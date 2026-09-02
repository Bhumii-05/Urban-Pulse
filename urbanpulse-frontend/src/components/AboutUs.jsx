import { motion } from "framer-motion";
import { Leaf, ShieldCheck, MapPin, BarChart3, Users } from "lucide-react";

const stats = [
  { label: "Urban Coverage", value: "100%", sub: "Full ward mapping" },
  { label: "Response Rate", value: "< 24h", sub: "Swift concern resolution" },
  { label: "Active Roles", value: "3 Tier", sub: "Citizen, Worker & Admin" },
  { label: "Resource Efficiency", value: "40%", sub: "Optimized collection" },
];

export default function AboutUs() {
  return (
    <section id="about" className="relative bg-[#F4F8F6] py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3.5 py-1 text-xs font-semibold text-[#005B4F] ring-1 ring-inset ring-emerald-600/20">
            <Leaf className="h-3.5 w-3.5" />
            Empowering Clean Cities
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            About <span className="text-[#005B4F]">UrbanPulse</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            UrbanPulse bridges the gap between citizens, frontline sanitation workers, and municipal authorities to create cleaner, data-driven, and sustainable urban environments.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-slate-900">
              Modernizing Waste Infrastructure with Real-Time Intelligence
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Traditional waste collection systems suffer from irregular schedules, unmonitored overflow bins, and slow issue resolution. UrbanPulse introduces full-cycle accountability through GIS mapping, instant citizen reporting, and dynamic route monitoring.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005B4F] text-white shadow-sm">
                  <MapPin className="h-5 w-5 text-[#8FD35F]" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800">Pinpoint Accuracy</h4>
                  <p className="text-sm text-slate-500">
                    Geotagged pickup suggestions and photo-verified concern reporting.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005B4F] text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-[#8FD35F]" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800">Transparent Accountability</h4>
                  <p className="text-sm text-slate-500">
                    Frontline photo verification on assignment completion.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005B4F] text-white shadow-sm">
                  <BarChart3 className="h-5 w-5 text-[#8FD35F]" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800">Data-Driven Administration</h4>
                  <p className="text-sm text-slate-500">
                    Live dashboards, fill-level analytics, and route management for municipal teams.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-4 sm:gap-6"
          >
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-3xl font-extrabold text-[#005B4F] sm:text-4xl">{item.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#15966F] to-[#8FD35F]" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}