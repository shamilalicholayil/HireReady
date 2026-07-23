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

  if (loading)
    return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;
  if (!slots.length)
    return (
      <div className="p-6 text-[var(--text-secondary)]">
        No interviews scheduled yet.
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-[var(--text-primary)] text-xl font-semibold">
        {isHR ? "Scheduled Interviews" : "My Interviews"}
      </h2>
      {slots.map((slot) => (
        <Card
          key={slot._id}
          title={slot.track}
          description={new Date(slot.startTime).toLocaleString()}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
              {slot.interviewStatus.replace("_", " ")}
            </span>
            <div className="flex gap-2">
              {canJoin(slot) && (
                <Button onClick={() => handleJoin(slot)}>
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
                    onClick={() => handleManualStatus(slot, "completed")}
                  >
                    Mark Completed
                  </Button>
                  <Button
                    variant="destructive"
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
