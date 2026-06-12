import os
import re

file_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\admin\UserManagement.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add overflow-x-auto to the table wrapper
content = content.replace('<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">', 
                          '<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated UserManagement.jsx for mobile responsiveness")
