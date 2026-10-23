import apiClient from './apiClient'

export const authService = {
  async login(email, password) {
    const { data } = await apiClient.post('/auth/login', { email, password })
    return data
  },

  async forgotPassword(email) {
    await apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(token, newPassword) {
    await apiClient.post('/auth/reset-password', { token, newPassword })
  },

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },
}
