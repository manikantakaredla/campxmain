file = r'c:\Users\manik\Music\campx final\campx-client\src\App.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

import_str = "import AddUsers from './pages/admin/AddUsers'"
if import_str not in content:
    content = content.replace("import UserManagement from './pages/admin/UserManagement'", "import UserManagement from './pages/admin/UserManagement'\nimport AddUsers from './pages/admin/AddUsers'")

route_str = '<Route path="add-users" element={<AddUsers />} />'
if route_str not in content:
    content = content.replace('<Route path="users" element={<UserManagement />} />', '<Route path="users" element={<UserManagement />} />\n              <Route path="add-users" element={<AddUsers />} />')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

file2 = r'c:\Users\manik\Music\campx final\campx-client\src\components\Layout\Sidebar.jsx'
with open(file2, 'r', encoding='utf-8') as f:
    content2 = f.read()

if "path: '/admin/add-users'" not in content2:
    content2 = content2.replace("{ name: 'User Management', path: '/admin/users', icon: Users },", "{ name: 'User Management', path: '/admin/users', icon: Users },\n    { name: 'Add Users', path: '/admin/add-users', icon: UserPlus },")
    if "UserPlus" not in content2:
        content2 = content2.replace("Users,", "Users, UserPlus,")

with open(file2, 'w', encoding='utf-8') as f:
    f.write(content2)

print('Updated App.jsx and Sidebar.jsx')
