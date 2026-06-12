file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\management\AssignStudents.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

state_old = "const [assignmentType, setAssignmentType] = useState(searchParams.get('type') || 'class')"
state_new = """const [assignmentType, setAssignmentType] = useState(searchParams.get('type') || 'class')
  const [assignMode, setAssignMode] = useState('individual') // 'individual' or 'section'
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('')"""
content = content.replace(state_old, state_new)

search_old = '<SearchBar onSearch={setSearchTerm} placeholder="Search students by name or roll number..." />'
search_new = """<SearchBar onSearch={setSearchTerm} placeholder="Search students by name or roll number..." />
              
              <div className="mt-4 flex gap-2">
                <button onClick={() => {setAssignMode('individual'); setSelectedStudents([]);}} className={`px-3 py-1 text-sm rounded-lg ${assignMode === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>Individual Selection</button>
                <button onClick={() => {setAssignMode('section'); setSelectedStudents([]);}} className={`px-3 py-1 text-sm rounded-lg ${assignMode === 'section' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>By Section Selection</button>
              </div>
              
              {assignMode === 'section' && (
                <div className="mt-4">
                  <select className="w-full p-2 border rounded-lg" value={selectedSectionFilter} onChange={(e) => {
                    setSelectedSectionFilter(e.target.value);
                    if (e.target.value) {
                      const sectionStudents = students.filter(s => s.section === e.target.value).map(s => s._id);
                      setSelectedStudents(sectionStudents);
                    } else {
                      setSelectedStudents([]);
                    }
                  }}>
                    <option value="">Select Section...</option>
                    {Array.from(new Set(students.map(s => s.section).filter(Boolean))).map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              )}"""

content = content.replace(search_old, search_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated AssignStudents.jsx')
