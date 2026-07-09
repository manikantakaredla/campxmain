import React, { useState, useEffect } from 'react'
import { analyticsService } from '../../services/analyticsService'
import { 
  BarChart2, Users, Eye, EyeOff, LayoutDashboard,
  Calendar, FileText, Filter, Search, ArrowLeft, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('announcements')
  const [items, setItems] = useState({ announcements: [], resources: [] })
  const [loading, setLoading] = useState(true)

  const [selectedItem, setSelectedItem] = useState(null)
  const [itemAnalytics, setItemAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [sectionFilter, setSectionFilter] = useState('all')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await analyticsService.getItems()
      if (response.success) {
        setItems({
          announcements: response.announcements,
          resources: response.resources
        })
      }
    } catch (error) {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = async (item) => {
    setSelectedItem(item)
    setAnalyticsLoading(true)
    setItemAnalytics(null)
    try {
      const response = await analyticsService.getItemAnalytics(item.itemType, item._id)
      if (response.success) {
        setItemAnalytics(response)
      }
    } catch (error) {
      toast.error('Failed to load detailed analytics')
      setSelectedItem(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleBack = () => {
    setSelectedItem(null)
    setItemAnalytics(null)
    setSearchTerm('')
    setDepartmentFilter('all')
    setSectionFilter('all')
  }

  const renderItemCard = (item) => {
    return (
      <div 
        key={item._id}
        onClick={() => handleItemClick(item)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-fitbit-primary transition-colors line-clamp-1">
              {item.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            item.itemType === 'announcement' 
              ? 'bg-blue-50 text-blue-700' 
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            {item.itemType === 'announcement' ? item.type : item.category}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-fitbit-primary" />
            <span className="font-medium">{item.itemType === 'announcement' ? item.viewCount || 0 : item.downloads || 0}</span>
            <span className="text-gray-500">total views</span>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fitbit-primary" />
      </div>
    )
  }

  if (selectedItem && analyticsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Loading Analytics...</h1>
        </div>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-fitbit-primary" />
        </div>
      </div>
    )
  }

  if (selectedItem && itemAnalytics) {
    const allUsers = [
      ...itemAnalytics.viewed.map(u => ({ ...u, status: 'viewed' })),
      ...itemAnalytics.pending.map(u => ({ ...u, status: 'pending' }))
    ]

    const departments = [...new Set(allUsers.map(u => u.department || u.branch).filter(Boolean))]
    const sections = [...new Set(allUsers.map(u => u.section).filter(Boolean))]

    const filteredUsers = allUsers.filter(u => {
      const matchesSearch = (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDept = departmentFilter === 'all' || (u.department === departmentFilter || u.branch === departmentFilter)
      const matchesSection = sectionFilter === 'all' || u.section === sectionFilter
      return matchesSearch && matchesDept && matchesSection
    })

    const viewedCount = filteredUsers.filter(u => u.status === 'viewed').length
    const pendingCount = filteredUsers.filter(u => u.status === 'pending').length
    const totalCount = filteredUsers.length
    const viewedPercentage = totalCount > 0 ? Math.round((viewedCount / totalCount) * 100) : 0

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-white bg-gray-50 rounded-full transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h1>
            <p className="text-gray-500 mt-1 capitalize">{selectedItem.itemType} Reach Analytics</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-fitbit-primary/5 rounded-bl-full -mr-4 -mt-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Reach Percentage</h3>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <BarChart2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{viewedPercentage}%</div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-fitbit-primary h-2 rounded-full transition-all duration-1000"
                style={{ width: `${viewedPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Viewed</h3>
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{viewedCount}</div>
            <p className="text-sm text-gray-500 mt-2">Students have viewed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-bl-full -mr-4 -mt-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                <EyeOff className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{pendingCount}</div>
            <p className="text-sm text-gray-500 mt-2">Students pending view</p>
          </div>
        </div>

        {/* Filters and List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitbit-primary focus:border-transparent text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitbit-primary text-sm outline-none bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-fitbit-primary text-sm outline-none bg-white"
              >
                <option value="all">All Sections</option>
                {sections.map(s => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 font-semibold">Section</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-8 h-8 mb-3 text-gray-300" />
                        <p>No students found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.rollNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.department || user.branch || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {user.section || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 'viewed' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {user.status === 'viewed' ? (
                            <><Eye className="w-3 h-3" /> Viewed</>
                          ) : (
                            <><EyeOff className="w-3 h-3" /> Pending</>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Dashboard View
  const activeItems = activeTab === 'announcements' ? items.announcements : items.resources

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-fitbit-primary" />
          Reach Analytics
        </h1>
        <p className="text-gray-500 mt-2">Track visibility and engagement for your uploaded content.</p>
      </div>

      <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'announcements' 
              ? 'border-fitbit-primary text-fitbit-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Announcements
          </span>
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
            activeTab === 'resources' 
              ? 'border-fitbit-primary text-fitbit-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Resources
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeItems.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeOff className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
            <p className="text-gray-500">You haven't uploaded any {activeTab} yet.</p>
          </div>
        ) : (
          activeItems.map(renderItemCard)
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard
