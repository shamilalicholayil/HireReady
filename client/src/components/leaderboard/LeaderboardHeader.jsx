import TrackFilter from "./TrackFilter";
import DifficultyFilter from "./DifficultyFilter";

export default function LeaderboardHeader({
  track,
  setTrack,
  difficulty,
  setDifficulty,
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Leaderboard</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Global rankings for {track} interviews
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <TrackFilter track={track} setTrack={setTrack} />

        <DifficultyFilter
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />
      </div>
    </div>
  );
}
