import apiClient from './apiClient'

export const operatorService = {
  async list() {
    const { data } = await apiClient.get('/operators')
    return data
  },

  async create(payload) {
    const { data } = await apiClient.post('/operators', payload)
    return data
  },
}
