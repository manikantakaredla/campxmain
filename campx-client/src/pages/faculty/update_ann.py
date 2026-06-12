import re
import sys

with open('MyAnnouncements.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add filterType state
content = content.replace("const [searchTerm, setSearchTerm] = useState('')", "const [searchTerm, setSearchTerm] = useState('')\n  const [filterType, setFilterType] = useState('my')")

# Update fetchAnnouncements
fetch_code_old = """  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await announcementService.getMyAnnouncements()
      let filtered = response.announcements || []"""

fetch_code_new = """  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = filterType === 'all' 
        ? await announcementService.getAll() 
        : await announcementService.getMyAnnouncements()
      let filtered = response.announcements || []"""

content = content.replace(fetch_code_old, fetch_code_new)

# Add dependency
content = content.replace('}, [pagination.page, searchTerm])', '}, [pagination.page, searchTerm, filterType])')

# For the UI split, we find the return statement
return_start = content.find('  return (\n    <div className="p-6">')

new_return = """  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
        <p className="text-gray-500 mt-1">Manage and view announcements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Panel: Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">{selectedAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</h2>
            {selectedAnnouncement && (
              <button onClick={resetForm} className="text-sm text-blue-600 hover:underline">
                Cancel
              </button>
            )}
          </div>
          
          <form onSubmit={selectedAnnouncement ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                <select name="audience" value={formData.audience} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="all">All Users</option>
                  <option value="students">Students</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
              <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button type="submit" disabled={submitting} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                {submitting ? 'Saving...' : (selectedAnnouncement ? 'Save Changes' : 'Publish Announcement')}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: List */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Announcements
                </button>
                <button
                  onClick={() => setFilterType('my')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === 'my' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  My Announcements
                </button>
              </div>
              <div className="w-full sm:w-64">
                <SearchBar onSearch={setSearchTerm} placeholder="Search..." />
              </div>
            </div>

            {loading ? (
              <Loader />
            ) : announcements.length === 0 ? (
              <EmptyState 
                icon={<Megaphone className="w-12 h-12" />}
                title="No announcements"
                description={filterType === 'my' ? "You haven't created any announcements yet" : "No announcements found"}
              />
            ) : (
              <div className="space-y-3">
                {paginatedAnnouncements.map((announcement) => (
                  <div key={announcement._id} className="p-4 rounded-lg border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all bg-gray-50/50">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${
                            announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                            announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {announcement.priority || 'NORMAL'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase font-semibold">
                            {announcement.audience}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{announcement.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{announcement.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Link to={`/announcement/${announcement._id}`} className="p-1.5 text-gray-400 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </Link>
                        {filterType === 'my' && (
                          <>
                            <button onClick={() => openEditModal(announcement)} className="p-1.5 text-gray-400 hover:text-green-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(announcement._id)} className="p-1.5 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Pagination 
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAnnouncements
"""

if return_start != -1:
    content = content[:return_start] + new_return

with open('MyAnnouncements.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
