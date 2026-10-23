import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { publicScheduleService } from '../services/publicScheduleService'

export default function TodaySchedule() {
  const [ward, setWard] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load('')
  }, [])

  async function load(nextWard) {
    setLoading(true)
    try {
      const data = await publicScheduleService.today(nextWard)
      setRows(data)
    } catch {
      toast.error("Could not load today's schedule")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await load(ward.trim())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="page-kicker">Public service update</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Today's water schedule</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Public view for residents and staff.
            </p>
          </div>
          <Link to="/login" className="text-sm font-semibold text-cyan-700 hover:underline">
            Staff sign-in
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Ward filter</label>
              <input
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="Leave blank to see all wards"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500 dark:border-gray-600"
              />
            </div>
            <button
              type="submit"
              className="primary-button"
            >
              Refresh
            </button>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-white/80 shadow animate-pulse dark:bg-gray-800/80" />
            ))
          ) : rows.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-white/90 p-8 text-center shadow dark:bg-gray-800/90">
              <p className="text-slate-500 dark:text-slate-400">No releases scheduled for today.</p>
            </div>
          ) : (
            rows.map((item, index) => (
              <article
                key={`${item.areaName}-${item.releaseTime}-${index}`}
                className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{item.areaName}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.ward}{item.zone ? ` - ${item.zone}` : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Info label="Date" value={item.releaseDate} />
                  <Info label="Time" value={item.releaseTime?.slice(0, 5)} />
                  <Info label="Notify before" value={`${item.notifyBeforeMins ?? '-'} min`} />
                  <Info label="Notes" value={item.notes || '-'} />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-gray-700/60">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</div>
    </div>
  )
}
