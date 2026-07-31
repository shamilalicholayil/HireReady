import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Trophy } from "lucide-react";

import { fetchLeaderboard, fetchMyRank } from "../../api/leaderboardApi";

import {
  setLeaderboardLoading,
  setLeaderboardEntries,
  setMyRank,
  setLeaderboardError,
  resetLeaderboard,
} from "../../features/leaderboard/leaderboardSlice";

import LeaderboardHeader from "../../components/leaderboard/LeaderboardHeader";
import Podium from "../../components/leaderboard/Podium";
import LeaderboardTable from "../../components/leaderboard/LeaderboardTable";

const LIMIT = 20;

export default function Leaderboard() {
  const dispatch = useDispatch();

  const { entries, page, loading, hasMore } = useSelector(
    (state) => state.leaderboard,
  );

  const [track, setTrack] = useState("frontend");
  const [difficulty, setDifficulty] = useState("beginner");

  const loadLeaderboard = useCallback(
    async (targetPage = 1, append = false) => {
      dispatch(setLeaderboardLoading(true));

      try {
        const res = await fetchLeaderboard({
          track,
          difficulty,
          page: targetPage,
          limit: LIMIT,
        });

        dispatch(
          setLeaderboardEntries({
            entries: res.data.leaderboard,
            page: targetPage,
            append,
            limit: LIMIT,
          }),
        );
      } catch (err) {
        dispatch(
          setLeaderboardError(
            err.response?.data?.message ?? "Unable to load leaderboard.",
          ),
        );
      } finally {
        dispatch(setLeaderboardLoading(false));
      }
    },
    [track, difficulty, dispatch],
  );

  const loadMyRank = useCallback(async () => {
    try {
      const res = await fetchMyRank({
        track,
        difficulty,
      });

      dispatch(
        setMyRank({
          rank: res.data.rank,
          totalScore: res.data.totalScore,
          sessionCount: res.data.sessionCount,
        }),
      );
    } catch {
      dispatch(
        setMyRank({
          rank: null,
          totalScore: 0,
          sessionCount: 0,
        }),
      );
    }
  }, [track, difficulty, dispatch]);

  useEffect(() => {
    dispatch(resetLeaderboard());

    loadLeaderboard();
    loadMyRank();
  }, [difficulty]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <LeaderboardHeader
        track={track}
        setTrack={setTrack}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />

      <Podium entries={entries} track={track} difficulty={difficulty} />

      <LeaderboardTable
        entries={entries}
        page={page}
        hasMore={hasMore}
        loading={loading}
        loadMore={() => loadLeaderboard(page + 1, true)}
      />
    </div>
  );
}
