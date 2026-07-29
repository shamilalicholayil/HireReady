import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchJobById,
  fetchJobApplications,
  updateApplicationStatus,
} from "../../api/jobApi";
import { downloadResume } from "../../api/profileApi";
import { Button } from "@/components/ui/button";
import Card from "../../components/common/Card";
import CloseAndScheduleForm from "../../components/jobs/CloseAndScheduleForm";

const formatSlotTime = (slot) => {
  if (!slot) return null;
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  const date = start.toLocaleDateString("en-GB");
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const endTime = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} from ${startTime} to ${endTime}`;
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

const JobApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchJobById(jobId)
      .then(({ data }) => setJob(data.data.job))
      .catch(() => toast.error("Failed to load job."));
  }, [jobId]);

  const loadApplications = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await fetchJobApplications(jobId, params);
      setApplications(data.data.applications);
    } catch (err) {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApplications({ search, status });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, status]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const { data } = await updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? data.data.application : a)),
      );
      toast.success(
        newStatus === "shortlisted"
          ? "Applicant shortlisted."
          : `Marked as ${newStatus}.`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  async function handleDownloadResume(applicantId) {
    try {
      const res = await downloadResume(applicantId);
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Couldn't download resume.");
    }
  }

  const hasDecisions = applications.some(
    (a) => a.status === "shortlisted" || a.status === "rejected",
  );

  return (
    <div className="p-6 space-y-4">
      <Button variant="outline" onClick={() => navigate("/hr/applications")}>
        ← Back to Applications
      </Button>

      <h2 className="text-[var(--text-primary)] text-xl font-semibold">
        {job?.title || "Applicants"}
      </h2>

      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Search by applicant name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-[var(--text-secondary)]">Loading...</div>
      )}
      {!loading && !applications.length && (
        <p className="text-[var(--text-secondary)]">
          No applicants match this filter.
        </p>
      )}

      {!loading &&
        applications.map((app) => (
          <Card
            key={app._id}
            title={app.applicant.name}
            description={app.applicant.email}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-[var(--text-secondary)]">
                {app.status}
              </span>
              {app.status === "applied" && (
                <div className="flex gap-2">
                  {app.applicant.resumeUrl && (
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadResume(app.applicant._id)}
                    >
                      Download CV
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(app._id, "shortlisted")}
                  >
                    Shortlist
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange(app._id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
            {app.status === "shortlisted" && app.scheduledSlot && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Interview: {formatSlotTime(app.scheduledSlot)}
              </p>
            )}
          </Card>
        ))}

      {job && !job.isClosed && hasDecisions && (
        <CloseAndScheduleForm
          jobId={jobId}
          onClosed={() => loadApplications({ search, status })}
        />
      )}
    </div>
  );
};

export default JobApplicants;
