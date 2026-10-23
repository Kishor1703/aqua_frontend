import { useRef, useState } from 'react'
import Modal from './Modal'
import { residentService } from '../services/residentService'

export default function CsvImportModal({ open, onClose, onImported }) {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [importing, setImporting] = useState(false)

  function reset() {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleImport() {
    if (!file) return
    setImporting(true)
    try {
      const data = await residentService.importCsv(file)
      setResult(data)
      if (data.successCount > 0) onImported()
    } finally {
      setImporting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Import Residents from CSV">
      {!result ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Columns: <code>houseNumber, ownerName, phoneNumber, alternatePhoneNumber,
            email, areaName, ward, zone, street, notificationPreference, preferredLanguage</code>.
            Email is optional; include an <code>email</code> column to import resident addresses.
            Missing areas are auto-created during import using <code>areaName + ward</code>.
            If <code>zone</code> is omitted, the backend uses <code>Imported</code>.
          </p>
          <button
            type="button"
            onClick={() => residentService.downloadTemplate()}
            className="text-sm text-aqua-600 hover:underline"
          >
            Download template
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-aqua-600 hover:bg-aqua-700 disabled:opacity-60"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="text-xl font-bold">{result.totalRows}</div>
              <div className="text-xs text-gray-500">Total rows</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-xl font-bold text-green-700 dark:text-green-400">{result.successCount}</div>
              <div className="text-xs text-gray-500">Imported</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <div className="text-xl font-bold text-red-700 dark:text-red-400">{result.failureCount}</div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Row</th>
                    <th className="text-left px-3 py-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((err) => (
                    <tr key={err.rowNumber} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2">{err.rowNumber}</td>
                      <td className="px-3 py-2">{err.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={reset} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600">
              Import another file
            </button>
            <button onClick={handleClose} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-aqua-600 hover:bg-aqua-700">
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
