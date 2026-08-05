import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  searchUsers,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  sendFriendRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
} from "../../api/friendApi";
import {
  setFriends,
  appendFriends,
  setIncoming,
  setOutgoing,
  setSearchResults,
  appendSearchResults,
  removeIncoming,
  removeOutgoing,
  addFriend,
  setFriendsLoading,
  setFriendsLoadingMore,
} from "../../features/friend/friendSlice";
import useLoadMoreOnScroll from "../../hooks/useLoadMoreOnScroll";

const TABS = [
  { key: "friends", label: "Friends" },
  { key: "requests", label: "Requests" },
  { key: "search", label: "Find people" },
];

export default function FriendsPage() {
  const dispatch = useDispatch();
  const {
    friends,
    friendsPagination,
    incoming,
    outgoing,
    searchResults,
    searchPagination,
    loading,
    loadingMore,
  } = useSelector((state) => state.friends);

  const [activeTab, setActiveTab] = useState("friends");
  const [query, setQuery] = useState("");
  const debounceRef = useRef(null);

  const loadFriends = useCallback(
    async (page = 1) => {
      dispatch(
        page === 1 ? setFriendsLoading(true) : setFriendsLoadingMore(true),
      );
      try {
        const res = await getFriends(page);
        const action = page === 1 ? setFriends : appendFriends;
        dispatch(
          action({
            friends: res.data.friends,
            pagination: res.data.pagination,
          }),
        );
      } catch {
        toast.error("Couldn't load your friends list.");
      } finally {
        dispatch(
          page === 1 ? setFriendsLoading(false) : setFriendsLoadingMore(false),
        );
      }
    },
    [dispatch],
  );

  const loadRequests = useCallback(async () => {
    dispatch(setFriendsLoading(true));
    try {
      const [inRes, outRes] = await Promise.all([
        getIncomingRequests(),
        getOutgoingRequests(),
      ]);
      dispatch(setIncoming(inRes.data.requests));
      dispatch(setOutgoing(outRes.data.requests));
    } catch {
      toast.error("Couldn't load requests.");
    } finally {
      dispatch(setFriendsLoading(false));
    }
  }, [dispatch]);

  const runSearch = useCallback(
    async (q, page = 1) => {
      dispatch(
        page === 1 ? setFriendsLoading(true) : setFriendsLoadingMore(true),
      );
      try {
        const res = await searchUsers(q, page);
        const action = page === 1 ? setSearchResults : appendSearchResults;
        dispatch(
          action({ users: res.data.users, pagination: res.data.pagination }),
        );
      } catch {
        toast.error("Search failed.");
      } finally {
        dispatch(
          page === 1 ? setFriendsLoading(false) : setFriendsLoadingMore(false),
        );
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (activeTab === "friends") loadFriends(1);
    if (activeTab === "requests") loadRequests();
  }, [activeTab, loadFriends, loadRequests]);

  useEffect(() => {
    if (activeTab !== "search") return;
    if (!query.trim()) {
      dispatch(
        setSearchResults({ users: [], pagination: { page: 1, totalPages: 1 } }),
      );
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query.trim(), 1), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, activeTab, dispatch, runSearch]);

  const friendsHasMore = friendsPagination.page < friendsPagination.totalPages;
  const searchHasMore = searchPagination.page < searchPagination.totalPages;

  const friendsSentinelRef = useLoadMoreOnScroll({
    hasMore: activeTab === "friends" && friendsHasMore,
    loading: loadingMore,
    onLoadMore: useCallback(
      () => loadFriends(friendsPagination.page + 1),
      [loadFriends, friendsPagination.page],
    ),
  });

  const searchSentinelRef = useLoadMoreOnScroll({
    hasMore: activeTab === "search" && searchHasMore,
    loading: loadingMore,
    onLoadMore: useCallback(
      () => runSearch(query.trim(), searchPagination.page + 1),
      [runSearch, query, searchPagination.page],
    ),
  });

  const handleSend = async (userId) => {
    try {
      await sendFriendRequest(userId);
      toast.success("Friend request sent.");
      if (query.trim()) runSearch(query.trim(), 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't send request.");
    }
  };

  const handleAccept = async (requestId, requesterOrUser) => {
    try {
      await acceptRequest(requestId);
      dispatch(removeIncoming(requestId));
      dispatch(addFriend(requesterOrUser));
      toast.success(`You and ${requesterOrUser.name} are now friends.`);
      if (activeTab === "search" && query.trim()) runSearch(query.trim(), 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't accept request.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectRequest(requestId);
      dispatch(removeIncoming(requestId));
      toast("Request declined.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't decline request.");
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await cancelRequest(requestId);
      dispatch(removeOutgoing(requestId));
      toast("Request cancelled.");
      if (activeTab === "search" && query.trim()) runSearch(query.trim(), 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't cancel request.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
        Friends
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Connect with people to start messaging.
      </p>

      <div className="flex gap-1 border-b border-[var(--border)] mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === t.key
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.label}
            {t.key === "requests" && incoming.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-[var(--primary)] text-white text-[10px] px-1">
                {incoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "search" && (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name..."
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] mb-5"
        />
      )}

      {loading && (
        <p className="text-sm text-[var(--text-secondary)]">Loading...</p>
      )}

      {activeTab === "friends" && !loading && friends.length === 0 && (
        <EmptyState text="No friends yet. Find people to connect with." />
      )}

      {activeTab === "friends" && (
        <ul className="space-y-2">
          {friends.map((f) => (
            <UserRow key={f._id} user={f} />
          ))}
        </ul>
      )}

      {activeTab === "search" && (
        <>
          {!loading && query.trim() && searchResults.length === 0 && (
            <EmptyState text={`No one found matching "${query}".`} />
          )}
          <ul className="space-y-2">
            {searchResults.map((u) => (
              <UserRow
                key={u._id}
                user={u}
                action={
                  <RelationshipAction
                    user={u}
                    onSend={handleSend}
                    onAccept={handleAccept}
                    onCancel={handleCancel}
                  />
                }
              />
            ))}
          </ul>
        </>
      )}

      {activeTab === "requests" && !loading && (
        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              Incoming
            </h2>
            {incoming.length === 0 ? (
              <EmptyState text="No incoming requests." small />
            ) : (
              <ul className="space-y-2">
                {incoming.map((r) => (
                  <UserRow
                    key={r._id}
                    user={r.requester}
                    action={
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(r._id, r.requester)}
                          className="text-xs font-medium bg-[var(--primary)] text-white rounded-md px-3 py-1.5 hover:opacity-90 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(r._id)}
                          className="text-xs font-medium bg-[var(--surface-alt)] text-[var(--text-primary)] border border-[var(--border)] rounded-md px-3 py-1.5 hover:bg-[var(--bg)] transition"
                        >
                          Decline
                        </button>
                      </div>
                    }
                  />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">
              Sent
            </h2>
            {outgoing.length === 0 ? (
              <EmptyState text="No pending sent requests." small />
            ) : (
              <ul className="space-y-2">
                {outgoing.map((r) => (
                  <UserRow
                    key={r._id}
                    user={r.receiver}
                    action={
                      <button
                        onClick={() => handleCancel(r._id)}
                        className="text-xs font-medium text-[var(--error)] border border-[var(--error)]/30 rounded-md px-3 py-1.5 hover:bg-[var(--error)]/10 transition"
                      >
                        Cancel request
                      </button>
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {activeTab === "friends" && friendsHasMore && (
        <div ref={friendsSentinelRef} className="h-8" />
      )}
      {activeTab === "search" && searchHasMore && (
        <div ref={searchSentinelRef} className="h-8" />
      )}
      {loadingMore && (
        <p className="text-xs text-center text-[var(--text-secondary)] py-2">
          Loading more...
        </p>
      )}
    </div>
  );
}

function RelationshipAction({ user, onSend, onAccept, onCancel }) {
  const { status, requestId } = user.relationship || { status: "none" };

  if (status === "friends") {
    return (
      <span className="text-xs text-[var(--text-secondary)]">
        Already friends
      </span>
    );
  }
  if (status === "outgoing") {
    return (
      <button
        onClick={() => onCancel(requestId)}
        className="text-xs font-medium text-[var(--error)] border border-[var(--error)]/30 rounded-md px-3 py-1.5 hover:bg-[var(--error)]/10 transition"
      >
        Cancel request
      </button>
    );
  }
  if (status === "incoming") {
    return (
      <button
        onClick={() => onAccept(requestId, user)}
        className="text-xs font-medium bg-[var(--primary)] text-white rounded-md px-3 py-1.5 hover:opacity-90 transition"
      >
        Accept
      </button>
    );
  }
  return (
    <button
      onClick={() => onSend(user._id)}
      className="text-xs font-medium bg-[var(--primary)] text-white rounded-md px-3 py-1.5 hover:opacity-90 transition"
    >
      Add friend
    </button>
  );
}

function UserRow({ user, action }) {
  return (
    <li className="flex items-center justify-between bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3">
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-full object-cover border border-[var(--border)] shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {user.name}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
        </div>
      </div>
      {action}
    </li>
  );
}

function EmptyState({ text, small }) {
  return (
    <p
      className={`text-[var(--text-secondary)] ${small ? "text-xs" : "text-sm py-8 text-center"}`}
    >
      {text}
    </p>
  );
}
