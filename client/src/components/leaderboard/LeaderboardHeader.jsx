import TrackFilter from "./TrackFilter";
import DifficultyFilter from "./DifficultyFilter";

export default function LeaderboardHeader({
  track,
  setTrack,
  difficulty,
  setDifficulty,
}) {
  return (
    <div className="mb-10 flex items-end justify-between">
      <div>
        <h1 className="text-4xl font-bold">Leaderboard</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Global rankings for {track} interviews
        </p>
      </div>

      <div className="flex gap-3">
        <TrackFilter track={track} setTrack={setTrack} />

        <DifficultyFilter
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
      </div>
    </div>
  );
}
