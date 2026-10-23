export default function Pagination({ pageNumber, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const canPrev = pageNumber > 0
  const canNext = pageNumber < totalPages - 1

  return (
    <div className="mt-5 flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-500 dark:text-slate-400">
        Page {pageNumber + 1} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={!canPrev}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={!canNext}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Next
        </button>
      </div>
    </div>
  )
}
