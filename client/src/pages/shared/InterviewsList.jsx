import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchMySlots, updateInterviewStatus } from "../../api/slotApi";
import { Button } from "@/components/ui/button";
import Card from "../../components/common/Card";

const InterviewsList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isHR = user.role === "hr";
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

  const canJoin = (slot) => {
    const owns = isHR
      ? slot.contactEmail === user.email
      : slot.booking === user._id;
    const notEnded =
      slot.interviewStatus !== "completed" &&
      slot.interviewStatus !== "no_show";
    return owns && notEnded;
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
        {isHR ? "Scheduled Interviews" : "My Interviews"}
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
        <Card
          key={slot._id}
          title={slot.track}
          description={new Date(slot.startTime).toLocaleString()}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <span className="w-fit rounded-full bg-[var(--surface)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--text-secondary)]">
              {slot.interviewStatus.replace("_", " ")}
            </span>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {canJoin(slot) && (
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => handleJoin(slot)}
                >
                  {slot.interviewStatus === "in_progress"
                    ? "Rejoin"
                    : "Join Interview"}
                </Button>
              )}
              {/* HR-only manual status controls — only valid mid-interview per state machine */}
              {isHR && slot.interviewStatus === "in_progress" && (
                <>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleManualStatus(slot, "completed")}
                  >
                    Mark Completed
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={() => handleManualStatus(slot, "no_show")}
                  >
                    Mark No-Show
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default InterviewsList;
