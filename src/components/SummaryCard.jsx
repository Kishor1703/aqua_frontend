export default function SummaryCard({ label, value, accent, subtitle }) {
  return (
    <div className="group rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/90">
      <div className="mb-4 h-1 w-14 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 opacity-80 transition-opacity group-hover:opacity-100" />
      <div className={`text-3xl font-semibold tracking-tight ${accent || 'text-slate-900 dark:text-white'}`}>{value}</div>
      <div className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</div>
      {subtitle && <div className="mt-1 text-xs text-slate-400">{subtitle}</div>}
    </div>
  )
}
