import os

file = 'MyAnnouncements.jsx'
if os.path.exists(file):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Add to state
    content = content.replace("contacts: [],", "contacts: [],\n    addToCalendar: false,")
    content = content.replace("attachment: null", "attachment: null,\n      addToCalendar: false")
    
    # Checkbox handler
    checkbox_handler = """  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked })
  }"""
    if 'handleCheckboxChange' not in content:
        content = content.replace("const handleInputChange", checkbox_handler + "\n\n  const handleInputChange")
        
    # FormData append
    content = content.replace("submitData.append('contacts', JSON.stringify(formData.contacts))", "submitData.append('contacts', JSON.stringify(formData.contacts))\n      submitData.append('addToCalendar', formData.addToCalendar)")
    
    # UI checkbox
    checkbox_ui = """
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" name="addToCalendar" checked={formData.addToCalendar} onChange={handleCheckboxChange} id="addToCalendar" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="addToCalendar" className="text-sm font-medium text-gray-700">Add to Calendar Event</label>
            </div>
"""
    if 'addToCalendar' not in content[content.find('<form'):]:
        content = content.replace("<div>\n              <label className=\"block text-sm font-medium text-gray-700 mb-1\">Attachment</label>", checkbox_ui + "\n            <div>\n              <label className=\"block text-sm font-medium text-gray-700 mb-1\">Attachment</label>")
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
