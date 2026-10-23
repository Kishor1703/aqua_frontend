import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Areas from './pages/Areas'
import Residents from './pages/Residents'
import Schedules from './pages/Schedules'
import Notifications from './pages/Notifications'
import ManageOperators from './pages/ManageOperators'
import Reports from './pages/Reports'
import TodaySchedule from './pages/TodaySchedule'
import AlertScheduler from './pages/AlertScheduler'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/today-schedule" element={<TodaySchedule />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/areas" element={<Areas />} />
              <Route path="/residents" element={<Residents />} />
              <Route path="/schedules" element={<Schedules />} />
              <Route path="/alert-scheduler" element={<AlertScheduler />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reports" element={<Reports />} />
              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route path="/admin/operators" element={<ManageOperators />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
