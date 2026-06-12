file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\CreateAnnouncement.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

import_old = "import { useAuth } from '../../hooks/useAuth'"
if "useAuth" not in content:
    import_new = "import api from '../../services/api'\nimport { useSettings } from '../../hooks/useSettings'\nimport { useAuth } from '../../hooks/useAuth'"
    content = content.replace("import api from '../../services/api'", import_new)

hook_old = """const CreateAnnouncement = () => {
  const navigate = useNavigate()"""
hook_new = """const CreateAnnouncement = () => {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const { user } = useAuth()"""
if "useSettings" not in content:
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
    targetYear: '',
    targetSection: ''
  })"""
if "targetDepartment: ''" not in content:
    content = content.replace(form_data_old, form_data_new)

submit_data_old = """      submitData.append('contacts', JSON.stringify(formData.contacts))
      if (formData.attachment) {"""
submit_data_new = """      submitData.append('contacts', JSON.stringify(formData.contacts))
      if (formData.audience === 'students' || formData.audience === 'faculty') {
        if (formData.targetDepartment) submitData.append('targetDepartment', formData.targetDepartment)
      }
      if (formData.audience === 'students') {
        if (formData.targetYear) submitData.append('targetYear', formData.targetYear)
        if (formData.targetSection) submitData.append('targetSection', formData.targetSection)
      }
      if (formData.attachment) {"""
if "targetDepartment" not in content:
    content = content.replace(submit_data_old, submit_data_new)

audience_old = """            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location (Optional)
                </label>"""
audience_new = """            {(formData.audience === 'students' || formData.audience === 'faculty') && user?.managedBranches?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Branch</label>
                  <select name="targetDepartment" value={formData.targetDepartment} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">All Managed Branches</option>
                    {user.managedBranches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                {formData.audience === 'students' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                      <select name="targetYear" value={formData.targetYear} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Years</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Section</label>
                      <select name="targetSection" value={formData.targetSection} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Sections</option>
                        {settings?.sections?.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location (Optional)
                </label>"""
if "managedBranches?.length" not in content:
    content = content.replace(audience_old, audience_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated faculty/CreateAnnouncement.jsx')
