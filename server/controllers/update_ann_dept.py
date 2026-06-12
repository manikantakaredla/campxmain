file = r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

dept_old = """    const currentUser = await User.findById(req.user.id);
    let finalTargetDepartment = targetDepartment || null;
    if (["faculty", "hod", "deputyhod"].includes(currentUser.role)) {
      finalTargetDepartment = currentUser.department;
    }"""

dept_new = """    const currentUser = await User.findById(req.user.id);
    let finalTargetDepartment = targetDepartment || null;
    
    if (["faculty", "hod", "deputyhod"].includes(currentUser.role)) {
      finalTargetDepartment = currentUser.department;
    } else if (["dean", "principal", "management"].includes(currentUser.role)) {
      const allowedBranches = currentUser.managedBranches && currentUser.managedBranches.length > 0 
        ? currentUser.managedBranches 
        : [currentUser.department];
      
      if (targetDepartment && !allowedBranches.includes(targetDepartment)) {
        return res.status(403).json({
          success: false,
          message: "You can only target your managed branches."
        });
      }
      // If no target department selected, it will target all allowed branches (handled in query/notification)
    }"""

content = content.replace(dept_old, dept_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated announcementController.js role restriction')
