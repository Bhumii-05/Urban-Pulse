import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import background from "../assets/features-background.png";
import { authService } from "../api/auth.service";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(identifier.trim());
      setSubmitted(true);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : "Request failed. Please try again."
        );
      } else {
        setError("Unable to connect to server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#0a1f14]">
      <img
        src={background}
        alt="UrbanPulse eco-friendly city"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ objectPosition: "center 70%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[460px] rounded-[32px] border border-white/50 bg-white/50 p-10 shadow-[0_30px_80px_-10px_rgba(6,78,59,0.35)] backdrop-blur-2xl sm:p-12"
        >
          <div className="pointer-events-none absolute inset-4 -z-10 rounded-[40px] bg-white/25 blur-3xl" />

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#005B4F] transition-colors hover:text-[#159A6A]"
          >
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 flex flex-col items-center text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005B4F]/10 text-[#005B4F]">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="mt-4 text-[22px] font-bold text-[#102A2A]">
                Check Your Inbox
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#102A2A]/75">
                If an account matches <strong className="text-[#102A2A]">{identifier}</strong>, we've dispatched a password reset link. It expires in <strong>15 minutes</strong>.
              </p>
              <p className="mt-4 text-[12px] text-[#102A2A]/50">
                Didn't receive anything? Check your spam folder or try again.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-[13px] font-semibold text-[#159A6A] hover:underline"
              >
                Re-enter details
              </button>
            </motion.div>
          ) : (
            <>
              <h2 className="mt-5 text-[24px] font-bold leading-tight text-[#102A2A]">
                Forgot Password?
              </h2>
              <p className="mt-1.5 text-[13.5px] text-[#102A2A]/70">
                Enter your registered email or phone number to receive a secure recovery link.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-700">
                  {error}
                </div>
              )}

              <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="identifier"
                    className="text-[13px] font-semibold text-[#102A2A]"
                  >
                    Email or Phone
                  </label>
                  <div
                    className={`flex items-center gap-2.5 rounded-xl border bg-white/55 px-3.5 py-2.5 transition-all duration-200 ${
                      focused
                        ? "border-[#2FBE86] shadow-[0_0_0_3px_rgba(47,190,134,0.18)]"
                        : "border-white/50"
                    }`}
                  >
                    <Mail size={17} className="shrink-0 text-[#005B4F]/60" />
                    <input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. name@domain.com or 9876543210"
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      className="w-full bg-transparent text-[14px] text-[#102A2A] placeholder:text-[#102A2A]/40 focus:outline-none"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? {} : { scale: 1.015 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004D40] to-[#159A6A] py-3 text-[14.5px] font-semibold text-white shadow-[0_10px_25px_rgba(0,77,64,0.35)] transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(0,77,64,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}