import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  entries: [],
  myRank: null,
  myScore: 0,
  mySessionCount: 0,
  page: 1,
  hasMore: true,
  loading: false,
  error: null,
};

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {
    setLeaderboardLoading(state, action) {
      state.loading = action.payload;
    },
    setLeaderboardEntries(state, action) {
      const { entries, page, append, limit } = action.payload;
      state.entries = append ? [...state.entries, ...entries] : entries;
      state.page = page;
      state.hasMore = entries.length > 0 && entries.length >= limit;
    },
    setMyRank(state, action) {
      const { rank, totalScore, sessionCount } = action.payload;
      state.myRank = rank;
      state.myScore = totalScore;
      state.mySessionCount = sessionCount;
    },
    setLeaderboardError(state, action) {
      state.error = action.payload;
    },
    resetLeaderboard(state) {
      state.entries = [];
      state.page = 1;
      state.hasMore = true;
      state.myRank = null;
      state.error = null;
    },
  },
});

export const {
  setLeaderboardLoading,
  setLeaderboardEntries,
  setMyRank,
  setLeaderboardError,
  resetLeaderboard,
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
