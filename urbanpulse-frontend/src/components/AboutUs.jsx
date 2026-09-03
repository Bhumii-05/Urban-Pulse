import { motion } from "framer-motion";
import { 
  Leaf, 
  MapPin, 
  ShieldCheck, 
  Route, 
  Map, 
  Trash2, 
  MessageSquareCode,
  FileCheck2,
  Send,
  Sparkles
} from "lucide-react";

// 2 Rows of 3 Cards: Core platform roles & tools
const platformFeatures = [
  // Row 1: Citizens & Workers
  {
    icon: MapPin,
    title: "Easy Waste Reporting",
    badge: "For Citizens",
    description:
      "Drop a pin on the map, snap a photo, and track cleanup updates. It also warns you if someone already reported the same spot.",
  },
  {
    icon: Route,
    title: "Daily Pickup Routes",
    badge: "For Sanitation Workers",
    description:
      "Workers get a clear, step-by-step route for the day and can easily report delays like blocked roads or locked gates.",
  },
  {
    icon: ShieldCheck,
    title: "Photo Cleanup Proof",
    badge: "Guaranteed Work",
    description:
      "Workers take a quick photo of the clean area before marking a task as done, so you know the problem is actually solved.",
  },
  // Row 2: Bins, City Maps & AI
  {
    icon: Trash2,
    title: "Live Public Bin Tracking",
    badge: "Smart Bins",
    description:
      "See which street dustbins are empty, half-full, or overflowing so trucks only visit bins that actually need emptying.",
  },
  {
    icon: Map,
    title: "Interactive City Map",
    badge: "City Map",
    description:
      "A simple map view where citizens pin complaints, workers follow routes, and city managers see citywide cleanliness.",
  },
  {
    icon: MessageSquareCode,
    title: "AI Help & Community Ideas",
    badge: "Help & Ideas",
    description:
      "Ask our AI assistant questions anytime, or suggest new spots where your neighborhood needs more public dustbins.",
  },
];

const lifecycleSteps = [
  { step: "01", title: "Report", desc: "Citizen uploads photo and marks location on the map.", icon: MapPin },
  { step: "02", title: "Check", desc: "System verifies duplicates and alerts local administration.", icon: FileCheck2 },
  { step: "03", title: "Dispatch", desc: "Automated route assignment straight to sanitation workers.", icon: Send },
  { step: "04", title: "Verified Clean", desc: "Worker uploads completion proof before closing ticket.", icon: Sparkles },
];

export default function AboutUs() {
  return (
    <section id="about" className="relative bg-[#F4F8F6] py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3.5 py-1 text-xs font-semibold text-[#005B4F] ring-1 ring-inset ring-emerald-600/20">
            <Leaf className="h-3.5 w-3.5" />
            Cleaner Neighborhoods, Together
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How <span className="text-[#005B4F]">UrbanPulse</span> Works
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            We connect residents, sanitation workers, and city officials on one platform to clean up garbage faster and keep streets clean.
          </p>
        </div>

        {/* 2-Row Feature Grid (6 Cards total) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {platformFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.07 }}
                className="group relative flex flex-col justify-start rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-emerald-200"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#005B4F] text-white shadow-sm transition-colors group-hover:bg-[#15966F]">
                    <Icon className="h-6 w-6 text-[#8FD35F]" />
                  </div>
                  <span className="text-xs font-semibold text-[#005B4F] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {item.badge}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                  {item.title}
                </h4>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Full-Cycle Accountability Strip */}
        <div className="rounded-3xl border border-emerald-900/10 bg-white p-8 sm:p-10 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
              Full-Cycle Accountability
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-2">
              From Citizen Report to Verified Resolution
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {lifecycleSteps.map((s, idx) => {
              const StepIcon = s.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-emerald-50/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100/80 text-[#005B4F] mb-3 font-bold text-sm">
                    {s.step}
                  </div>
                  <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <StepIcon className="w-4 h-4 text-emerald-600" />
                    {s.title}
                  </h5>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}