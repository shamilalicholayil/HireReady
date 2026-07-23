import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { toggleBlockUser } from "../../api/userApi";
import useAdminUsers from "../../hooks/useAdminUsers";

const ROLES = ["user", "hr", "admin"];

export default function UserManagement() {
  const [activeRole, setActiveRole] = useState("user");
  const [confirmTarget, setConfirmTarget] = useState(null);

  const {
    users,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    loading,
    error,
    refetch,
  } = useAdminUsers(activeRole);

  const confirmToggleBlock = async () => {
    if (!confirmTarget) return;
    try {
      await toggleBlockUser(confirmTarget._id);
      toast.success(
        confirmTarget.isBlocked
          ? "User unblocked successfully."
          : "User blocked successfully.",
      );
      refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update user status.",
      );
    } finally {
      setConfirmTarget(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        User Management
      </h1>

      {/* Role Tabs */}
      <div className="flex gap-2">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize"
            style={{
              background:
                activeRole === role ? "var(--primary)" : "var(--surface)",
              color: activeRole === role ? "#fff" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full max-w-md rounded-lg p-3 text-sm"
        style={{
          background: "var(--bg)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* User List */}
      <div className="space-y-3">
        {!loading && users.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No {activeRole}s found.
          </p>
        )}

        {users.map((u) => (
          <div
            key={u._id}
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {u.avatar ? (
              <img
                src={u.avatar}
                alt={u.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-[var(--border)] shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {u.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {u.name}
                </p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: u.isBlocked
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(52, 211, 153, 0.15)",
                    color: u.isBlocked ? "#ef4444" : "var(--success)",
                  }}
                >
                  {u.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {u.email}
              </p>
              {u.track && (
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {u.track}
                </p>
              )}
            </div>

            <button
              onClick={() => setConfirmTarget(u)}
              disabled={u.role === "admin"}
              className="px-3 py-1 rounded-lg text-xs font-semibold shrink-0 disabled:opacity-40"
              style={{
                background: u.isBlocked ? "var(--success)" : "#ef4444",
                color: "#fff",
              }}
            >
              {u.isBlocked ? "Unblock" : "Block"}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-40"
            style={{
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            Prev
          </button>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-40"
            style={{
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={
          confirmTarget?.isBlocked ? "Unblock this user?" : "Block this user?"
        }
        description={
          confirmTarget?.isBlocked
            ? "This user will regain access to their account."
            : "This user will be logged out immediately and denied access until unblocked."
        }
        onConfirm={confirmToggleBlock}
        confirmLabel={confirmTarget?.isBlocked ? "Unblock" : "Block"}
      />
    </div>
  );
}
