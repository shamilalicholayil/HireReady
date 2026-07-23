import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    conversations: [],
    activeConversationId: null,
    activeMessages: [],
    typingUserId: null,
    onlineUsers: [],
    loadingConversations: false,
    loadingMessages: false,
    hasMoreMessages: true,
    loadingOlderMessages: false,
    error: null,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setActiveConversationId: (state, action) => {
      state.activeConversationId = action.payload;
    },
    setActiveMessages: (state, action) => {
      const { messages, hasMore } = action.payload;
      state.activeMessages = messages;
      state.hasMoreMessages = hasMore;
    },
    appendMessage: (state, action) => {
      const msg = action.payload;

      const isActiveConversation =
        msg.sender === state.activeConversationId ||
        msg.receiver === state.activeConversationId;

      if (isActiveConversation) {
        state.activeMessages.push(msg);
      }

      const existing = state.conversations.find(
        (c) => c._id === msg.conversationId,
      );
      if (existing) {
        existing.lastMessage = {
          content: msg.content,
          sender: msg.sender,
          createdAt: msg.createdAt,
        };
        existing.updatedAt = msg.createdAt;
        state.conversations = [
          existing,
          ...state.conversations.filter((c) => c._id !== existing._id),
        ];
      }
    },
    markActiveMessagesRead: (state) => {
      state.activeMessages = state.activeMessages.map((m) => ({
        ...m,
        status: "read",
      }));
    },
    setConversationUnreadCount: (state, action) => {
      const { conversationId, unreadCount } = action.payload;
      const conv = state.conversations.find((c) => c._id === conversationId);
      if (conv) conv.unreadCount = unreadCount;
    },
    bumpConversationUnread: (state, action) => {
      const { conversationId, lastMessage } = action.payload;
      const conv = state.conversations.find((c) => c._id === conversationId);
      if (!conv) return;
      conv.unreadCount = (conv.unreadCount || 0) + 1;
    },
    setTypingUser: (state, action) => {
      state.typingUserId = action.payload;
    },
    clearTypingUser: (state, action) => {
      if (state.typingUserId === action.payload) {
        state.typingUserId = null;
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    userWentOnline: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    userWentOffline: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(
        (id) => id !== action.payload,
      );
    },
    setLoadingConversations: (state, action) => {
      state.loadingConversations = action.payload;
    },
    setLoadingMessages: (state, action) => {
      state.loadingMessages = action.payload;
    },
    prependOlderMessages: (state, action) => {
      const { messages, hasMore } = action.payload;
      state.activeMessages = [...messages, ...state.activeMessages];
      state.hasMoreMessages = hasMore;
    },
    setLoadingOlderMessages: (state, action) => {
      state.loadingOlderMessages = action.payload;
    },
    setMessagesError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setConversations,
  setActiveConversationId,
  setActiveMessages,
  appendMessage,
  markActiveMessagesRead,
  setConversationUnreadCount,
  bumpConversationUnread,
  setTypingUser,
  clearTypingUser,
  setOnlineUsers,
  userWentOnline,
  userWentOffline,
  setLoadingConversations,
  setLoadingMessages,
  prependOlderMessages,
  setLoadingOlderMessages,
  setMessagesError,
} = messagesSlice.actions;

export default messagesSlice.reducer;
