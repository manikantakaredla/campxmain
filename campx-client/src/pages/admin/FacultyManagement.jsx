import React, { useState, useEffect } from 'react'
import { Search, Filter, BookOpen, Users, UserCheck, MoreVertical } from 'lucide-react'
import facultyManagementService from '../../services/facultyManagementService'
import { Pagination } from '../../components/common/Pagination'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import toast from 'react-hot-toast'
import FacultyDetailsModal from '../../components/admin/FacultyDetailsModal'

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const fetchFaculty = async (page = 1) => {
    try {
      setLoading(true)
      const res = await facultyManagementService.getFacultyList({
        page,
        limit: pagination.limit,
        search: searchTerm,
        department: departmentFilter
      })
      if (res.success) {
        setFaculty(res.faculty)
        setPagination(res.pagination)
      }
    } catch (error) {
      toast.error('Failed to load faculty list')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFaculty(1)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, departmentFilter])

  const handlePageChange = (newPage) => {
    fetchFaculty(newPage)
  }

  const openDetails = (fac) => {
    setSelectedFaculty(fac)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Faculty Management</h1>
          <p className="text-gray-500 mt-1">Manage faculty subjects, class assignments, and workload.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="IT">IT</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader /></div>
          ) : faculty.length === 0 ? (
            <EmptyState title="No faculty found" description="Try adjusting your filters" />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-medium">Faculty Name</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium">Subjects</th>
                  <th className="p-4 font-medium">Sections</th>
                  <th className="p-4 font-medium">Proctoring</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faculty.map((fac) => (
                  <tr key={fac._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {fac.profilePicture ? (
                          <img src={fac.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {fac.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">{fac.name}</p>
                          <p className="text-xs text-gray-500">{fac.employeeId} • {fac.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{fac.department}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">{fac.primarySubjectCount + fac.secondarySubjectCount}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{fac.assignedSectionsCount}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{fac.proctorCount}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        fac.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {fac.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => openDetails(fac)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {isDetailsModalOpen && selectedFaculty && (
        <FacultyDetailsModal
          facultyId={selectedFaculty._id}
          onClose={() => {
            setIsDetailsModalOpen(false)
            fetchFaculty(pagination.page) // refresh row counts
          }}
        />
      )}
    </div>
  )
}

export default FacultyManagement
