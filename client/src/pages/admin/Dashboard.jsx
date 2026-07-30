import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const StatCard = ({ label, value }) => (
  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
    <p className="text-[var(--text-secondary)] text-xs">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/admin/dashboard-stats")
      .then((res) => setStats(res.data.data));
  }, []);

  if (!stats)
    return (
      <div className="p-6 text-[var(--text-secondary)]">
        Loading dashboard...
      </div>
    );

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total Users" value={stats.totalUsers} />
      <StatCard label="Approved HR" value={stats.totalHR} />
      <StatCard label="Pending HR Approvals" value={stats.pendingHR} />
      <StatCard label="Total Sessions" value={stats.totalSessions} />
      <StatCard label="Completed Sessions" value={stats.completedSessions} />
      <StatCard label="Booked Slots" value={stats.bookedSlots} />
      <StatCard
        label="Completed Interviews"
        value={stats.completedInterviews}
      />
    </div>
  );
};

export default AdminDashboard;
