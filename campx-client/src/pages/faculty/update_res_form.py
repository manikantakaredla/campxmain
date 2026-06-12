file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\UploadResource.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

import_old = "import api from '../../services/api'"
import_new = "import api from '../../services/api'\nimport { useSettings } from '../../hooks/useSettings'"
if "useSettings" not in content:
    content = content.replace(import_old, import_new)

hook_old = """const UploadResource = () => {
  const navigate = useNavigate()"""
hook_new = """const UploadResource = () => {
  const navigate = useNavigate()
  const { settings } = useSettings()"""
content = content.replace(hook_old, hook_new)

branch_old = """              <input
                type="text"
                name="targetBranch"
                value={formData.targetBranch}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CSE, ECE, Mechanical"
              />"""

branch_new = """              <select
                name="targetBranch"
                value={formData.targetBranch}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                {settings?.branches?.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>"""
content = content.replace(branch_old, branch_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated UploadResource.jsx to use dynamic branches')
