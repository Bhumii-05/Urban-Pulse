import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'
import background from '../assets/urbanpulse-background.png'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()
  return (
    <section
      id="top"
      className="relative min-h-screen w-full overflow-hidden"
    >
      {/* Background */}
      <div
  className="absolute inset-0 bg-cover bg-[center_68%] bg-no-repeat"
  style={{
    backgroundImage: `url(${background})`,
  }}
/>

      {/* Very subtle overlay — keeps background visible */}
      

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center -translate-y-8">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center rounded-full border border-gray-200 bg-white/90 px-5 py-2 shadow-sm backdrop-blur-sm"
        >
          <span
  className="text-[12px] font-semibold tracking-wide"
  style={{ color: '#159A68' }}
>
  SMARTER WASTE MANAGEMENT. CLEANER CITIES.
</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-4xl text-[3rem] font-extrabold leading-[1.08] tracking-tight sm:text-[3.8rem] md:text-[4.2rem]"
          style={{ color: '#071923' }}
        >
          <span style={{ color: '#159A68' }}>
            UrbanPulse
          </span>{' '}
          – Smart Waste
          <br />
          Management System
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 max-w-2xl text-[16px] leading-relaxed sm:text-[17px]"
          style={{ color: '#172B35' }}
        >
          Smarter collection. Cleaner cities. Better tomorrow.
          <br />
          Together, let's build a sustainable urban future.
        </motion.p>

        {/* Button + Phone */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-8 flex flex-col items-center gap-5"
        >
          {/* Explore Features */}
          <a
            
            className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-1"
            style={{
              backgroundColor: '#159A68',
              boxShadow: '0 8px 25px rgba(21, 154, 104, 0.25)',
            }}
          >
            RAISE A CONCERN

            <ArrowRight
              size={17}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

          {/* Phone */}
          <a
            href="tel:1800123URBAN"
            className="inline-flex items-center gap-2 text-[14px] font-medium transition-colors"
            style={{ color: '#172B35' }}
          >
            <Phone size={15} />
            1800-123-URBAN
          </a>
        </motion.div>


      </div>
      
    </section>
  )
}