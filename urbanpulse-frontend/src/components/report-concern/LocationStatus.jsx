import { MapPin, RotateCw, AlertTriangle, Loader2 } from 'lucide-react'

export default function LocationStatus({ status, location, errorMessage, onRetry }) {
  if (status === 'success') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          GPS Location Detected ({location})
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-emerald-700"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2"
      >
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {errorMessage || 'Unable to detect your location.'} Please enable location access and try again.
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-red-700"
        >
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>
    )
  }

  // idle | loading
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Detecting your location…
    </div>
  )
}
