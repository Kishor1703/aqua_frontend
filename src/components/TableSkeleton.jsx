export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-100 bg-white/70 p-2 dark:border-slate-700 dark:bg-slate-800/60">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-3 border-b border-slate-100 last:border-b-0 dark:border-slate-700">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
          ))}
        </div>
      ))}
    </div>
  )
}
