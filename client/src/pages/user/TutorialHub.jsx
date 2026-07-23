import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { X, Search } from "lucide-react";
import { getPublicTutorials } from "../../api/tutorialApi";

const TRACKS = ["frontend", "backend", "dsa", "hr", "fullstack"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function TutorialHub() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTrack, setFilterTrack] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [activeTutorial, setActiveTutorial] = useState(null);

  const fetchTutorials = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterTrack) params.track = filterTrack;
      if (filterDifficulty) params.difficulty = filterDifficulty;
      const res = await getPublicTutorials(params);
      setTutorials(res.data.tutorials);
    } catch (err) {
      toast.error("Failed to load tutorials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, [filterTrack, filterDifficulty]);

  const filteredTutorials = useMemo(() => {
    if (!search.trim()) return tutorials;
    const q = search.toLowerCase();
    return tutorials.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.topics.some((topic) => topic.toLowerCase().includes(q)),
    );
  }, [tutorials, search]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Tutorial Hub
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Curated videos to sharpen your interview prep.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tutorials..."
            className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm"
            style={{
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />
        </div>

        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          className="rounded-lg p-2.5 text-sm"
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
          className="rounded-lg p-2.5 text-sm"
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

      {/* Grid */}
      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Loading tutorials...
        </p>
      ) : filteredTutorials.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No tutorials found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTutorials.map((t) => (
            <button
              key={t._id}
              onClick={() => setActiveTutorial(t)}
              className="text-left rounded-xl overflow-hidden transition-transform hover:-translate-y-0.5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={`https://img.youtube.com/vi/${t.youtubeId}/mqdefault.jpg`}
                alt={t.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 space-y-1.5">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t.title}
                </p>
                {t.description && (
                  <p
                    className="text-xs line-clamp-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {t.description}
                  </p>
                )}
                <div
                  className="flex gap-2 text-[11px] pt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="capitalize">{t.track}</span>
                  <span>•</span>
                  <span className="capitalize">{t.difficulty}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal player */}
      {activeTutorial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setActiveTutorial(null)}
        >
          <div
            className="w-full max-w-2xl rounded-xl overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex justify-between items-center p-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {activeTutorial.title}
              </p>
              <button
                onClick={() => setActiveTutorial(null)}
                style={{ color: "var(--text-secondary)" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${activeTutorial.youtubeId}`}
                title={activeTutorial.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {activeTutorial.description && (
              <p
                className="p-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {activeTutorial.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
