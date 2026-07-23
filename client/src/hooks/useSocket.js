import { io } from "socket.io-client";
import { toast } from "sonner";

import { store } from "../app/store";
import { logout } from "../features/auth/authSlice";
import {
  appendMessage,
  markActiveMessagesRead,
  bumpConversationUnread,
  setConversationUnreadCount,
  userWentOnline,
  userWentOffline,
  setOnlineUsers,
  setTypingUser,
  clearTypingUser,
} from "../features/messages/messagesSlice";
import { updateFriendLastSeen } from "../features/friend/friendSlice";
import { markAsRead } from "../api/messageApi";

const SOCKET_URL = new URL(import.meta.env.VITE_API_URL).origin;

let socket = null;

function connectSocket(token) {
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
  });

  socket.on("newMessage", (message) => {
    store.dispatch(appendMessage(message));
    store.dispatch(
      bumpConversationUnread({
        conversationId: message.conversationId,
        lastMessage: {
          content: message.content,
          sender: message.sender,
          createdAt: message.createdAt,
        },
      }),
    );

    const state = store.getState();
    const isActiveConversation =
      message.sender === state.messages.activeConversationId ||
      message.receiver === state.messages.activeConversationId;

    if (isActiveConversation) {
      const myId = state.auth.user._id;
      const otherUserId =
        message.sender === myId ? message.receiver : message.sender;
      markAsRead(otherUserId).catch(() => {});
    }
  });

  socket.on("conversationRead", ({ conversationId, unreadCount }) => {
    store.dispatch(setConversationUnreadCount({ conversationId, unreadCount }));
  });

  socket.on("messagesRead", ({ conversationId }) => {
    const activeId = store.getState().messages.activeConversationId;
    if (activeId) {
      store.dispatch(markActiveMessagesRead({ conversationId }));
    }
  });

  socket.on("userOnline", ({ userId }) => {
    store.dispatch(userWentOnline(userId));
  });

  socket.on("onlineUsersSnapshot", ({ userIds }) => {
    store.dispatch(setOnlineUsers(userIds));
  });

  socket.on("userOffline", ({ userId, lastSeen }) => {
    store.dispatch(userWentOffline(userId));
    store.dispatch(updateFriendLastSeen({ userId, lastSeen }));
  });

  socket.on("userTyping", ({ senderId }) => {
    store.dispatch(setTypingUser(senderId));
  });

  socket.on("userStoppedTyping", ({ senderId }) => {
    store.dispatch(clearTypingUser(senderId));
  });

  socket.on("accountBlocked", ({ message }) => {
    toast.error(message || "Your account has been blocked.");
    store.dispatch(logout());
  });

  return socket;
}

function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}

const getSocket = () => socket;

function emitTyping(receiverId) {
  if (socket && receiverId) socket.emit("typing", { receiverId });
}

function emitStopTyping(receiverId) {
  if (socket && receiverId) socket.emit("stopTyping", { receiverId });
}

let lastToken = null;

store.subscribe(() => {
  const currentToken = store.getState().auth.accessToken;
  if (currentToken === lastToken) return;
  lastToken = currentToken;

  if (currentToken) {
    connectSocket(currentToken);
  } else {
    disconnectSocket();
  }
});

export {
  connectSocket,
  disconnectSocket,
  getSocket,
  emitTyping,
  emitStopTyping,
};
