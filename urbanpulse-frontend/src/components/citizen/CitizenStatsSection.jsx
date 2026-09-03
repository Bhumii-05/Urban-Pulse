import React from "react";
import { motion } from "framer-motion";
import { Layers, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

function StatCard({ icon: Icon, title, value, subtitle, loading, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {loading ? (
            <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
    </motion.div>
  );
}

export default function CitizenStatsSection({
  data,
  loading,
  error,
  onRetry,
}) {
  if (error) {
    return (
      <div className="mb-8 flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load dashboard data.
            </p>
            <p className="text-sm text-red-600">Please try again.</p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3.5 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        index={0}
        icon={Layers}
        title="Total Reported Concerns"
        value={data?.total_concerns ?? 0}
        subtitle="My total reports"
        loading={loading}
      />
      <StatCard
        index={1}
        icon={Clock}
        title="Pending Concerns"
        value={data?.pending_concerns ?? 0}
        subtitle="Awaiting resolution"
        loading={loading}
      />
      <StatCard
        index={2}
        icon={CheckCircle2}
        title="Resolved Concerns"
        value={data?.resolved_concerns ?? 0}
        subtitle="Successfully resolved"
        loading={loading}
      />
    </div>
  );
}