import { useEffect, useState, useCallback } from "react";
import { fetchLeaderboard } from "../../api/leaderboardApi";
import Card from "../../components/common/Card";

const TRACKS = ["frontend", "backend", "dsa", "fullstack"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const LIMIT = 20;

const LeaderboardManagement = () => {
  const [track, setTrack] = useState("frontend");
  const [difficulty, setDifficulty] = useState("beginner");
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (targetPage) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchLeaderboard({
          track,
          difficulty,
          page: targetPage,
          limit: LIMIT,
        });
        setEntries(res.data.leaderboard);
        setHasMore(res.data.leaderboard.length >= LIMIT);
        setPage(targetPage);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    },
    [track, difficulty],
  );

  useEffect(() => {
    load(1);
  }, [track, difficulty]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-[var(--foreground)] mb-4">
        Leaderboard Overview
      </h1>

      <div className="flex gap-3 mb-6">
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className="bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded-lg px-3 py-2 text-sm capitalize"
        >
          {TRACKS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded-lg px-3 py-2 text-sm capitalize"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <Card title={`${track} / ${difficulty} - Page ${page}`}>
        {loading ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">
            Loading...
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-red-400">{error}</div>
        ) : entries.length === 0 ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">
            No data for this track/difficulty yet.
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)] border-b border-[var(--border)]">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">User</th>
                  <th className="py-2 px-2">Score</th>
                  <th className="py-2 px-2">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr
                    key={entry.user?._id || idx}
                    className="border-b border-[var(--border)]"
                  >
                    <td className="py-2 px-2 font-mono">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="py-2 px-2">{entry.user?.name}</td>
                    <td className="py-2 px-2 text-[var(--accent)] font-semibold">
                      {entry.totalScore}
                    </td>
                    <td className="py-2 px-2">{entry.sessionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                Page {page}
              </span>
              <button
                onClick={() => load(page + 1)}
                disabled={!hasMore || loading}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm text-[var(--foreground)] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default LeaderboardManagement;
