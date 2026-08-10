import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import InterviewStart from "../../components/interview-ai/InterviewStart";
import InterviewHeader from "../../components/interview-ai/InterviewHeader";
import InterviewQuestion from "../../components/interview-ai/InterviewQuestion";
import AnswerEditor from "../../components/interview-ai/AnswerEditor";
import CameraPreview from "../../components/interview-ai/CameraPreview";
import ReportDashboard from "../../components/interview-ai/ReportDashboard";

import {
  startInterviewSession,
  submitInterviewAnswer,
  finishInterviewSession,
  getInterviewQuestionById,
} from "../../api/interviewApi";

import {
  startInterview,
  setCurrentQuestion,
  setFollowUpQuestion,
  popRemainingQuestionId,
  setStatus,
  setReport,
  setError,
  resetInterview,
} from "../../features/interview/interviewSlice";

const TRACKS = ["frontend", "backend", "dsa", "fullstack"];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function AiInterview() {
  const dispatch = useDispatch();

  const {
    session,
    currentQuestion,
    isFollowUp,
    remainingQuestionIds,
    report,
    status,
    error,
  } = useSelector((state) => state.interview);

  const [track, setTrack] = useState(TRACKS[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [userAnswer, setUserAnswer] = useState("");
  const [questionStartedAt, setQuestionStartedAt] = useState(null);
  const [answerType, setAnswerType] = useState("text");
  const [questionKey, setQuestionKey] = useState(0);

  const handleStart = async () => {
    dispatch(setStatus("starting"));
    try {
      const { data } = await startInterviewSession({
        track,
        difficulty,
      });
      dispatch(startInterview(data));
      setQuestionStartedAt(Date.now());
      setQuestionKey((k) => k + 1);
    } catch (err) {
      dispatch(
        setError(err?.response?.data?.message || "Failed to start session"),
      );
    }
  };

  const advanceToNextQuestion = async (currentSession) => {
    const [nextId] = remainingQuestionIds;

    if (!nextId) {
      dispatch(setStatus("submitting"));

      const { data } = await finishInterviewSession(currentSession._id);

      dispatch(setReport(data.session));

      return;
    }

    const { data } = await getInterviewQuestionById(nextId);

    dispatch(popRemainingQuestionId());

    dispatch(setCurrentQuestion(data.question));

    setQuestionStartedAt(Date.now());
    setQuestionKey((k) => k + 1);
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    dispatch(setStatus("submitting"));
    const time = questionStartedAt
      ? Math.round((Date.now() - questionStartedAt) / 1000)
      : undefined;
    const payload = isFollowUp
      ? {
          sessionId: session._id,
          isFollowUp: true,
          parentQuestion: currentQuestion.parentQuestion,
          questionText: currentQuestion.questionText,
          answerKeyPoints: currentQuestion.answerKeyPoints,
          userAnswer,
          time,
          type: answerType,
        }
      : {
          sessionId: session._id,
          isFollowUp: false,
          questionId: currentQuestion._id,
          userAnswer,
          time,
          type: answerType,
        };

    try {
      const { data } = await submitInterviewAnswer(payload);
      setUserAnswer("");
      if (data.nextStep === "follow_up") {
        dispatch(setFollowUpQuestion(data.followUp));
        setQuestionStartedAt(Date.now());
        setQuestionKey((k) => k + 1);
      } else {
        await advanceToNextQuestion(session);
      }
    } catch (err) {
      dispatch(
        setError(err?.response?.data?.message || "Failed to submit answer"),
      );
    }
  };

  if (status === "idle") {
    return (
      <InterviewStart
        track={track}
        setTrack={setTrack}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        handleStart={handleStart}
        error={error}
      />
    );
  }

  if (status === "finished" && report) {
    return (
      <ReportDashboard
        report={report}
        onNewSession={() => {
          dispatch(resetInterview());

          setUserAnswer("");
        }}
      />
    );
  }

  const questionText =
    currentQuestion?.question || currentQuestion?.questionText;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 pb-0">
      <InterviewHeader track={track} difficulty={difficulty} />

      <div className="space-y-6">
        {isFollowUp && (
          <div className="glass rounded-2xl p-4 border-yellow-400/30 text-yellow-300">
            AI Follow-up Question
          </div>
        )}

        <InterviewQuestion question={questionText} />

        <AnswerEditor
          key={questionKey}
          value={userAnswer}
          setValue={setUserAnswer}
          disabled={status === "submitting"}
          onSubmit={handleSubmitAnswer}
          onVoiceUsed={() => setAnswerType("voice")}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-white/10 bg-[var(--bg)]/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          onClick={handleSubmitAnswer}
          disabled={status === "submitting"}
          className="mx-auto block w-full max-w-3xl h-14 rounded-2xl gradient-primary font-semibold transition hover:scale-[1.02] disabled:opacity-50"
        >
          {status === "submitting" ? "AI Evaluating..." : "Submit Answer →"}
        </button>
      </div>
    </div>
  );
}
