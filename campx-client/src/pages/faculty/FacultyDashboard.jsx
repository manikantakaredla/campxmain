import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { announcementService } from '../../services/announcementService'
import { resourceService } from '../../services/resourceService'
import { facultyService } from '../../services/facultyService'
import { Link } from 'react-router-dom'
import {
  Megaphone,
  FileText,
  Users,
  Calendar,
  Plus,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Eye,
  TrendingUp,
  BookOpen,
  Briefcase
} from 'lucide-react'
import toast from 'react-hot-toast'

const FacultyDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    announcements: 0,
    resources: 0,
    classStudents: 0,
    proctorStudents: 0,
    activities: 0
  })
  const [recentAnnouncements, setRecentAnnouncements] = useState([])
  const [recentResources, setRecentResources] = useState([])
  const [classAssignmentsSummary, setClassAssignmentsSummary] = useState(null)
  const [workloadSummary, setWorkloadSummary] = useState(null)
  const [subjectResources, setSubjectResources] = useState([])

  useEffect(() => {
    fetchAnnouncements()
    fetchResources()
    fetchClassStudents()
    fetchProctorStudents()
    fetchClassAssignmentsSummary()
    fetchWorkloadSummary()
    fetchSubjectResourceCounts()
  }, [])

  const fetchSubjectResourceCounts = async () => {
    try {
      const subRes = await resourceService.getFacultySubjects()
      const resRes = await resourceService.getAll({ limit: 1000 })
      if (subRes.success && resRes.success) {
        const allAssigned = [
          ...(subRes.primary || []).map(s => ({ ...s, isPrimary: true })),
          ...(subRes.secondary || []).map(s => ({ ...s, isPrimary: false }))
        ]
        const counts = allAssigned.map(sub => {
          const count = (resRes.resources || []).filter(r => r.subjectId === sub._id).length
          return {
            ...sub,
            resourceCount: count
          }
        })
        setSubjectResources(counts)
      }
    } catch (error) {
      console.error('Error fetching subject resource counts:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getMyAnnouncements();
      setRecentAnnouncements(res.announcements?.slice(0, 5) || []);
      setStats(prev => ({ ...prev, announcements: res.announcements?.length || 0 }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }

  const fetchResources = async () => {
    try {
      const res = await resourceService.getAll({ uploadedBy: user?._id, limit: 3 })
      setRecentResources(res.resources || [])
      setStats(prev => ({ ...prev, resources: res.pagination?.total || 0 }))
    } catch (error) {
      console.error('Error fetching resources:', error)
    }
  }

  const handleDeleteResource = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.delete(id)
        toast.success('Resource deleted successfully')
        fetchResources()
      } catch (error) {
        toast.error('Failed to delete resource')
      }
    }
  }

  const fetchClassStudents = async () => {
    try {
      const res = await facultyService.getClassStudents();
      // Only set if not already set by summary
      if (stats.classStudents === 0) {
        setStats(prev => ({ ...prev, classStudents: res.students?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching class students:', error);
    }
  }

  const fetchClassAssignmentsSummary = async () => {
    try {
      const res = await facultyService.getClassAssignmentsSummary();
      setClassAssignmentsSummary(res.summary);
      if (res.summary?.totalStudents !== undefined) {
        setStats(prev => ({ ...prev, classStudents: res.summary.totalStudents }));
      }
    } catch (error) {
      console.error('Error fetching class assignments summary:', error);
    }
  }

  const fetchWorkloadSummary = async () => {
    try {
      const res = await facultyService.getWorkloadSummary();
      if (res.success) {
        setWorkloadSummary(res.workload);
      }
    } catch (error) {
      console.error('Error fetching workload summary:', error);
    }
  }

  const fetchProctorStudents = async () => {
    try {
      const res = await facultyService.getProctorStudents();
      setStats(prev => ({ ...prev, proctorStudents: res.students?.length || 0 }));
    } catch (error) {
      console.error('Error fetching proctor students:', error);
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await announcementService.delete(id)
        toast.success('Deleted')
        fetchAnnouncements()
      } catch (error) {
        toast.error('Failed to delete')
      }
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-600'
      case 'high': return 'bg-orange-50 text-orange-600'
      case 'medium': return 'bg-yellow-50 text-yellow-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const statCards = [
    {
      label: 'Announcements',
      value: stats.announcements,
      icon: Megaphone,
      link: '/faculty/announcements',
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      label: 'Resources',
      value: stats.resources,
      icon: FileText,
      link: '/faculty/resources',
      color: 'emerald',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    {
      label: 'Class Students',
      value: stats.classStudents,
      icon: Users,
      link: '/faculty/students',
      color: 'purple',
      bg: 'bg-purple-50',
      text: 'text-purple-600'
    },
    {
      label: 'Proctor Students',
      value: stats.proctorStudents,
      icon: UserPlus,
      link: '/faculty/students?type=proctor',
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600'
    }
  ]

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Welcome back, {user?.name?.split(' ')[0]}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-medium">
              Manage your class activities and resources
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/faculty/announcements/create"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_2px_10px_-3px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_20px_-3px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 hover:bg-blue-700 transition-all duration-300"
            >
              <Plus size={16} />
              New Announcement
            </Link>
            <Link
              to="/faculty/resources/upload"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-gray-50 transition-all duration-300"
            >
              <FileText size={16} />
              Upload Resource
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-20 h-20 ${card.bg} rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-500`}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                    <Icon size={20} className={card.text} />
                  </div>
                  <TrendingUp size={16} className="text-green-500 hidden sm:block" />
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">{card.label}</p>
                </div>
                <Link
                  to={card.link}
                  className={`inline-flex items-center gap-1 text-xs font-bold mt-4 ${card.text} hover:opacity-80 transition-opacity`}
                >
                  View details
                  <ChevronRight size={12} />
                </Link>
              </div>
            )
          })}
        </div>



        {/* My Subjects Resources */}
        {subjectResources.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600 animate-pulse" />
                </div>
                My Subjects Resources
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectResources.map(sub => (
                <div key={sub._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${sub.isPrimary ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {sub.isPrimary ? 'Primary' : 'Secondary'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-bold uppercase bg-gray-100 px-2 py-1 rounded-md">{sub.code}</span>
                    </div>
                    <h4 className="text-gray-900 font-bold text-base mb-1 group-hover:text-blue-600 transition-colors">{sub.name}</h4>
                    <p className="text-xs text-gray-500 mb-5 font-medium">{sub.department} • Semester {sub.semester}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xs font-bold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {sub.resourceCount} Resources
                    </span>
                    <div className="flex gap-2">
                      <Link
                        to={`/faculty/resources?subjectId=${sub._id}`}
                        className="px-3 py-1.5 border border-gray-200 text-xs font-bold rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        title="View Resources"
                      >
                        View
                      </Link>
                      <Link
                        to={`/faculty/resources/upload?subjectId=${sub._id}`}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                        title="Quick Upload"
                      >
                        Upload
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Class Assignments Summary Widget */}
        {classAssignmentsSummary && classAssignmentsSummary.totalSections > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-purple-600" />
              My Class Sections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classAssignmentsSummary.sections.map((sec, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                      Section {sec.section}
                    </span>
                    <span className="text-[11px] text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-md">{sec.batch}</span>
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg mb-1">{sec.department} - Year {sec.year}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-5 font-medium">
                    <div className="p-1.5 bg-gray-50 rounded-lg">
                      <Users size={14} className="text-gray-500" />
                    </div>
                    <span>{sec.studentCount} Students Enrolled</span>
                  </div>
                  <Link
                    to={`/faculty/students?branch=${sec.department}&year=${sec.year}&section=${sec.section}`}
                    className="w-full inline-flex justify-center items-center gap-2 py-2.5 bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200 rounded-xl text-sm font-bold text-gray-700 hover:text-purple-700 transition-colors"
                  >
                    <Eye size={16} />
                    View Students
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Megaphone size={18} className="text-blue-600" />
                </div>
                <h2 className="font-bold text-gray-900">Recent Announcements</h2>
              </div>
              <Link to="/faculty/announcements" className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                View all
              </Link>
            </div>

            <div className="flex-1 divide-y divide-gray-50">
              {recentAnnouncements.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Megaphone size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No announcements yet</p>
                  <Link to="/faculty/announcements/create" className="text-sm font-bold text-blue-600 mt-3 inline-block bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                    Create your first
                  </Link>
                </div>
              ) : (
                recentAnnouncements.map((item) => (
                  <div key={item._id} className="px-6 py-4 hover:bg-gray-50/80 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                            {item.priority || 'normal'}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-100 rounded-lg p-1">
                        <Link
                          to={`/faculty/announcements/edit/${item._id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteAnnouncement(item._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Resources */}
          <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <FileText size={18} className="text-emerald-600" />
                </div>
                <h2 className="font-bold text-gray-900">Recent Resources</h2>
              </div>
              <Link to="/faculty/resources" className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                View all
              </Link>
            </div>

            <div className="flex-1 divide-y divide-gray-50">
              {recentResources.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <FileText size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No resources yet</p>
                  <Link to="/faculty/resources/upload" className="text-sm font-bold text-emerald-600 mt-3 inline-block bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                    Upload your first
                  </Link>
                </div>
              ) : (
                recentResources.map((item) => (
                  <div key={item._id} className="px-6 py-4 hover:bg-gray-50/80 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-700">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            {item.downloads || 0} downloads
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-gray-100 rounded-lg p-1">
                        <Link
                          to={`/faculty/resources/${item._id}`}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        {(item.uploadedBy === user?._id || item.uploadedBy?._id === user?._id) && (
                          <>
                            <Link
                              to={`/faculty/resources/edit/${item._id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit size={16} />
                            </Link>
                            <button onClick={() => handleDeleteResource(item._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/faculty/announcements/create"
            className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Megaphone size={20} className="text-blue-600 group-hover:text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Create Announcement</p>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Share updates with students</p>
            </div>
            <div className="ml-auto w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600" />
            </div>
          </Link>

          <Link
            to="/faculty/resources/upload"
            className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileText size={20} className="text-emerald-600 group-hover:text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Upload Resource</p>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Share study materials</p>
            </div>
            <div className="ml-auto w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
              <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-600" />
            </div>
          </Link>

          <Link
            to="/faculty/students"
            className="flex items-center gap-4 p-5 bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-purple-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users size={20} className="text-purple-600 group-hover:text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">View Students</p>
              <p className="text-[11px] font-medium text-gray-500 mt-0.5 uppercase tracking-wider">Class & proctor students</p>
            </div>
            <div className="ml-auto w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
              <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-600" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FacultyDashboard