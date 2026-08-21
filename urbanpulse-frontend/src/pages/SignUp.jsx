import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import background from "../assets/features-background.png";

import { useNavigate, Link } from "react-router-dom";
import { authService } from "../api/auth.service";

export default function SignUp() {
  //  Navigation hook initialization
  const navigate = useNavigate();

  //  state variables for holding form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // states for loading and error holding
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const fieldClasses = (field) =>
    `flex items-center gap-2.5 rounded-xl border bg-white/55 px-3.5 py-2.5 transition-all duration-200 ${
      focusedField === field
        ? "border-[#2FBE86] shadow-[0_0_0_3px_rgba(47,190,134,0.18)]"
        : "border-white/50"
    }`;

  // Submit Handler function for Backend API call
 const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    // Client-side Password matching validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        password: password,
      });

      navigate("/login");
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : "Registration failed. Please check your inputs.",
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
      {/* Background — untouched, full viewport */}
      <img
        src={background}
        alt="UrbanPulse eco-friendly city with a green collection truck, waste segregation bins and a sustainable skyline"
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{ objectPosition: "center 70%" }}
      />

      {/* Very subtle readability gradient — background stays clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center gap-10 px-6 py-10 lg:flex-row lg:gap-20 lg:px-16 xl:gap-28 xl:px-24">
        {/* Top-left logo */}
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

        {/* Floating glass sign-up card */}
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
          className="relative w-full max-w-[460px] rounded-[32px] border border-white/50 bg-white/50 p-11 shadow-[0_30px_80px_-10px_rgba(6,78,59,0.35)] backdrop-blur-2xl sm:p-14"
        >
          {/* Soft glow behind the card for extra lift */}
          <div className="pointer-events-none absolute inset-4 -z-10 rounded-[40px] bg-white/25 blur-3xl" />

          <h2
            className="font-display text-[26px] font-bold leading-tight text-[#0B3D2E]"
            style={{
              fontFamily:
                '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
            }}
          >
            Create Account
          </h2>
          <p className="mt-1.5 text-[13.5px] text-[#0B3D2E]/70">
            Join UrbanPulse and start your sustainable journey
          </p>

          {/* Error message display card */}
          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-500/10 px-4 py-2 text-[13px] font-medium text-red-700">
              {error}
            </div>
          )}
          {/* changed onSubmit={handleSubmit} */}
          <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fullName"
                className="text-[13px] font-semibold text-[#0B3D2E]"
              >
                Full Name
              </label>
              <div className={fieldClasses("fullName")}>
                <User size={17} className="shrink-0 text-[#005B4F]/60" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-[14px] text-[#0B3D2E] placeholder:text-[#0B3D2E]/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[13px] font-semibold text-[#0B3D2E]"
              >
                Email Address
              </label>
              <div className={fieldClasses("email")}>
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
                  className="w-full bg-transparent text-[14px] text-[#0B3D2E] placeholder:text-[#0B3D2E]/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-[13px] font-semibold text-[#0B3D2E]"
              >
                Phone Number
              </label>
              <div className={fieldClasses("phone")}>
                <Phone size={17} className="shrink-0 text-[#005B4F]/60" />
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-[14px] text-[#0B3D2E] placeholder:text-[#0B3D2E]/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[13px] font-semibold text-[#0B3D2E]"
              >
                Password
              </label>
              <div className={fieldClasses("password")}>
                <Lock size={17} className="shrink-0 text-[#005B4F]/60" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-[14px] text-[#0B3D2E] placeholder:text-[#0B3D2E]/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 text-[#0B3D2E]/50 transition-colors hover:text-[#005B4F]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-[13px] font-semibold text-[#0B3D2E]"
              >
                Confirm Password
              </label>
              <div className={fieldClasses("confirmPassword")}>
                <Lock size={17} className="shrink-0 text-[#005B4F]/60" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-transparent text-[14px] text-[#0B3D2E] placeholder:text-[#0B3D2E]/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="shrink-0 text-[#0B3D2E]/50 transition-colors hover:text-[#005B4F]"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F9B76] to-[#4ADE80] py-3 text-[14.5px] font-semibold text-white shadow-[0_10px_25px_rgba(15,155,118,0.35)] transition-shadow duration-200 hover:shadow-[0_14px_32px_rgba(15,155,118,0.45)] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>

          {/* Log in */}
          <p className="mt-6 text-center text-[13px] text-[#0B3D2E]/70">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#159A6A] transition-colors hover:text-[#004D40]"
            >
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
