import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Bell, Sun, Moon, User, LogOut, Menu } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "../../hooks/useTheme";
import { logoutUser } from "../../api/authApi";
import { logout } from "../../features/auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../features/notification/notificationSlice";

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { items: notifications, unreadCount } = useSelector(
    (state) => state.notification,
  );

  const { isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 10 }));
  }, [dispatch]);

  const segment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const pageTitle = segment.replace(/^\w/, (c) => c.toUpperCase());

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // nothing to do here
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <header className="w-full bg-[var(--surface)] border-b border-[var(--border)] px-4 md:px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {pageTitle === "Profile" ? "My Profile" : pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              aria-label="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--primary)] text-[9px] font-bold flex items-center justify-center text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllNotificationsRead())}
                  className="text-xs text-[var(--primary)]"
                >
                  Mark all read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 && (
              <p className="px-2 py-4 text-sm text-center text-[var(--text-secondary)]">
                No notifications yet.
              </p>
            )}
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n._id}
                onClick={() =>
                  !n.isRead && dispatch(markNotificationRead(n._id))
                }
                className={`whitespace-normal py-2 ${n.isRead ? "opacity-60" : ""}`}
              >
                {n.message}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className="rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              tabIndex={0}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-[var(--border)]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                navigate(user?.role === "hr" ? "/hr/profile" : "/profile")
              }
            >
              <User size={16} className="mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
