import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, LogIn, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "About Us", href: "#about" },
  { label: "Live Impact", href: "#impact", badge: "Live" },
  { label: "Features", href: "#features" },
  { label: "Contact Us", href: "#contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute top-4 left-4 right-4 z-50"
    >
      {/* Main Navbar */}
      <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-6 rounded-2xl bg-[#003D36] px-6 py-3.5 shadow-lg md:px-8">
        
        {/* Logo / Brand */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#15966F] shadow-sm">
            <Leaf size={22} strokeWidth={2.5} className="text-white" />
          </span>

          <span className="leading-tight">
            <span className="block text-[18px] font-bold tracking-tight text-white">
              Urban<span className="text-[#8FD35F]">Pulse</span>
            </span>

            <span className="block text-[11px] font-medium tracking-wide text-white/70">
              Smart Waste Management
            </span>
          </span>
        </Link>

        {/* Desktop Navigation - About Us -> Live Impact -> Features -> Contact Us */}
        <nav className="hidden items-center gap-8 xl:flex">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-2 text-[15px] font-semibold text-white/85 transition-colors duration-200 hover:text-white"
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-[#8FD35F] ring-1 ring-emerald-500/30">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8FD35F] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8FD35F]" />
                  </span>
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Right Side / Login CTA */}
        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#8FD35F] px-6 py-2.5 text-[15px] font-bold text-[#003D36] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#A4E576] hover:shadow-md"
          >
            <LogIn size={17} strokeWidth={2.5} />
            <span>Login</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-[1450px] overflow-hidden rounded-2xl bg-[#003D36] shadow-lg lg:hidden"
          >
            <div className="flex flex-col gap-1.5 p-5">
              {LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-[16px] font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-[#8FD35F] ring-1 ring-emerald-500/30">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#8FD35F]" />
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}

              <div className="mt-2 flex items-center border-t border-white/10 pt-4">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8FD35F] px-5 py-3 text-center text-[15px] font-bold text-[#003D36] shadow-sm transition-all duration-200 hover:bg-[#A4E576]"
                >
                  <LogIn size={17} strokeWidth={2.5} />
                  <span>Login</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}