import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  approveHRApplicant,
  rejectHRApplicant,
} from "../../api/hrVerificationApi";
import useHRApplicants from "../../hooks/useHRApplicants";

const STATUSES = ["pending", "approved", "rejected"];

export default function HRVerificationQueue() {
  const [activeStatus, setActiveStatus] = useState("pending");
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const {
    applicants,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    loading,
    error,
    refetch,
  } = useHRApplicants(activeStatus);

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    try {
      if (confirmTarget.action === "approve") {
        await approveHRApplicant(confirmTarget.user._id);
        toast.success("HR applicant approved.");
      } else {
        await rejectHRApplicant(confirmTarget.user._id, rejectReason);
        toast.success("HR applicant rejected.");
      }
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed.");
    } finally {
      setConfirmTarget(null);
      setRejectReason("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        HR Verification Queue
      </h1>

      <div className="flex gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className="px-4 py-2 rounded-lg text-sm font-semibold capitalize"
            style={{
              background:
                activeStatus === status ? "var(--primary)" : "var(--surface)",
              color: activeStatus === status ? "#fff" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, or company..."
        className="w-full max-w-md rounded-lg p-3 text-sm"
        style={{
          background: "var(--bg)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="space-y-3">
        {!loading && applicants.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            No {activeStatus} applicants.
          </p>
        )}

        {applicants.map((a) => (
          <div
            key={a._id}
            className="rounded-xl p-4 flex items-center gap-4"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {a.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="flex-1 space-y-1">
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {a.name} — <span className="font-normal">{a.companyName}</span>
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {a.email}
              </p>
              {a.hrDocuments?.[0]?.url ? (
                <a
                  href={a.hrDocuments[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  View verification document
                </a>
              ) : (
                <p className="text-xs text-yellow-500">
                  No document uploaded yet
                </p>
              )}
              {a.hrStatus === "rejected" && a.hrRejectionReason && (
                <p className="text-xs text-red-400">
                  Reason: {a.hrRejectionReason}
                </p>
              )}
              {a.hrRejectionHistory?.length > 0 && (
                <details className="mt-1">
                  <summary className="text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]">
                    Previously rejected {a.hrRejectionHistory.length}x
                  </summary>
                  <div className="mt-1 space-y-1 pl-3 border-l-2 border-[var(--border)]">
                    {a.hrRejectionHistory.map((entry, i) => (
                      <p
                        key={i}
                        className="text-xs text-[var(--text-secondary)]"
                      >
                        <span className="text-red-400">
                          {new Date(entry.rejectedAt).toLocaleDateString()}:
                        </span>{" "}
                        {entry.reason || "No reason given"}
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </div>

            {activeStatus === "pending" && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() =>
                    setConfirmTarget({ user: a, action: "approve" })
                  }
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--success)", color: "#fff" }}
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    setConfirmTarget({ user: a, action: "reject" })
                  }
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

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
          confirmTarget?.action === "approve"
            ? "Approve this HR applicant?"
            : "Reject this HR applicant?"
        }
        description={
          confirmTarget?.action === "approve"
            ? "This user will gain HR access immediately."
            : "They'll be notified their application was rejected."
        }
        onConfirm={handleConfirm}
        confirmLabel={
          confirmTarget?.action === "approve" ? "Approve" : "Reject"
        }
      >
        {confirmTarget?.action === "reject" && (
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full rounded-lg p-2 text-sm"
            style={{
              background: "var(--bg)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          />
        )}
      </ConfirmDialog>
    </div>
  );
}
