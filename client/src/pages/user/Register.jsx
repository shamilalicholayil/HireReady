import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { initiateRegister, verifyOtp } from "../../api/authApi";
import { setCredentials } from "../../features/auth/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState("form"); // "form" | "otp"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading
  const [error, setError] = useState("");

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const { confirmPassword, ...registerData } = formData;
      await initiateRegister(registerData);
      setStep("otp");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setStatus("idle");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const res = await verifyOtp({ email: formData.email, otp });
      const { accessToken, user } = res.data;
      dispatch(setCredentials({ user, accessToken }));
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setStatus("idle");
    }
  };

  const handleResend = async () => {
    setError("");
    setStatus("loading");
    try {
      const { confirmPassword, ...registerData } = formData;
      await initiateRegister(registerData);
      setError(""); // could add a small "code resent" toast here later
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't resend code.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
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
          {step === "form" ? (
            <>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Create your account
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Start prepping for your next interview.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Jane Doe"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="you@example.com"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    value={formData.confirmPassword}
                    onChange={handleFormChange}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
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
                  {status === "loading" ? "Sending code..." : "Continue"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <hr className="flex-1 border-[var(--border)]" />
                <span className="text-xs text-[var(--text-secondary)]">
                  or continue with
                </span>
                <hr className="flex-1 border-[var(--border)]" />
              </div>

              <a
                href={`${import.meta.env.VITE_API_URL}/auth/google`}
                className="w-full flex items-center justify-center gap-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm font-medium rounded-lg py-2.5 hover:bg-[var(--surface-alt)] transition"
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Register using Google
              </a>

              <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[var(--primary)] hover:underline"
                >
                  Log in
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Verify your email
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                We sent a 6-digit code to{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {formData.email}
                </span>
                . It expires in 5 minutes.
              </p>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-[var(--text-primary)] placeholder:tracking-normal placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                </div>

                {error && (
                  <p className="text-sm text-[var(--error)] bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading" || otp.length !== 6}
                  className="w-full bg-[var(--primary)] text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Verifying..." : "Verify & continue"}
                </button>
              </form>

              <div className="flex items-center justify-between mt-6 text-sm">
                <button
                  onClick={() => setStep("form")}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  ← Edit details
                </button>
                <button
                  onClick={handleResend}
                  disabled={status === "loading"}
                  className="text-[var(--primary)] hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
