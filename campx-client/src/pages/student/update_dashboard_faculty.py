import os
import re

file_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\student\StudentDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add assignedFaculty state
state_logic = """  const [assignedFaculty, setAssignedFaculty] = useState(null)
  
  useEffect(() => {
    fetchDashboardData()
  }, [])"""

# Replace the existing useEffect
pattern_effect = re.compile(r'useEffect\(\(\) => \{\s*fetchDashboardData\(\)\s*\}, \[\]\)', re.MULTILINE)
content = pattern_effect.sub(state_logic, content)

# 2. Add API fetch in fetchDashboardData
api_logic = """      const response = await api.get('/student/dashboard')
      
      try {
        const facultyRes = await api.get('/student/assigned-faculty')
        if(facultyRes.data.success) {
          setAssignedFaculty(facultyRes.data.data)
        }
      } catch (err) {
        console.error("Error fetching faculty:", err);
      }
"""
content = content.replace("const response = await api.get('/student/dashboard')", api_logic)

# 3. Render the Faculty Card
faculty_card_ui = """
      {/* Profile Overview & Faculty Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
"""
content = content.replace('{/* Profile Overview */}\n      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">', faculty_card_ui + '<div className="p-6">')
content = content.replace('{/* Profile Overview */}\r\n      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">', faculty_card_ui + '<div className="p-6">')

# After the profile card, add the Faculty card
profile_card_end = """              </div>
            </div>
          </div>
        </div>"""
        
faculty_card_html = """
        {/* Assigned Faculty Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Assigned Faculty
            </h2>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-4">
            {assignedFaculty ? (
              <>
                {assignedFaculty.classTeacher ? (
                  <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1">Class Teacher</p>
                    <p className="font-semibold text-gray-800">{assignedFaculty.classTeacher.name}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Mail size={12}/> {assignedFaculty.classTeacher.email}</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No Class Teacher assigned</div>
                )}
                
                {assignedFaculty.proctor ? (
                  <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                    <p className="text-xs text-purple-600 font-medium mb-1">Proctor</p>
                    <p className="font-semibold text-gray-800">{assignedFaculty.proctor.name}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Mail size={12}/> {assignedFaculty.proctor.email}</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No Proctor assigned</div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <Loader size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
"""

# Try to find the exact end of profile overview.
# It ends right before {/* Quick Stats */}
# So we can replace {/* Quick Stats */} with the closing of grid and then Quick Stats
content = content.replace("{/* Quick Stats */}", "        </div>\n      </div>\n" + faculty_card_html + "\n      {/* Quick Stats */}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated StudentDashboard.jsx")
