import apiClient from './apiClient'

export const dashboardService = {
  async summary() {
    const { data } = await apiClient.get('/dashboard/summary')
    return data
  },

  async today() {
    const { data } = await apiClient.get('/dashboard/today')
    return data
  },

  async upcoming() {
    const { data } = await apiClient.get('/dashboard/upcoming')
    return data
  },

  async charts() {
    const { data } = await apiClient.get('/dashboard/charts')
    return data
  },
}
