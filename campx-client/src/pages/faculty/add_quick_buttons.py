import os

file_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\MyStudents.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add standard buttons for the current active tab (Class or Proctor)
# We need to add the buttons to the top, next to the Search Bar or Tabs
buttons_html = """        <div className="flex gap-3">
          {(activeTab === 'class' || activeTab === 'proctor') && (
            <>
              <Link
                to={`/faculty/announcements/create?target=${activeTab}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <span className="text-lg">📢</span> Add {activeTab === 'class' ? 'Class' : 'Proctor'} Announcement
              </Link>
              <Link
                to={`/faculty/resources/upload?target=${activeTab}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <span className="text-lg">📁</span> Add {activeTab === 'class' ? 'Class' : 'Proctor'} Resource
              </Link>
            </>
          )}
        </div>"""

if "Add Class Announcement" not in content:
    # Replace the search bar div to include flex layout
    old_search = """      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <SearchBar onSearch={handleSearch} placeholder="Search by name, roll number, or email..." />
      </div>"""
      
    new_search = """      {/* Search Bar & Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="max-w-md w-full">
          <SearchBar onSearch={handleSearch} placeholder="Search by name, roll number, or email..." />
        </div>
""" + buttons_html + """
      </div>"""
      
    content = content.replace(old_search, new_search)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added action buttons to MyStudents.jsx")
