import { createSlice } from "@reduxjs/toolkit";

const friendSlice = createSlice({
  name: "friends",
  initialState: {
    friends: [],
    incoming: [],
    outgoing: [],
    searchResults: [],
    loading: false,
    error: null,
  },
  reducers: {
    setFriends: (state, action) => {
      state.friends = action.payload;
    },
    setIncoming: (state, action) => {
      state.incoming = action.payload;
    },
    setOutgoing: (state, action) => {
      state.outgoing = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    removeIncoming: (state, action) => {
      state.incoming = state.incoming.filter((r) => r._id !== action.payload);
    },
    removeOutgoing: (state, action) => {
      state.outgoing = state.outgoing.filter((r) => r._id !== action.payload);
    },
    addFriend: (state, action) => {
      state.friends.push(action.payload);
    },
    updateFriendLastSeen: (state, action) => {
      const { userId, lastSeen } = action.payload;
      const friend = state.friends.find((f) => f._id === userId);
      if (friend) friend.lastSeen = lastSeen;
    },
    setFriendsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setFriendsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFriends,
  setIncoming,
  setOutgoing,
  setSearchResults,
  removeIncoming,
  removeOutgoing,
  addFriend,
  updateFriendLastSeen,
  setFriendsLoading,
  setFriendsError,
} = friendSlice.actions;

export default friendSlice.reducer;
