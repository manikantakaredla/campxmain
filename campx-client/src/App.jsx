import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/layout/Layout'

// Auth Pages
import LandingPage from './pages/auth/LandingPage'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard'
import StudentAnnouncements from './pages/student/StudentAnnouncements'
import StudentResources from './pages/student/StudentResources'
import StudentCalendar from './pages/student/StudentCalendar'
import StudentProfile from './pages/student/StudentProfile'
import StudentNotifications from './pages/student/StudentNotifications'
import ClassUpdates from './pages/student/ClassUpdates';
import OpportunitiesDashboard from './pages/student/Opportunities/OpportunitiesDashboard';

// Shared Pages
import AnnouncementDetails from './pages/shared/AnnouncementDetails'
import ResourceDetails from './pages/shared/ResourceDetails'
import ActivityDetails from './pages/shared/ActivityDetails'

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import MyStudents from './pages/faculty/MyStudents'
import MyAnnouncements from './pages/faculty/MyAnnouncements'
import FacultyCreateAnnouncement from './pages/faculty/CreateAnnouncement'
import FacultyEditAnnouncement from './pages/faculty/EditAnnouncement'
import MyResources from './pages/faculty/Myresources'
import UploadResource from './pages/faculty/UploadResource'
import EditResource from './pages/faculty/EditResource'
import MyActivities from './pages/faculty/MyActivities'
import CreateActivity from './pages/faculty/CreateActivity'
import EditActivity from './pages/faculty/EditActivity'
import FacultyProfile from './pages/faculty/FacultyProfile'
import FacultyNotifications from './pages/faculty/FacultyNotifications'
import FacultyStudentDetails from './pages/faculty/StudentDetails'

// Management Pages (HOD/Dean/Principal)
import ManagementDashboard from './pages/management/ManagementDashboard'
import FacultyManagement from './pages/management/FacultyManagement'
import FacultyDetails from './pages/management/FacultyDetails'
import AssignStudents from './pages/management/AssignStudents'
import DepartmentStudents from './pages/management/DepartmentStudents'
import ManagementStudentDetails from './pages/management/StudentDetails'
import UploadAssignments from './pages/management/UploadAssignments'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import AddUsers from './pages/admin/AddUsers'
import UserDetails from './pages/admin/UserDetails'
import AnnouncementManagement from './pages/admin/AnnouncementManagement'
import ResourceManagement from './pages/admin/ResourceManagement'
import CalendarManagement from './pages/admin/CalendarManagement'
import DataUpload from './pages/admin/DataUpload'
import SystemSettings from './pages/admin/SystemSettings'
import AdminCreateAnnouncement from './pages/admin/CreateAnnouncement'
import AdminEditAnnouncement from './pages/admin/EditAnnouncement'
import AdminOpportunities from './pages/admin/Opportunities/AdminOpportunities';
import PlacementUpload from './pages/admin/Opportunities/PlacementUpload';
import PlacementAnalytics from './pages/admin/Opportunities/PlacementAnalytics';

function App() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not authenticated - show landing page
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

  // Student Routes
  if (role === 'student') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/announcements" element={<StudentAnnouncements />} />
          <Route path="/student/resources" element={<StudentResources />} />
          <Route path="/student/calendar" element={<StudentCalendar />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/opportunities" element={<OpportunitiesDashboard />} />
          
          <Route path="/announcement/:id" element={<AnnouncementDetails />} />
          <Route path="/resource/:id" element={<ResourceDetails />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
          
          <Route path="/student/class-updates" element={<ClassUpdates />} />
          <Route path="*" element={<StudentDashboard />} />
        </Route>
      </Routes>
    )
  }

  // Faculty Routes
  if (role === 'faculty') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/students" element={<MyStudents />} />
          <Route path="/faculty/students/:id" element={<FacultyStudentDetails />} />
          <Route path="/faculty/announcements" element={<MyAnnouncements />} />
          <Route path="/faculty/announcements/create" element={<FacultyCreateAnnouncement />} />
          <Route path="/faculty/announcements/edit/:id" element={<FacultyEditAnnouncement />} />
          <Route path="/faculty/resources" element={<MyResources />} />
          <Route path="/faculty/resources/upload" element={<UploadResource />} />
          <Route path="/faculty/resources/edit/:id" element={<EditResource />} />
          <Route path="/faculty/activities" element={<MyActivities />} />
          <Route path="/faculty/activities/create" element={<CreateActivity />} />
          <Route path="/faculty/activities/edit/:id" element={<EditActivity />} />
          <Route path="/faculty/profile" element={<FacultyProfile />} />
          <Route path="/faculty/notifications" element={<FacultyNotifications />} />
          
          <Route path="/announcement/:id" element={<AnnouncementDetails />} />
          <Route path="/resource/:id" element={<ResourceDetails />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
          
          <Route path="*" element={<FacultyDashboard />} />
        </Route>
      </Routes>
    )
  }

  // Management Routes (HOD/Dean/Principal)
  if (['hod', 'deputyhod', 'dean', 'principal'].includes(role)) {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/management/dashboard" element={<ManagementDashboard />} />
          <Route path="/management/faculty" element={<FacultyManagement />} />
          <Route path="/management/faculty/:id" element={<FacultyDetails />} />
          <Route path="/management/assign-students" element={<AssignStudents />} />
          <Route path="/management/students" element={<DepartmentStudents />} />
          <Route path="/management/students/:id" element={<ManagementStudentDetails />} />
          
          {/* Upload Assignment Routes - ADD THESE */}
          <Route path="/management/upload/class" element={<UploadAssignments />} />
          <Route path="/management/upload/proctor" element={<UploadAssignments />} />
          
          <Route path="/management/announcements" element={<MyAnnouncements />} />
          <Route path="/management/announcements/create" element={<FacultyCreateAnnouncement />} />
          <Route path="/management/announcements/edit/:id" element={<FacultyEditAnnouncement />} />
          <Route path="/management/resources" element={<MyResources />} />
          <Route path="/management/resources/upload" element={<UploadResource />} />
          <Route path="/management/resources/edit/:id" element={<EditResource />} />
          <Route path="/management/activities" element={<MyActivities />} />
          <Route path="/management/activities/create" element={<CreateActivity />} />
          <Route path="/management/activities/edit/:id" element={<EditActivity />} />
          <Route path="/management/profile" element={<FacultyProfile />} />
          <Route path="/management/notifications" element={<FacultyNotifications />} />
          
          <Route path="/announcement/:id" element={<AnnouncementDetails />} />
          <Route path="/resource/:id" element={<ResourceDetails />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
          
          <Route path="*" element={<ManagementDashboard />} />
        </Route>
      </Routes>
    )
  }

  // Admin Routes
  if (role === 'admin') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />
          <Route path="/admin/announcements" element={<AnnouncementManagement />} />
          <Route path="/admin/announcements/create" element={<AdminCreateAnnouncement />} />
          <Route path="/admin/announcements/edit/:id" element={<AdminEditAnnouncement />} />
          <Route path="/admin/resources" element={<ResourceManagement />} />
          <Route path="/admin/calendar" element={<CalendarManagement />} />
          <Route path="/admin/upload-data" element={<DataUpload />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          
          {/* Opportunities Module */}
          <Route path="/admin/opportunities" element={<AdminOpportunities />} />
          <Route path="/admin/placements/upload" element={<PlacementUpload />} />
          <Route path="/admin/placements/analytics" element={<PlacementAnalytics />} />
          
          <Route path="/announcement/:id" element={<AnnouncementDetails />} />
          <Route path="/resource/:id" element={<ResourceDetails />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
          
          <Route path="*" element={<AdminDashboard />} />
        </Route>
      </Routes>
    )
  }

  // Fallback
  return (
    <Routes>
      <Route path="/*" element={<LandingPage />} />
    </Routes>
  )
}

export default App