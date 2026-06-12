import os

files = [
    r'c:\Users\manik\Music\campx final\server\controllers\studentController.js',
    r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("ClassFacultyAssignment", "ClassStudentAssignment")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
print("Fixed Assignment Model References")
