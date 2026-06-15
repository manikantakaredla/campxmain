import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SearchBar } from '../../components/common/SearchBar'
import { Pagination } from '../../components/common/Pagination'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import { GraduationCap, Mail, Phone, ChevronRight, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const DepartmentStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [pagination.page, searchTerm, sectionFilter, yearFilter])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        section: sectionFilter,
        year: yearFilter
      }
      const response = await api.get('/hod/students', { params })
      setStudents(response.data.students || [])
      setPagination({
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 10,
        total: response.data.pagination?.total || 0,
        pages: response.data.pagination?.pages || 0
      })
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Department Students</h1>
        <p className="text-gray-500 mt-1">View all students in your department</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar onSearch={setSearchTerm} placeholder="Search by name or roll number..." />
          </div>
          <div className="flex gap-2">
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <EmptyState 
          icon={<GraduationCap className="w-12 h-12" />}
          title="No students found"
          description="No students match your search criteria"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Student</th>
                <th className="text-left p-4 font-semibold text-gray-600">Roll Number</th>
                <th className="text-left p-4 font-semibold text-gray-600">Section</th>
                <th className="text-left p-4 font-semibold text-gray-600">Year</th>
                <th className="text-left p-4 font-semibold text-gray-600">Faculty</th>
                <th className="text-left p-4 font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-600">{student.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{student.rollNumber}</td>
                  <td className="p-4 text-gray-600">{student.section || '-'}</td>
                  <td className="p-4 text-gray-600">{student.currentYear}</td>
                  <td className="p-4">
                    {student.classFacultyName && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Class: {student.classFacultyName}
                      </span>
                    )}
                    {student.proctorFacultyName && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 ml-1">
                        Proctor: {student.proctorFacultyName}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <Link to={`/management/students/${student._id}`}>
                      <ChevronRight className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default DepartmentStudents