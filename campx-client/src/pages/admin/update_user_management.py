file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\admin\UserManagement.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

dept_old = """  const departments = ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL']
  const sections = (settings?.sections || [])"""

dept_new = """  const departments = (settings?.departments || [])
  const sections = (settings?.sections || [])"""

content = content.replace(dept_old, dept_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated UserManagement.jsx departments')
