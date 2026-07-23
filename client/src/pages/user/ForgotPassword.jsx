import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await forgotPasswordApi(email);
      setStatus("sent");
    } catch {
      setStatus("sent");
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
          {status === "sent" ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-[var(--primary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Check your inbox
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                If an account exists for{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {email}
                </span>
                , a password reset link is on its way. It expires in 10 minutes.
              </p>
              <Link
                to="/login"
                className="inline-block text-sm text-[var(--primary)] hover:underline mt-2"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Forgot your password?
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-[var(--primary)] text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Sending..." : "Send reset link"}
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
