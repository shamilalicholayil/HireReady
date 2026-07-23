import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { logoutUser } from "../../api/authApi";
import { logout } from "../../features/auth/authSlice";

export default function HRVerificationPending() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user?.hrDocuments || user.hrDocuments.length === 0) {
    return <Navigate to="/hr-document-upload" replace />;
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Nothing here
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/15 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path
              d="M12 6v6l4 2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Application Under Review
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Thanks for registering. Our admin team is reviewing your company
          details and verification documents. We'll notify you by email once
          your account is approved.
        </p>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 text-left mb-6">
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">
            Status
          </p>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-500">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Pending Approval
          </span>
        </div>

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
