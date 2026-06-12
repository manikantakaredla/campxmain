file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\MyStudents.jsx'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add ArrowLeft to lucide-react imports
if "ArrowLeft" not in content:
    content = content.replace("import { Users, Mail, Phone, Search, UserCheck, UserPlus } from 'lucide-react'", 
                              "import { Users, Mail, Phone, Search, UserCheck, UserPlus, ArrowLeft } from 'lucide-react'")

# Add state
if "const [selectedSection" not in content:
    content = content.replace("const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })",
                              "const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })\n  const [selectedSection, setSelectedSection] = useState(null)")

# reset selectedSection on tab change
if "fetchStudents()" in content:
    content = content.replace("fetchStudents()", "fetchStudents()\n    if(activeTab !== 'all') setSelectedSection(null)")


with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added selectedSection state and ArrowLeft import")
