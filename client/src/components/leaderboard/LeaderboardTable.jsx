import LeaderboardRow from "./LeaderboardRow";

const LIMIT = 20;

export default function LeaderboardTable({
  entries,
  page,
  hasMore,
  loading,
  loadMore,
}) {
  const others = entries.slice(3);

  return (
    <section className="mt-10">
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {/* Header */}

        <div className="grid grid-cols-[80px_1fr_120px_120px] border-b border-border bg-background/40 px-6 py-4 text-sm font-semibold text-muted-foreground">
          <span>Rank</span>

          <span>Candidate</span>

          <span>Sessions</span>

          <span className="text-right">Score</span>
        </div>

        {others.length === 0 && !loading && (
          <div className="py-12 text-center text-muted-foreground">
            Nobody else is on the leaderboard yet.
          </div>
        )}

        {others.map((entry, index) => (
          <LeaderboardRow
            key={entry.user._id}
            entry={entry}
            rank={index + 4 + (page - 1) * LIMIT}
          />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="
            mt-6
            w-full
            rounded-2xl
            border
            border-border
            bg-card
            py-3
            font-medium
            transition
            hover:border-primary
            hover:bg-background
          "
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </section>
  );
}
