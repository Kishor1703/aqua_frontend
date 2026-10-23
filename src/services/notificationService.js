import apiClient from './apiClient'

export const notificationService = {
  async sendTestEmail() {
    const { data } = await apiClient.post('/notifications/test-email')
    return data
  },

  async search({ scheduleId = '', residentId = '', status = '', channel = '', page = 0, size = 10 } = {}) {
    const { data } = await apiClient.get('/notifications', {
      params: {
        scheduleId: scheduleId || undefined,
        residentId: residentId || undefined,
        status: status || undefined,
        channel: channel || undefined,
        page,
        size,
      },
    })
    return data
  },

  async stats() {
    const { data } = await apiClient.get('/notifications/stats')
    return data
  },

  async retry(id) {
    const { data } = await apiClient.post(`/notifications/${id}/retry`)
    return data
  },

  async retryAllFailed() {
    await apiClient.post('/notifications/retry-failed')
  },
}
