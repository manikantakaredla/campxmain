file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\admin\CreateAnnouncement.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('settings?.departments?.map', 'settings?.branches?.map')

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

file2 = r'c:\Users\manik\Music\campx final\campx-client\src\pages\admin\UserManagement.jsx'
with open(file2, 'r', encoding='utf-8') as f:
    content2 = f.read()

content2 = content2.replace('const departments = (settings?.departments || [])', 'const departments = (settings?.branches || [])')

with open(file2, 'w', encoding='utf-8') as f:
    f.write(content2)

print('Fixed branches array')
