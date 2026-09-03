import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'
import background from '../assets/urbanpulse-background.png'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-start"
    >
      {/* Background Graphic */}
      <div
        className="absolute inset-0 bg-cover bg-[center_70%] bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${background})`,
        }}
      />

      {/* Hero Content positioned inside the clear sky opening */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-24 pb-12 text-center sm:pt-28 md:pt-32">

        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center rounded-full border border-gray-200/80 bg-white/95 px-4 py-1.5 shadow-xs backdrop-blur-sm sm:mb-5"
        >
          <span
            className="text-[11px] font-bold tracking-wider sm:text-[12px]"
            style={{ color: '#159A68' }}
          >
            SMARTER WASTE MANAGEMENT. CLEANER CITIES.
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl text-[2.6rem] font-extrabold leading-[1.1] tracking-tight sm:text-[3.4rem] md:text-[4rem]"
          style={{ color: '#071923' }}
        >
          <span style={{ color: '#159A68' }}>UrbanPulse</span> – Smart Waste
          <br className="hidden sm:inline" /> Management System
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 max-w-2xl text-[15px] leading-relaxed sm:mt-5 sm:text-[16px]"
          style={{ color: '#172B35' }}
        >
          Smarter collection. Cleaner cities. Better tomorrow.
          <br className="hidden sm:inline" />
          Together, let's build a sustainable urban future.
        </motion.p>

        {/* Actions (Join Button + Contact) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 flex flex-col items-center gap-3.5 sm:mt-7"
        >
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: '#159A68',
              boxShadow: '0 6px 20px rgba(21, 154, 104, 0.3)',
            }}
          >
            Join Urban-Pulse
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>

          <a
            href="tel:1800123URBAN"
            className="inline-flex items-center gap-2 text-[13px] font-semibold transition-colors hover:opacity-80"
            style={{ color: '#172B35' }}
          >
            <Phone size={14} />
            1800-123-URBAN
          </a>
        </motion.div>

      </div>
    </section>
  )
}