import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  fetchMySlots,
  updateInterviewStatus,
  setSlotOutcome,
} from "../../api/slotApi";
import InterviewSlotCard from "../../components/jobs/InterviewSlotCard";
import Pagination from "../../components/common/Pagination";

const ROUNDS = ["all", "screening", "technical", "managerial", "hr_final"];

const HRJobInterviews = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [slots, setSlots] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchMySlots({
        job: jobId,
        search,
        stage: statusFilter === "all" ? undefined : statusFilter,
        round: roundFilter === "all" ? undefined : roundFilter,
        page,
        limit: 10,
      })
        .then(({ data }) => {
          setSlots(data.data.slots);
          setTotalPages(data.data.pagination.totalPages);
          if (data.data.slots[0]?.job?.title)
            setJobTitle(data.data.slots[0].job.title);
        })
        .catch(() => toast.error("Failed to load interviews."))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [jobId, search, statusFilter, roundFilter, page]);

  const handleFilterChange = (setter) => (value) => {
    setPage(1);
    setter(value);
  };

  const handleJoin = async (slot) => {
    try {
      if (slot.interviewStatus === "not_started") {
        await updateInterviewStatus(slot._id, "in_progress");
      }
      navigate(`/interview/${slot._id}`);
    } catch (err) {
      if (err.response?.status === 403)
        toast.error("Not authorized to join this interview.");
      else if (err.response?.status === 400)
        toast.error(err.response.data.message);
      else toast.error("Failed to join. Try again.");
    }
  };

  const handleManualStatus = async (slot, status) => {
    try {
      const { data } = await updateInterviewStatus(slot._id, status);
      setSlots((prev) =>
        prev.map((s) => (s._id === slot._id ? data.data.slot : s)),
      );
      toast.success(`Marked as ${status.replace("_", " ")}.`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleOutcome = async (slot, outcome) => {
    try {
      const { data } = await setSlotOutcome(slot._id, outcome);
      setSlots((prev) =>
        prev.map((s) => (s._id === slot._id ? data.data.slot : s)),
      );
      toast.success(
        outcome === "shortlisted" ? "Shortlisted for next round." : "Rejected.",
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set outcome.");
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => navigate("/hr/interviews")}
      >
        ← Back to Interviews
      </Button>
      <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
        {jobTitle || "Interviews"}
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          placeholder="Search by candidate name..."
          value={search}
          onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
          className="w-full flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)]"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {["all", "upcoming", "finished"].map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(setStatusFilter)(f)}
            className={`rounded-full px-3 py-2 text-sm transition sm:px-4 ${
              statusFilter === f
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)]"
            }`}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {ROUNDS.map((r) => (
          <button
            key={r}
            onClick={() => handleFilterChange(setRoundFilter)(r)}
            className={`rounded-full px-3 py-2 text-sm transition sm:px-4 ${
              roundFilter === r
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)]"
            }`}
          >
            {r === "all" ? "All Rounds" : r.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-[var(--text-secondary)]">Loading...</div>
      )}
      {!loading && !slots.length && (
        <p className="text-[var(--text-secondary)]">
          No interviews match this filter.
        </p>
      )}

      {!loading &&
        slots.map((slot) => (
          <InterviewSlotCard
            key={slot._id}
            slot={slot}
            isHR={true}
            user={user}
            hasNextRound={() => slot.hasNextRound}
            onJoin={handleJoin}
            onManualStatus={handleManualStatus}
            onOutcome={handleOutcome}
            onNextRoundScheduled={(nextSlot) =>
              setSlots((prev) => [...prev, nextSlot])
            }
          />
        ))}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default HRJobInterviews;
