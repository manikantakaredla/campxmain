file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\MyStudents.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the students mapping
old_mapping = """        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => ("""

# Helper function definition
helper_function = """  // Group students by section
  const groupedStudents = students.reduce((acc, student) => {
    const section = student.section || 'Unassigned';
    if (!acc[section]) acc[section] = [];
    acc[section].push(student);
    return acc;
  }, {});
"""

if "const groupedStudents" not in content:
    content = content.replace("return (", helper_function + "\n  return (")

new_mapping = """        <div className="space-y-8">
          {Object.entries(groupedStudents).sort(([a], [b]) => a.localeCompare(b)).map(([section, sectionStudents]) => (
            <div key={section} className="bg-gray-50 p-4 rounded-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Section {section}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionStudents.map((student) => ("""

if "Object.entries(groupedStudents)" not in content:
    content = content.replace(old_mapping, new_mapping)

old_end = """          ))}
        </div>"""

new_end = """                ))}
              </div>
            </div>
          ))}
        </div>"""

if "</div>\n            </div>\n          ))}" not in content:
    content = content.replace(old_end, new_end)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated MyStudents.jsx to group by section")
