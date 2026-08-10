import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { scheduleNextRound } from "../../api/slotApi";

const NextRoundButton = ({ slot, onScheduled }) => {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSchedule = async () => {
    if (!startTime || !endTime) return;
    if (new Date(startTime) >= new Date(endTime)) {
      toast.error("Start time must be before end time.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await scheduleNextRound(slot._id, startTime, endTime);
      toast.success("Next round scheduled.");
      onScheduled(data.data.nextSlot);
      setOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to schedule next round.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        Schedule Next Round
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-sm text-[var(--text-primary)] sm:w-48"
      />
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-sm text-[var(--text-primary)] sm:w-48"
      />
      <div className="flex gap-2">
        <Button
          className="flex-1 sm:flex-none"
          disabled={!startTime || !endTime || submitting}
          onClick={handleSchedule}
        >
          {submitting ? "Scheduling..." : "Confirm"}
        </Button>
        <Button
          variant="outline"
          className="flex-1 sm:flex-none"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default NextRoundButton;
