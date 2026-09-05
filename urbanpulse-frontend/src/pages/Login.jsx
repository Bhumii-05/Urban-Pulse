import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import background from "../assets/features-background.png";
import { authService } from "../api/auth.service";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const loginData = await authService.login({
        email: email.trim(),
        password: password,
      });

      localStorage.setItem("access_token", loginData.access_token);

      const userData = await authService.getCurrentUser();
      const role = userData.role?.toLowerCase();

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "worker") {
        navigate("/worker");
      } else if (role === "citizen") {
        navigate("/citizen");
      } else {
        setError("Unknown user role detected.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.data?.detail) {
        setError(
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : "Login failed. Please try again.",
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

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-10 px-6 py-8 lg:flex-row lg:gap-20 lg:px-16 xl:gap-28 xl:px-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute left-8 top-8 z-20 lg:left-12 lg:top-8"
        >
          <h1
            className="text-3xl font-extrabold leading-none tracking-tight text-[#064E3B] drop-shadow-[0_2px_6px_rgba(255,255,255,0.35)]"
            style={{
              fontFamily:
                '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            Urban<span className="text-[#16A34A]">Pulse</span>
          </h1>
          <p className="mt-1 text-xs font-medium tracking-wide text-[#14532D] drop-shadow-[0_1px_4px_rgba(255,255,255,0.5)]">
            Smart Waste Management
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { duration: 0.7, delay: 0.2 },
            y: {
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.9,
            },
          }}
          className="w-full max-w-[460px] rounded-[32px] border border-white/50 bg-white/50 p-11 shadow-[0_30px_80px_-10px_rgba(6,78,59,0.35)] backdrop-blur-2xl sm:p-14"
        >
          <div className="pointer-events-none absolute inset-4 -z-10 rounded-[40px] bg-white/25 blur-3xl" />
          <h2
            className="font-display text-[26px] font-bold leading-tight text-[#102A2A]"
            style={{
              fontFamily:
                '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            Welcome Back!
          </h2>
          <p className="mt-1.5 text-[13.5px] text-[#102A2A]/70">
            Log in to continue your sustainable journey
          </p>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-500/10 px-4 py-2 text-[13px] font-medium text-red-700">
              {error}
            </div>
          )}

          <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-semibold text-[#102A2A]"
              >
                Email Address
              </label>
              <div
                className={`flex items-center gap-2.5 rounded-xl border bg-white/55 px-3.5 py-2.5 transition-all duration-200 ${
                  focusedField === "email"
                    ? "border-[#2FBE86] shadow-[0_0_0_3px_rgba(47,190,134,0.18)]"
                    : "border-white/50"
                }`}
              >
                <Mail size={17} className="shrink-0 text-[#005B4F]/60" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-[14px] text-[#102A2A] placeholder:text-[#102A2A]/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold text-[#102A2A]"
              >
                Password
              </label>
              <div
                className={`flex items-center gap-2.5 rounded-xl border bg-white/70 px-3.5 py-2.5 transition-all duration-200 ${
                  focusedField === "password"
                    ? "border-[#159A6A] shadow-[0_0_0_3px_rgba(21,154,106,0.15)]"
                    : "border-white/60"
                }`}
              >
                <Lock size={17} className="shrink-0 text-[#005B4F]/60" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-[14px] text-[#102A2A] placeholder:text-[#102A2A]/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 text-[#102A2A]/50 transition-colors hover:text-[#005B4F]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="-mt-2 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[12.5px] font-medium text-[#005B4F] transition-colors hover:text-[#159A6A]"
              >
                Forgot Password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.015 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#004D40] to-[#159A6A] py-3 text-[14.5px] font-semibold text-white shadow-[0_10px_25px_rgba(0,77,64,0.35)] transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(0,77,64,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Log In"
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[#102A2A]/70">
            Don&rsquo;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#159A6A] transition-colors hover:text-[#004D40]"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
