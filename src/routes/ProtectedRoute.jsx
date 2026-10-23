import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guards a route subtree. Optionally restricts to a set of roles.
 * Usage:
 *   <Route element={<ProtectedRoute roles={['ADMIN']} />}>
 *     <Route path="/admin" element={<AdminPage />} />
 *   </Route>
 */
export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
