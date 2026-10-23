import apiClient from './apiClient'

export const areaService = {
  async search({ search = '', activeOnly = false, page = 0, size = 10 } = {}) {
    const { data } = await apiClient.get('/areas', {
      params: { search, activeOnly, page, size },
    })
    return data
  },

  // Used to populate area dropdowns elsewhere (Residents, Schedules).
  // Areas are a small, slow-changing list, so one large page is fine —
  // no need for a separate unpaginated endpoint.
  async listAllActive() {
    const { data } = await apiClient.get('/areas', {
      params: { activeOnly: true, page: 0, size: 500, sort: 'name' },
    })
    return data.content
  },

  async getById(id) {
    const { data } = await apiClient.get(`/areas/${id}`)
    return data
  },

  async create(payload) {
    const { data } = await apiClient.post('/areas', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await apiClient.put(`/areas/${id}`, payload)
    return data
  },

  async setActive(id, active) {
    await apiClient.patch(`/areas/${id}/status`, null, { params: { active } })
  },

  async remove(id) {
    await apiClient.delete(`/areas/${id}`)
  },
}
