import apiClient from './apiClient'

export const publicScheduleService = {
  async today(ward = '') {
    const { data } = await apiClient.get('/public/today-schedules', {
      params: { ward: ward || undefined },
    })
    return data
  },
}
