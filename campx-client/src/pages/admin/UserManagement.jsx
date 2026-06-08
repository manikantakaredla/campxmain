import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, Eye, Edit, Trash2, CheckCircle, XCircle, 
  Search, Filter, ChevronLeft, ChevronRight, 
  UserPlus, GraduationCap, Briefcase, Shield,
  AlertCircle, Mail, Phone, Calendar as CalIcon,
  Download, Upload, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [showResetModal, setShowResetModal] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')
  const itemsPerPage = 10

  const roles = [
    { value: 'student', label: 'Student', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
    { value: 'faculty', label: 'Faculty', icon: <Briefcase className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
    { value: 'hod', label: 'HOD', icon: <Shield className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
    { value: 'deputyhod', label: 'Deputy HOD', icon: <Shield className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'dean', label: 'Dean', icon: <Shield className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
    { value: 'principal', label: 'Principal', icon: <Shield className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700' },
    { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' }
  ]

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      }
      const response = await api.get('/admin/users', { params })
      setUsers(response.data.users || [])
      setTotalPages(response.data.pagination?.pages || 1)
      setTotalUsers(response.data.pagination?.total || 0)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted successfully')
      setShowDeleteModal(null)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleResetPassword = async (id) => {
    try {
      await api.put(`/admin/users/${id}/reset-password`, { newPassword: 'Password@123' })
      toast.success('Password reset to: Password@123')
      setShowResetModal(null)
    } catch (error) {
      toast.error('Failed to reset password')
    }
  }

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role })
      toast.success(`Role updated to ${role}`)
      setShowRoleModal(null)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const getRoleBadge = (role) => {
    const roleConfig = roles.find(r => r.value === role) || roles[0]
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${roleConfig.color}`}>
        {roleConfig.icon}
        {roleConfig.label}
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Inactive
        </span>
      )
    }
  }

  const toggleUserStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive })
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
    setStatusFilter('')
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Phone', 'Status', 'Joined']
    const csvData = users.map(user => [
      user.name,
      user.email,
      user.role,
      user.phoneNumber || '',
      user.isActive ? 'Active' : 'Inactive',
      new Date(user.createdAt).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Users exported successfully')
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, roll number, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="hod">HOD</option>
            <option value="deputyhod">Deputy HOD</option>
            <option value="dean">Dean</option>
            <option value="principal">Principal</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(searchTerm || roleFilter || statusFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">User</th>
                <th className="text-left p-4 font-semibold text-gray-600">Contact</th>
                <th className="text-left p-4 font-semibold text-gray-600">Role</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Joined</th>
                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-t border-gray-100 hover:bg-gray-50 transition-all">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          user.role === 'student' ? 'bg-green-100' :
                          user.role === 'faculty' ? 'bg-blue-100' :
                          'bg-purple-100'
                        }`}>
                          <span className={`font-bold ${
                            user.role === 'student' ? 'text-green-600' :
                            user.role === 'faculty' ? 'text-blue-600' :
                            'text-purple-600'
                          }`}>
                            {user.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">
                            {user.rollNumber || user.employeeId || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.phoneNumber || 'No phone'}</p>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(user.isActive)}
                        <button
                          onClick={() => toggleUserStatus(user)}
                          className="text-xs text-blue-600 hover:underline text-left"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link 
                          to={`/admin/users/${user._id}`} 
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => {
                            setSelectedUser(user)
                            setShowResetModal(user)
                          }}
                          className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors"
                          title="Reset Password"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role)
                            setShowRoleModal(user)
                          }}
                          className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Change Role"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowDeleteModal(user)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteModal(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Delete User</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{showDeleteModal.name}</span>? 
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteModal._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowResetModal(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Reset password for <span className="font-semibold">{showResetModal.name}</span>? 
              The new password will be: <span className="font-mono bg-gray-100 px-2 py-1 rounded">Password@123</span>
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowResetModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleResetPassword(showResetModal._id)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Reset Password</button>
            </div>
          </div>
        </>
      )}

      {/* Change Role Modal */}
      {showRoleModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowRoleModal(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Change User Role</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Change role for <span className="font-semibold">{showRoleModal.name}</span>
            </p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="hod">HOD</option>
              <option value="deputyhod">Deputy HOD</option>
              <option value="dean">Dean</option>
              <option value="principal">Principal</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowRoleModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleRoleChange(showRoleModal._id, newRole)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Update Role</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserManagement