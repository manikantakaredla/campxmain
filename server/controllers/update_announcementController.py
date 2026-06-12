file = r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

notif_old = """      targetUsers = await User.find(query).select("_id");
    } else if (announcement.audience === "faculty") {"""

notif_new = """      targetUsers = await User.find(query).select("_id");
      
      // Add management of this branch
      if (announcement.targetDepartment) {
        const mgmtUsers = await User.find({
          role: { $in: ["dean", "principal", "management"] },
          $or: [
            { managedBranches: announcement.targetDepartment },
            { department: announcement.targetDepartment }
          ],
          isActive: true
        }).select("_id");
        targetUsers = [...targetUsers, ...mgmtUsers];
      }
    } else if (announcement.audience === "faculty") {"""

content = content.replace(notif_old, notif_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated announcementController.js')
