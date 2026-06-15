import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { SearchBar } from '../../components/common/SearchBar'
import { Loader } from '../../components/common/Loader'
import { Users, UserCheck, UserPlus, Check, X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const AssignStudents = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [facultyList, setFacultyList] = useState([])
  const [students, setStudents] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState(searchParams.get('faculty') || '')
  const [assignmentType, setAssignmentType] = useState(searchParams.get('type') || 'class')
  const [assignMode, setAssignMode] = useState('individual') // 'individual' or 'section'
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('')
  const [selectedStudents, setSelectedStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [facultyRes, studentsRes] = await Promise.all([
        api.get('/hod/faculty'),
        api.get('/hod/students?limit=100')
      ])
      setFacultyList(facultyRes.data.faculty || [])
      setStudents(studentsRes.data.students || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedFaculty) {
      toast.error('Please select a faculty member')
      return
    }
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student')
      return
    }

    setSubmitting(true)
    try {
      const endpoint = assignmentType === 'class' 
        ? '/hod/assign/class' 
        : '/hod/assign/proctor'
      
      await api.post(endpoint, {
        facultyId: selectedFaculty,
        studentIds: selectedStudents
      })
      
      toast.success(`Successfully assigned ${selectedStudents.length} students`)
      navigate('/management/faculty')
    } catch (error) {
      console.error('Error assigning students:', error)
      toast.error(error.response?.data?.message || 'Failed to assign students')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedFacultyData = facultyList.find(f => f._id === selectedFaculty)

  if (loading) return <Loader />

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Assign Students</h1>
        <p className="text-gray-500 mt-1">Assign class or proctor students to faculty members</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Faculty Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Faculty
              </h2>
            </div>
            
            <div className="p-3 space-y-1 max-h-[400px] overflow-y-auto">
              {facultyList.map((faculty) => (
                <button
                  key={faculty._id}
                  onClick={() => setSelectedFaculty(faculty._id)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between ${
                    selectedFaculty === faculty._id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{faculty.name}</p>
                    <p className="text-xs text-gray-500">{faculty.designation}</p>
                  </div>
                  {selectedFaculty === faculty._id && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Student Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAssignmentType('class')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      assignmentType === 'class'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Class Students
                  </button>
                  <button
                    onClick={() => setAssignmentType('proctor')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      assignmentType === 'proctor'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    Proctor Students
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  Selected: {selectedStudents.length} students
                </div>
              </div>
            </div>

            {/* Selected Faculty Info */}
            {selectedFacultyData && (
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{selectedFacultyData.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{selectedFacultyData.name}</p>
                    <p className="text-sm text-gray-600">{selectedFacultyData.designation} - {selectedFacultyData.department}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Student Search */}
            <div className="p-4 border-b border-gray-100">
              <SearchBar onSearch={setSearchTerm} placeholder="Search students by name or roll number..." />
              
              <div className="mt-4 flex gap-2">
                <button onClick={() => {setAssignMode('individual'); setSelectedStudents([]);}} className={`px-3 py-1 text-sm rounded-lg ${assignMode === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>Individual Selection</button>
                <button onClick={() => {setAssignMode('section'); setSelectedStudents([]);}} className={`px-3 py-1 text-sm rounded-lg ${assignMode === 'section' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>By Section Selection</button>
              </div>
              
              {assignMode === 'section' && (
                <div className="mt-4">
                  <select className="w-full p-2 border rounded-lg" value={selectedSectionFilter} onChange={(e) => {
                    setSelectedSectionFilter(e.target.value);
                    if (e.target.value) {
                      const sectionStudents = students.filter(s => s.section === e.target.value).map(s => s._id);
                      setSelectedStudents(sectionStudents);
                    } else {
                      setSelectedStudents([]);
                    }
                  }}>
                    <option value="">Select Section...</option>
                    {Array.from(new Set(students.map(s => s.section).filter(Boolean))).map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Student List */}
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No students found</p>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <label
                      key={student._id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        selectedStudents.includes(student._id)
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => toggleStudent(student._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.rollNumber} • {student.branch} • Year {student.currentYear}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => navigate('/management/assign-students')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedFaculty || selectedStudents.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Assign {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignStudents