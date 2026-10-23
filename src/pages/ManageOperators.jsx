import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { operatorService } from '../services/operatorService'
import TableSkeleton from '../components/TableSkeleton'

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  ward: '',
  phoneNumber: '',
}

export default function ManageOperators() {
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  async function loadOperators() {
    setLoading(true)
    try {
      const data = await operatorService.list()
      setOperators(data)
    } catch {
      toast.error('Could not load operators')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOperators()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await operatorService.create(form)
      toast.success('Operator created')
      setForm(EMPTY_FORM)
      loadOperators()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create operator')
    } finally {
      setSubmitting(false)
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="app-page space-y-6">
      <div>
        <div className="page-kicker">Access control</div>
        <h1 className="page-title">Operator management</h1>
        <p className="page-description">
          Admins can create operator accounts. Operators can then sign in and manage areas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold mb-4">Create Operator</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
                required
                maxLength={150}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
                required
                maxLength={150}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Temporary password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
                required
                minLength={8}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ward</label>
              <input
                value={form.ward}
                onChange={(e) => updateField('ward', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone number</label>
              <input
                value={form.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
                maxLength={20}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="primary-button w-full disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Operator'}
            </button>
          </form>
        </section>

        <section className="overflow-x-auto rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">Operators</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {operators.length} operator{operators.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <TableSkeleton cols={5} />
          ) : operators.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              No operators have been created yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Ward</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((operator) => (
                  <tr key={operator.id} className="border-b border-gray-50 dark:border-gray-700/50">
                    <td className="py-3 pr-4 font-medium">{operator.fullName}</td>
                    <td className="py-3 pr-4">{operator.email}</td>
                    <td className="py-3 pr-4">{operator.ward || '-'}</td>
                    <td className="py-3 pr-4">{operator.phoneNumber || '-'}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        operator.active
                          ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700/20'
                          : 'bg-slate-200 text-slate-700 ring-1 ring-slate-300'
                      }`}>
                        {operator.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {operator.createdAt ? new Date(operator.createdAt).toLocaleDateString() : '-'}
                    </td>
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
