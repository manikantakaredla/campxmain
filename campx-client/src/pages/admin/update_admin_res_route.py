file = r'c:\Users\manik\Music\campx final\campx-client\src\App.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

route_old = """          <Route path="/admin/resources" element={<ResourceManagement />} />
          <Route path="/resource/:id" element={<ResourceDetails />} />"""

route_new = """          <Route path="/admin/resources" element={<ResourceManagement />} />
          <Route path="/admin/resources/upload" element={<UploadResource />} />
          <Route path="/resource/:id" element={<ResourceDetails />} />"""

if "/admin/resources/upload" not in content:
    content = content.replace(route_old, route_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated App.jsx')

file2 = r'c:\Users\manik\Music\campx final\campx-client\src\pages\admin\ResourceManagement.jsx'
with open(file2, 'r', encoding='utf-8') as f:
    content2 = f.read()

header_old = """      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resource Management</h1>
      </div>"""

header_new = """      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Resource Management</h1>
        <Link 
          to="/admin/resources/upload" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Upload Resource
        </Link>
      </div>"""

if "Upload Resource" not in content2:
    content2 = content2.replace(header_old, header_new)

with open(file2, 'w', encoding='utf-8') as f:
    f.write(content2)
print('Updated ResourceManagement.jsx')
