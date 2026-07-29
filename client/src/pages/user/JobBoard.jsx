import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { fetchActiveJobs } from "../../api/jobApi";
import { MapPin } from "lucide-react";

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

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveJobs()
      .then(({ data }) => setJobs(data.data.jobs))
      .catch(() => toast.error("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-3">
      <h2 className="text-[var(--text-primary)] text-xl font-semibold mb-2">
        Job Board
      </h2>

      {jobs.map((job) => (
        <Link
          key={job._id}
          to={`/jobs/${job._id}`}
          className="block bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]/60 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center font-bold text-sm shrink-0">
              {job.company?.charAt(0).toUpperCase() || "J"}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-[var(--text-primary)] font-semibold text-sm sm:text-base leading-snug truncate">
                {job.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm truncate">
                {job.company}
              </p>
              <p className="text-[var(--text-secondary)] text-xs flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="shrink-0" />
                {job.location}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] uppercase font-medium tracking-wide text-[var(--primary)] bg-[var(--primary)]/10 rounded-full px-2 py-0.5">
                  {TRACK_LABELS[job.track] || job.track}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  {timeAgo(job.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default JobBoard;
