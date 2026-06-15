import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Mail, Phone, Briefcase, Building, 
  Users, GraduationCap, Calendar, UserCheck, UserPlus,
  ChevronRight
} from 'lucide-react'
import { Loader } from '../../components/common/Loader'
import toast from 'react-hot-toast'
import api from '../../services/api'

const FacultyDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [faculty, setFaculty] = useState(null)
  const [classStudents, setClassStudents] = useState([])
  const [proctorStudents, setProctorStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFacultyDetails()
  }, [id])

  const fetchFacultyDetails = async () => {
    try {
      // Get faculty details from faculty list
      const facultyRes = await api.get('/hod/faculty')
      const foundFaculty = facultyRes.data.faculty?.find(f => f._id === id)
      setFaculty(foundFaculty)
      
      // Get class assignments
      const classRes = await api.get(`/hod/assignments/class?facultyId=${id}`)
      // Get proctor assignments
      const proctorRes = await api.get(`/hod/assignments/proctor?facultyId=${id}`)
      
      // Safely extract students with null checks
      const classAssignments = classRes.data.assignments?.[id] || {}
      const proctorAssignments = proctorRes.data.assignments?.[id] || {}
      
      setClassStudents(classAssignments.students || [])
      setProctorStudents(proctorAssignments.students || [])
    } catch (error) {
      console.error('Error fetching faculty details:', error)
      toast.error('Failed to load faculty details')
      navigate('/management/faculty')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'hod': return 'bg-purple-100 text-purple-700'
      case 'deputyhod': return 'bg-indigo-100 text-indigo-700'
      case 'dean': return 'bg-blue-100 text-blue-700'
      case 'principal': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleTitle = (role) => {
    switch (role) {
      case 'hod': return 'Head of Department'
      case 'deputyhod': return 'Deputy Head of Department'
      case 'dean': return 'Dean'
      case 'principal': return 'Principal'
      default: return 'Faculty Member'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Faculty not found</p>
        <button onClick={() => navigate('/management/faculty')} className="mt-4 text-blue-600 hover:underline">
          Back to Faculty
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/management/faculty')} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Faculty
      </button>

      {/* Faculty Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-700">
                {faculty.name?.charAt(0) || 'F'}
              </span>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">{faculty.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(faculty.role)}`}>
                  {getRoleTitle(faculty.role)}
                </span>
              </div>
              <p className="text-gray-500">{faculty.designation || 'Faculty'}</p>
              <p className="text-sm text-gray-400 mt-1">{faculty.department}</p>
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="border-t border-gray-100 p-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-600">{faculty.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={16} className="text-gray-400" />
              <span className="text-gray-600">{faculty.phoneNumber || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase size={16} className="text-gray-400" />
              <span className="text-gray-600">ID: {faculty.employeeId || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-600">Joined: {new Date(faculty.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Students */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Students */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <UserCheck size={16} className="text-blue-600" />
                Class Students ({classStudents.length})
              </h2>
              <Link 
                to={`/management/assign-students?faculty=${faculty._id}&type=class`} 
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Assign +
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {classStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No class students assigned
              </div>
            ) : (
              classStudents.map((student) => (
                <Link
                  key={student?._id || Math.random()}
                  to={`/management/students/${student?._id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {student?.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{student?.rollNumber || 'No roll number'}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Proctor Students */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <UserPlus size={16} className="text-green-600" />
                Proctor Students ({proctorStudents.length})
              </h2>
              <Link 
                to={`/management/assign-students?faculty=${faculty._id}&type=proctor`} 
                className="text-xs text-green-600 hover:text-green-700"
              >
                Assign +
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {proctorStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No proctor students assigned
              </div>
            ) : (
              proctorStudents.map((student) => (
                <Link
                  key={student?._id || Math.random()}
                  to={`/management/students/${student?._id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {student?.name?.charAt(0) || 'S'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{student?.rollNumber || 'No roll number'}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyDetails