import React, { useState, useEffect } from 'react'
import { facultyService } from '../../services/facultyService'
import { SearchBar } from '../../components/common/SearchBar'
import { Pagination } from '../../components/common/Pagination'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import { Users, Search, Mail, Phone, GraduationCap, BookOpen, UserCheck, UserPlus, Megaphone, Folder, ArrowLeft, MessageSquare, CheckCircle, XCircle, Clock, MapPin, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const MyStudents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all') // all, class, proctor
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [selectedSection, setSelectedSection] = useState(null)

  useEffect(() => {
    if(activeTab !== 'permissions') {
      fetchStudents()
    }
    if(activeTab !== 'all') setSelectedSection(null)
  }, [activeTab, pagination.page, searchTerm])

  // Static demo data for permissions
  const permissionsData = [
    { id: 1, studentName: 'Rahul Kumar', rollNo: '22A91A0501', permissionType: 'Workshop', reason: 'Attending AI Workshop at IIT Madras', status: 'Pending', date: '2026-07-26' },
    { id: 2, studentName: 'Priya Sharma', rollNo: '22A91A0502', permissionType: 'Hackathon', reason: 'Participating in Smart India Hackathon', status: 'Approved', date: '2026-07-27' },
    { id: 3, studentName: 'Amit Singh', rollNo: '22A91A0503', permissionType: 'Sports', reason: 'University Cricket Tournament', status: 'Pending', date: '2026-07-28' },
  ];

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
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-6 py-2 font-medium transition-all ${
            activeTab === 'permissions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4 inline mr-2" />
          Permission Students
        </button>
      </div>

      {/* Search Bar & Action Buttons */}
      {activeTab !== 'permissions' && (
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
      )}

      {/* Students List or Permissions */}
      {activeTab === 'permissions' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Current Class Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Ongoing Class</h2>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 text-sm md:text-base">
                <div className="flex items-center gap-2 font-medium text-blue-700">
                  <BookOpen size={18} />
                  B.Tech CSE - 3rd Year (Section A)
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  Room 304, Main Block
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  10:30 AM - 11:20 AM
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm text-blue-600 flex-shrink-0">
              <Users size={28} />
            </div>
          </div>

          {/* Permissions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Student Permissions Request</h3>
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                3 Pending
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Permission Type</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {permissionsData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-800">{item.studentName}</td>
                      <td className="px-6 py-4">{item.rollNo}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          {item.permissionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                      <td className="px-6 py-4">{item.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {item.status === 'Pending' && (
                          <>
                            <button className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg transition-colors" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {item.status === 'Approved' && (
                           <span className="text-sm text-gray-400 font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : loading ? (
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
                      {/* <button 
                        onClick={(e) => { e.preventDefault(); navigate(`/faculty/messages?userId=${student._id}`); }} 
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors ml-auto" 
                        title="Message Student"
                      >
                        <MessageSquare size={18} />
                      </button> */}
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