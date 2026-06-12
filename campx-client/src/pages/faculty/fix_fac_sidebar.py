file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\FacultyDashboard.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("My Announcements", "Announcements")
content = content.replace("My Resources", "Resources")
content = content.replace("My Students", "Students")

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated FacultyDashboard.jsx sidebar labels")
