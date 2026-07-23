import { useState, useEffect } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  createTutorial,
  getAllTutorials,
  updateTutorial,
  toggleTutorialStatus,
} from "../../api/tutorialApi";

const TRACKS = ["frontend", "backend", "dsa", "hr", "fullstack"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const empty = {
  title: "",
  youtubeId: "",
  track: "frontend",
  description: "",
  difficulty: "beginner",
  topics: "",
};

export default function TutorialManagement() {
  const [tutorials, setTutorials] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterTrack, setFilterTrack] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchTutorials = async () => {
    try {
      const params = {};
      if (filterTrack) params.track = filterTrack;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      const res = await getAllTutorials(params);
      setTutorials(res.data.tutorials);
    } catch (err) {
      toast.error("Failed to fetch tutorials.");
    }
  };

  useEffect(() => {
    fetchTutorials();
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
      };
      if (editId) {
        await updateTutorial(editId, payload);
      } else {
        await createTutorial(payload);
      }
      setForm(empty);
      setEditId(null);
      fetchTutorials();
    } catch (err) {
      setError("Failed to save tutorial.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    setForm({
      title: t.title,
      youtubeId: t.youtubeId,
      track: t.track,
      description: t.description,
      difficulty: t.difficulty,
      topics: t.topics.join(", "),
    });
  };

  const confirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      await toggleTutorialStatus(confirmTarget._id);
      toast.success(
        confirmTarget.isActive
          ? "Tutorial hidden successfully."
          : "Tutorial restored successfully.",
      );
      fetchTutorials();
    } catch (err) {
      toast.error("Failed to update tutorial status.");
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
        Tutorial Management
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
          {editId ? "Edit Tutorial" : "Add Tutorial"}
        </h2>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full rounded-lg p-3 text-sm"
          style={{
            background: "var(--bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />

        <input
          name="youtubeId"
          value={form.youtubeId}
          onChange={handleChange}
          placeholder="YouTube Video ID (e.g. dQw4w9WgXcQ)"
          className="w-full rounded-lg p-3 text-sm"
          style={{
            background: "var(--bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
          }}
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
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

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {loading ? "Saving..." : editId ? "Update" : "Add Tutorial"}
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

      {/* Tutorial List */}
      <div className="space-y-3">
        {tutorials.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No tutorials found.
          </p>
        )}
        {tutorials.map((t) => (
          <div
            key={t._id}
            className="rounded-xl p-4 flex gap-4"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <img
              src={`https://img.youtube.com/vi/${t.youtubeId}/mqdefault.jpg`}
              alt={t.title}
              className="w-32 h-20 object-cover rounded-lg shrink-0"
            />

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t.title}
                </p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: t.isActive
                      ? "rgba(52, 211, 153, 0.15)"
                      : "rgba(139, 148, 158, 0.15)",
                    color: t.isActive
                      ? "var(--success)"
                      : "var(--text-secondary)",
                  }}
                >
                  {t.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              {t.description && (
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {t.description}
                </p>
              )}
              <div
                className="flex gap-2 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>{t.track}</span>
                <span>•</span>
                <span>{t.difficulty}</span>
                <span>•</span>
                <span>{t.topics.join(", ")}</span>
              </div>
            </div>

            <div className="flex gap-2 items-start shrink-0">
              <button
                onClick={() => handleEdit(t)}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmTarget(t)}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  background: t.isActive ? "#ef4444" : "var(--success)",
                  color: "#fff",
                }}
              >
                {t.isActive ? "Delete" : "Restore"}
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
            ? "Hide this tutorial?"
            : "Restore this tutorial?"
        }
        description={
          confirmTarget?.isActive
            ? "This tutorial will be hidden from Tutorial Hub. You can restore it later."
            : "This tutorial will become visible in Tutorial Hub again."
        }
        onConfirm={confirmToggle}
        confirmLabel={confirmTarget?.isActive ? "Hide" : "Restore"}
      />
    </div>
  );
}
