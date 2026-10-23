import apiClient from './apiClient'

export const residentService = {
  async search({ search = '', areaId = '', status = '', page = 0, size = 10 } = {}) {
    const { data } = await apiClient.get('/residents', {
      params: { search, areaId: areaId || undefined, status: status || undefined, page, size },
    })
    return data
  },

  async getById(id) {
    const { data } = await apiClient.get(`/residents/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await apiClient.post('/residents', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/residents/${id}`, payload)
    return data
  },

  async setStatus(id, status) {
    await apiClient.patch(`/residents/${id}/status`, null, { params: { status } })
  },

  async remove(id) {
    await apiClient.delete(`/residents/${id}`)
  },

  async importCsv(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await apiClient.post('/residents/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async exportCsv({ areaId = '', status = '' } = {}) {
    const response = await apiClient.get('/residents/export', {
      params: { areaId: areaId || undefined, status: status || undefined },
      responseType: 'blob',
    })
    downloadBlob(response.data, extractFilename(response.headers) || 'residents-export.csv')
  },

  async downloadTemplate() {
    const response = await apiClient.get('/residents/import-template', { responseType: 'blob' })
    downloadBlob(response.data, 'resident-import-template.csv')
  },
}

function extractFilename(headers) {
  const disposition = headers?.['content-disposition']
  const match = disposition?.match(/filename="?([^"]+)"?/)
  return match?.[1]
}

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
