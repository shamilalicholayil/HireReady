import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Bell, Sun, Moon, User, Building2, LogOut, Menu } from "lucide-react";
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

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

        <button
          aria-label="Notifications"
          className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
        >
          <Bell size={18} />
        </button>

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
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User size={16} className="mr-2" />
              Profile
            </DropdownMenuItem>
            {user?.role === "hr" && (
              <DropdownMenuItem onClick={() => navigate("/hr/company")}>
                <Building2 size={16} className="mr-2" />
                Company Info
              </DropdownMenuItem>
            )}
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
