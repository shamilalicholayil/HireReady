import { useState, useEffect } from "react";
import { getAnswerHistory } from "../../api/answerApi";

const TRACKS = ["frontend", "backend", "dsa", "hr", "fullstack"];

export default function AnswerHistory() {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTrack, setFilterTrack] = useState("");

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterTrack) params.track = filterTrack;
      const res = await getAnswerHistory(params);
      setAnswers(res.data.answers);
    } catch (err) {
      setError("Failed to fetch answer history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [filterTrack]);

  return (
    <div className="p-6 space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Answer History
      </h1>

      {/* Filter */}
      <select
        value={filterTrack}
        onChange={(e) => setFilterTrack(e.target.value)}
        className="rounded-lg p-2 text-sm"
        style={{
          background: "var(--surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      >
        <option value="">All Tracks</option>
        {TRACKS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* States */}
      {loading && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading...
        </p>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && answers.length === 0 && (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No answers yet.
        </p>
      )}

      {/* Answer List */}
      <div className="space-y-4">
        {answers.map((a) => (
          <div
            key={a._id}
            className="rounded-xl p-5 space-y-3"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Question */}
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {a.questionText ||
                a.question?.question ||
                "Question not available"}
            </p>

            {/* Meta */}
            <div
              className="flex gap-3 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <span>{a.type}</span>
              {a.timeTaken && (
                <>
                  <span>•</span>
                  <span>{a.timeTaken}s</span>
                </>
              )}
              {a.score !== undefined && (
                <>
                  <span>•</span>
                  <span>Score: {a.score}</span>
                </>
              )}
            </div>

            {/* User Answer */}
            <div className="rounded-lg p-3" style={{ background: "var(--bg)" }}>
              <p
                className="text-xs mb-1 font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Your Answer
              </p>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                {a.userAnswer}
              </p>
            </div>

            {/* Polished Answer */}
            {a.polishedAnswer && (
              <div
                className="rounded-lg p-3"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--primary)",
                }}
              >
                <p
                  className="text-xs mb-1 font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  AI Polished Answer
                </p>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {a.polishedAnswer}
                </p>
              </div>
            )}

            {/* Missed Points */}
            {a.missedPoints?.length > 0 && (
              <div>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Missed Points
                </p>
                <div className="flex flex-wrap gap-2">
                  {a.missedPoints.map((point, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full text-xs"
                      style={{ background: "#ef444420", color: "#ef4444" }}
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
