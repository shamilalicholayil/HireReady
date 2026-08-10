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
import ScheduleInterviewButton from "../../components/jobs/ScheduleInterviewButton";

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
    <div className="space-y-4 p-4 sm:p-6">
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => navigate("/hr/applications")}
      >
        ← Back to Applications
      </Button>

      <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
        {job?.title || "Applicants"}
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          placeholder="Search by applicant name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)] sm:w-56"
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <span className="w-fit rounded-full bg-[var(--surface)] px-3 py-1 text-xs uppercase text-[var(--text-secondary)]">
                {app.status}
              </span>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                {app.applicant.resumeUrl && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleDownloadResume(app.applicant._id)}
                  >
                    Download CV
                  </Button>
                )}
                {app.status === "applied" && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleStatusChange(app._id, "shortlisted")}
                    >
                      Shortlist
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full sm:w-auto"
                      onClick={() => handleStatusChange(app._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
            {app.status === "shortlisted" && app.scheduledSlot && (
              <p className="mt-3 break-words text-sm text-[var(--text-secondary)]">
                Interview: {formatSlotTime(app.scheduledSlot)}
              </p>
            )}

            {app.status === "shortlisted" && !app.scheduledSlot && (
              <div className="mt-3">
                <ScheduleInterviewButton
                  appId={app._id}
                  onScheduled={(updatedApp) =>
                    setApplications((prev) =>
                      prev.map((a) =>
                        a._id === updatedApp._id ? updatedApp : a,
                      ),
                    )
                  }
                />
              </div>
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
