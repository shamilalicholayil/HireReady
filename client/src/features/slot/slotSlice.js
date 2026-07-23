import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  slots: [],
  loading: false,
  error: null,
};

const slotSlice = createSlice({
  name: "slot",
  initialState,
  reducers: {
    setSlots: (state, action) => {
      state.slots = action.payload;
    },
    addSlot: (state, action) => {
      state.slots.push(action.payload);
    },
    setInterviewStatus: (state, action) => {
      const { slotId, interviewStatus, roomId } = action.payload;
      const slot = state.slots.find((s) => s._id === slotId);
      if (slot) {
        slot.interviewStatus = interviewStatus;
        if (roomId) slot.roomId = roomId;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setSlots, addSlot, setInterviewStatus, setLoading, setError } =
  slotSlice.actions;
export default slotSlice.reducer;
