import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchMyInterviewJobGroups } from "../../api/slotApi";
import Pagination from "../../components/common/Pagination";

const HRInterviewsList = () => {
  const navigate = useNavigate();
  const [jobGroups, setJobGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchMyInterviewJobGroups({ search, track, page, limit: 10 })
        .then(({ data }) => {
          setJobGroups(data.data.jobGroups);
          setTotalPages(data.data.pagination.totalPages);
        })
        .catch(() => toast.error("Failed to load interviews."))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search, track, page]);

  const handleFilterChange = (setter) => (value) => {
    setPage(1);
    setter(value);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
        Scheduled Interviews
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          placeholder="Search by job title or company..."
          value={search}
          onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
          className="w-full flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)]"
        />
        <select
          value={track}
          onChange={(e) => handleFilterChange(setTrack)(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)] sm:w-56"
        >
          <option value="">All Tracks</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="dsa">DSA</option>
          <option value="fullstack">Full-stack</option>
        </select>
      </div>

      {loading && (
        <div className="text-[var(--text-secondary)]">Loading...</div>
      )}
      {!loading && !jobGroups.length && (
        <p className="text-[var(--text-secondary)]">
          No interviews match this filter.
        </p>
      )}

      {!loading &&
        jobGroups.map(({ job, count, nextTime }) => (
          <div
            key={job._id}
            onClick={() => navigate(`/hr/interviews/${job._id}`)}
            className="flex cursor-pointer flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--primary)]/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-[var(--text-primary)] font-semibold truncate">
                {job.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {job.company}
              </p>
            </div>
            <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end shrink-0">
              <span className="whitespace-nowrap text-xs text-[var(--text-secondary)]">
                {count} interview{count !== 1 ? "s" : ""}
              </span>
              <span className="whitespace-nowrap text-xs text-[var(--text-secondary)]">
                Next: {new Date(nextTime).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        ))}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default HRInterviewsList;
