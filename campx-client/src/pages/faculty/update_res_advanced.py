import os
import re

file_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\UploadResource.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useLocation import
if "useLocation" not in content:
    content = content.replace("import { useNavigate } from 'react-router-dom'", "import { useNavigate, useLocation } from 'react-router-dom'")

# 2. Parse target parameter
target_logic = """  const location = useLocation()
  const targetParam = new URLSearchParams(location.search).get('target')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    unit: '',
    type: 'notes',
    audience: targetParam === 'class' ? 'class' : (targetParam === 'proctor' ? 'proctor' : 'all'),
    file: null,
    targetMyClass: targetParam === 'class',
    targetMyProctor: targetParam === 'proctor',
    targetMyDepartment: false,
    forClass: false
  })"""

# replace existing useState
pattern_state = re.compile(r'const \[formData, setFormData\] = useState\(\{[\s\S]*?forClass: false\s*\}\)', re.MULTILINE)
content = pattern_state.sub(target_logic.replace('const [formData', 'const targetParamFallback = null;\n  const [formData'), content)

# 3. Add appending target flags to submitData
submit_logic = """      submitData.append('type', formData.type)
      submitData.append('targetMyClass', formData.targetMyClass)
      submitData.append('targetMyProctor', formData.targetMyProctor)
      submitData.append('targetMyDepartment', formData.targetMyDepartment)
"""
content = content.replace("submitData.append('type', formData.type)", submit_logic)

# 4. Add UI checkboxes
ui_checkboxes = """
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Advanced Targeting</h2>
            </div>
            <div className="p-6">
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
            </div>
        </div>
"""

content = content.replace("{/* File Upload Card */}", ui_checkboxes + "\n        {/* File Upload Card */}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated UploadResource.jsx")
