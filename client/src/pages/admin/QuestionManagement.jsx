import { useState, useEffect } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  createQuestion,
  getAllQuestions,
  updateQuestion,
  toggleQuestionStatus,
} from "../../api/questionApi";

const TRACKS = ["frontend", "backend", "dsa", "hr", "fullstack"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const empty = {
  question: "",
  track: "frontend",
  difficulty: "beginner",
  topics: "",
  answerKeyPoints: "",
};

export default function QuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterTrack, setFilterTrack] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchQuestions = async () => {
    try {
      const params = {};
      if (filterTrack) params.track = filterTrack;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      const res = await getAllQuestions(params);
      setQuestions(res.data.questions);
    } catch (err) {
      toast.error("Failed to fetch questions.");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filterTrack, filterDifficulty]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        topics: form.topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        answerKeyPoints: form.answerKeyPoints
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editId) {
        await updateQuestion(editId, payload);
      } else {
        await createQuestion(payload);
      }
      setForm(empty);
      setEditId(null);
      fetchQuestions();
    } catch (err) {
      setError("Failed to save question.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    setEditId(q._id);
    setForm({
      question: q.question,
      track: q.track,
      difficulty: q.difficulty,
      topics: q.topics.join(", "),
      answerKeyPoints: q.answerKeyPoints.join(", "),
    });
  };

  const confirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      await toggleQuestionStatus(confirmTarget._id);
      toast.success(
        confirmTarget.isActive
          ? "Question hidden successfully."
          : "Question restored successfully.",
      );
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to update question status.");
    } finally {
      setConfirmTarget(null);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Question Management
      </h1>

      {/* Form */}
      <div
        className="rounded-xl p-6 space-y-4"
        style={{ background: "var(--surface)" }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {editId ? "Edit Question" : "Add Question"}
        </h2>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <textarea
          name="question"
          value={form.question}
          onChange={handleChange}
          placeholder="Question"
          rows={3}
          className="w-full rounded-lg p-3 text-sm resize-none"
          style={{
            background: "var(--bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />

        <div className="flex gap-4">
          <select
            name="track"
            value={form.track}
            onChange={handleChange}
            className="flex-1 rounded-lg p-3 text-sm"
            style={{
              background: "var(--bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {TRACKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="flex-1 rounded-lg p-3 text-sm"
            style={{
              background: "var(--bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <input
          name="topics"
          value={form.topics}
          onChange={handleChange}
          placeholder="Topics (comma separated)"
          className="w-full rounded-lg p-3 text-sm"
          style={{
            background: "var(--bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />

        <input
          name="answerKeyPoints"
          value={form.answerKeyPoints}
          onChange={handleChange}
          placeholder="Answer key points (comma separated)"
          className="w-full rounded-lg p-3 text-sm"
          style={{
            background: "var(--bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {loading ? "Saving..." : editId ? "Update" : "Add Question"}
          </button>
          {editId && (
            <button
              onClick={() => {
                setForm(empty);
                setEditId(null);
              }}
              className="px-6 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "var(--surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
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

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="rounded-lg p-2 text-sm"
          style={{
            background: "var(--surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        {questions.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No questions found.
          </p>
        )}
        {questions.map((q) => (
          <div
            key={q._id}
            className="rounded-xl p-4 flex justify-between items-start gap-4"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {q.question}
                </p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: q.isActive
                      ? "rgba(52, 211, 153, 0.15)"
                      : "rgba(139, 148, 158, 0.15)",
                    color: q.isActive
                      ? "var(--success)"
                      : "var(--text-secondary)",
                  }}
                >
                  {q.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <div
                className="flex gap-2 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>{q.track}</span>
                <span>•</span>
                <span>{q.difficulty}</span>
                <span>•</span>
                <span>{q.topics.join(", ")}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(q)}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmTarget(q)}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: q.isActive ? "#ef4444" : "var(--success)",
                  color: "#fff",
                }}
              >
                {q.isActive ? "Delete" : "Restore"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.isActive
            ? "Hide this question?"
            : "Restore this question?"
        }
        description={
          confirmTarget?.isActive
            ? "This question will be hidden from the question bank. You can restore it later."
            : "This question will become visible in the question bank again."
        }
        onConfirm={confirmToggle}
        confirmLabel={confirmTarget?.isActive ? "Hide" : "Restore"}
      />
    </div>
  );
}
