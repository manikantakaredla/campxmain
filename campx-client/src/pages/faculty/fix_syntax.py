file1 = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\UploadResource.jsx'
with open(file1, 'r', encoding='utf-8') as f:
    content1 = f.read()

# Fix double settings
double_settings = """  const { settings } = useSettings()\n  const { settings } = useSettings()"""
single_settings = """  const { settings } = useSettings()"""
if double_settings in content1:
    content1 = content1.replace(double_settings, single_settings)
else:
    # try another format
    content1 = content1.replace("const { settings } = useSettings()\n  const { settings } = useSettings()", "const { settings } = useSettings()")

with open(file1, 'w', encoding='utf-8') as f:
    f.write(content1)

file2 = r'c:\Users\manik\Music\campx final\campx-client\src\pages\faculty\MyAnnouncements.jsx'
with open(file2, 'r', encoding='utf-8') as f:
    content2 = f.read()

# Fix double addToCalendar
double_add = """        addToCalendar: false,\n        attachment: null,\n        addToCalendar: false"""
single_add = """        addToCalendar: false,\n        attachment: null"""
if double_add in content2:
    content2 = content2.replace(double_add, single_add)
else:
    # try regex replacement
    import re
    content2 = re.sub(r'addToCalendar:\s*false,\s*attachment:\s*null,\s*addToCalendar:\s*false', r'addToCalendar: false,\n        attachment: null', content2)

with open(file2, 'w', encoding='utf-8') as f:
    f.write(content2)

print('Fixed syntax errors')
