import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchActiveJobs, applyToJob } from "../../api/jobApi";
import { Button } from "@/components/ui/button";
import Card from "../../components/common/Card";

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(new Set());

  useEffect(() => {
    fetchActiveJobs()
      .then(({ data }) => setJobs(data.data.jobs))
      .catch(() => toast.error("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (jobId) => {
    try {
      await applyToJob(jobId);
      setAppliedIds((prev) => new Set(prev).add(jobId));
      toast.success("Application submitted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply.");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-[var(--text-secondary)]">Loading jobs...</div>
    );
  if (!jobs.length)
    return (
      <div className="p-6 text-[var(--text-secondary)]">
        No open positions right now.
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-[var(--text-primary)] text-xl font-semibold">
        Job Board
      </h2>
      {jobs.map((job) => (
        <Card
          key={job._id}
          title={job.title}
          description={`${job.company} — ${job.location}`}
        >
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {job.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-[var(--text-secondary)]">
              {job.track}
            </span>
            <Button
              onClick={() => handleApply(job._id)}
              disabled={appliedIds.has(job._id)}
            >
              {appliedIds.has(job._id) ? "Applied" : "Apply"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default JobBoard;
