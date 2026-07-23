import { createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    currentSession: null,
    sessions: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentSession(state, action) {
      state.currentSession = action.payload;
    },
    setSessions(state, action) {
      state.sessions = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearSession(state) {
      state.currentSession = null;
      state.error = null;
    },
  },
});

export const {
  setCurrentSession,
  setSessions,
  setLoading,
  setError,
  clearSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
