import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  session: null,
  currentQuestion: null,
  isFollowUp: false,
  remainingQuestionIds: [],
  report: null,
  status: "idle",
  error: null,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    startInterview(state, action) {
      const { session, firstQuestion, remainingQuestionIds } = action.payload;
      state.session = session;
      state.currentQuestion = firstQuestion;
      state.isFollowUp = false;
      state.remainingQuestionIds = remainingQuestionIds;
      state.report = null;
      state.status = "answering";
      state.error = null;
    },
    setCurrentQuestion(state, action) {
      state.currentQuestion = action.payload;
      state.isFollowUp = false;
      state.status = "answering";
    },
    setFollowUpQuestion(state, action) {
      state.currentQuestion = action.payload;
      state.isFollowUp = true;
      state.status = "answering";
    },
    popRemainingQuestionId(state) {
      state.remainingQuestionIds.shift();
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    setReport(state, action) {
      state.session = action.payload;
      state.report = action.payload;
      state.status = "finished";
    },
    setError(state, action) {
      state.error = action.payload;
      state.status = "answering";
    },
    resetInterview() {
      return initialState;
    },
  },
});

export const {
  startInterview,
  setCurrentQuestion,
  setFollowUpQuestion,
  popRemainingQuestionId,
  setStatus,
  setReport,
  setError,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;
