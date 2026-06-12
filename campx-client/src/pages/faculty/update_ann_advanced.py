import os
import re

file_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\CreateAnnouncement.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useLocation import
if "useLocation" not in content:
    content = content.replace("import { useNavigate } from 'react-router-dom'", "import { useNavigate, useLocation } from 'react-router-dom'")

# 2. Add useLocation hook & parse target
target_logic = """  const location = useLocation()
  const targetParam = new URLSearchParams(location.search).get('target')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    priority: 'medium',
    audience: targetParam === 'class' ? 'class' : (targetParam === 'proctor' ? 'proctor' : 'all'),
    type: 'general',
    addToCalendar: false,
    location: '',
    eventDate: '',
    eventVenue: '',
    registrationLink: '',
    registrationDeadline: '',
    expiryDate: '',
    contacts: [],
    attachment: null,
    targetMyClass: targetParam === 'class',
    targetMyProctor: targetParam === 'proctor',
    targetMySection: false,
    targetMyDepartment: false,
    isImportant: false,
    isPinned: false,
    sendReminder: false
  })"""

# replace existing useState
pattern_state = re.compile(r'const \[formData, setFormData\] = useState\(\{[\s\S]*?targetSection: \'\'\s*\}\)', re.MULTILINE)
content = pattern_state.sub(target_logic.replace('const [formData', 'const targetParamFallback = null;\n  const [formData'), content)

# 3. Add appending new fields to submitData
submit_logic = """      submitData.append('contacts', JSON.stringify(formData.contacts))
      submitData.append('url', formData.url || '')
      submitData.append('eventDate', formData.eventDate || '')
      submitData.append('eventVenue', formData.eventVenue || '')
      submitData.append('registrationLink', formData.registrationLink || '')
      submitData.append('registrationDeadline', formData.registrationDeadline || '')
      submitData.append('targetMyClass', formData.targetMyClass)
      submitData.append('targetMyProctor', formData.targetMyProctor)
      submitData.append('targetMySection', formData.targetMySection)
      submitData.append('targetMyDepartment', formData.targetMyDepartment)
      submitData.append('isImportant', formData.isImportant)
      submitData.append('isPinned', formData.isPinned)
      submitData.append('sendReminder', formData.sendReminder)
"""
content = content.replace("submitData.append('contacts', JSON.stringify(formData.contacts))", submit_logic)

# 4. Add UI fields for url, target audience, event details
# Find the end of Basic Information section
ui_event_fields = """
        {/* Advanced / Event Information */}
        {['event', 'hackathon', 'workshop', 'placement'].includes(formData.type) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Event Specific Details</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input
                    type="datetime-local"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Venue</label>
                  <input
                    type="text"
                    name="eventVenue"
                    value={formData.eventVenue}
                    onChange={handleInputChange}
                    placeholder="e.g. Seminar Hall"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration/External URL</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url || formData.registrationLink}
                    onChange={(e) => {
                       handleInputChange(e);
                       setFormData(prev => ({...prev, registrationLink: e.target.value}));
                    }}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Audience Target Flags */}
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

# Insert before "Attachment & Calendar"
content = content.replace("{/* Attachment & Calendar */}", ui_event_fields + "\n        {/* Attachment & Calendar */}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated CreateAnnouncement.jsx")
