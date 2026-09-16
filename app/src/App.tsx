import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { StudentHome } from './pages/student/Home'
import { StudentReport } from './pages/student/Report'
import { StudentMyReports } from './pages/student/MyReports'
import { SecurityDashboard } from './pages/security/Dashboard'
import { IncidentDetails } from './pages/security/IncidentDetails'
import { CommunityReports } from './pages/security/CommunityReports'
import { CampusMap } from './pages/security/CampusMap'
import { AuditLogs } from './pages/security/AuditLogs'
import { Admin } from './pages/admin/Admin'

function RootRedirect() {
  const { session, profile, loading } = useAuth()
  if (loading) return null
  if (!session || !profile) return <Navigate to="/login" replace />
  if (profile.role === 'security') return <Navigate to="/security" replace />
  if (profile.role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/student" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute allow={['student']}>
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/report"
            element={
              <ProtectedRoute allow={['student']}>
                <StudentReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/my-reports"
            element={
              <ProtectedRoute allow={['student']}>
                <StudentMyReports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/security"
            element={
              <ProtectedRoute allow={['security', 'admin']}>
                <SecurityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/incidents/:id"
            element={
              <ProtectedRoute allow={['security', 'admin']}>
                <IncidentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/community-reports"
            element={
              <ProtectedRoute allow={['security', 'admin']}>
                <CommunityReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/map"
            element={
              <ProtectedRoute allow={['security', 'admin']}>
                <CampusMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security/audit-logs"
            element={
              <ProtectedRoute allow={['security', 'admin']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
