import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { reportService } from '../services/reportService'

const PERIODS = [
  { value: 'DAILY', label: 'Today' },
  { value: 'WEEKLY', label: 'Last 7 days' },
  { value: 'MONTHLY', label: 'This month' },
]

export default function Reports() {
  const [period, setPeriod] = useState('WEEKLY')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const data = await reportService.summary(period)
        if (!cancelled) setReport(data)
      } catch {
        if (!cancelled) toast.error('Could not load report data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [period])

  async function handleExport(type) {
    setExporting(type)
    try {
      if (type === 'csv') {
        await reportService.exportCsv(period)
      } else {
        await reportService.exportPdf(period)
      }
      toast.success(`Report downloaded as ${type.toUpperCase()}`)
    } catch {
      toast.error('Could not export report')
    } finally {
      setExporting(null)
    }
  }

  const summary = report?.summary
  const breakdown = report?.breakdown || []

  return (
    <div className="app-page space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="page-kicker">Operations insight</div>
          <h1 className="page-title">Reports</h1>
          <p className="page-description">
            Operational summary for schedules, notifications, and ward activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
          >
            {PERIODS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="secondary-button disabled:opacity-60"
          >
            {exporting === 'csv' ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="primary-button disabled:opacity-60"
          >
            {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {loading || !summary ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white shadow animate-pulse dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Schedules" value={summary.totalSchedules} />
            <MetricCard label="Released" value={summary.releasedCount} accent="text-green-600 dark:text-green-400" />
            <MetricCard label="Delayed" value={summary.delayedCount} accent="text-amber-600 dark:text-amber-400" />
            <MetricCard label="Cancelled" value={summary.cancelledCount} accent="text-gray-500" />
            <MetricCard label="Active Areas" value={summary.activeAreas} />
            <MetricCard label="Active Residents" value={summary.activeResidents} />
            <MetricCard label="Notifications Sent" value={summary.notificationsSent} accent="text-aqua-600 dark:text-aqua-400" />
            <MetricCard label="Success Rate" value={`${summary.successRatePercent}%`} accent="text-aqua-600 dark:text-aqua-400" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
            <section className="overflow-x-auto rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Daily Breakdown</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {summary.fromDate} to {summary.toDate}
                  </p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Scheduled</th>
                    <th className="py-2 pr-4">Released</th>
                    <th className="py-2 pr-4">Delayed</th>
                    <th className="py-2 pr-4">Cancelled</th>
                    <th className="py-2 pr-4">Sent</th>
                    <th className="py-2 pr-4">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row) => (
                    <tr key={row.date} className="border-b border-gray-50 dark:border-gray-700/50">
                      <td className="py-3 pr-4 font-medium">{row.date}</td>
                      <td className="py-3 pr-4">{row.scheduledCount}</td>
                      <td className="py-3 pr-4">{row.releasedCount}</td>
                      <td className="py-3 pr-4">{row.delayedCount}</td>
                      <td className="py-3 pr-4">{row.cancelledCount}</td>
                      <td className="py-3 pr-4">{row.notificationsSent}</td>
                      <td className="py-3 pr-4">{row.notificationsFailed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold mb-4">Quick Summary</h2>
              <dl className="space-y-3 text-sm">
                <SummaryRow label="Period" value={summary.period} />
                <SummaryRow label="Window" value={`${summary.fromDate} -> ${summary.toDate}`} />
                <SummaryRow label="Schedules" value={summary.totalSchedules} />
                <SummaryRow label="Successful notifications" value={summary.notificationsSent} />
                <SummaryRow label="Failed notifications" value={summary.notificationsFailed} />
                <SummaryRow label="Success rate" value={`${summary.successRatePercent}%`} />
              </dl>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

function MetricCard({ label, value, accent = 'text-gray-900 dark:text-white' }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <div className={`mt-2 text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0 dark:border-gray-700">
      <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  )
}
