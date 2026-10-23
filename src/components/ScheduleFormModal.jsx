import { useEffect, useState } from 'react'
import Modal from './Modal'

const EMPTY_FORM = { areaId: '', releaseDate: '', releaseTime: '18:00', notifyBeforeMins: 60, notes: '' }

const NOTIFY_PRESETS = [
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: 'Custom', value: 'custom' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function ScheduleFormModal({ open, initialValue, areas, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [customNotify, setCustomNotify] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (initialValue) {
        setForm({
          areaId: initialValue.areaId,
          releaseDate: initialValue.releaseDate,
          releaseTime: initialValue.releaseTime?.slice(0, 5) ?? '18:00',
          notifyBeforeMins: initialValue.notifyBeforeMins,
          notes: initialValue.notes || '',
        })
        setCustomNotify(![30, 60, 120].includes(initialValue.notifyBeforeMins))
      } else {
        setForm({ ...EMPTY_FORM, areaId: areas[0]?.id ?? '', releaseDate: today() })
        setCustomNotify(false)
      }
      setErrors({})
    }
  }, [open, initialValue, areas])

  function validate() {
    const next = {}
    if (!form.areaId) next.areaId = 'Select an area'
    if (!form.releaseDate) next.releaseDate = 'Release date is required'
    if (!form.releaseTime) next.releaseTime = 'Release time is required'
    if (!form.notifyBeforeMins || form.notifyBeforeMins < 5) next.notifyBeforeMins = 'Must be at least 5 minutes'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({
        ...form,
        areaId: Number(form.areaId),
        notifyBeforeMins: Number(form.notifyBeforeMins),
        releaseTime: form.releaseTime.length === 5 ? `${form.releaseTime}:00` : form.releaseTime,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initialValue ? 'Edit Schedule' : 'New Water Schedule'}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Area <span className="text-rose-500">*</span></label>
          <select
            className="w-full px-3 py-2.5 text-sm"
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Release date <span className="text-rose-500">*</span></label>
            <input
              type="date"
              min={today()}
              className="w-full px-3 py-2.5 text-sm"
              value={form.releaseDate}
              onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
            />
            {errors.releaseDate && <p className="text-red-500 text-xs mt-1">{errors.releaseDate}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Release time <span className="text-rose-500">*</span></label>
            <input
              type="time"
              className="w-full px-3 py-2.5 text-sm"
              value={form.releaseTime}
              onChange={(e) => setForm({ ...form, releaseTime: e.target.value })}
            />
            {errors.releaseTime && <p className="text-red-500 text-xs mt-1">{errors.releaseTime}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Notify residents</label>
          <select
            className="w-full px-3 py-2.5 text-sm"
            value={customNotify ? 'custom' : form.notifyBeforeMins}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setCustomNotify(true)
              } else {
                setCustomNotify(false)
                setForm({ ...form, notifyBeforeMins: Number(e.target.value) })
              }
            }}
          >
            {NOTIFY_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {customNotify && (
            <div className="mt-2">
              <input
                type="number"
                min={5}
                max={1440}
                placeholder="Minutes before release"
                className="w-full px-3 py-2.5 text-sm"
                value={form.notifyBeforeMins}
                onChange={(e) => setForm({ ...form, notifyBeforeMins: e.target.value })}
              />
            </div>
          )}
          {errors.notifyBeforeMins && <p className="text-red-500 text-xs mt-1">{errors.notifyBeforeMins}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Notes <span className="font-normal text-slate-400">(optional)</span></label>
          <textarea
            rows={2}
            placeholder="Add a note for operators or residents"
            className="w-full px-3 py-2.5 text-sm"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button type="button" onClick={onClose} className="secondary-button">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="primary-button disabled:opacity-60"
          >
            {submitting ? 'Saving…' : initialValue ? 'Save changes' : 'Create schedule'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
