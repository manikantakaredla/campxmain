import React, { useState, useEffect } from 'react'
import { resourceService } from '../../services/resourceService'
import { SearchBar } from '../../components/common/SearchBar'
import { Loader } from '../../components/common/Loader'
import { EmptyState } from '../../components/common/EmptyState'
import { FileText, Download, Eye, Clock, User, Filter, BookOpen, Layers, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const StudentResources = () => {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', resourceType: '', semester: '', sortBy: 'latest' })

  const resourceTypes = [
    'All', 'Notes', 'PPT', 'Assignment', 'Question Bank', 'Previous Paper', 'Lab Manual', 'Syllabus', 'Video Link', 'Other'
  ]

  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8']

  useEffect(() => {
    fetchResources()
  }, [filters])

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600 animate-pulse" /> Resources Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Organized subject-wise learning materials uploaded by your faculty</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div key={subjectName} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-blue-100 hover:shadow-md transition-all">
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
                        <div key={resource._id} className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
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

                          <div className="flex md:flex-col items-center justify-end gap-2 md:w-32 flex-shrink-0">
                            <Link
                              to={`/resource/${resource._id}`}
                              className="w-full text-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye size={12} /> View Details
                            </Link>
                            <button
                              onClick={() => handleDownload(resource._id)}
                              className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                            >
                              <Download size={12} /> Download
                            </button>
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
    </div>
  )
}

export default StudentResources