file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\FacultyProfile.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

dept_old = """          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="text-gray-800">{user?.department || 'Not specified'}</p>
            </div>
          </div>"""

dept_new = """          <div className="flex items-center gap-3">
            <Building className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="text-gray-800">{user?.department || 'Not specified'}</p>
            </div>
          </div>
          
          {['dean', 'principal', 'management'].includes(user?.role) && (
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-500">Assigned Branches</p>
                <p className="text-gray-800">
                  {user?.managedBranches?.length > 0 
                    ? user.managedBranches.join(', ') 
                    : (user?.department || 'None')}
                </p>
              </div>
            </div>
          )}"""

if "{['dean', 'principal', 'management'].includes(user?.role) && (" not in content:
    content = content.replace(dept_old, dept_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated FacultyProfile.jsx')
