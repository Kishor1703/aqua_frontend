import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  const from = location.state?.from?.pathname || '/dashboard'

  function validate() {
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address'
    if (!form.password) next.password = 'Password is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] dark:border-slate-700 dark:bg-slate-900/80">
        <div className="hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">AquaAlert</div>
            <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
              Clear water alerts for every ward, every day.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Schedule releases, manage residents, and keep operators focused on the right ward.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-lg font-semibold">Ward</div>
              <div className="mt-1 text-slate-300">Scoped access</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-lg font-semibold">Alerts</div>
              <div className="mt-1 text-slate-300">Automatic dispatch</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-lg font-semibold">Reports</div>
              <div className="mt-1 text-slate-300">Daily insight</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-600 dark:text-cyan-300">AquaAlert</div>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Corporation staff access for scheduling and monitoring.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/80" noValidate>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link to="/forgot-password" className="text-cyan-700 hover:underline dark:text-cyan-300">
                Forgot password?
              </Link>
              <span className="text-slate-300">|</span>
              <Link to="/today-schedule" className="text-cyan-700 hover:underline dark:text-cyan-300">
                View today&apos;s schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
