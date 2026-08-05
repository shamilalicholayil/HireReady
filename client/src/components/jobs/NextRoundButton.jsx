import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { fetchMySlots, scheduleNextRound } from "../../api/slotApi";

const ROUNDS = ["technical", "managerial", "hr_final"];

const formatSlotOption = (slot) => {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  return `${start.toLocaleDateString("en-GB")} — ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} to ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
};

const NextRoundButton = ({ slot, onScheduled }) => {
  const [open, setOpen] = useState(false);
  const [openSlots, setOpenSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [round, setRound] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchMySlots({ track: slot.track, status: "open" })
      .then(({ data }) => setOpenSlots(data.data.slots))
      .catch(() => toast.error("Failed to load open slots."))
      .finally(() => setLoading(false));
  }, [open, slot.track]);

  const handleSchedule = async () => {
    if (!selectedSlot || !round) return;
    setSubmitting(true);
    try {
      const { data } = await scheduleNextRound(slot._id, selectedSlot, round);
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
      <select
        value={round}
        onChange={(e) => setRound(e.target.value)}
        className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-sm text-[var(--text-primary)] sm:w-40"
      >
        <option value="">Round</option>
        {ROUNDS.map((r) => (
          <option key={r} value={r}>
            {r.replace("_", " ")}
          </option>
        ))}
      </select>
      <select
        value={selectedSlot}
        onChange={(e) => setSelectedSlot(e.target.value)}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-sm text-[var(--text-primary)] sm:w-64"
      >
        <option value="">
          {loading ? "Loading slots..." : "Select a slot"}
        </option>
        {openSlots.map((s) => (
          <option key={s._id} value={s._id}>
            {formatSlotOption(s)}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button
          className="flex-1 sm:flex-none"
          disabled={!selectedSlot || !round || submitting}
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
