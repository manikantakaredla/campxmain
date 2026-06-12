file = r'c:\Users\manik\Music\campx final\server\controllers\resourceController.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

dept_old = """    const currentUser = await User.findById(req.user.id);
    let finalTargetBranch = targetBranch || null;
    if (["faculty", "hod", "deputyhod"].includes(currentUser.role)) {
      finalTargetBranch = currentUser.department;
    }"""

dept_new = """    const currentUser = await User.findById(req.user.id);
    let finalTargetBranch = targetBranch || null;
    
    if (["faculty", "hod", "deputyhod"].includes(currentUser.role)) {
      finalTargetBranch = currentUser.department;
    } else if (["dean", "principal", "management"].includes(currentUser.role)) {
      const allowedBranches = currentUser.managedBranches && currentUser.managedBranches.length > 0 
        ? currentUser.managedBranches 
        : [currentUser.department];
      
      if (targetBranch && !allowedBranches.includes(targetBranch)) {
        return res.status(403).json({
          success: false,
          message: "You can only target your managed branches."
        });
      }
    }"""

content = content.replace(dept_old, dept_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated resourceController.js role restriction')
