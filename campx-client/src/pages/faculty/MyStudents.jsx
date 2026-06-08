import React, { useState, useEffect } from 'react'
import { facultyService } from '../../services/facultyService'
import { SearchBar } from '../../components/Common/SearchBar'
import { Pagination } from '../../components/Common/Pagination'
import { Loader } from '../../components/Common/Loader'
import { EmptyState } from '../../components/Common/EmptyState'
import { Users, Search, Mail, Phone, GraduationCap, BookOpen, UserCheck, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyStudents = () => {
  const [activeTab, setActiveTab] = useState('class') // class, proctor
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })

  useEffect(() => {
    fetchStudents()
  }, [activeTab, pagination.page, searchTerm])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      }
      
      const response = activeTab === 'class' 
        ? await facultyService.getClassStudents(params)
        : await facultyService.getProctorStudents(params)
      
      setStudents(response.students || [])
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }))
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Students</h1>
        <p className="text-gray-500 mt-1">View and manage your class and proctor students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('class')}
          className={`px-6 py-2 font-medium transition-all ${
            activeTab === 'class'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4 inline mr-2" />
          Class Students
        </button>
        <button
          onClick={() => setActiveTab('proctor')}
          className={`px-6 py-2 font-medium transition-all ${
            activeTab === 'proctor'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Proctor Students
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <SearchBar onSearch={handleSearch} placeholder="Search by name, roll number, or email..." />
      </div>

      {/* Students List */}
      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <EmptyState 
          icon={<Users className="w-12 h-12" />}
          title="No students found"
          description={activeTab === 'class' 
            ? "You haven't been assigned any class students yet" 
            : "You haven't been assigned any proctor students yet"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => (
            <Link
              key={student._id}
              to={`/faculty/students/${student._id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {student.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-500">{student.rollNumber}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {student.branch}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Year {student.currentYear}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Sem {student.currentSemester}
                    </span>
                  </div>
                  {student.email && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {student.email}
                    </p>
                  )}
                  {student.phoneNumber && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {student.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6">
          <Pagination 
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </div>
      )}
    </div>
  )
}

export default MyStudents