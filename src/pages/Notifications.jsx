import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { notificationService } from '../services/notificationService'
import TableSkeleton from '../components/TableSkeleton'
import Pagination from '../components/Pagination'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 15

const STATUS_STYLES = {
  SENT: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  PENDING: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  RETRYING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
      <div className={`text-2xl font-bold ${accent || ''}`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  )
}

export default function Notifications() {
  const { hasRole } = useAuth()
  const [sendingEmail, setSendingEmail] = useState(false)

  async function handleTestEmail() {
    setSendingEmail(true)
    try {
      await notificationService.sendTestEmail()
      toast.success('SMTP accepted the test email. Check your configured test inbox.')
    } catch (err) {
      toast.error(err.response?.data?.errorMessage || err.response?.data?.message || 'Test email failed')
    } finally {
      setSendingEmail(false)
    }
  }
  const [rows, setRows] = useState([])
  const [pageInfo, setPageInfo] = useState({ pageNumber: 0, totalPages: 0, totalElements: 0 })
  const [stats, setStats] = useState(null)

  const [statusFilter, setStatusFilter] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [retryingId, setRetryingId] = useState(null)
  const [retryingAll, setRetryingAll] = useState(false)

  const loadStats = useCallback(async () => {
    try {
      setStats(await notificationService.stats())
    } catch {
      // Stats are a nice-to-have strip; don't block the page on failure.
    }
  }, [])

  const loadNotifications = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const data = await notificationService.search({
        status: statusFilter,
        channel: channelFilter,
        page,
        size: PAGE_SIZE,
      })
      setRows(data.content)
      setPageInfo({
        pageNumber: data.pageNumber,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      })
    } catch {
      toast.error('Could not load notifications')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, channelFilter])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadNotifications(0)
  }, [loadNotifications])

  async function handleRetry(id) {
    setRetryingId(id)
    try {
      await notificationService.retry(id)
      toast.success('Notification resent')
      loadNotifications(pageInfo.pageNumber)
      loadStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Retry failed')
    } finally {
      setRetryingId(null)
    }
  }

  async function handleRetryAll() {
    setRetryingAll(true)
    try {
      await notificationService.retryAllFailed()
      toast.success('Retrying all eligible failed notifications in the background')
      setTimeout(() => { loadNotifications(0); loadStats() }, 2000)
    } catch {
      toast.error('Could not start bulk retry')
    } finally {
      setRetryingAll(false)
    }
  }

  return (
    <div className="app-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="page-kicker">Delivery monitor</div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-description">
            {pageInfo.totalElements} record{pageInfo.totalElements === 1 ? '' : 's'} total
          </p>
        </div>
        <button
          onClick={handleRetryAll}
          disabled={retryingAll}
          className="secondary-button disabled:opacity-60"
        >
          {retryingAll ? 'Starting…' : 'Retry all failed'}
        </button>
      </div>

      {hasRole('ADMIN') && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow mb-6 p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Test email</h2>
            <p className="text-sm text-gray-500">Send a test message to your configured test inbox. Wait 60 seconds between attempts.</p>
          </div>
          <button onClick={handleTestEmail} disabled={sendingEmail} className="secondary-button disabled:opacity-60">
            {sendingEmail ? 'Sending...' : 'Send test email'}
          </button>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Sent" value={stats.totalSent} accent="text-green-600 dark:text-green-400" />
          <StatCard label="Failed" value={stats.totalFailed} accent="text-red-600 dark:text-red-400" />
          <StatCard label="Pending" value={stats.totalPending} />
          <StatCard label="Retrying" value={stats.totalRetrying} accent="text-amber-600 dark:text-amber-400" />
          <StatCard label="Success Rate" value={`${stats.successRatePercent}%`} accent="text-aqua-600 dark:text-aqua-400" />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
          <option value="RETRYING">Retrying</option>
        </select>
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All channels</option>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
          <option value="VOICE">Voice</option>
          <option value="PUSH">Push</option>
          <option value="WHATSAPP">WhatsApp</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
        {loading ? (
          <TableSkeleton cols={7} />
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">No notifications found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 pr-4">Resident</th>
                <th className="py-2 pr-4">Area</th>
                <th className="py-2 pr-4">Channel</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Attempts</th>
                <th className="py-2 pr-4">Error</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => (
                <tr key={n.id} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="py-3 pr-4 font-medium">{n.residentName}<div className="text-xs text-gray-400">{n.residentPhone}</div></td>
                  <td className="py-3 pr-4">{n.areaName}</td>
                  <td className="py-3 pr-4">{n.channel}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[n.status]}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{n.attemptCount}</td>
                  <td className="py-3 pr-4 text-red-500 max-w-[200px] truncate" title={n.errorMessage}>
                    {n.errorMessage || '—'}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {n.status === 'FAILED' && (
                      <button
                        onClick={() => handleRetry(n.id)}
                        disabled={retryingId === n.id}
                        className="font-medium text-cyan-700 hover:underline disabled:opacity-50"
                      >
                        {retryingId === n.id ? 'Retrying…' : 'Retry'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          pageNumber={pageInfo.pageNumber}
          totalPages={pageInfo.totalPages}
          onPageChange={(p) => loadNotifications(p)}
        />
      </div>
    </div>
  )
}
