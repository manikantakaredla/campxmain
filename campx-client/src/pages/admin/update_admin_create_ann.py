file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\admin\CreateAnnouncement.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

import_old = "import api from '../../services/api'"
import_new = "import api from '../../services/api'\nimport { useSettings } from '../../hooks/useSettings'"
if "useSettings" not in content:
    content = content.replace(import_old, import_new)

hook_old = """const CreateAnnouncement = () => {
  const navigate = useNavigate()"""
hook_new = """const CreateAnnouncement = () => {
  const navigate = useNavigate()
  const { settings } = useSettings()"""
content = content.replace(hook_old, hook_new)

form_data_old = """    location: '',
    expiryDate: '',
    contacts: [],
    attachment: null
  })"""
form_data_new = """    location: '',
    expiryDate: '',
    contacts: [],
    attachment: null,
    targetDepartment: '',
    targetSection: '',
    targetYear: ''
  })"""
content = content.replace(form_data_old, form_data_new)

submit_data_old = """      submitData.append('contacts', JSON.stringify(formData.contacts))
      if (formData.attachment) {"""
submit_data_new = """      submitData.append('contacts', JSON.stringify(formData.contacts))
      if (formData.audience === 'students') {
        if (formData.targetDepartment) submitData.append('targetDepartment', formData.targetDepartment)
        if (formData.targetSection) submitData.append('targetSection', formData.targetSection)
        if (formData.targetYear) submitData.append('targetYear', formData.targetYear)
      } else if (formData.audience === 'faculty') {
        if (formData.targetDepartment) submitData.append('targetDepartment', formData.targetDepartment)
      }
      if (formData.attachment) {"""
content = content.replace(submit_data_old, submit_data_new)

audience_old = """          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select name="audience" value={formData.audience} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>"""

audience_new = """          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select name="audience" value={formData.audience} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
          
          {(formData.audience === 'students' || formData.audience === 'faculty') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Department</label>
                <select name="targetDepartment" value={formData.targetDepartment} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Departments</option>
                  {settings?.departments?.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              {formData.audience === 'students' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                    <select name="targetYear" value={formData.targetYear} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">All Years</option>
                      {[1, 2, 3, 4].map(y => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Section</label>
                    <select name="targetSection" value={formData.targetSection} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">All Sections</option>
                      {settings?.sections?.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}"""
content = content.replace(audience_old, audience_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated admin/CreateAnnouncement.jsx')
