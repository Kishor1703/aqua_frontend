import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { residentService } from '../services/residentService'
import { areaService } from '../services/areaService'
import TableSkeleton from '../components/TableSkeleton'
import Pagination from '../components/Pagination'
import ResidentFormModal from '../components/ResidentFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import CsvImportModal from '../components/CsvImportModal'

const PAGE_SIZE = 10

export default function Residents() {
  const [rows, setRows] = useState([])
  const [areas, setAreas] = useState([])
  const [pageInfo, setPageInfo] = useState({ pageNumber: 0, totalPages: 0, totalElements: 0 })

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingResident, setEditingResident] = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    areaService.listAllActive().then(setAreas).catch(() => toast.error('Could not load areas'))
  }, [])

  const loadResidents = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const data = await residentService.search({
        search: debouncedSearch,
        areaId: areaFilter,
        status: statusFilter,
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
      toast.error('Could not load residents')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, areaFilter, statusFilter])

  useEffect(() => {
    loadResidents(0)
  }, [loadResidents])

  async function handleCreateOrUpdate(form) {
    try {
      if (editingResident) {
        await residentService.update(editingResident.id, form)
        toast.success('Resident updated')
      } else {
        await residentService.create(form)
        toast.success('Resident added')
      }
      setFormOpen(false)
      setEditingResident(null)
      loadResidents(pageInfo.pageNumber)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save resident')
    }
  }

  async function handleDelete() {
    try {
      await residentService.remove(confirmTarget.id)
      toast.success('Resident removed')
      setConfirmTarget(null)
      loadResidents(pageInfo.pageNumber)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete resident')
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      await residentService.exportCsv({ areaId: areaFilter, status: statusFilter })
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="app-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="page-kicker">Community directory</div>
          <h1 className="page-title">Residents</h1>
          <p className="page-description">
            {pageInfo.totalElements} resident{pageInfo.totalElements === 1 ? '' : 's'} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="secondary-button"
          >
            Import CSV
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="secondary-button disabled:opacity-60"
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button
            onClick={() => { setEditingResident(null); setFormOpen(true) }}
            className="primary-button"
          >
            + New Resident
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          placeholder="Search by name, house no., phone, email, code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
        />
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
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
        {loading ? (
          <TableSkeleton cols={7} />
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            No residents found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Owner</th>
                <th className="py-2 pr-4">House No.</th>
                <th className="py-2 pr-4">Area</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Preference</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="py-3 pr-4 font-mono text-xs">{r.residentCode}</td>
                  <td className="py-3 pr-4 font-medium">{r.ownerName}</td>
                  <td className="py-3 pr-4">{r.houseNumber}</td>
                  <td className="py-3 pr-4">{r.areaName}</td>
                  <td className="py-3 pr-4">{r.phoneNumber}{r.email && <div className="text-xs text-gray-500">{r.email}</div>}</td>
                  <td className="py-3 pr-4">{r.notificationPreference}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      r.status === 'ACTIVE'
                        ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700/20'
                        : 'bg-slate-200 text-slate-700 ring-1 ring-slate-300'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right space-x-3">
                    <button
                      onClick={() => { setEditingResident(r); setFormOpen(true) }}
                      className="font-medium text-cyan-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmTarget(r)}
                      className="text-red-600 hover:underline"
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
          onPageChange={(p) => loadResidents(p)}
        />
      </div>

      <ResidentFormModal
        open={formOpen}
        initialValue={editingResident}
        areas={areas}
        onClose={() => { setFormOpen(false); setEditingResident(null) }}
        onSubmit={handleCreateOrUpdate}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete resident"
        message={confirmTarget ? `Remove "${confirmTarget.ownerName}" (${confirmTarget.residentCode})? This cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => loadResidents(0)}
      />
    </div>
  )
}
