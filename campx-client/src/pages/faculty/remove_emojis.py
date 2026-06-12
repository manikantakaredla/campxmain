import os
import re

# 1. Fix emojis in MyStudents.jsx
ms_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\MyStudents.jsx'
with open(ms_path, 'r', encoding='utf-8') as f:
    ms_content = f.read()

# Add Megaphone and Folder to lucide-react imports
if "Megaphone" not in ms_content:
    ms_content = ms_content.replace("import { Search, ChevronRight, User as UserIcon, BookOpen, Clock } from 'lucide-react'", "import { Search, ChevronRight, User as UserIcon, BookOpen, Clock, Megaphone, Folder } from 'lucide-react'")

ms_content = ms_content.replace('<span className="text-lg">📢</span>', '<Megaphone size={18} />')
ms_content = ms_content.replace('<span className="text-lg">📁</span>', '<Folder size={18} />')

with open(ms_path, 'w', encoding='utf-8') as f:
    f.write(ms_content)


# 2. Fix emojis in CreateAnnouncement.jsx
ca_path = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\CreateAnnouncement.jsx'
with open(ca_path, 'r', encoding='utf-8') as f:
    ca_content = f.read()

# Add FileText, Image, Paperclip to lucide-react imports
if "FileText" not in ca_content:
    ca_content = ca_content.replace("import { Upload, X, MapPin, Calendar, Users, AlertCircle, Plus, Trash2 } from 'lucide-react'", "import { Upload, X, MapPin, Calendar, Users, AlertCircle, Plus, Trash2, FileText, Image, Paperclip } from 'lucide-react'")

ca_content = ca_content.replace("return '📄'", "return <FileText className=\"w-10 h-10 text-gray-400\" />")
ca_content = ca_content.replace("return '🖼️'", "return <Image className=\"w-10 h-10 text-gray-400\" />")
ca_content = ca_content.replace("return '📎'", "return <Paperclip className=\"w-10 h-10 text-gray-400\" />")

with open(ca_path, 'w', encoding='utf-8') as f:
    f.write(ca_content)

print("Fixed emojis in UI")
