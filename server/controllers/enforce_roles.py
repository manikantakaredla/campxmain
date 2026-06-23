import re

file1 = r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js'
with open(file1, 'r', encoding='utf-8') as f:
    content = f.read()

enforce_dept = """
    const currentUser = await User.findById(req.user.id);
    let finalTargetDepartment = targetDepartment || null;
    if (["faculty", "hod"].includes(currentUser.role)) {
      finalTargetDepartment = currentUser.department;
    }
"""

if 'finalTargetDepartment' not in content:
    content = content.replace('// Build announcement data', enforce_dept + '\n    // Build announcement data')
    content = content.replace('targetDepartment: targetDepartment || null,', 'targetDepartment: finalTargetDepartment,')

with open(file1, 'w', encoding='utf-8') as f:
    f.write(content)


file2 = r'c:\Users\manik\Music\campx final\server\controllers\resourceController.js'
with open(file2, 'r', encoding='utf-8') as f:
    content2 = f.read()

enforce_branch = """
    const currentUser = await User.findById(req.user.id);
    let finalTargetBranch = targetBranch || null;
    if (["faculty", "hod"].includes(currentUser.role)) {
      finalTargetBranch = currentUser.department;
    }
"""
if 'finalTargetBranch' not in content2:
    content2 = content2.replace('const resource = await Resource.create({', enforce_branch + '\n    const resource = await Resource.create({')
    content2 = content2.replace('targetBranch,\n      targetYear,', 'targetBranch: finalTargetBranch,\n      targetYear,')

with open(file2, 'w', encoding='utf-8') as f:
    f.write(content2)

print('Done enforcing role restrictions')
