import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { fetchMySlots } from "../../api/slotApi";
import { scheduleApplicantInterview } from "../../api/jobApi";

const formatSlotOption = (slot) => {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  return `${start.toLocaleDateString("en-GB")} — ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} to ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
};

const ScheduleInterviewButton = ({ appId, track, onScheduled }) => {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchMySlots({ track, status: "open" })
      .then(({ data }) => setSlots(data.data.slots))
      .catch(() => toast.error("Failed to load open slots."))
      .finally(() => setLoading(false));
  }, [open, track]);

  const handleSchedule = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      const { data } = await scheduleApplicantInterview(appId, selectedSlot);
      toast.success("Interview scheduled.");
      onScheduled(data.data.application);
      setOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to schedule interview.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        Schedule Interview
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <select
        value={selectedSlot}
        onChange={(e) => setSelectedSlot(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-sm text-[var(--text-primary)] sm:w-64"
      >
        <option value="">
          {loading ? "Loading slots..." : "Select a slot"}
        </option>
        {slots.map((slot) => (
          <option key={slot._id} value={slot._id}>
            {formatSlotOption(slot)}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button
          className="flex-1 sm:flex-none"
          disabled={!selectedSlot || submitting}
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

export default ScheduleInterviewButton;
