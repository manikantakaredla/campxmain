import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SearchBar } from '../../components/Common/SearchBar'
import { Loader } from '../../components/Common/Loader'
import { EmptyState } from '../../components/Common/EmptyState'
import { Briefcase, Mail, Phone, Building, ChevronRight, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/hod/faculty')
      setFaculty(response.data.faculty || [])
    } catch (error) {
      console.error('Error fetching faculty:', error)
      toast.error('Failed to load faculty')
    } finally {
      setLoading(false)
    }
  }

  const filteredFaculty = faculty.filter(f => 
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'hod': return 'bg-purple-100 text-purple-700'
      case 'deputyhod': return 'bg-indigo-100 text-indigo-700'
      case 'dean': return 'bg-blue-100 text-blue-700'
      case 'principal': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'hod': return 'HOD'
      case 'deputyhod': return 'Deputy HOD'
      case 'dean': return 'Dean'
      case 'principal': return 'Principal'
      default: return 'Faculty'
    }
  }

  if (loading) return <Loader />

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Faculty Management</h1>
        <p className="text-gray-500 mt-1">View and manage department faculty members</p>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <SearchBar onSearch={setSearchTerm} placeholder="Search by name, email, or ID..." />
      </div>

      {/* Faculty List */}
      {filteredFaculty.length === 0 ? (
        <EmptyState 
          icon={<Briefcase className="w-12 h-12" />}
          title="No faculty found"
          description="No faculty members match your search"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredFaculty.map((faculty) => (
            <Link
              key={faculty._id}
              to={`/management/faculty/${faculty._id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {faculty.name?.charAt(0) || 'F'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {faculty.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(faculty.role)}`}>
                      {getRoleLabel(faculty.role)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{faculty.designation}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="text-xs">{faculty.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span className="text-xs">{faculty.department}</span>
                    </div>
                    {faculty.employeeId && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        <span className="text-xs">ID: {faculty.employeeId}</span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default FacultyManagement