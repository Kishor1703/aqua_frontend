import { useEffect, useState } from 'react'
import Modal from './Modal'

const EMPTY_FORM = { name: '', ward: '', zone: '', street: '' }

export default function AreaFormModal({ open, initialValue, fixedWard, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(() => {
        const next = initialValue ? { ...EMPTY_FORM, ...initialValue } : EMPTY_FORM
        return fixedWard ? { ...next, ward: fixedWard } : next
      })
      setErrors({})
    }
  }, [open, initialValue, fixedWard])

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Area name is required'
    if (!form.ward.trim()) next.ward = 'Ward is required'
    if (!form.zone.trim()) next.zone = 'Zone is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit(form)
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name, label, required = true, disabled = false) => (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-500"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        disabled={disabled}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title={initialValue ? 'Edit Area' : 'New Area'}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {field('name', 'Area name')}
        {field('ward', 'Ward', true, !!fixedWard)}
        {field('zone', 'Zone')}
        {field('street', 'Street', false)}
        {fixedWard && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ward is locked to your assigned ward: <span className="font-medium">{fixedWard}</span>
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-aqua-600 hover:bg-aqua-700 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : initialValue ? 'Save changes' : 'Create area'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
