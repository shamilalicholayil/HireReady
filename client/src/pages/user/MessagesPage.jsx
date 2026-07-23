import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Smile,
  Paperclip,
  X,
  Loader2,
  Ban,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import {
  getConversationsList,
  getConversation,
  sendMessage,
  markAsRead,
  uploadAttachment,
} from "../../api/messageApi";
import { getFriends, blockUser, unblockUser } from "../../api/friendApi";
import { emitTyping, emitStopTyping } from "../../hooks/useSocket";

import {
  setConversations,
  setActiveConversationId,
  setActiveMessages,
  prependOlderMessages,
  setLoadingOlderMessages,
  appendMessage,
  markActiveMessagesRead,
  setLoadingConversations,
  setLoadingMessages,
} from "../../features/messages/messagesSlice";
import { setFriends } from "../../features/friend/friendSlice";
import { updateUser } from "../../features/auth/authSlice";

import MessageTicks from "../../components/common/MessageTicks";
import AttachmentPreview from "../../components/common/AttachmentPreview";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const TYPING_TIMEOUT_MS = 2000;
const PAGE_SIZE = 30;
const SCROLL_TOP_THRESHOLD = 100;

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "Offline";
  const diffMs = Date.now() - new Date(lastSeen).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Last seen just now";
  if (diffMin < 60) return `Last seen ${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Last seen ${diffHr}h ago`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `Last seen ${diffDays}d ago`;

  return `Last seen ${new Date(lastSeen).toLocaleDateString()}`;
}

export default function MessagesPage() {
  const dispatch = useDispatch();
  const { user: me } = useSelector((state) => state.auth);
  const { friends } = useSelector((state) => state.friends);
  const {
    conversations,
    activeConversationId,
    activeMessages,
    hasMoreMessages,
    loadingOlderMessages,
    onlineUsers,
    typingUserId,
    loadingConversations,
    loadingMessages,
  } = useSelector((state) => state.messages);

  const [draft, setDraft] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPopoverRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const messagesContainerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const isPrependRef = useRef(false);

  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blockActionLoading, setBlockActionLoading] = useState(false);

  const activeFriend = friends.find((f) => f._id === activeConversationId);

  const loadSidebarData = useCallback(async () => {
    dispatch(setLoadingConversations(true));
    try {
      const [convRes, friendsRes] = await Promise.all([
        getConversationsList(),
        getFriends(),
      ]);
      dispatch(setConversations(convRes.data.conversations));
      dispatch(setFriends(friendsRes.data.friends));
    } catch {
      toast.error("Couldn't load conversations.");
    } finally {
      dispatch(setLoadingConversations(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadSidebarData();
  }, [loadSidebarData]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (isPrependRef.current) {
      isPrependRef.current = false;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      }
      return;
    }

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        emojiPopoverRef.current &&
        !emojiPopoverRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current && activeConversationId) {
        emitStopTyping(activeConversationId);
        isTypingRef.current = false;
      }
    };
  }, [activeConversationId]);

  useEffect(() => {
    setPendingFile(null);
    setUploadProgress(null);
  }, [activeConversationId]);

  const openConversation = async (friendId) => {
    dispatch(setActiveConversationId(friendId));
    dispatch(setLoadingMessages(true));
    try {
      const res = await getConversation(friendId, { limit: PAGE_SIZE });
      dispatch(
        setActiveMessages({
          messages: res.data.messages,
          hasMore: res.data.hasMore,
        }),
      );
      await markAsRead(friendId);
      dispatch(markActiveMessagesRead());
    } catch {
      toast.error("Couldn't load this conversation.");
    } finally {
      dispatch(setLoadingMessages(false));
    }
  };

  const loadOlderMessages = useCallback(async () => {
    if (!activeConversationId || !hasMoreMessages || loadingOlderMessages)
      return;

    const oldestMessage = activeMessages[0];
    if (!oldestMessage) return;

    const container = messagesContainerRef.current;
    prevScrollHeightRef.current = container ? container.scrollHeight : 0;
    isPrependRef.current = true;

    dispatch(setLoadingOlderMessages(true));
    try {
      const res = await getConversation(activeConversationId, {
        before: oldestMessage.createdAt,
        limit: PAGE_SIZE,
      });
      dispatch(
        prependOlderMessages({
          messages: res.data.messages,
          hasMore: res.data.hasMore,
        }),
      );
    } catch {
      isPrependRef.current = false;
      toast.error("Couldn't load older messages.");
    } finally {
      dispatch(setLoadingOlderMessages(false));
    }
  }, [
    activeConversationId,
    hasMoreMessages,
    loadingOlderMessages,
    activeMessages,
    dispatch,
  ]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (container.scrollTop < SCROLL_TOP_THRESHOLD) {
      loadOlderMessages();
    }
  };

  const handleDraftChange = (e) => {
    setDraft(e.target.value);
    if (!activeConversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTyping(activeConversationId);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitStopTyping(activeConversationId);
    }, TYPING_TIMEOUT_MS);
  };

  const handleEmojiClick = (emojiData) => {
    const input = inputRef.current;
    const cursor = input ? input.selectionStart : draft.length;
    const before = draft.slice(0, cursor);
    const after = draft.slice(cursor);
    const next = before + emojiData.emoji + after;
    setDraft(next);

    requestAnimationFrame(() => {
      if (input) {
        const newPos = cursor + emojiData.emoji.length;
        input.focus();
        input.setSelectionRange(newPos, newPos);
      }
    });
  };

  const getMaxSizeForFile = (file) => {
    const isImage = file.type.startsWith("image/");
    const isVideoOrAudio =
      file.type.startsWith("video/") || file.type.startsWith("audio/");
    if (isVideoOrAudio) return 100 * 1024 * 1024;
    return 10 * 1024 * 1024;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;
    const maxSize = getMaxSizeForFile(file);
    if (file.size > maxSize) {
      toast.error(
        `File is too large (max ${maxSize / (1024 * 1024)}MB for this type).`,
      );
      return;
    }
    setPendingFile(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if ((!content && !pendingFile) || !activeConversationId || sending) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      emitStopTyping(activeConversationId);
      isTypingRef.current = false;
    }

    setSending(true);
    const fileToSend = pendingFile;
    setDraft("");
    setShowEmojiPicker(false);
    setPendingFile(null);

    try {
      let attachments = [];

      if (fileToSend) {
        setUploadProgress(0);
        const uploadRes = await uploadAttachment(
          fileToSend,
          activeConversationId,
          (progressEvent) => {
            const pct = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(pct);
          },
        );
        attachments = [uploadRes.data.attachment];
        setUploadProgress(null);
      }

      const res = await sendMessage(activeConversationId, content, attachments);
      dispatch(appendMessage(res.data.message));
      const convRes = await getConversationsList();
      dispatch(setConversations(convRes.data.conversations));
    } catch (err) {
      setDraft(content);
      setPendingFile(fileToSend);
      setUploadProgress(null);
      toast.error(err.response?.data?.message || "Couldn't send message.");
    } finally {
      setSending(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!activeConversationId) return;
    setBlockActionLoading(true);
    try {
      const res = iBlockedActiveFriend
        ? await unblockUser(activeConversationId)
        : await blockUser(activeConversationId);
      dispatch(updateUser({ blockedUsers: res.data.blockedUsers }));
      toast.success(iBlockedActiveFriend ? "User unblocked." : "User blocked.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Couldn't update block status.",
      );
    } finally {
      setBlockActionLoading(false);
      setShowBlockConfirm(false);
    }
  };

  const conversationFor = (friendId) =>
    conversations.find((c) => c.participants.some((p) => p._id === friendId));

  const sortedContacts = [...friends].sort((a, b) => {
    const convA = conversationFor(a._id);
    const convB = conversationFor(b._id);
    if (convA && convB)
      return new Date(convB.updatedAt) - new Date(convA.updatedAt);
    if (convA) return -1;
    if (convB) return 1;
    return a.name.localeCompare(b.name);
  });

  const activeFriendIsOnline = onlineUsers.includes(activeConversationId);
  const activeFriendIsTyping = typingUserId === activeConversationId;

  const iBlockedActiveFriend = me?.blockedUsers?.includes(activeConversationId);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div
        className={`w-full md:w-80 border-r border-[var(--border)] flex-col overflow-y-auto
        ${activeConversationId ? "hidden md:flex" : "flex"}`}
      >
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <h1 className="text-base font-semibold text-[var(--text-primary)]">
            Messages
          </h1>
        </div>

        {loadingConversations && (
          <p className="text-sm text-[var(--text-secondary)] px-4 py-3">
            Loading...
          </p>
        )}

        {!loadingConversations && sortedContacts.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)] px-4 py-6 text-center">
            Add friends to start messaging them.
          </p>
        )}

        <ul>
          {sortedContacts.map((friend) => {
            const conv = conversationFor(friend._id);
            const isOnline = onlineUsers.includes(friend._id);
            const isActive = activeConversationId === friend._id;

            return (
              <li key={friend._id}>
                <button
                  onClick={() => openConversation(friend._id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isActive ? "bg-[var(--primary)]/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="relative shrink-0">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                        {friend.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[var(--surface)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {friend.name}
                      </p>
                      {conv?.unreadCount > 0 && (
                        <span className="bg-[var(--primary)] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {conv?.lastMessage?.content || "Start a conversation"}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className={`flex-1 flex-col min-w-0 ${
          activeConversationId ? "flex" : "hidden md:flex"
        }`}
      >
        {!activeConversationId && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Select a conversation to start messaging.
            </p>
          </div>
        )}

        {activeConversationId && (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
              <button
                onClick={() => dispatch(setActiveConversationId(null))}
                aria-label="Back to conversations"
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-white/5"
              >
                <ArrowLeft size={18} />
              </button>
              {activeFriend?.avatar ? (
                <img
                  src={activeFriend.avatar}
                  alt={activeFriend.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-[var(--border)]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                  {activeFriend?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {activeFriend?.name}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {activeFriendIsTyping
                    ? "typing..."
                    : activeFriendIsOnline
                      ? "Online"
                      : formatLastSeen(activeFriend?.lastSeen)}
                </p>
              </div>
              <button
                onClick={() => setShowBlockConfirm(true)}
                aria-label={
                  iBlockedActiveFriend ? "Unblock user" : "Block user"
                }
                className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-white/5"
              >
                <Ban
                  size={18}
                  className={iBlockedActiveFriend ? "text-red-400" : ""}
                />
              </button>
            </div>

            <div
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
            >
              {loadingOlderMessages && (
                <div className="flex justify-center py-2">
                  <Loader2
                    size={16}
                    className="animate-spin text-[var(--text-secondary)]"
                  />
                </div>
              )}

              {!loadingMessages &&
                !hasMoreMessages &&
                activeMessages.length > 0 && (
                  <p className="text-center text-[10px] text-[var(--text-secondary)] py-1">
                    Beginning of conversation
                  </p>
                )}

              {loadingMessages && (
                <p className="text-sm text-[var(--text-secondary)]">
                  Loading...
                </p>
              )}
              {!loadingMessages && activeMessages.length === 0 && (
                <p className="text-sm text-[var(--text-secondary)] text-center py-8">
                  No messages yet. Say hello.
                </p>
              )}
              {activeMessages.map((msg) => {
                const isMine =
                  msg.sender === me._id || msg.sender?._id === me._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? "bg-[var(--primary)] text-white rounded-br-sm"
                          : "bg-[var(--surface-alt)] text-[var(--text-primary)] rounded-bl-sm"
                      }`}
                    >
                      {msg.attachments?.length > 0 && (
                        <div className="mb-1.5 space-y-1.5">
                          {msg.attachments.map((att, idx) => (
                            <AttachmentPreview key={idx} attachment={att} />
                          ))}
                        </div>
                      )}
                      {msg.content && <p>{msg.content}</p>}
                      {isMine && (
                        <div className="flex justify-end mt-1">
                          <MessageTicks status={msg.status} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="relative flex flex-col gap-2 px-4 py-3 border-t border-[var(--border)]"
            >
              {pendingFile && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-[var(--border)] text-xs text-[var(--text-primary)]">
                  <Paperclip size={14} className="shrink-0" />
                  <span className="truncate flex-1">{pendingFile.name}</span>
                  {uploadProgress !== null ? (
                    <span className="shrink-0 text-[var(--text-secondary)]">
                      {uploadProgress}%
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingFile(null)}
                      aria-label="Remove attachment"
                      className="shrink-0 text-[var(--text-secondary)] hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              {showEmojiPicker && (
                <div
                  ref={emojiPopoverRef}
                  className="absolute bottom-full mb-2 left-4 z-10"
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick} height={350} />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                  disabled={sending}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-white/5 shrink-0 disabled:opacity-40"
                >
                  <Paperclip size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  aria-label="Insert emoji"
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-white/5 shrink-0"
                >
                  <Smile size={18} />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={handleDraftChange}
                  disabled={iBlockedActiveFriend}
                  placeholder={
                    iBlockedActiveFriend
                      ? "You've blocked this user"
                      : "Type a message..."
                  }
                  className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={(!draft.trim() && !pendingFile) || sending}
                  aria-label="Send message"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
      <ConfirmDialog
        open={showBlockConfirm}
        onOpenChange={setShowBlockConfirm}
        title={iBlockedActiveFriend ? "Unblock this user?" : "Block this user?"}
        description={
          iBlockedActiveFriend
            ? "You'll be able to message each other again."
            : "They won't be able to message you, and you won't be able to message them."
        }
        onConfirm={handleToggleBlock}
        confirmLabel={iBlockedActiveFriend ? "Unblock" : "Block"}
      />
    </div>
  );
}
