import React, { useState, useEffect } from 'react'
import { resourceService } from '../../services/resourceService'
import { SearchBar } from '../../components/common/SearchBar'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import { FileText, Download, Eye, Clock, User, Filter, BookOpen, Layers, Calendar, ArrowLeft, File, FileSpreadsheet, FileArchive, CheckCircle, ExternalLink, MessageCircle, Copy } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const StudentResources = () => {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', resourceType: '', semester: '', sortBy: 'latest' })
  const [activeView, setActiveView] = useState('categories')

  const categoryCards = [
    { id: 'all', title: 'All Resources', icon: <Layers className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-blue-50', borderColor: 'border-blue-100', hoverBorder: 'hover:border-blue-300', value: '' },
    { id: 'notes', title: 'Notes', icon: <FileText className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-indigo-50', borderColor: 'border-indigo-100', hoverBorder: 'hover:border-indigo-300', value: 'Notes' },
    { id: 'ppt', title: 'Presentations', icon: <File className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-orange-50', borderColor: 'border-orange-100', hoverBorder: 'hover:border-orange-300', value: 'PPT' },
    { id: 'assignment', title: 'Assignments', icon: <FileSpreadsheet className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', hoverBorder: 'hover:border-emerald-300', value: 'Assignment' },
    { id: 'qb', title: 'Question Banks', icon: <FileText className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-red-50', borderColor: 'border-red-100', hoverBorder: 'hover:border-red-300', value: 'Question Bank' },
    { id: 'papers', title: 'Previous Papers', icon: <FileArchive className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-purple-50', borderColor: 'border-purple-100', hoverBorder: 'hover:border-purple-300', value: 'Previous Paper' },
    { id: 'lab', title: 'Lab Manuals', icon: <FileArchive className="w-8 h-8 text-teal-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-teal-50', borderColor: 'border-teal-100', hoverBorder: 'hover:border-teal-300', value: 'Lab Manual' },
    { id: 'syllabus', title: 'Syllabus', icon: <BookOpen className="w-8 h-8 text-cyan-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-cyan-50', borderColor: 'border-cyan-100', hoverBorder: 'hover:border-cyan-300', value: 'Syllabus' },
    { id: 'video', title: 'Video Links', icon: <File className="w-8 h-8 text-pink-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-pink-50', borderColor: 'border-pink-100', hoverBorder: 'hover:border-pink-300', value: 'Video Link' },
    { id: 'gclassroom', title: 'Google Classroom', icon: <img src="https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png" alt="GC" className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform object-contain" />, bgColor: 'bg-green-50', borderColor: 'border-green-200', hoverBorder: 'hover:border-green-400', value: 'GoogleClassroom' },
    { id: 'other', title: 'Other Materials', icon: <File className="w-8 h-8 text-gray-600 mb-3 group-hover:scale-110 transition-transform" />, bgColor: 'bg-gray-50', borderColor: 'border-gray-200', hoverBorder: 'hover:border-gray-400', value: 'Other' }
  ]

  const resourceTypes = [
    'All', 'Notes', 'PPT', 'Assignment', 'Question Bank', 'Previous Paper', 'Lab Manual', 'Syllabus', 'Video Link', 'Other'
  ]

  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8']

  useEffect(() => {
    if (activeView === 'resources') {
      fetchResources()
    }
  }, [filters, activeView])

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = {
        limit: 100, // Fetch all current semester resources to group them locally
        search: filters.search,
        resourceType: filters.resourceType === 'All' ? '' : filters.resourceType,
        semester: filters.semester === 'All' ? '' : filters.semester,
        sortBy: filters.sortBy
      }
      const response = await resourceService.getAll(params)
      setResources(response.resources || [])
    } catch (error) {
      console.error('Error fetching student resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  const handleDownload = async (resourceId) => {
    try {
      const response = await resourceService.download(resourceId)
      if (response.success && response.fileUrl) {
        window.open(response.fileUrl, '_blank')
        toast.success('Download started')
        // Refresh local download count
        setResources(prev => prev.map(res => 
          res._id === resourceId ? { ...res, downloads: (res.downloads || 0) + 1 } : res
        ))
      }
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handleMarkCompleted = async (resourceId) => {
    try {
      const response = await resourceService.markCompleted(resourceId);
      if (response.success) {
        toast.success('Assignment marked as completed');
        setResources(prev => prev.map(res => 
          res._id === resourceId 
            ? { ...res, completedBy: [...(res.completedBy || []), user._id] }
            : res
        ));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as completed');
    }
  };

  const getFileIcon = (fileType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return '📄 PDF'
    if (ext === 'ppt' || ext === 'pptx') return '📊 PPT'
    if (ext === 'doc' || ext === 'docx') return '📝 DOC'
    if (ext === 'xls' || ext === 'xlsx') return '📈 XLS'
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return '🖼️ IMG'
    return '📁 FILE'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Group resources by Semester, and then by Subject Name
  const groupedResources = resources.reduce((acc, resource) => {
    const semKey = resource.semester ? `Semester ${resource.semester}` : 'General Resources';
    const subKey = resource.subjectName || 'Other Materials';
    
    if (!acc[semKey]) acc[semKey] = {};
    if (!acc[semKey][subKey]) acc[semKey][subKey] = [];
    
    acc[semKey][subKey].push(resource);
    return acc;
  }, {});

  const semestersList = Object.keys(groupedResources).sort((a, b) => {
    if (a.includes('General')) return 1;
    if (b.includes('General')) return -1;
    return a.localeCompare(b);
  });

  const handleCategoryClick = (categoryValue) => {
    if (categoryValue === 'GoogleClassroom') {
      setActiveView('classroom')
      return
    }
    setFilters(prev => ({ ...prev, resourceType: categoryValue }))
    setActiveView('resources')
  }

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto space-y-5 bg-[#F8FAFC] min-h-screen pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 animate-pulse" /> Resources
          </h1>
        </div>
      </div>

      {activeView === 'categories' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categoryCards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCategoryClick(card.value)}
              className={`flex flex-col items-center justify-center p-4 rounded-[24px] border ${card.borderColor} ${card.bgColor} ${card.hoverBorder} transition-all duration-300 hover:shadow-lg group text-center cursor-pointer h-full`}
            >
              <div className="scale-75 md:scale-100">{card.icon}</div>
              <h3 className="font-bold text-gray-800 text-[10px] md:text-xs group-hover:text-blue-700 transition-colors uppercase tracking-wider">{card.title}</h3>
            </button>
          ))}
        </div>
      ) : activeView === 'classroom' ? (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveView('categories')}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-bold border border-gray-200 bg-white"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Categories
            </button>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
               Google Classroom Links
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, name: 'Data Structures', faculty: 'Dr. Ramesh Kumar', classInfo: 'B.Tech CSE - 3rd Year A', link: 'https://classroom.google.com/', code: 'ds_3a_2026', whatsapp: 'https://chat.whatsapp.com/' },
              { id: 2, name: 'Operating Systems', faculty: 'Prof. Sharma', classInfo: 'B.Tech CSE - 3rd Year A', link: 'https://classroom.google.com/', code: 'os_2026', whatsapp: 'https://chat.whatsapp.com/' },
              { id: 3, name: 'Database Management', faculty: 'Dr. Anita Desai', classInfo: 'B.Tech CSE - 3rd Year A', link: 'https://classroom.google.com/', code: 'dbms_26', whatsapp: 'https://chat.whatsapp.com/' },
              { id: 4, name: 'Computer Networks', faculty: 'Prof. Verma', classInfo: 'B.Tech CSE - 3rd Year A', link: 'https://classroom.google.com/', code: 'cn_3a', whatsapp: 'https://chat.whatsapp.com/' }
            ].map((subject) => (
              <div key={subject.id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">{subject.name}</h3>
                <p className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <User size={14} className="text-green-600" /> {subject.faculty}
                </p>
                <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold">Class:</span>
                    <span className="text-gray-800 font-bold">{subject.classInfo}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold">Code:</span>
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                      <span className="text-gray-800 font-mono font-bold tracking-wider">{subject.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(subject.code); toast.success('Code copied!') }} className="text-gray-400 hover:text-green-600 transition-colors" title="Copy Code">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a href={subject.link} target="_blank" rel="noreferrer" className="flex-1 bg-white text-gray-800 font-bold py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/59/Google_Classroom_Logo.png" alt="GC" className="w-4 h-4 object-contain" /> Join
                  </a>
                  <a href={subject.whatsapp} target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366]/10 text-[#075E54] font-bold py-2.5 rounded-xl border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Header for resources view */}
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => setActiveView('categories')}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm font-bold border border-gray-200 bg-white"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Categories
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {filters.resourceType === '' ? 'All Resources' : filters.resourceType}
            </h2>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search by title, description or subject..." 
            />
          </div>
          
          <div>
            <select
              value={filters.semester || 'All'}
              onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Semesters</option>
              {semesters.slice(1).map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.resourceType || 'All'}
              onChange={(e) => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              {resourceTypes.slice(1).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader />
        </div>
      ) : resources.length === 0 ? (
        <EmptyState 
          icon={<FileText size={48} className="text-gray-400" />}
          title="No resources found"
          description="There are no academic resources matching your current semester or filter criteria."
        />
      ) : (
        <div className="space-y-10">
          {semestersList.map(semesterKey => (
            <div key={semesterKey} className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> {semesterKey}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.keys(groupedResources[semesterKey]).map(subjectName => (
                  <div key={subjectName} className="bg-white rounded-[24px] border border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col hover:border-blue-100 hover:shadow-md transition-all">
                    {/* Subject Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2 text-md">
                        <BookOpen className="w-4 h-4 text-blue-500" /> {subjectName}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold uppercase">
                        {groupedResources[semesterKey][subjectName].length} Resources
                      </span>
                    </div>

                    {/* Resources List */}
                    <div className="divide-y divide-gray-50 flex-1">
                      {groupedResources[semesterKey][subjectName].map(resource => (
                        <div key={resource._id} className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase tracking-widest">
                                {getFileIcon(resource.fileType, resource.fileName)}
                              </span>
                              {resource.unitNumber && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  Unit {resource.unitNumber}
                                </span>
                              )}
                              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                                {resource.resourceType || resource.category}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{resource.title}</h4>
                            {resource.description && (
                              <p className="text-xs text-gray-500 line-clamp-2">{resource.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {resource.uploadedBy?.name || 'Faculty'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(resource.createdAt)}
                              </span>
                              <span>• {resource.downloads || 0} downloads</span>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-col items-center justify-end gap-2 md:w-36 flex-shrink-0">
                            {(resource.category === 'Assignment' || resource.resourceType === 'Assignment') && (
                              <button
                                onClick={() => handleMarkCompleted(resource._id)}
                                disabled={resource.completedBy?.includes(user._id)}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                                  resource.completedBy?.includes(user._id)
                                    ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                <CheckCircle size={12} /> 
                                {resource.completedBy?.includes(user._id) ? 'Completed' : 'Mark Completed'}
                              </button>
                            )}
                            <div className="flex gap-2 w-full">
                              <Link
                                to={`/resource/${resource._id}`}
                                className="w-full text-center px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center gap-1"
                              >
                                <Eye size={12} /> View
                              </Link>
                              <button
                                onClick={() => handleDownload(resource._id)}
                                className="w-full px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                              >
                                <Download size={12} /> DL
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default StudentResources