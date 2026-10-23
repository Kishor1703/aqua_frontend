import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/areas', label: 'Areas' },
  { to: '/residents', label: 'Residents' },
  { to: '/schedules', label: 'Schedules' },
  { to: '/alert-scheduler', label: 'Alert Scheduler' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/reports', label: 'Reports' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = user?.role === 'ADMIN'
    ? [...NAV_ITEMS, { to: '/admin/operators', label: 'Operators' }]
    : NAV_ITEMS

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-transparent">
      <aside className="hidden w-72 shrink-0 border-r border-white/60 bg-slate-950/95 p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:block dark:border-slate-800/80">
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">AquaAlert</div>
          <h1 className="mt-2 text-xl font-semibold">Water Operations</h1>
          <p className="mt-1 text-sm text-slate-300">
            Schedule releases, send alerts, and monitor service by ward.
          </p>
        </div>
        {user?.ward && user?.role === 'OPERATOR' && (
          <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">Ward</div>
            <div className="mt-1 font-medium">{user.ward}</div>
          </div>
        )}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/12 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 w-full rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-sm font-semibold text-rose-200 transition-colors hover:bg-rose-500/20"
        >
          Logout
        </button>
      </aside>
      <main className="min-w-0 flex-1 bg-slate-50/80 dark:bg-slate-900/80">
        <header className="border-b border-slate-200/70 bg-white/75 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-semibold tracking-tight text-slate-900">AquaAlert</div>
            <button onClick={handleLogout} className="text-sm font-medium text-rose-600">Logout</button>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${isActive ? 'bg-cyan-100 text-cyan-800' : 'text-slate-500'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <Outlet />
      </main>
    </div>
  )
}
