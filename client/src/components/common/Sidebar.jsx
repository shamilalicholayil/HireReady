import { useSelector } from "react-redux";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  CalendarCheck,
  UserPlus,
  Mail,
  BookOpen,
  Trophy,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  ClipboardList,
  FileCheck2,
  Gauge,
  Award,
  FileBarChart,
  X,
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);
  const { conversations } = useSelector((state) => state.messages);

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  const navLinksByRole = {
    user: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/interview", label: "Interview", icon: MessageSquare },
      { to: "/job-board", label: "Job Board", icon: Briefcase },
      { to: "/my-interviews", label: "My Interviews", icon: CalendarCheck },
      { to: "/friends", label: "Friends", icon: UserPlus },
      { to: "/messages", label: "Messages", icon: Mail },
      { to: "/tutorialHub", label: "Tutorial Hub", icon: BookOpen },
      { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ],
    hr: [
      { to: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/hr/job-postings", label: "Job Postings", icon: Briefcase },
      { to: "/hr/applications", label: "Applications", icon: ClipboardList },
      { to: "/hr/interviews", label: "Interviews", icon: CalendarCheck },
    ],
    admin: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/user-management", label: "User Management", icon: Users },
      {
        to: "/admin/hr-verification",
        label: "HR Verification Queue",
        icon: FileCheck2,
      },
      {
        to: "/admin/question-management",
        label: "Question Management",
        icon: HelpCircle,
      },
      {
        to: "/admin/tutorial-management",
        label: "Tutorial Management",
        icon: BookOpen,
      },
      {
        to: "/admin/job-oversight",
        label: "HR/Job Oversight",
        icon: Briefcase,
      },
      { to: "/admin/ai-usage-monitor", label: "AI Usage Monitor", icon: Gauge },
      {
        to: "/admin/leaderboard-management",
        label: "Leaderboard Management",
        icon: Award,
      },
      { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    ],
  };

  const navLinks = navLinksByRole[user?.role] || navLinksByRole.user;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <aside
        className={`w-64 h-screen fixed top-0 left-0 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col overflow-y-auto z-50
        transition-transform duration-200 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-indigo-500 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-white font-semibold text-[15px]">
                HireReady
              </h1>
              <p className="text-[10px] tracking-widest text-[var(--text-secondary)]">
                AI INTERVIEW PREP
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 mt-2 flex flex-col gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--primary)]/15 text-[var(--primary)]"
                    : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {label === "Messages" && totalUnread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
