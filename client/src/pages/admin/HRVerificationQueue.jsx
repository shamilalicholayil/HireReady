import { useState } from "react";
import { toast } from "sonner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  approveHRApplicant,
  rejectHRApplicant,
  downloadHRDocument,
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

  async function handleDownloadHRDocument(applicant) {
    try {
      const documentId = applicant.hrDocuments[0]._id;
      const res = await downloadHRDocument(applicant._id, documentId);
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "hr-document.pdf";
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Couldn't download document.");
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1
        className="text-2xl font-bold sm:text-3xl"
        style={{ color: "var(--text-primary)" }}
      >
        HR Verification Queue
      </h1>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className="rounded-lg px-4 py-2 text-sm font-semibold capitalize transition"
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
        className="w-full rounded-lg p-3 text-sm sm:max-w-md"
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
            className="flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-start"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
              {a.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <p
                className="break-words text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {a.name} — <span className="font-normal">{a.companyName}</span>
              </p>
              <p
                className="break-all text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {a.email}
              </p>
              {a.hrDocuments?.[0]?.url ? (
                <button
                  type="button"
                  onClick={() => handleDownloadHRDocument(a)}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  Download verification document
                </button>
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
                  <div className="mt-1 space-y-1 border-l-2 border-[var(--border)] pl-3 break-words">
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
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row shrink-0">
                <button
                  onClick={() =>
                    setConfirmTarget({ user: a, action: "approve" })
                  }
                  className="w-full rounded-lg px-3 py-2 text-xs font-semibold sm:w-auto"
                  style={{ background: "var(--success)", color: "#fff" }}
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    setConfirmTarget({ user: a, action: "reject" })
                  }
                  className="w-full rounded-lg px-3 py-2 text-xs font-semibold sm:w-auto"
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
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
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
