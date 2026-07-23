const ai = require("../config/gemini");
const { mcpToTool } = require("@google/genai");
const { getMcpClient } = require("../mcp/mcpClient");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const AppError = require("../utils/AppError");

const GEMINI_MODEL_FLASH = process.env.GEMINI_MODEL_FLASH || "gemini-3.6-flash";
const GEMINI_MODEL_PRO =
  process.env.GEMINI_MODEL_PRO || "gemini-3.1-pro-preview";

const withRetry = async (fn, retries = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable =
        err?.status === 503 ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.message?.includes("high demand");
      if (!isRetryable || attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
};

/**
 * Step 1: Gemini calls real MCP tools (get_candidate_profile,
 * get_past_performance) against our MCP server to gather actual
 * candidate context. Tool-calling and forced-JSON output can't be
 * combined in one Gemini call, so this step returns plain text context,
 * consumed by step 2 below.
 */
const gatherCandidateContext = async ({ userId, track }) => {
  const mcpClient = await getMcpClient();

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: `Use the available tools to look up the candidate's profile and past interview performance for userId "${userId}".
Then write a short (2-3 sentence) summary of their skill level and background relevant to the "${track}" track, to help calibrate interview question difficulty and focus.`,
      config: {
        tools: [mcpToTool(mcpClient)],
      },
    }),
  );

  return response.text;
};

/**
 * Step 2: Generates `count` new interview questions via Gemini, informed
 * by the candidate context from step 1, and persists them to the
 * Question bank with source: "AI" so future sessions can reuse them
 * without another API call.
 */
const generateQuestions = async ({ userId, track, difficulty, count }) => {
  const candidateContext = await gatherCandidateContext({ userId, track });

  const prompt = `Candidate context: ${candidateContext}

Generate ${count} unique technical interview questions for a ${difficulty}-level candidate on the ${track} track, tailored to the candidate context above where relevant.
Each question should test real-world understanding, not trivia.
For each question, also provide 3-5 key points a strong answer should cover, and 2-4 relevant topic tags.`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  topics: { type: "array", items: { type: "string" } },
                  answerKeyPoints: { type: "array", items: { type: "string" } },
                },
                required: ["question", "topics", "answerKeyPoints"],
              },
            },
          },
          required: ["questions"],
        },
      },
    }),
  );

  let parsed;
  try {
    parsed = JSON.parse(response.text);
  } catch (err) {
    throw new AppError("Failed to parse question generation response", 502);
  }

  const created = await Question.insertMany(
    parsed.questions.map((q) => ({
      question: q.question,
      track,
      difficulty,
      topics: q.topics,
      answerKeyPoints: q.answerKeyPoints,
      source: "AI",
      isActive: true,
    })),
  );

  return created;
};

/**
 * Fetches questions for a session: prefers the existing bank first
 * (zero API cost), only calls Gemini to generate the shortfall.
 * Excludes questions this user has already answered.
 */
const getQuestionsForSession = async ({ userId, track, difficulty, count }) => {
  const answeredQuestionIds = await Answer.find({ user: userId })
    .distinct("question")
    .then((ids) => ids.filter(Boolean));

  const existing = await Question.find({
    track,
    difficulty,
    isActive: true,
    _id: { $nin: answeredQuestionIds },
  }).limit(count);

  if (existing.length >= count) {
    return existing.slice(0, count);
  }

  const shortfall = count - existing.length;
  const generated = await generateQuestions({
    userId,
    track,
    difficulty,
    count: shortfall,
  });

  return [...existing, ...generated];
};

/**
 * Scores a candidate's transcribed spoken answer against the question's
 * key points using Gemini, returning a structured score + feedback.
 */
const scoreAnswer = async ({ questionText, answerKeyPoints, userAnswer }) => {
  const prompt = `Question: ${questionText}
Key points a strong answer should cover: ${answerKeyPoints.join("; ")}
Candidate's transcribed spoken answer: "${userAnswer}"

Score this answer from 0-100 based on technical accuracy and completeness relative to the key points.
List any key points the candidate missed.
Write a polished, ideal version of the answer for reference.`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            missedPoints: { type: "array", items: { type: "string" } },
            polishedAnswer: { type: "string" },
          },
          required: ["score", "missedPoints", "polishedAnswer"],
        },
      },
    }),
  );

  try {
    return JSON.parse(response.text);
  } catch (err) {
    throw new AppError("Failed to parse answer scoring response", 502);
  }
};

/**
 * If a candidate's answer was weak, generates one adaptive follow-up
 * question that digs deeper on the same topic instead of moving on.
 * Caller is responsible for capping this to one follow-up per question
 * (checked via Answer.parentQuestion in the controller) to avoid loops.
 */
const generateFollowUp = async ({ questionText, userAnswer, missedPoints }) => {
  const prompt = `Original question: ${questionText}
Candidate's answer: "${userAnswer}"
Key points they missed: ${missedPoints.join("; ")}

Write ONE follow-up question that either digs deeper into a specific gap in their answer, or simplifies the topic if they showed limited understanding. Keep it conversational, like a real interviewer probing further.`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            followUpQuestion: { type: "string" },
          },
          required: ["followUpQuestion"],
        },
      },
    }),
  );

  try {
    return JSON.parse(response.text).followUpQuestion;
  } catch (err) {
    throw new AppError("Failed to parse follow-up question response", 502);
  }
};

/**
 * End-of-session final report. Uses the Pro model (higher quality,
 * used once per session rather than once per answer) to synthesize
 * overall performance, strengths, weaknesses, and improvement advice
 * across every Answer in the session.
 */
const generateFinalReport = async ({ track, answers }) => {
  const answerSummary = answers
    .map(
      (a, i) =>
        `Q${i + 1}: ${a.questionText}\nAnswer: ${a.userAnswer}\nScore: ${a.score}\nMissed: ${(a.missedPoints || []).join(", ") || "none"}`,
    )
    .join("\n\n");

  const prompt = `Track: ${track}
Full interview transcript with per-question scores:

${answerSummary}

Write a final interview report covering: overall technical depth, communication clarity, an overall score (0-100, weighted average is fine but use judgment), 2-4 concrete strengths, 2-4 concrete weaknesses, and 2-4 personalized, actionable improvement suggestions.`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: GEMINI_MODEL_PRO,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallScore: { type: "number" },
            communicationNotes: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            improvementSuggestions: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "overallScore",
            "communicationNotes",
            "strengths",
            "weaknesses",
            "improvementSuggestions",
          ],
        },
      },
    }),
  );

  try {
    return JSON.parse(response.text);
  } catch (err) {
    throw new AppError("Failed to parse final report response", 502);
  }
};

module.exports = {
  generateQuestions,
  getQuestionsForSession,
  scoreAnswer,
  generateFollowUp,
  generateFinalReport,
};
