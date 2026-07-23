import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPasswordApi } from "../../api/authApi";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setStatus("loading");
    try {
      await resetPasswordApi(token, newPassword);
      setStatus("success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setStatus("error");
      setError(
        err?.response?.data?.message ||
          "This reset link is invalid or has expired.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--primary)] font-[Space_Grotesk]">
            HireReady
          </h1>
          <p className="text-xs tracking-wide text-[var(--text-secondary)] mt-1">
            AI INTERVIEW PREP
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
          {status === "success" ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Password reset
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Set a new password
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Choose a strong password you haven't used before.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[var(--error)] bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[var(--primary)] text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Resetting..." : "Reset password"}
                </button>
              </form>

              <Link
                to="/login"
                className="block text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mt-6 transition"
              >
                ← Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
