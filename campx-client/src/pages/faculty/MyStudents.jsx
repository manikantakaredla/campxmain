import React, { useState, useEffect } from 'react'
import { facultyService } from '../../services/facultyService'
import { SearchBar } from '../../components/Common/SearchBar'
import { Pagination } from '../../components/Common/Pagination'
import { Loader } from '../../components/Common/Loader'
import { EmptyState } from '../../components/Common/EmptyState'
import { Users, Search, Mail, Phone, GraduationCap, BookOpen, UserCheck, UserPlus, Megaphone, Folder, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyStudents = () => {
  const [activeTab, setActiveTab] = useState('all') // all, class, proctor
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [selectedSection, setSelectedSection] = useState(null)

  useEffect(() => {
    fetchStudents()
    if(activeTab !== 'all') setSelectedSection(null)
  }, [activeTab, pagination.page, searchTerm])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      }
      
      const response = activeTab === 'all'
        ? await facultyService.getAllAssignedStudents(params)
        : activeTab === 'class' 
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

    // Group students by section
  const groupedStudents = students.reduce((acc, student) => {
    const section = student.section || 'Unassigned';
    if (!acc[section]) acc[section] = [];
    acc[section].push(student);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Students</h1>
        <p className="text-gray-500 mt-1">View and manage your class and proctor students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-2 font-medium transition-all ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          All Students
        </button>
        <button
          onClick={() => setActiveTab('class')}
          className={`px-6 py-2 font-medium transition-all ${
            activeTab === 'class'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCheck className="w-4 h-4 inline mr-2" />
          My Students
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

      {/* Search Bar & Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="max-w-md w-full">
          <SearchBar onSearch={handleSearch} placeholder="Search by name, roll number, or email..." />
        </div>
        <div className="flex gap-3">
          {(activeTab === 'class' || activeTab === 'proctor') && (
            <>
              <Link
                to={`/faculty/announcements/create?target=${activeTab}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Megaphone size={18} /> Add {activeTab === 'class' ? 'Class' : 'Proctor'} Announcement
              </Link>
              <Link
                to={`/faculty/resources/upload?target=${activeTab}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Folder size={18} /> Add {activeTab === 'class' ? 'Class' : 'Proctor'} Resource
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <EmptyState 
          icon={<Users className="w-12 h-12" />}
          title="No students found"
          description={activeTab === 'all'
            ? "You haven't been assigned any students yet"
            : activeTab === 'class' 
            ? "You haven't been assigned any class students yet" 
            : "You haven't been assigned any proctor students yet"}
        />
      ) : (
        <div>
          {/* If a section is selected, show its students. Otherwise, show section cards */}
          {activeTab === 'all' && !selectedSection ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(groupedStudents).sort(([a], [b]) => a.localeCompare(b)).map(([section, sectionStudents]) => (
                <div 
                  key={section} 
                  onClick={() => setSelectedSection(section)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Section {section}</h3>
                  <p className="text-sm text-gray-500">{sectionStudents.length} Students</p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {activeTab === 'all' && selectedSection && (
                <div className="mb-6 flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedSection(null)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Sections
                  </button>
                  <h2 className="text-lg font-bold text-gray-800">Section {selectedSection} Students</h2>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(selectedSection ? groupedStudents[selectedSection] : students).map((student) => (
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
            </div>
          )}
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