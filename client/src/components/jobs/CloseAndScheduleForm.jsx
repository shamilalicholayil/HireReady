import { useState } from "react";
import { toast } from "sonner";
import { closeJobAndSchedule } from "../../api/jobApi";
import { Button } from "@/components/ui/button";
import Card from "../common/Card";

const CloseAndScheduleForm = ({ jobId, onClosed }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [avgDurationMinutes, setAvgDurationMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = async () => {
    if (!date || !time) {
      toast.error("Set the interview window start date and time.");
      return;
    }
    const interviewWindowStart = new Date(`${date}T${time}`);
    if (interviewWindowStart <= new Date()) {
      toast.error("Interview window must be in the future.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await closeJobAndSchedule(jobId, {
        interviewWindowStart,
        avgDurationMinutes: Number(avgDurationMinutes) || 30,
      });
      toast.success(
        `Closed. ${data.data.scheduledCount} interview(s) scheduled, ${data.data.rejectedNotified} rejection email(s) sent.`,
      );
      onClosed();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to close and schedule.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Close Applications & Schedule Interviews">
      <p className="text-sm text-[var(--text-secondary)] mb-2">
        This deactivates the job, auto-schedules every shortlisted applicant
        sequentially from the start time below, and emails both shortlisted and
        rejected applicants. This cannot be undone.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
        />
        <input
          type="number"
          min={5}
          value={avgDurationMinutes}
          onChange={(e) => setAvgDurationMinutes(e.target.value)}
          placeholder="Duration (min)"
          className="w-32 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
        />
        <Button
          variant="destructive"
          onClick={handleClose}
          disabled={submitting}
        >
          {submitting ? "Processing..." : "Close & Schedule"}
        </Button>
      </div>
    </Card>
  );
};

export default CloseAndScheduleForm;
