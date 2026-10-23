import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
    } catch {
      // Intentionally swallow errors here too — the backend always
      // returns 204 regardless of whether the email exists, so the
      // UI shouldn't reveal anything different on failure either.
    } finally {
      setIsLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,.12)] backdrop-blur">
        <div className="page-kicker">AquaAlert</div>
        <h1 className="page-title">Reset your password</h1>

        {submitted ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If an account exists for that email, we've sent a reset link. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="you@corporation.gov.in"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aqua-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button w-full disabled:opacity-60"
            >
              {isLoading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-medium text-cyan-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
