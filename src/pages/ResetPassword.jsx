import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await authService.resetPassword(token, password)
      setCompleted(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'This reset link is invalid or expired')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,.12)] backdrop-blur">
        <div className="page-kicker">AquaAlert</div>
        <h1 className="page-title">Choose a new password</h1>
        {completed ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Your password has been changed.</p>
            <Link to="/login" className="primary-button block text-center">Back to sign in</Link>
          </div>
        ) : !token ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">This reset link is missing its token. Request a new one.</p>
            <Link to="/forgot-password" className="primary-button block text-center">Request reset link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="New password"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-500"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button type="submit" disabled={isLoading} className="primary-button w-full disabled:opacity-60">
              {isLoading ? 'Updating...' : 'Reset password'}
            </button>
          </form>
        )}
        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-cyan-700 hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
