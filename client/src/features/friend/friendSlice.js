import { createSlice } from "@reduxjs/toolkit";

const initialPagination = { page: 1, totalPages: 1 };

const friendSlice = createSlice({
  name: "friends",
  initialState: {
    friends: [],
    friendsPagination: { ...initialPagination },
    incoming: [],
    outgoing: [],
    searchResults: [],
    searchPagination: { ...initialPagination },
    loading: false,
    loadingMore: false,
    error: null,
  },
  reducers: {
    setFriends: (state, action) => {
      state.friends = action.payload.friends;
      state.friendsPagination = action.payload.pagination;
    },
    appendFriends: (state, action) => {
      state.friends.push(...action.payload.friends);
      state.friendsPagination = action.payload.pagination;
    },
    setIncoming: (state, action) => {
      state.incoming = action.payload;
    },
    setOutgoing: (state, action) => {
      state.outgoing = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload.users;
      state.searchPagination = action.payload.pagination;
    },
    appendSearchResults: (state, action) => {
      state.searchResults.push(...action.payload.users);
      state.searchPagination = action.payload.pagination;
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
    setFriendsLoadingMore: (state, action) => {
      state.loadingMore = action.payload;
    },
    setFriendsError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setFriends,
  appendFriends,
  setIncoming,
  setOutgoing,
  setSearchResults,
  appendSearchResults,
  removeIncoming,
  removeOutgoing,
  addFriend,
  updateFriendLastSeen,
  setFriendsLoading,
  setFriendsLoadingMore,
  setFriendsError,
} = friendSlice.actions;

export default friendSlice.reducer;
