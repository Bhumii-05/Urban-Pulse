import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, LogIn, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "About Us", href: "#about" },
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
      <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4 rounded-xl bg-[#003D36] px-5 py-3 shadow-lg md:px-6">
        {/* Logo / Brand */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#15966F]">
            <Leaf size={19} strokeWidth={2.5} className="text-white" />
          </span>

          <span className="leading-tight">
            <span className="block text-[16px] font-bold tracking-tight text-white">
              Urban<span className="text-[#8FD35F]">Pulse</span>
            </span>

            <span className="block text-[9px] font-medium tracking-wide text-white/60">
              Smart Waste Management
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 xl:flex">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium text-white/80 transition-colors duration-200 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Side */}
        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          {/* login Link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#8FD35F] px-5 py-2.5 text-[13px] font-semibold text-[#003D36] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#A4E576] hover:shadow-md"
          >
            <LogIn size={15} />
            <span>Login</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
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
            className="mx-auto mt-2 max-w-[1450px] overflow-hidden rounded-xl bg-[#003D36] shadow-lg lg:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-2 flex items-center border-t border-white/10 pt-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#8FD35F] px-4 py-2.5 text-center text-sm font-semibold text-[#003D36] shadow-sm transition-all duration-200 hover:bg-[#A4E576]"
                >
                  <LogIn size={15} />
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
