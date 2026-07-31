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
    <div className="space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
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
            className="flex cursor-pointer flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--primary)]/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-[var(--text-primary)] font-semibold truncate">
                {job.title}
              </h3>
              <p className="break-words text-sm text-[var(--text-secondary)]">
                {job.company} — {job.location}
              </p>
              <p className="text-[var(--text-secondary)] text-xs mt-1">
                Posted {new Date(job.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center shrink-0">
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${
                  job.isClosed
                    ? "text-[var(--text-secondary)] bg-white/5"
                    : job.isActive
                      ? "text-green-400 bg-green-400/10"
                      : "text-yellow-400 bg-yellow-400/10"
                }`}
              >
                {job.isClosed ? "Closed" : job.isActive ? "Open" : "Inactive"}
              </span>
              <span className="whitespace-nowrap text-xs text-[var(--text-secondary)]">
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
