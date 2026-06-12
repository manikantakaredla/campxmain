import os

files = ['Myresources.jsx', 'UploadResource.jsx', 'EditResource.jsx']
for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        old_vis_opts = '''<option value="all">All Students</option>
                    <option value="branch">Specific Branch</option>
                    <option value="year">Specific Year</option>'''
                    
        new_vis_opts = '''<option value="all">All Students</option>
                    <option value="branch">Specific Branch</option>
                    <option value="year">Specific Year</option>
                    <option value="section">Specific Section</option>
                    <option value="class">My Class Students</option>
                    <option value="proctor">My Proctor Students</option>'''
                    
        content = content.replace(old_vis_opts, new_vis_opts)
        
        # Add targetSection field handling
        if 'targetSection: formData.targetSection' not in content:
            content = content.replace("targetYear: formData.targetYear,", "targetYear: formData.targetYear,\n      targetSection: formData.targetSection,")
            content = content.replace("targetYear: '',", "targetYear: '',\n    targetSection: '',")
            content = content.replace("submitData.append('targetYear', formData.targetYear)", "submitData.append('targetYear', formData.targetYear)\n      submitData.append('targetSection', formData.targetSection)")
            content = content.replace("submitData.append('targetYear', formData.targetYear || '')", "submitData.append('targetYear', formData.targetYear || '')\n      submitData.append('targetSection', formData.targetSection || '')")
            
            # The JSX for targetSection
            old_year_jsx = """{formData.visibility === 'year' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                  <select name="targetYear" value={formData.targetYear} onChange={handleInputChange} className="input-field">
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              )}"""
              
            new_section_jsx = old_year_jsx + """
              {formData.visibility === 'section' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Section</label>
                  <input type="text" name="targetSection" value={formData.targetSection} onChange={handleInputChange} className="input-field" placeholder="e.g., A, B, C" />
                </div>
              )}"""
              
            content = content.replace(old_year_jsx, new_section_jsx)
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
