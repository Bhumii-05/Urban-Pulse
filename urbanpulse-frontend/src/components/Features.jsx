import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  MapPin,
  MessageSquare,
  Bell,
  Truck,
  CheckCircle2,
  Camera,
  Layers,
  Users,
  Route,
  Trash2,
  BarChart,
  UserCheck,
} from "lucide-react";

const ROLES = [
  { id: "citizen", label: "For Citizens", icon: Users },
  { id: "worker", label: "For Sanitation Workers", icon: Truck },
  { id: "admin", label: "For Administrators", icon: Layers },
];

const FEATURES_BY_ROLE = {
  citizen: [
    {
      icon: AlertCircle,
      title: "Concern Management",
      desc: "Report issues with photos and pinpoint location. Track progress and edit or delete pending submissions.",
    },
    {
      icon: MapPin,
      title: "Pin Collection Points",
      desc: "Mark new collection sites on interactive Leaflet maps and submit missed door-to-door reports.",
    },
    {
      icon: MessageSquare,
      title: "Suggestions & Feedback",
      desc: "Recommend new public bin locations and receive official updates and feedback directly from city admins.",
    },
    {
      icon: Bell,
      title: "Real-Time Notifications",
      desc: "Stay notified when your reported concern is assigned, in-progress, or successfully resolved.",
    },
  ],
  worker: [
    {
      icon: Route,
      title: "Optimized Daily Routes",
      desc: "Access scheduled collection paths with sequenced stops on interactive maps for maximum route efficiency.",
    },
    {
      icon: CheckCircle2,
      title: "Point Status Updates",
      desc: "Mark points as collected or log collection bottlenecks like locked premises, road blocks, or vehicle faults.",
    },
    {
      icon: Camera,
      title: "Proof of Resolution",
      desc: "Accept assigned spot concerns, resolve them on-site, and upload photographic verification.",
    },
    {
      icon: Layers,
      title: "Worker Dashboard",
      desc: "Overview of pending work orders, completed runs, and real-time administrative instructions.",
    },
  ],
  admin: [
    {
      icon: UserCheck,
      title: "Role & User Administration",
      desc: "Manage sanitation staff accounts, verify credentials, assign roles, and monitor individual worker activity.",
    },
    {
      icon: Route,
      title: "Dynamic Route Dispatch",
      desc: "Construct and alter collection routes, add collection points, and dispatch workers in real time.",
    },
    {
      icon: Trash2,
      title: "Smart Waste Bin Controls",
      desc: "Register new public bins, update geolocation details, monitor fill levels, and activate/deactivate bins.",
    },
    {
      icon: BarChart,
      title: "Ward Analytics & Reporting",
      desc: "System statistics, resolution performance metrics, priority trends, and category distribution charts.",
    },
  ],
};

export default function Features() {
  const [activeTab, setActiveTab] = useState("citizen");

  return (
    <section id="features" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-3.5 py-1 text-xs font-semibold text-[#005B4F] ring-1 ring-inset ring-emerald-600/20">
            System Capabilities
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Built for Every Stakeholder
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            A cohesive platform designed to streamline city-wide waste collection operations.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-slate-100 p-1.5 ring-1 ring-slate-200/60">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = activeTab === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveTab(role.id)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#005B4F] text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#8FD35F]" : "text-slate-500"}`} />
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {FEATURES_BY_ROLE[activeTab].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#FBFDFC] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#005B4F] ring-1 ring-emerald-100 group-hover:bg-[#005B4F] group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.desc}</p>
                  </div>
                  <div className="mt-6 h-1 w-12 rounded-full bg-slate-200 group-hover:bg-[#8FD35F] transition-colors" />
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}