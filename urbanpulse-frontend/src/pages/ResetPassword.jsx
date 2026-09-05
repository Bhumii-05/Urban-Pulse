import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import background from "../assets/features-background.png";
import { authService } from "../api/auth.service";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!token) {
      setError("Reset token is missing or invalid. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.resetPassword({
        token,
        new_password: password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : "Reset failed. The token may be expired or already used."
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

          {!token ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
                <AlertCircle size={32} />
              </div>
              <h2 className="mt-4 text-[22px] font-bold text-[#102A2A]">
                Invalid Link
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#102A2A]/75">
                No reset token found in your URL. The link might be broken or incomplete.
              </p>
              <Link
                to="/forgot-password"
                className="mt-6 rounded-xl bg-gradient-to-r from-[#004D40] to-[#159A6A] px-6 py-2.5 text-[14px] font-semibold text-white"
              >
                Request a New Link
              </Link>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005B4F]/10 text-[#005B4F]">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="mt-4 text-[22px] font-bold text-[#102A2A]">
                Password Reset!
              </h2>
              <p className="mt-2 text-[13.5px] text-[#102A2A]/75">
                Your password has been successfully updated. Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-[24px] font-bold leading-tight text-[#102A2A]">
                Set New Password
              </h2>
              <p className="mt-1.5 text-[13.5px] text-[#102A2A]/70">
                Choose a strong password with at least 8 characters.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-700">
                  {error}
                </div>
              )}

              <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#102A2A]">
                    New Password
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 focus-within:border-[#159A6A] focus-within:shadow-[0_0_0_3px_rgba(21,154,106,0.15)]">
                    <Lock size={17} className="shrink-0 text-[#005B4F]/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full bg-transparent text-[14px] text-[#102A2A] placeholder:text-[#102A2A]/40 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-[#102A2A]/50 hover:text-[#005B4F]"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#102A2A]">
                    Confirm New Password
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 focus-within:border-[#159A6A] focus-within:shadow-[0_0_0_3px_rgba(21,154,106,0.15)]">
                    <Lock size={17} className="shrink-0 text-[#005B4F]/60" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-transparent text-[14px] text-[#102A2A] placeholder:text-[#102A2A]/40 focus:outline-none"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? {} : { scale: 1.015 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004D40] to-[#159A6A] py-3 text-[14.5px] font-semibold text-white shadow-[0_10px_25px_rgba(0,77,64,0.35)] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    "Reset Password"
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