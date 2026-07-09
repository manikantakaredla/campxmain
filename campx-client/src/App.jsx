import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useSettings } from './hooks/useSettings'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'

// Loading Component (inline to avoid import issues)
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-fitbit-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

// Auth Pages (Keep static for fast initial load)
import LandingPage from './pages/auth/LandingPage'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import MaintenancePage from './pages/common/MaintenancePage'

// Lazy loaded pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const StudentAnnouncements = lazy(() => import('./pages/student/StudentAnnouncements'))
const StudentResources = lazy(() => import('./pages/student/StudentResources'))
const StudentCalendar = lazy(() => import('./pages/student/StudentCalendar'))
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'))
const StudentNotifications = lazy(() => import('./pages/student/StudentNotifications'))
const ClassUpdates = lazy(() => import('./pages/student/ClassUpdates'))
const OpportunitiesDashboard = lazy(() => import('./pages/student/Opportunities/OpportunitiesDashboard'))

const AnnouncementDetails = lazy(() => import('./pages/shared/AnnouncementDetails'))
const ResourceDetails = lazy(() => import('./pages/shared/ResourceDetails'))
const ActivityDetails = lazy(() => import('./pages/shared/ActivityDetails'))
const Messages = lazy(() => import('./pages/shared/Messages'))
const AnalyticsDashboard = lazy(() => import('./pages/shared/AnalyticsDashboard'))

const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'))
const MyStudents = lazy(() => import('./pages/faculty/MyStudents'))
const MyAnnouncements = lazy(() => import('./pages/faculty/MyAnnouncements'))
const FacultyCreateAnnouncement = lazy(() => import('./pages/faculty/CreateAnnouncement'))
const FacultyEditAnnouncement = lazy(() => import('./pages/faculty/EditAnnouncement'))
const MyResources = lazy(() => import('./pages/faculty/Myresources'))
const UploadResource = lazy(() => import('./pages/faculty/UploadResource'))
const EditResource = lazy(() => import('./pages/faculty/EditResource'))
const MyActivities = lazy(() => import('./pages/faculty/MyActivities'))
const CreateActivity = lazy(() => import('./pages/faculty/CreateActivity'))
const EditActivity = lazy(() => import('./pages/faculty/EditActivity'))
const FacultyProfile = lazy(() => import('./pages/faculty/FacultyProfile'))
const FacultyNotifications = lazy(() => import('./pages/faculty/FacultyNotifications'))
const FacultyStudentDetails = lazy(() => import('./pages/faculty/StudentDetails'))

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const UserDetails = lazy(() => import('./pages/admin/UserDetails'))
const AnnouncementManagement = lazy(() => import('./pages/admin/AnnouncementManagement'))
const ResourceManagement = lazy(() => import('./pages/admin/ResourceManagement'))
const CalendarManagement = lazy(() => import('./pages/admin/CalendarManagement'))
const DataUpload = lazy(() => import('./pages/admin/DataUpload'))
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'))
const AdminCreateAnnouncement = lazy(() => import('./pages/admin/CreateAnnouncement'))
const AdminEditAnnouncement = lazy(() => import('./pages/admin/EditAnnouncement'))
const AdminOpportunities = lazy(() => import('./pages/admin/Opportunities/AdminOpportunities'))
const PlacementUpload = lazy(() => import('./pages/admin/Opportunities/PlacementUpload'))
const PlacementAnalytics = lazy(() => import('./pages/admin/Opportunities/PlacementAnalytics'))
const AdminFacultyManagement = lazy(() => import('./pages/admin/FacultyManagement'))

// Role-based route guard
const RoleBasedRedirect = ({ role }) => {
  const redirectMap = {
    student: '/student/dashboard',
    faculty: '/faculty/dashboard',
    hod: '/admin/dashboard',
    dean: '/admin/dashboard',
    principal: '/admin/dashboard',
    admin: '/admin/dashboard'
  }
  return <Navigate to={redirectMap[role] || '/'} replace />
}

function App() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { settings, loading: settingsLoading } = useSettings()

  if (authLoading) return <LoadingSpinner />

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/*" element={<LandingPage />} />
      </Routes>
    )
  }

  const role = user?.role

  // Wait for settings to load before checking maintenance mode
  if (settingsLoading) return <LoadingSpinner />

  // Enforce Maintenance Mode (block everyone except Admin)
  if (settings?.maintenanceMode && role !== 'admin') {
    return (
      <Routes>
        <Route path="*" element={<MaintenancePage />} />
      </Routes>
    )
  }

  const wrapSuspense = (Component) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  )

  if (role === 'student') {
    return (
      <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={wrapSuspense(StudentDashboard)} />
          <Route path="/student/announcements" element={wrapSuspense(StudentAnnouncements)} />
          <Route path="/student/resources" element={wrapSuspense(StudentResources)} />
          <Route path="/student/calendar" element={wrapSuspense(StudentCalendar)} />
          <Route path="/student/profile" element={wrapSuspense(StudentProfile)} />
          <Route path="/student/notifications" element={wrapSuspense(StudentNotifications)} />
          <Route path="/student/opportunities" element={wrapSuspense(OpportunitiesDashboard)} />
          <Route path="/student/class-updates" element={wrapSuspense(ClassUpdates)} />
          <Route path="/student/messages" element={wrapSuspense(Messages)} />
          
          <Route path="/announcement/:id" element={wrapSuspense(AnnouncementDetails)} />
          <Route path="/resource/:id" element={wrapSuspense(ResourceDetails)} />
          <Route path="/activity/:id" element={wrapSuspense(ActivityDetails)} />
          
          <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
        </Route>
      </Routes>
      </ErrorBoundary>
    )
  }

  if (role === 'faculty') {
    return (
      <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/faculty/dashboard" replace />} />
          <Route path="/faculty/dashboard" element={wrapSuspense(FacultyDashboard)} />
          <Route path="/faculty/students" element={wrapSuspense(MyStudents)} />
          <Route path="/faculty/students/:id" element={wrapSuspense(FacultyStudentDetails)} />
          <Route path="/faculty/announcements" element={wrapSuspense(MyAnnouncements)} />
          <Route path="/faculty/announcements/create" element={wrapSuspense(FacultyCreateAnnouncement)} />
          <Route path="/faculty/announcements/edit/:id" element={wrapSuspense(FacultyEditAnnouncement)} />
          <Route path="/faculty/resources" element={wrapSuspense(MyResources)} />
          <Route path="/faculty/resources/upload" element={wrapSuspense(UploadResource)} />
          <Route path="/faculty/resources/edit/:id" element={wrapSuspense(EditResource)} />
          <Route path="/faculty/activities" element={wrapSuspense(MyActivities)} />
          <Route path="/faculty/activities/create" element={wrapSuspense(CreateActivity)} />
          <Route path="/faculty/activities/edit/:id" element={wrapSuspense(EditActivity)} />
          <Route path="/faculty/profile" element={wrapSuspense(FacultyProfile)} />
          <Route path="/faculty/notifications" element={wrapSuspense(FacultyNotifications)} />
          <Route path="/faculty/messages" element={wrapSuspense(Messages)} />
          <Route path="/faculty/analytics" element={wrapSuspense(AnalyticsDashboard)} />
          
          <Route path="/announcement/:id" element={wrapSuspense(AnnouncementDetails)} />
          <Route path="/resource/:id" element={wrapSuspense(ResourceDetails)} />
          <Route path="/activity/:id" element={wrapSuspense(ActivityDetails)} />
          
          <Route path="*" element={<Navigate to="/faculty/dashboard" replace />} />
        </Route>
      </Routes>
      </ErrorBoundary>
    )
  }

  if (['admin', 'hod', 'dean', 'principal'].includes(role)) {
    return (
      <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={wrapSuspense(AdminDashboard)} />
          <Route path="/admin/users" element={wrapSuspense(UserManagement)} />
          <Route path="/admin/users/:id" element={wrapSuspense(UserDetails)} />
          <Route path="/admin/announcements" element={wrapSuspense(AnnouncementManagement)} />
          <Route path="/admin/announcements/create" element={wrapSuspense(AdminCreateAnnouncement)} />
          <Route path="/admin/announcements/edit/:id" element={wrapSuspense(AdminEditAnnouncement)} />
          <Route path="/admin/resources" element={wrapSuspense(ResourceManagement)} />
          <Route path="/admin/resources/upload" element={wrapSuspense(UploadResource)} />
          <Route path="/admin/calendar" element={wrapSuspense(CalendarManagement)} />
          <Route path="/admin/upload-data" element={wrapSuspense(DataUpload)} />
          <Route path="/admin/settings" element={wrapSuspense(SystemSettings)} />
          <Route path="/admin/opportunities" element={wrapSuspense(AdminOpportunities)} />
          <Route path="/admin/placements/upload" element={wrapSuspense(PlacementUpload)} />
          <Route path="/admin/placements/analytics" element={wrapSuspense(PlacementAnalytics)} />
          <Route path="/admin/faculty-management" element={wrapSuspense(AdminFacultyManagement)} />
          <Route path="/admin/analytics" element={wrapSuspense(AnalyticsDashboard)} />
          
          <Route path="/announcement/:id" element={wrapSuspense(AnnouncementDetails)} />
          <Route path="/resource/:id" element={wrapSuspense(ResourceDetails)} />
          <Route path="/activity/:id" element={wrapSuspense(ActivityDetails)} />
          
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
      </ErrorBoundary>
    )
  }

  return <RoleBasedRedirect role={role} />
}

export default App