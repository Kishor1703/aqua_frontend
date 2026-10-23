import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { areaService } from '../services/areaService'
import TableSkeleton from '../components/TableSkeleton'
import Pagination from '../components/Pagination'
import AreaFormModal from '../components/AreaFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 10

export default function Areas() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [pageInfo, setPageInfo] = useState({ pageNumber: 0, totalPages: 0, totalElements: 0 })
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchAreas = useCallback((page = 0) => areaService.search({
      search: debouncedSearch,
      activeOnly,
      page,
      size: PAGE_SIZE,
    }), [debouncedSearch, activeOnly])

  useEffect(() => {
    let cancelled = false

    async function initialLoad() {
      setLoading(true)
      try {
        const data = await fetchAreas(0)
        if (cancelled) return
        setRows(data.content)
        setPageInfo({
          pageNumber: data.pageNumber,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
        })
      } catch {
        if (!cancelled) toast.error('Could not load areas')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    initialLoad()
    return () => { cancelled = true }
  }, [fetchAreas])

  async function handleCreateOrUpdate(form) {
    try {
      if (editingArea) {
        await areaService.update(editingArea.id, form)
        toast.success('Area updated')
      } else {
        await areaService.create(form)
        toast.success('Area created')
      }
      setFormOpen(false)
      setEditingArea(null)
      const data = await fetchAreas(pageInfo.pageNumber)
      setRows(data.content)
      setPageInfo({
        pageNumber: data.pageNumber,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save area')
    }
  }

  async function handleDelete() {
    try {
      await areaService.remove(confirmTarget.id)
      toast.success('Area removed')
      setConfirmTarget(null)
      const data = await fetchAreas(pageInfo.pageNumber)
      setRows(data.content)
      setPageInfo({
        pageNumber: data.pageNumber,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete area')
    }
  }

  return (
    <div className="app-page">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="page-kicker">Master data</div>
          <h1 className="page-title">Areas</h1>
          <p className="page-description">
            {pageInfo.totalElements} area{pageInfo.totalElements === 1 ? '' : 's'} total
          </p>
        </div>
        <button
          onClick={() => { setEditingArea(null); setFormOpen(true) }}
          className="primary-button"
        >
          + New Area
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          placeholder="Search by name, ward, zone, street..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Active only
        </label>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {loading ? (
          <TableSkeleton cols={6} />
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-slate-500 dark:text-slate-400">
            No areas found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Ward</th>
                <th className="py-2 pr-4">Zone</th>
                <th className="py-2 pr-4">Street</th>
                <th className="py-2 pr-4">Residents</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((area) => (
                <tr key={area.id} className="border-b border-slate-100 text-slate-600 last:border-0">
                  <td className="py-4 pr-4 font-semibold text-slate-900">{area.name}</td>
                  <td className="py-4 pr-4">{area.ward}</td>
                  <td className="py-4 pr-4">{area.zone}</td>
                  <td className="py-4 pr-4">{area.street || '—'}</td>
                  <td className="py-4 pr-4">{area.residentCount}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      area.active
                        ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700/20'
                        : 'bg-slate-200 text-slate-700 ring-1 ring-slate-300'
                    }`}>
                      {area.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 pr-0 text-right space-x-3">
                    <button
                      onClick={() => { setEditingArea(area); setFormOpen(true) }}
                      className="font-semibold text-cyan-700 hover:text-cyan-900 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmTarget(area)}
                      className="font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          pageNumber={pageInfo.pageNumber}
          totalPages={pageInfo.totalPages}
          onPageChange={(p) => fetchAreas(p).then((data) => {
            setRows(data.content)
            setPageInfo({
              pageNumber: data.pageNumber,
              totalPages: data.totalPages,
              totalElements: data.totalElements,
            })
          })}
        />
      </div>

      <AreaFormModal
        open={formOpen}
        initialValue={editingArea}
        fixedWard={user?.role === 'OPERATOR' ? user?.ward : null}
        onClose={() => { setFormOpen(false); setEditingArea(null) }}
        onSubmit={handleCreateOrUpdate}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete area"
        message={
          confirmTarget
            ? `Remove "${confirmTarget.name}"? If it still has residents linked, it will be deactivated instead of deleted.`
            : ''
        }
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  )
}
