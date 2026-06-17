import React, { useState, useEffect } from 'react'
import { useSettings } from '../../hooks/useSettings'
import { Link } from 'react-router-dom'
import { 
  Users, Eye, Edit, Trash2, CheckCircle, XCircle, 
  Search, Filter, ChevronLeft, ChevronRight, 
  GraduationCap, Briefcase, Shield, AlertCircle,
  RefreshCw, ArrowLeft, Layers, BookOpen, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { getBranches, getYears, getSections } from '../../utils/academicHierarchy'
import { getBranchDisplayName } from '../../utils/branchUtils'

const UserManagement = () => {
  const [viewState, setViewState] = useState('main') // 'main', 'sections', 'students', 'role_users'
  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { settings } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('1')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [showResetModal, setShowResetModal] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(null)
  const [newRole, setNewRole] = useState('')
  
  const itemsPerPage = 10

  const departments = getBranches(settings);

  let currentSections = [];
  if (selectedDept && yearFilter) {
    currentSections = getSections(settings, selectedDept, yearFilter);
  }

  const roleCards = [
    { id: 'admin', label: 'Admins', icon: Shield, color: 'text-gray-700 bg-gray-100', border: 'border-gray-200' },
    { id: 'dean', label: 'Deans', icon: Star, color: 'text-red-700 bg-red-100', border: 'border-red-200' },
    { id: 'faculty', label: 'Faculty', icon: Briefcase, color: 'text-blue-700 bg-blue-100', border: 'border-blue-200' },
  ]

  useEffect(() => {
    if (viewState === 'students' || viewState === 'role_users') {
      fetchUsers()
    }
  }, [viewState, currentPage, searchTerm, statusFilter, yearFilter, selectedSection])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter
      }
      
      if (viewState === 'students') {
        params.role = 'student'
        if (selectedDept) params.branch = selectedDept
        if (selectedSection) params.section = selectedSection
        if (yearFilter) params.currentYear = yearFilter
      } else if (viewState === 'role_users') {
        params.role = selectedRole
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

  const toggleUserStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive })
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const renderBreadcrumbs = () => {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => {
          setViewState('main')
          setSelectedDept(null)
          setSelectedSection(null)
        }} className="hover:text-blue-600 font-medium">Departments</button>
        {selectedDept && (
          <>
            <span>/</span>
            <button onClick={() => {
              setViewState('sections')
              setSelectedSection(null)
            }} className="hover:text-blue-600 font-medium">{selectedDept}</button>
          </>
        )}
        {selectedSection && viewState === 'students' && (
          <>
            <span>/</span>
            <span className="text-gray-800 font-semibold">Section {selectedSection}</span>
          </>
        )}
        {selectedRole && viewState === 'role_users' && (
          <>
            <span>/</span>
            <span className="text-gray-800 font-semibold">{selectedRole.toUpperCase()}</span>
          </>
        )}
      </div>
    )
  }

  // --- Views --- //
  
  const handleBackClick = () => {
    if (viewState === 'students') {
      if (selectedSection) {
        setViewState('sections')
      } else if (selectedDept) {
        setViewState('sections')
      } else {
        setViewState('main')
      }
    } else if (viewState === 'sections' || viewState === 'role_users') {
      setViewState('main')
      setSelectedDept(null)
      setSelectedRole(null)
    }
  }

  return (
    <div className="p-6">
      {viewState !== 'main' && renderBreadcrumbs()}
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {viewState !== 'main' && (
            <button 
              onClick={handleBackClick}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {viewState === 'main' && "User Management"}
              {viewState === 'sections' && `${getBranchDisplayName(selectedDept)} Sections`}
              {viewState === 'students' && (selectedSection ? `${getBranchDisplayName(selectedDept)} - Section ${selectedSection} Students` : selectedDept ? `${getBranchDisplayName(selectedDept)} - All Students` : "All Students")}
              {viewState === 'role_users' && `${selectedRole?.toUpperCase()} Users`}
            </h1>
            <p className="text-gray-500 mt-1">
              {viewState === 'main' && "Manage users across departments and roles."}
              {viewState === 'sections' && "Select a section to view students."}
              {(viewState === 'students' || viewState === 'role_users') && "Manage users in this category."}
            </p>
          </div>
        </div>
        
        {(viewState === 'students' || viewState === 'role_users') && (
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={
              viewState === 'role_users' ? `Search ${selectedRole}s by name, email...` :
              selectedSection ? `Search student in ${getBranchDisplayName(selectedDept)} - Sec ${selectedSection}...` :
              selectedDept ? `Search student in ${getBranchDisplayName(selectedDept)}...` :
              "Search all students..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm) {
                if (viewState !== 'role_users') setViewState('students');
                setCurrentPage(1);
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {viewState !== 'role_users' && (
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value)
              setCurrentPage(1)
              if (viewState === 'students' && selectedSection) {
                 setViewState('sections')
                 setSelectedSection(null)
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getYears().map(y => (
              <option key={y} value={y}>{y}{y==='1'?'st':y==='2'?'nd':y==='3'?'rd':'th'} Year</option>
            ))}
          </select>
        )}
        
        <button
          onClick={() => {
            if (viewState !== 'role_users') setViewState('students');
            setCurrentPage(1);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Search
        </button>

        {(searchTerm || statusFilter || yearFilter) && (
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setYearFilter(''); setCurrentPage(1); }}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {viewState === 'main' && (
        <>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {roleCards.map(role => (
              <div 
                key={role.id}
                onClick={() => {
                  setSelectedRole(role.id)
                  setViewState('role_users')
                  setCurrentPage(1)
                  setSearchTerm('')
                }}
                className={`p-6 bg-white rounded-xl shadow-sm border ${role.border} hover:shadow-md cursor-pointer transition-all flex items-center gap-4`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.color}`}>
                  <role.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{role.label}</h3>
                  <p className="text-sm text-gray-500">View all {role.label.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-4">Departments</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {departments.map(dept => (
              <div 
                key={dept}
                onClick={() => {
                  setSelectedDept(dept)
                  setSelectedSection(null)
                  setViewState('sections')
                }}
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all text-center group"
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{getBranchDisplayName(dept)}</h3>
                <p className="text-sm text-gray-500 mt-1">View Sections</p>
              </div>
            ))}
          </div>
        </>
      )}

      {viewState === 'sections' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentSections.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No sections configured for this branch {yearFilter ? `and year ${yearFilter}` : ''}.</p>
            </div>
          ) : (
            currentSections.map(sec => (
              <div 
                key={sec}
                onClick={() => {
                  setSelectedSection(sec)
                  setViewState('students')
                  setCurrentPage(1)
                  setSearchTerm('')
                }}
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-300 cursor-pointer transition-all text-center group"
              >
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Section {sec}</h3>
                <p className="text-sm text-gray-500 mt-1">View Students</p>
              </div>
            ))
          )}
        </div>
      )}

      {(viewState === 'students' || viewState === 'role_users') && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="w-full hidden md:table">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-600">User</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Contact</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Role</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-500">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id} className="border-t border-gray-100 hover:bg-gray-50 transition-all">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center">
                                {user.name?.charAt(0) || 'U'}
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
                            <span className="inline-flex text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1 items-start">
                              {user.isActive ? (
                                <span className="inline-flex text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>
                              ) : (
                                <span className="inline-flex text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full"><XCircle className="w-3 h-3 mr-1"/> Inactive</span>
                              )}
                              {user.role !== 'admin' && (
                                <button onClick={() => toggleUserStatus(user)} className="text-xs text-blue-600 hover:underline">
                                  {user.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Link to={`/admin/users/${user._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button onClick={() => { setShowResetModal(user); }} className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors" title="Reset Password">
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setNewRole(user.role); setShowRoleModal(user); }} className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors" title="Change Role">
                                <Shield className="w-4 h-4" />
                              </button>
                              <button onClick={() => setShowDeleteModal(user)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete User">
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      No users found
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user._id} className="p-4 hover:bg-gray-50 transition-all flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center flex-shrink-0">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 line-clamp-1">{user.name}</p>
                            <p className="text-xs text-gray-400">
                              {user.rollNumber || user.employeeId || 'N/A'} • {user.role}
                            </p>
                          </div>
                          <div>
                            {user.isActive ? (
                              <span className="inline-flex text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Active</span>
                            ) : (
                              <span className="inline-flex text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full">Inactive</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex gap-2">
                            <Link to={`/admin/users/${user._id}`} className="p-2 bg-gray-100 text-gray-600 rounded-lg" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button onClick={() => { setShowResetModal(user); }} className="p-2 bg-gray-100 text-orange-600 rounded-lg" title="Reset Password">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setNewRole(user.role); setShowRoleModal(user); }} className="p-2 bg-gray-100 text-purple-600 rounded-lg" title="Change Role">
                              <Shield className="w-4 h-4" />
                            </button>
                            <button onClick={() => setShowDeleteModal(user)} className="p-2 bg-red-50 text-red-600 rounded-lg" title="Delete User">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="px-4 py-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

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
            <p className="text-gray-600 mb-6">Are you sure you want to delete <span className="font-semibold">{showDeleteModal.name}</span>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDeleteUser(showDeleteModal._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete User</button>
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
            <p className="text-gray-600 mb-6">Reset password for <span className="font-semibold">{showResetModal.name}</span> to: <span className="font-mono bg-gray-100 px-2 py-1 rounded">Password@123</span></p>
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
            <p className="text-gray-600 mb-4">Change role for <span className="font-semibold">{showRoleModal.name}</span></p>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6">
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