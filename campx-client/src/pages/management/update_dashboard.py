file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\management\ManagementDashboard.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Pending Actions with Student Engagement
pending_old = """        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">0</span>
          </div>
          <h3 className="text-sm font-medium text-gray-700">Pending Actions</h3>
          <Link to="/management/assign-students" className="text-sm text-gray-400 hover:text-orange-600 mt-2 inline-flex items-center gap-1">
            Assign now <ChevronRight className="w-3 h-3" />
          </Link>
        </div>"""

engagement_new = """        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">85%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-700">Student Engagement</h3>
          <p className="text-sm text-gray-400 mt-2 inline-flex items-center gap-1">
            Across managed branches
          </p>
        </div>"""

content = content.replace(pending_old, engagement_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated ManagementDashboard.jsx')
