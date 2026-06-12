import os
import re

file_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\UploadResource.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import authService if not there
if "import { authService }" not in content:
    content = content.replace("import React, { useState } from 'react'", "import React, { useState } from 'react'\nimport { authService } from '../../services/authService'")

# 2. Get user inside component
user_def = """  const user = authService.getStoredUser();
  const isAdminOrHigher = user && ['admin', 'management', 'principal', 'dean'].includes(user.role);
"""
# insert right after const [loading, setLoading] = useState(false)
content = content.replace("  const [loading, setLoading] = useState(false)", "  const [loading, setLoading] = useState(false)\n" + user_def)

# 3. Ensure targetBranches etc exist in state
if "targetBranches" not in content:
    content = content.replace("targetMyDepartment: false,", "targetMyDepartment: false,\n    targetBranches: '',\n    targetYears: '',\n    targetSections: '',")

# 4. Append the array fields in handleSubmit
submit_append = """      submitData.append('targetMyDepartment', formData.targetMyDepartment)
      submitData.append('targetBranches', JSON.stringify(formData.targetBranches ? formData.targetBranches.split(',').map(s=>s.trim()) : []))
      submitData.append('targetYears', JSON.stringify(formData.targetYears ? formData.targetYears.split(',').map(s=>s.trim()) : []))
      submitData.append('targetSections', JSON.stringify(formData.targetSections ? formData.targetSections.split(',').map(s=>s.trim()) : []))"""
content = content.replace("      submitData.append('targetMyDepartment', formData.targetMyDepartment)", submit_append)


# 5. Advanced Targeting UI conditionally rendered based on role
advanced_targeting_ui = """
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Advanced Targeting</h2>
            </div>
            <div className="p-6">
              {!isAdminOrHigher ? (
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.targetMyClass} onChange={(e) => setFormData({...formData, targetMyClass: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">My Class Students</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.targetMyProctor} onChange={(e) => setFormData({...formData, targetMyProctor: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">My Proctoring Students</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.targetMyDepartment} onChange={(e) => setFormData({...formData, targetMyDepartment: e.target.checked})} className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Entire Department</span>
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Branches</label>
                    <input type="text" name="targetBranches" value={formData.targetBranches} onChange={handleInputChange} placeholder="e.g. CSE, ECE (comma separated)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Years</label>
                    <input type="text" name="targetYears" value={formData.targetYears} onChange={handleInputChange} placeholder="e.g. 1, 2, 3 (comma separated)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Sections</label>
                    <input type="text" name="targetSections" value={formData.targetSections} onChange={handleInputChange} placeholder="e.g. A, B, C (comma separated)" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}
            </div>
        </div>
"""

pattern_flags = re.compile(r'<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">.*?<h2 className="font-semibold text-gray-800">Advanced Targeting<\/h2>.*?<\/div>\s*<\/div>\s*<\/div>', re.MULTILINE | re.DOTALL)
content = pattern_flags.sub(advanced_targeting_ui, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated UploadResource.jsx for admin targeting")
