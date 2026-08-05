import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Card from "../../components/common/Card";
import { createSlot, fetchMySlots } from "../../api/slotApi";

const TRACKS = ["frontend", "backend", "dsa", "fullstack"];

const emptyForm = { name: "", track: "", date: "", startTime: "", endTime: "" };

const formatSlotRange = (slot) => {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  return `${start.toLocaleDateString("en-GB")} — ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} to ${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
};

const SlotManagement = () => {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const { data } = await fetchMySlots();
      setSlots(data.data.slots);
    } catch {
      toast.error("Failed to load slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, track, date, startTime, endTime } = form;
    if (!name || !track || !date || !startTime || !endTime) {
      toast.error("Fill in all fields.");
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    if (start >= end) {
      toast.error("Start time must be before end time.");
      return;
    }
    if (start <= new Date()) {
      toast.error("Slot must be in the future.");
      return;
    }

    setSubmitting(true);
    try {
      await createSlot({
        name,
        track,
        date: start,
        startTime: start,
        endTime: end,
      });
      toast.success("Slot created.");
      setForm(emptyForm);
      loadSlots();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create slot.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
        Interview Slots
      </h2>

      <Card title="Create Open Slot">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="name"
              placeholder="Slot / interviewer name"
              value={form.name}
              onChange={handleChange}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)]"
            />
            <select
              name="track"
              value={form.track}
              onChange={handleChange}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)]"
            >
              <option value="">Select track</option>
              {TRACKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)]"
            />
            <input
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)]"
            />
            <input
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--text-primary)]"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            {submitting ? "Creating..." : "Create Slot"}
          </Button>
        </form>
      </Card>

      <Card title="Your Slots">
        {loading && <p className="text-[var(--text-secondary)]">Loading...</p>}
        {!loading && !slots.length && (
          <p className="text-[var(--text-secondary)]">No slots yet.</p>
        )}
        {!loading && (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className="flex flex-col justify-between gap-1 rounded-lg border border-[var(--border)] p-3 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="text-[var(--text-primary)]">
                    {formatSlotRange(slot)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {slot.track} — {slot.job?.title || "Unassigned"}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-2 py-1 text-[10px] uppercase ${
                    slot.slotStatus === "open"
                      ? "bg-green-400/10 text-green-400"
                      : "bg-[var(--surface)] text-[var(--text-secondary)]"
                  }`}
                >
                  {slot.slotStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SlotManagement;
