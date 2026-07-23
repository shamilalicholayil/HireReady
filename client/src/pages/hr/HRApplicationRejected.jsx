import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { logoutUser } from "../../api/authApi";
import { reapplyHR } from "../../api/profileApi";
import { logout, setCredentials } from "../../features/auth/authSlice";

export default function HRApplicationRejected() {
  const { user, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reapplying, setReapplying] = useState(false);

  const handleReapply = async () => {
    setReapplying(true);
    try {
      const res = await reapplyHR();
      dispatch(setCredentials({ user: res.data.user, accessToken }));
      navigate("/hr-document-upload");
    } catch (err) {
      // could add a toast here
    } finally {
      setReapplying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/15 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path
              d="M15 9l-6 6M9 9l6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Application Not Approved
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Unfortunately, your HR application wasn't approved at this time.
        </p>

        {user?.hrRejectionReason && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-left mb-6">
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">
              Reason
            </p>
            <p className="text-sm text-[var(--text-primary)]">
              {user.hrRejectionReason}
            </p>
          </div>
        )}

        <button
          onClick={handleReapply}
          disabled={reapplying}
          className="w-full bg-[var(--primary)] text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 transition disabled:opacity-50 mb-4"
        >
          {reapplying ? "Submitting..." : "Re-apply"}
        </button>

        <button
          onClick={handleLogout}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition underline"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
