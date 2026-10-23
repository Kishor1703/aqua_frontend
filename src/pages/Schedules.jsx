import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { scheduleService } from '../services/scheduleService'
import { areaService } from '../services/areaService'
import TableSkeleton from '../components/TableSkeleton'
import Pagination from '../components/Pagination'
import ScheduleFormModal from '../components/ScheduleFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import StatusBadge from '../components/StatusBadge'

const PAGE_SIZE = 10

// Only these transitions are offered as quick actions in the table —
// mirrors the backend's ALLOWED_TRANSITIONS map so the UI never offers
// a button that the API would reject.
const NEXT_ACTIONS = {
  SCHEDULED: [
    { label: 'Mark Released', status: 'RELEASED' },
    { label: 'Mark Delayed', status: 'DELAYED' },
    { label: 'Cancel', status: 'CANCELLED', danger: true },
  ],
  DELAYED: [
    { label: 'Mark Released', status: 'RELEASED' },
    { label: 'Reschedule', status: 'SCHEDULED' },
    { label: 'Cancel', status: 'CANCELLED', danger: true },
  ],
  RELEASED: [],
  CANCELLED: [],
}

export default function Schedules() {
  const [rows, setRows] = useState([])
  const [areas, setAreas] = useState([])
  const [pageInfo, setPageInfo] = useState({ pageNumber: 0, totalPages: 0, totalElements: 0 })

  const [areaFilter, setAreaFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null) // { schedule, action }

  useEffect(() => {
    areaService.listAllActive().then(setAreas).catch(() => toast.error('Could not load areas'))
  }, [])

  const loadSchedules = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const data = await scheduleService.search({
        areaId: areaFilter,
        status: statusFilter,
        fromDate,
        toDate,
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
      toast.error('Could not load schedules')
    } finally {
      setLoading(false)
    }
  }, [areaFilter, statusFilter, fromDate, toDate])

  useEffect(() => {
    loadSchedules(0)
  }, [loadSchedules])

  async function handleCreateOrUpdate(form) {
    try {
      if (editingSchedule) {
        await scheduleService.update(editingSchedule.id, form)
        toast.success('Schedule updated')
      } else {
        await scheduleService.create(form)
        toast.success('Schedule created')
      }
      setFormOpen(false)
      setEditingSchedule(null)
      loadSchedules(pageInfo.pageNumber)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save schedule')
    }
  }

  async function handleDelete() {
    try {
      await scheduleService.remove(confirmTarget.id)
      toast.success('Schedule removed')
      setConfirmTarget(null)
      loadSchedules(pageInfo.pageNumber)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete schedule')
    }
  }

  async function handleStatusChange() {
    try {
      await scheduleService.updateStatus(statusTarget.schedule.id, statusTarget.action.status)
      toast.success(`Marked as ${statusTarget.action.status.toLowerCase()}`)
      setStatusTarget(null)
      loadSchedules(pageInfo.pageNumber)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status')
    }
  }

  function canEdit(schedule) {
    return schedule.status === 'SCHEDULED' || schedule.status === 'DELAYED'
  }

  return (
    <div className="app-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="page-kicker">Release planning</div>
          <h1 className="page-title">Water schedules</h1>
          <p className="page-description">
            {pageInfo.totalElements} schedule{pageInfo.totalElements === 1 ? '' : 's'} total
          </p>
        </div>
        <button
          onClick={() => { setEditingSchedule(null); setFormOpen(true) }}
          className="primary-button"
        >
          + New Schedule
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>{a.name} ({a.ward})</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="RELEASED">Released</option>
          <option value="DELAYED">Delayed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
        />
        <span className="self-center text-gray-400 text-sm">to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
        {loading ? (
          <TableSkeleton cols={7} />
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">No schedules found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 pr-4">Area</th>
                <th className="py-2 pr-4">Release Date</th>
                <th className="py-2 pr-4">Release Time</th>
                <th className="py-2 pr-4">Notify Before</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Notes</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 dark:border-gray-700/50 align-top">
                  <td className="py-3 pr-4 font-medium">{s.areaName} <span className="text-gray-400">({s.areaWard})</span></td>
                  <td className="py-3 pr-4">{s.releaseDate}</td>
                  <td className="py-3 pr-4">{s.releaseTime?.slice(0, 5)}</td>
                  <td className="py-3 pr-4">{s.notifyBeforeMins} min</td>
                  <td className="py-3 pr-4"><StatusBadge status={s.status} /></td>
                  <td className="py-3 pr-4 text-gray-500 max-w-[160px] truncate" title={s.notes}>{s.notes || '—'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                      {canEdit(s) && (
                        <button
                          onClick={() => { setEditingSchedule(s); setFormOpen(true) }}
                          className="font-medium text-cyan-700 hover:underline"
                        >
                          Edit
                        </button>
                      )}
                      {NEXT_ACTIONS[s.status]?.map((action) => (
                        <button
                          key={action.status}
                          onClick={() => setStatusTarget({ schedule: s, action })}
                          className={action.danger ? 'font-medium text-rose-600 hover:underline' : 'font-medium text-cyan-700 hover:underline'}
                        >
                          {action.label}
                        </button>
                      ))}
                      {s.status !== 'RELEASED' && (
                        <button
                          onClick={() => setConfirmTarget(s)}
                          className="text-gray-400 hover:underline hover:text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          pageNumber={pageInfo.pageNumber}
          totalPages={pageInfo.totalPages}
          onPageChange={(p) => loadSchedules(p)}
        />
      </div>

      <ScheduleFormModal
        open={formOpen}
        initialValue={editingSchedule}
        areas={areas}
        onClose={() => { setFormOpen(false); setEditingSchedule(null) }}
        onSubmit={handleCreateOrUpdate}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete schedule"
        message={confirmTarget ? `Remove the ${confirmTarget.releaseDate} release for ${confirmTarget.areaName}? This cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />

      <ConfirmDialog
        open={!!statusTarget}
        title={statusTarget?.action.label}
        message={
          statusTarget
            ? `${statusTarget.action.label} for ${statusTarget.schedule.areaName} on ${statusTarget.schedule.releaseDate}?`
            : ''
        }
        confirmLabel={statusTarget?.action.label}
        danger={statusTarget?.action.danger}
        onConfirm={handleStatusChange}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  )
}
