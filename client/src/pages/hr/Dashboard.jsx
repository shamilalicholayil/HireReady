import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosInstance";

const StatCard = ({ label, value }) => (
  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
    <p className="text-[var(--text-secondary)] text-xs">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const HRDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/slots/my-interviews")
      .then((res) => setSlots(res.data.data.slots))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-6 text-[var(--text-secondary)]">
        Loading dashboard...
      </div>
    );

  const upcoming = slots.filter(
    (s) => s.slotStatus === "booked" && new Date(s.startTime) > new Date(),
  );
  const completed = slots.filter((s) => s.interviewStatus === "completed");

  return (
    <div className="p-6 space-y-6">
      {user?.hrStatus && user.hrStatus !== "approved" && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            user.hrStatus === "pending"
              ? "bg-yellow-500/10 text-yellow-500"
              : "bg-red-500/10 text-red-500"
          }`}
        >
          {user.hrStatus === "pending"
            ? "Your HR account is pending approval."
            : `HR account rejected: ${user.hrRejectionReason || "no reason given"}`}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Slots" value={slots.length} />
        <StatCard
          label="Booked"
          value={slots.filter((s) => s.slotStatus === "booked").length}
        />
        <StatCard label="Completed Interviews" value={completed.length} />
        <StatCard label="Upcoming" value={upcoming.length} />
      </div>

      <div>
        <h3 className="font-medium mb-3">Upcoming Interviews</h3>
        <div className="space-y-2">
          {upcoming.map((s) => (
            <div
              key={s._id}
              className="flex justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3"
            >
              <span>{s.job?.title || s.name}</span>
              <span className="text-[var(--text-secondary)] text-sm">
                {new Date(s.startTime).toLocaleString()}
              </span>
            </div>
          ))}
          {upcoming.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)]">
              No upcoming interviews.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
