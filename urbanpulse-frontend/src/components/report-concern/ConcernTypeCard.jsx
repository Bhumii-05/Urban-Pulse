export default function ConcernTypeCard({ category, selected, onSelect }) {
  const Icon = category.icon

  return (
    <button
      type="button"
      onClick={() => onSelect(category.value)}
      aria-pressed={selected}
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 bg-white px-3 py-4 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        selected
          ? 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]'
          : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
          selected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700'
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="text-sm font-medium text-slate-800">{category.label}</span>
      {selected && <span className="sr-only">Selected</span>}
    </button>
  )
}
