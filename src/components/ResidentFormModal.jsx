import { useEffect, useState } from 'react'
import Modal from './Modal'

const EMPTY_FORM = {
  houseNumber: '',
  ownerName: '',
  phoneNumber: '',
  alternatePhoneNumber: '',
  email: '',
  areaId: '',
  notificationPreference: 'SMS',
  preferredLanguage: 'en',
}

const PREFERENCES = ['SMS', 'VOICE', 'PUSH', 'WHATSAPP', 'ALL']

export default function ResidentFormModal({ open, initialValue, areas, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        initialValue
          ? {
              houseNumber: initialValue.houseNumber,
              ownerName: initialValue.ownerName,
              phoneNumber: initialValue.phoneNumber,
              alternatePhoneNumber: initialValue.alternatePhoneNumber || '',
              email: initialValue.email || '',
              areaId: initialValue.areaId,
              notificationPreference: initialValue.notificationPreference,
              preferredLanguage: initialValue.preferredLanguage || 'en',
            }
          : { ...EMPTY_FORM, areaId: areas[0]?.id ?? '' }
      )
      setErrors({})
    }
  }, [open, initialValue, areas])

  function validate() {
    const next = {}
    if (!form.houseNumber.trim()) next.houseNumber = 'House number is required'
    if (!form.ownerName.trim()) next.ownerName = 'Owner name is required'
    if (!/^[+]?[0-9]{10,15}$/.test(form.phoneNumber.trim())) next.phoneNumber = 'Enter a valid phone number'
    if (form.alternatePhoneNumber && !/^[+]?[0-9]{10,15}$/.test(form.alternatePhoneNumber.trim()))
      next.alternatePhoneNumber = 'Enter a valid phone number'
    if (form.email && (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(form.email.trim()) || form.email.trim().length > 254))
      next.email = 'Enter a valid email address (up to 254 characters)'
    if (!form.areaId) next.areaId = 'Select an area'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({ ...form, areaId: Number(form.areaId) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initialValue ? 'Edit Resident' : 'New Resident'}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">House Number *</label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
              value={form.houseNumber}
              onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
            />
            {errors.houseNumber && <p className="text-red-500 text-xs mt-1">{errors.houseNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Area *</label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
              value={form.areaId}
              onChange={(e) => setForm({ ...form, areaId: e.target.value })}
            >
              <option value="" disabled>Select area</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.ward})</option>
              ))}
            </select>
            {errors.areaId && <p className="text-red-500 text-xs mt-1">{errors.areaId}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            maxLength={254}
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Owner Name *</label>
          <input
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
          />
          {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alternate Number</label>
            <input
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
              value={form.alternatePhoneNumber}
              onChange={(e) => setForm({ ...form, alternatePhoneNumber: e.target.value })}
            />
            {errors.alternatePhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.alternatePhoneNumber}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notification Preference</label>
          <select
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aqua-500"
            value={form.notificationPreference}
            onChange={(e) => setForm({ ...form, notificationPreference: e.target.value })}
          >
            {PREFERENCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-aqua-600 hover:bg-aqua-700 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : initialValue ? 'Save changes' : 'Add resident'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
