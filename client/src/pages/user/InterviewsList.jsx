import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchMySlots, updateInterviewStatus } from "../../api/slotApi";
import InterviewSlotCard from "../../components/jobs/InterviewSlotCard";

const InterviewsList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const FINISHED_STATUSES = ["completed", "no_show"];

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchMySlots();
        setSlots(data.data.slots);
      } catch (err) {
        toast.error("Failed to load interviews.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  const filteredSlots = slots.filter((slot) => {
    if (filter === "finished")
      return FINISHED_STATUSES.includes(slot.interviewStatus);
    if (filter === "upcoming")
      return !FINISHED_STATUSES.includes(slot.interviewStatus);
    return true;
  });

  if (loading)
    return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!slots.length)
    return (
      <div className="p-6 text-[var(--text-secondary)]">
        No interviews scheduled yet.
      </div>
    );

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
        My Interviews
      </h2>
      <div className="mb-2 flex flex-wrap gap-2">
        {["all", "upcoming", "finished"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-2 text-sm transition sm:px-4 ${
              filter === f
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface)] text-[var(--text-secondary)]"
            }`}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filteredSlots.map((slot) => (
        <InterviewSlotCard
          key={slot._id}
          slot={slot}
          isHR={false}
          user={user}
          onJoin={handleJoin}
        />
      ))}
    </div>
  );
};

export default InterviewsList;
