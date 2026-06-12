file_res = r'c:\Users\manik\Music\campx final\server\controllers\resourceController.js'
with open(file_res, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Update req.query
old_query = """const { page = 1, limit = 10, category, search, branch, year } = req.query;"""
new_query = """const { page = 1, limit = 10, category, search, branch, year, forClass } = req.query;"""
if "forClass" not in old_query and "forClass" in new_query:
    content = content.replace(old_query, new_query)

# Update logic
old_logic = """      query.$or = [
        { visibility: "all" },
        { visibility: "branch", targetBranch: user.branch },
        { visibility: "year", targetYear: user.currentYear },
        { visibility: "section", targetSection: user.section }
      ];

      if (classAssignment) {
        query.$or.push({ visibility: "class", uploadedBy: classAssignment.facultyId });
      }
      if (proctorAssignment) {
        query.$or.push({ visibility: "proctor", uploadedBy: proctorAssignment.facultyId });
      }"""

new_logic = """      if (forClass === "true") {
        query.$or = [
          { visibility: "section", targetSection: user.section }
        ];
        if (classAssignment) {
          query.$or.push({ uploadedBy: classAssignment.facultyId });
        }
        if (proctorAssignment) {
          query.$or.push({ uploadedBy: proctorAssignment.facultyId });
        }
      } else {
        query.$or = [
          { visibility: "all" },
          { visibility: "branch", targetBranch: user.branch },
          { visibility: "year", targetYear: user.currentYear },
          { visibility: "section", targetSection: user.section }
        ];

        if (classAssignment) {
          query.$or.push({ visibility: "class", uploadedBy: classAssignment.facultyId });
        }
        if (proctorAssignment) {
          query.$or.push({ visibility: "proctor", uploadedBy: proctorAssignment.facultyId });
        }
      }"""

if "forClass === \"true\"" not in content:
    content = content.replace(old_logic, new_logic)

with open(file_res, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated resourceController.js")


file_front = r'c:\Users\manik\Music\campx final\campx-client\src\pages\student\StudentAnnouncements.jsx'
with open(file_front, 'r', encoding='utf-8') as f:
    front_content = f.read()

# Update fetch to pull resources
old_fetch = """  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        priority: selectedPriority,
        type: selectedType,
        ...(forClass && { forClass: 'true' })
      }
      const response = await announcementService.getAll(params)
      setAnnouncements(response.announcements || [])
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }))
    } catch (error) {
      toast.error('Failed to load announcements')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }"""

new_fetch = """  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        priority: selectedPriority,
        type: selectedType,
        ...(forClass && { forClass: 'true' })
      }
      const response = await announcementService.getAll(params)
      let combined = response.announcements || []
      
      if (forClass) {
        try {
          const api = (await import('../../services/api')).default;
          const res = await api.get('/resources', { params: { forClass: 'true', limit: 50 } });
          const resources = (res.data.resources || []).map(r => ({
            ...r,
            isResource: true,
            createdAt: r.createdAt
          }));
          combined = [...combined, ...resources].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch(e) {
          console.error("Failed fetching class resources", e);
        }
      }

      setAnnouncements(combined)
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0
      }))
    } catch (error) {
      toast.error('Failed to load announcements')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }"""

if "let combined =" not in front_content:
    front_content = front_content.replace(old_fetch, new_fetch)

# Update rendering to handle resources
render_old = """                  <AnnouncementCard
                    key={announcement._id}
                    announcement={announcement}
                    isNew={new Date(announcement.createdAt) > new Date(Date.now() - 86400000)}
                  />"""

render_new = """                  {announcement.isResource ? (
                    <div key={announcement._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Resource: {announcement.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{announcement.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{announcement.description || 'No description'}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-400">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 truncate">By {announcement.uploadedBy?.name || 'Unknown'}</p>
                    </div>
                  ) : (
                    <AnnouncementCard
                      key={announcement._id}
                      announcement={announcement}
                      isNew={new Date(announcement.createdAt) > new Date(Date.now() - 86400000)}
                    />
                  )}"""

if "announcement.isResource ?" not in front_content:
    front_content = front_content.replace(render_old, render_new)

with open(file_front, 'w', encoding='utf-8') as f:
    f.write(front_content)
print("Updated StudentAnnouncements.jsx")
