import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { initiateRegisterHR, verifyOtpHR } from "../../api/authApi";
import { setCredentials } from "../../features/auth/authSlice";
import { registerHRSchema, otpSchema } from "../../validation/authSchemas";

export default function RegisterHR() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({ resolver: zodResolver(registerHRSchema) });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors, isSubmitting: otpSubmitting },
  } = useForm({ resolver: zodResolver(otpSchema) });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await initiateRegisterHR(registerData);
      setEmail(data.email);
      setStep("otp");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
    }
  };

  const onVerifyOtp = async ({ otp }) => {
    try {
      const res = await verifyOtpHR({ email, otp });
      const { accessToken, user } = res.data;
      dispatch(setCredentials({ user, accessToken }));
      navigate("/hr-document-upload");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired code.");
    }
  };

  const handleResend = async () => {
    try {
      const { confirmPassword, ...registerData } = getValues();
      await initiateRegisterHR(registerData);
      toast.success("Code resent.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't resend code.");
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

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    placeholder="Jane Doe"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                  {errors.name && (
                    <p className="text-xs text-[var(--error)] mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    {...register("companyName")}
                    placeholder="Acme Corp"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-[var(--error)] mt-1">
                      {errors.companyName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@company.com"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                  {errors.email && (
                    <p className="text-xs text-[var(--error)] mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    {...register("password")}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                  {errors.password && (
                    <p className="text-xs text-[var(--error)] mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    {...register("confirmPassword")}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-[var(--error)] mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--primary)] text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending code..." : "Continue"}
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
                  {email}
                </span>
                . It expires in 5 minutes.
              </p>

              <form
                onSubmit={handleOtpSubmit(onVerifyOtp)}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                    Verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    {...registerOtp("otp")}
                    placeholder="123456"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-center text-lg tracking-[0.5em] text-[var(--text-primary)] placeholder:tracking-normal placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition"
                  />
                  {otpErrors.otp && (
                    <p className="text-xs text-[var(--error)] mt-1 text-center">
                      {otpErrors.otp.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otpSubmitting}
                  className="w-full bg-[var(--primary)] text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpSubmitting ? "Verifying..." : "Verify & continue"}
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
                  className="text-[var(--primary)] hover:underline"
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
