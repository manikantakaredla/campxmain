import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { facultyService } from '../../services/facultyService'
import { Loader } from '../../components/common/Loader'
import { User, Mail, Phone, GraduationCap, BookOpen, Calendar, ArrowLeft, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const StudentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudent()
  }, [id])

  const fetchStudent = async () => {
    try {
      const response = await facultyService.getStudentDetail(id)
      setStudent(response.student)
    } catch (error) {
      console.error('Error fetching student:', error)
      toast.error('Failed to load student details')
      navigate('/faculty/students')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />
  if (!student) return null

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">{student.name?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
            <p className="text-gray-500">{student.rollNumber}</p>
            <p className="text-sm text-gray-400 capitalize">{student.course}</p>
          </div>
          {/* <Link to={`/faculty/messages?userId=${student._id}`} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
            <MessageSquare size={18} />
            <span className="hidden sm:inline">Message</span>
          </Link> */}
        </div>
        
        <div className="p-6 space-y-4">
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
              <p className="text-gray-800">{student.section}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Batch</p>
              <p className="text-gray-800">{student.batch}</p>
            </div>
          </div>
        </div>

        {/* Engagement Metrics (Mocked for now) */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Student Engagement Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Engagements</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Announcements Sent</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">View Count</p>
              <p className="text-2xl font-bold text-purple-600">0</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <p className="text-sm font-medium text-gray-500 mb-1">Reach</p>
              <p className="text-2xl font-bold text-orange-600">0%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetails