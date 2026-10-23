import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { dashboardService } from '../services/dashboardService'
import SummaryCard from '../components/SummaryCard'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [today, setToday] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const [summaryData, todayData, upcomingData, chartsData] = await Promise.all([
          dashboardService.summary(),
          dashboardService.today(),
          dashboardService.upcoming(),
          dashboardService.charts(),
        ])
        if (cancelled) return
        setSummary(summaryData)
        setToday(todayData)
        setUpcoming(upcomingData)
        setCharts(chartsData)
      } catch {
        if (!cancelled) toast.error('Could not load dashboard data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="app-page">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">Overview</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Welcome back, {user?.fullName?.split(' ')[0]}
        </p>
      </div>

      {loading || !summary ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-white/70 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-800/80"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryCard label="Today's Scheduled Releases" value={summary.todayScheduledCount} accent="text-cyan-600 dark:text-cyan-400" />
            <SummaryCard label="Upcoming Releases" value={summary.upcomingCount} />
            <SummaryCard label="Delayed Releases" value={summary.delayedCount} accent="text-amber-600 dark:text-amber-400" />
            <SummaryCard label="Cancelled Releases" value={summary.cancelledCount} accent="text-slate-500" />
            <SummaryCard label="Total Residents" value={summary.totalActiveResidents} />
            <SummaryCard label="Notifications Sent" value={summary.notificationsSentTotal} accent="text-emerald-600 dark:text-emerald-400" />
            <SummaryCard label="Failed Notifications" value={summary.notificationsFailedTotal} accent="text-rose-600 dark:text-rose-400" />
            <SummaryCard label="Success Rate" value={`${summary.successRatePercent}%`} accent="text-cyan-600 dark:text-cyan-400" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Today's Releases">
              <ReleasesList items={today} emptyText="No releases scheduled for today." />
            </Panel>
            <Panel title="Upcoming Releases">
              <ReleasesList items={upcoming} emptyText="No upcoming releases." showDate />
            </Panel>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Daily Notifications (last 14 days)">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={charts.dailyNotifications}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sent" stroke="#06b6d4" name="Sent" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="#f43f5e" name="Failed" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Panel>

            <Panel title="Area-wise Notifications">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts.areaWiseNotifications} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="areaName" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#06b6d4" name="Sent" />
                  <Bar dataKey="failed" fill="#f43f5e" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          <div className="mt-6">
            <Panel title="Monthly Notifications (last 6 months)">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts.monthlyNotifications}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#06b6d4" name="Sent" />
                  <Bar dataKey="failed" fill="#f43f5e" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </>
      )}
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/90">
      <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</h2>
      {children}
    </div>
  )
}

function ReleasesList({ items, emptyText, showDate }) {
  return items.length === 0 ? (
    <p className="py-4 text-sm text-slate-400">{emptyText}</p>
  ) : (
    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
      {items.map((s) => (
        <li key={s.id} className="flex items-center justify-between py-3 text-sm">
          <div>
            <div className="font-medium text-slate-900 dark:text-white">
              {s.areaName} <span className="text-xs text-slate-400">({s.areaWard})</span>
            </div>
            <div className="text-xs text-slate-400">
              {showDate ? `${s.releaseDate} · ` : ''}{s.releaseTime?.slice(0, 5)}
            </div>
          </div>
          <StatusBadge status={s.status} />
        </li>
      ))}
    </ul>
  )
}
