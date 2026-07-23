import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { initiateRegisterHR, verifyOtpHR } from "../../api/authApi";
import { setCredentials } from "../../features/auth/authSlice";

export default function RegisterHR() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle");
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
      await initiateRegisterHR(registerData);
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
      const res = await verifyOtpHR({ email: formData.email, otp });
      const { accessToken, user } = res.data;
      console.log("USER FROM API:", user);
      dispatch(setCredentials({ user, accessToken }));
      navigate("/hr-document-upload");
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
      await initiateRegisterHR(registerData);
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
            HireReady for Business
          </h1>
          <p className="text-xs tracking-wide text-[var(--text-secondary)] mt-1">
            HR PARTNER REGISTRATION
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
          {step === "form" ? (
            <>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Register your company
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Your application will be reviewed by our team before you get
                access.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Your Name
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
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleFormChange}
                    placeholder="Acme Corp"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="you@company.com"
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
