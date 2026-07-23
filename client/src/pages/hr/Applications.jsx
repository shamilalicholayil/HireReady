import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchMyJobPostings,
  fetchJobApplications,
  updateApplicationStatus,
} from "../../api/jobApi";
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

const Applications = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobPostings(true)
      .then(({ data }) => setJobs(data.data.jobs))
      .catch(() => toast.error("Failed to load your postings."))
      .finally(() => setLoading(false));
  }, []);

  const loadApplications = async (jobId) => {
    setSelectedJobId(jobId);
    try {
      const { data } = await fetchJobApplications(jobId);
      setApplications(data.data.applications);
    } catch (err) {
      toast.error("Failed to load applications.");
    }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      const { data } = await updateApplicationStatus(appId, status);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? data.data.application : a)),
      );
      toast.success(
        status === "shortlisted"
          ? "Applicant shortlisted."
          : `Marked as ${status}.`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const selectedJob = jobs.find((j) => j._id === selectedJobId);
  const hasDecisions = applications.some(
    (a) => a.status === "shortlisted" || a.status === "rejected",
  );

  if (loading)
    return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-[var(--text-primary)] text-xl font-semibold">
        Applications
      </h2>

      <div className="flex gap-2 flex-wrap">
        {jobs.map((job) => (
          <Button
            key={job._id}
            variant={selectedJobId === job._id ? "default" : "outline"}
            onClick={() => loadApplications(job._id)}
          >
            {job.title} {job.isClosed && "(Closed)"}
          </Button>
        ))}
      </div>

      {selectedJobId && !applications.length && (
        <p className="text-[var(--text-secondary)]">
          No applicants yet for this job.
        </p>
      )}

      {applications.map((app) => (
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

      {selectedJobId && !selectedJob?.isClosed && hasDecisions && (
        <CloseAndScheduleForm
          jobId={selectedJobId}
          onClosed={() => loadApplications(selectedJobId)}
        />
      )}
    </div>
  );
};

export default Applications;
