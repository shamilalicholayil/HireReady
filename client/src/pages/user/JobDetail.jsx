import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { fetchJobById, applyToJob } from "../../api/jobApi";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";

function timeAgo(date) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return `Posted ${days} days ago`;
}

const TRACK_LABELS = {
  frontend: "Frontend",
  backend: "Backend",
  dsa: "DSA",
  fullstack: "Full-stack",
};

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobById(id)
      .then(({ data }) => setJob(data.data.job))
      .catch(() => toast.error("Job not found or no longer active."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyToJob(id);
      setApplied(true);
      toast.success("Application submitted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!job)
    return (
      <div className="p-6 text-[var(--text-secondary)]">Job not found.</div>
    );

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Link
        to="/job-board"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4"
      >
        <ArrowLeft size={15} /> Back to Job Board
      </Link>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-8">
        {/* Header */}
        <div className="flex gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold text-xl shrink-0">
            {job.company?.charAt(0).toUpperCase() || "J"}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[var(--text-primary)] text-xl sm:text-2xl font-bold leading-tight">
              {job.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-1">
              {job.company}
            </p>
            <p className="text-[var(--text-secondary)] text-sm flex items-center gap-1 mt-1">
              <MapPin size={13} className="shrink-0" />
              {job.location}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs uppercase font-medium tracking-wide text-[var(--primary)] bg-[var(--primary)]/10 rounded-full px-3 py-1">
            {TRACK_LABELS[job.track] || job.track}
          </span>
          {job.salaryRange?.min && (
            <span className="text-xs font-medium text-[var(--text-primary)] bg-[var(--surface-alt)] border border-[var(--border)] rounded-full px-3 py-1">
              ₹{job.salaryRange.min.toLocaleString()} – ₹
              {job.salaryRange.max.toLocaleString()}
            </span>
          )}
          <span className="text-xs text-[var(--text-secondary)]">
            {timeAgo(job.createdAt)}
          </span>
        </div>

        <div className="mt-5">
          <Button
            onClick={handleApply}
            disabled={applied || applying}
            className="w-full sm:w-auto"
          >
            {applied ? "Applied" : applying ? "Applying..." : "Apply"}
          </Button>
        </div>

        <div className="h-px bg-[var(--border)] my-6" />

        {/* Description */}
        <div>
          <h2 className="text-[var(--text-primary)] font-semibold text-sm uppercase tracking-wide mb-3">
            About the job
          </h2>
          <p className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>
      </div>
    </div>
  );
}
