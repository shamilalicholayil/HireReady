import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchMyJobPostings } from "../../api/jobApi";
import JobFilterBar from "../../components/jobs/JobFilterBar";
import Pagination from "../../components/common/Pagination";

const ApplicationsList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", track: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [includeClosed, setIncludeClosed] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMyJobPostings({ ...filters, includeClosed, page, limit: 10 })
      .then(({ data }) => {
        setJobs(data.data.jobs);
        setTotalPages(data.data.pagination.totalPages);
      })
      .catch(() => toast.error("Failed to load job postings."))
      .finally(() => setLoading(false));
  }, [filters, includeClosed, page]);

  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-[var(--text-primary)] text-xl font-semibold">
        Applications
      </h2>

      <JobFilterBar onFilterChange={handleFilterChange} />

      {loading && (
        <div className="text-[var(--text-secondary)]">Loading...</div>
      )}
      {!loading && !jobs.length && (
        <p className="text-[var(--text-secondary)]">
          No job postings match this filter.
        </p>
      )}

      {!loading &&
        jobs.map((job) => (
          <div
            key={job._id}
            onClick={() => navigate(`/hr/applications/${job._id}`)}
            className="cursor-pointer bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]/60 transition-colors flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <h3 className="text-[var(--text-primary)] font-semibold truncate">
                {job.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm truncate">
                {job.company} — {job.location}
              </p>
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                Posted {new Date(job.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span
                className={`text-[10px] uppercase font-medium tracking-wide rounded-full px-2 py-0.5 ${
                  job.isClosed
                    ? "text-[var(--text-secondary)] bg-white/5"
                    : job.isActive
                      ? "text-green-400 bg-green-400/10"
                      : "text-yellow-400 bg-yellow-400/10"
                }`}
              >
                {job.isClosed ? "Closed" : job.isActive ? "Open" : "Inactive"}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {job.applicantCount} applicant
                {job.applicantCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default ApplicationsList;
