import apiClient from './apiClient'

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const reportService = {
  async summary(period = 'WEEKLY') {
    const { data } = await apiClient.get('/reports', { params: { period } })
    return data
  },

  async exportCsv(period = 'WEEKLY') {
    const response = await apiClient.get('/reports/export.csv', {
      params: { period },
      responseType: 'blob',
    })
    downloadBlob(response.data, `aquaalert-report-${period.toLowerCase()}.csv`)
  },

  async exportPdf(period = 'WEEKLY') {
    const response = await apiClient.get('/reports/export.pdf', {
      params: { period },
      responseType: 'blob',
    })
    downloadBlob(response.data, `aquaalert-report-${period.toLowerCase()}.pdf`)
  },
}
