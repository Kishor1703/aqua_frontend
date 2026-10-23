import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { areaService } from '../services/areaService'
import { publicScheduleService } from '../services/publicScheduleService'
import { scheduleService } from '../services/scheduleService'
import { useAuth } from '../context/AuthContext'

const EMPTY_FORM = {
  areaId: '',
  releaseDate: '',
  releaseTime: '18:00',
  notifyBeforeMins: 60,
  notes: '',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function AlertScheduler() {
  const { user } = useAuth()
  const [areas, setAreas] = useState([])
  const [todaySchedules, setTodaySchedules] = useState([])
  const [scheduleError, setScheduleError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM, releaseDate: today() })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const areaData = await areaService.listAllActive()
        if (cancelled) return
        setAreas(areaData)
        setForm((current) => ({
          ...current,
          areaId: current.areaId || areaData[0]?.id || '',
        }))
        try {
          const scheduleData = await publicScheduleService.today(user?.ward || '')
          if (cancelled) return
          setTodaySchedules(scheduleData || [])
          setScheduleError('')
        } catch {
          if (!cancelled) {
            setTodaySchedules([])
            setScheduleError("Today's schedule list is temporarily unavailable.")
          }
        }
      } catch {
        if (!cancelled) toast.error('Could not load areas for alert scheduling')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user?.ward])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.areaId) {
      toast.error('Select an area first')
      return
    }

    setSubmitting(true)
    try {
      await scheduleService.create({
        ...form,
        areaId: Number(form.areaId),
        notifyBeforeMins: Number(form.notifyBeforeMins),
        releaseTime: form.releaseTime.length === 5 ? `${form.releaseTime}:00` : form.releaseTime,
      })
      toast.success('Alert scheduled')
      setForm({ ...EMPTY_FORM, areaId: form.areaId, releaseDate: today() })

      const refreshed = await publicScheduleService.today(user?.ward || '')
      setTodaySchedules(refreshed || [])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create alert')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-page space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Operators</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Alert Scheduler</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          For {user?.role === 'OPERATOR' ? `ward ${user?.ward}` : 'assigned wards'}.
          Create one schedule and the system sends the notification automatically at the right time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Create Alert</h2>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-700" />
              <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-700" />
              <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-700" />
              <div className="h-24 rounded-lg bg-gray-100 dark:bg-gray-700" />
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Area *</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  value={form.areaId}
                  onChange={(e) => setForm({ ...form, areaId: e.target.value })}
                >
                  <option value="">Select area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name} ({area.ward})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Release Date *</label>
                  <input
                    type="date"
                    min={today()}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Release Time *</label>
                  <input
                    type="time"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                    value={form.releaseTime}
                    onChange={(e) => setForm({ ...form, releaseTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Notify before (minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={1440}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  value={form.notifyBeforeMins}
                  onChange={(e) => setForm({ ...form, notifyBeforeMins: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Notes</label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                {submitting ? 'Scheduling...' : 'Schedule Alert'}
              </button>
            </form>
          )}
        </section>

        <section className="overflow-x-auto rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Today's Ward Alerts</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            These are the schedules already created for today. When the notify window is reached,
            the system sends the alert automatically.
          </p>

          {scheduleError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              {scheduleError}
            </div>
          )}

          {todaySchedules.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No alerts scheduled for today.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="py-2 pr-4">Area</th>
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Notify Before</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {todaySchedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b border-slate-50 dark:border-slate-700/50">
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
                      {schedule.areaName} <span className="text-slate-400">({schedule.areaWard})</span>
                    </td>
                    <td className="py-3 pr-4">{schedule.releaseTime?.slice(0, 5)}</td>
                    <td className="py-3 pr-4">{schedule.notifyBeforeMins} min</td>
                    <td className="py-3 pr-4">{schedule.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
