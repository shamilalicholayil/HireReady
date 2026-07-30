import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const StatCard = ({ label, value }) => (
  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
    <p className="text-[var(--text-secondary)] text-xs">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const UserDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("/sessions/me"),
      axiosInstance.get("/slots/my-interviews"),
    ])
      .then(([sessionsRes, slotsRes]) => {
        setSessions(sessionsRes.data.sessions);
        setSlots(slotsRes.data.data.slots);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-6 text-[var(--text-secondary)]">
        Loading dashboard...
      </div>
    );

  const completed = sessions.filter((s) => s.status === "completed");
  const avgScore = completed.length
    ? Math.round(
        completed.reduce((sum, s) => sum + (s.finalScore || 0), 0) /
          completed.length,
      )
    : 0;
  const upcoming = slots.filter(
    (s) => s.slotStatus === "booked" && new Date(s.startTime) > new Date(),
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={sessions.length} />
        <StatCard label="Completed" value={completed.length} />
        <StatCard label="Avg Score" value={avgScore} />
        <StatCard label="Upcoming Interviews" value={upcoming.length} />
      </div>

      <div>
        <h3 className="font-medium mb-3">Recent Sessions</h3>
        <div className="space-y-2">
          {sessions.slice(0, 5).map((s) => (
            <div
              key={s._id}
              className="flex justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3"
            >
              <span className="capitalize">
                {s.track} · {s.difficulty}
              </span>
              <span className="text-[var(--text-secondary)] text-sm">
                {s.status === "completed"
                  ? `${s.finalScore ?? "—"} pts`
                  : s.status}
              </span>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-sm text-[var(--text-secondary)]">
              No sessions yet.
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Upcoming Interviews</h3>
        <div className="space-y-2">
          {upcoming.map((s) => (
            <div
              key={s._id}
              className="flex justify-between bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3"
            >
              <span>
                {s.job?.title || "Interview"}{" "}
                {s.job?.company ? `— ${s.job.company}` : ""}
              </span>
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

export default UserDashboard;
