import apiClient from './apiClient'

export const scheduleService = {
  async search({ areaId = '', status = '', fromDate = '', toDate = '', page = 0, size = 10 } = {}) {
    const { data } = await apiClient.get('/schedules', {
      params: {
        areaId: areaId || undefined,
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        size,
      },
    })
    return data
  },

  async getById(id) {
    const { data } = await apiClient.get(`/schedules/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await apiClient.post('/schedules', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/schedules/${id}`, payload)
    return data
  },

  async updateStatus(id, status, notes) {
    const { data } = await apiClient.patch(`/schedules/${id}/status`, { status, notes })
    return data
  },

  async remove(id) {
    await apiClient.delete(`/schedules/${id}`)
  },
}
