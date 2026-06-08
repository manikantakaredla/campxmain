import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, Mail, Phone, GraduationCap, BookOpen, 
  Calendar, UserCheck, UserPlus, Building
} from 'lucide-react'
import { Loader } from '../../components/Common/Loader'
import toast from 'react-hot-toast'
import api from '../../services/api'

const StudentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [classFaculty, setClassFaculty] = useState(null)
  const [proctorFaculty, setProctorFaculty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentDetails()
  }, [id])

  const fetchStudentDetails = async () => {
    try {
      // Get student from department students list
      const studentsRes = await api.get('/hod/students?limit=200')
      const foundStudent = studentsRes.data.students?.find(s => s._id === id)
      setStudent(foundStudent)
      
      // Get faculty assignments
      const classRes = await api.get(`/hod/assignments/class?studentId=${id}`)
      const proctorRes = await api.get(`/hod/assignments/proctor?studentId=${id}`)
      
      setClassFaculty(classRes.data.classFaculty || null)
      setProctorFaculty(proctorRes.data.proctorFaculty || null)
    } catch (error) {
      console.error('Error fetching student details:', error)
      toast.error('Failed to load student details')
      navigate('/management/students')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />
  if (!student) return null

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{student.name?.charAt(0)}</span>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <p className="text-green-100">{student.rollNumber}</p>
              <p className="text-sm text-green-100 mt-1">{student.course} - {student.branch}</p>
            </div>
          </div>
        </div>
        
        {/* Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-800">{student.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Branch</p>
                <p className="text-gray-800">{student.branch}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Section</p>
                <p className="text-gray-800">{student.section || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Batch</p>
                <p className="text-gray-800">{student.batch}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Current Year / Semester</p>
                <p className="text-gray-800">Year {student.currentYear} / Sem {student.currentSemester}</p>
              </div>
            </div>
          </div>

          {/* Faculty Assignments */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Faculty Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-800">Class Faculty</h3>
                </div>
                {classFaculty ? (
                  <div>
                    <p className="text-gray-800">{classFaculty.name}</p>
                    <p className="text-sm text-gray-500">{classFaculty.department}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Not assigned</p>
                )}
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-800">Proctor Faculty</h3>
                </div>
                {proctorFaculty ? (
                  <div>
                    <p className="text-gray-800">{proctorFaculty.name}</p>
                    <p className="text-sm text-gray-500">{proctorFaculty.department}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Not assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetails