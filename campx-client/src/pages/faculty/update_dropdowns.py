import os
files = [
  r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\MyAnnouncements.jsx',
  r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\UploadResource.jsx',
  r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\EditResource.jsx',
  r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\Myresources.jsx'
]

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Add import
        if 'useSettings' not in content:
            if 'import { useNavigate }' in content:
                content = content.replace('import { useNavigate }', "import { useSettings } from '../../hooks/useSettings'\nimport { useNavigate }")
            elif "import React, { useState, useEffect } from 'react'" in content:
                content = content.replace("import React, { useState, useEffect } from 'react'", "import React, { useState, useEffect } from 'react'\nimport { useSettings } from '../../hooks/useSettings'")
            else:
                content = "import { useSettings } from '../../hooks/useSettings'\n" + content
                
        # Add hook call
        if 'const { settings } = useSettings()' not in content:
            if 'const [loading, setLoading] = useState(false)' in content:
                content = content.replace('const [loading, setLoading] = useState(false)', "const { settings } = useSettings()\n  const [loading, setLoading] = useState(false)")
            elif 'const [loading, setLoading] = useState(true)' in content:
                content = content.replace('const [loading, setLoading] = useState(true)', "const { settings } = useSettings()\n  const [loading, setLoading] = useState(true)")
            elif 'const [resources, setResources] = useState([])' in content:
                content = content.replace('const [resources, setResources] = useState([])', "const { settings } = useSettings()\n  const [resources, setResources] = useState([])")
            elif 'const [announcements, setAnnouncements] = useState([])' in content:
                content = content.replace('const [announcements, setAnnouncements] = useState([])', "const { settings } = useSettings()\n  const [announcements, setAnnouncements] = useState([])")
            
        # Replace TargetBranch input with select
        targetBranch_input = '<input type="text" name="targetBranch" value={formData.targetBranch} onChange={handleInputChange} className="input-field" placeholder="CSE, ECE, etc." />'
        targetBranch_select = """<select name="targetBranch" value={formData.targetBranch} onChange={handleInputChange} className="input-field">
                    <option value="">Select Branch</option>
                    {settings?.branches?.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>"""
        content = content.replace(targetBranch_input, targetBranch_select)
        
        targetSection_text = '<input type="text" name="targetSection" value={formData.targetSection} onChange={handleInputChange} className="input-field" placeholder="e.g., A, B, C" />'
        targetSection_select = """<select name="targetSection" value={formData.targetSection} onChange={handleInputChange} className="input-field">
                    <option value="">Select Section</option>
                    {settings?.sections?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>"""
        content = content.replace(targetSection_text, targetSection_select)

        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
print('Done dropdowns')
