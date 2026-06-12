file = r'c:\Users\manik\Music\campx final\server\routes\adminRoutes.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

import_str = '  createUser,\n  bulkCreateUsers,'
if 'createUser' not in content:
    content = content.replace('  deleteUser,', '  deleteUser,\n' + import_str)
    
routes_str = """
router.post("/users", authorizeRoles("admin"), createUser);
router.post("/users/bulk", authorizeRoles("admin"), csvUpload.single("file"), bulkCreateUsers);
"""
if 'router.post("/users"' not in content:
    content = content.replace('router.get("/users", authorizeRoles("admin"), getAllUsers);', 'router.get("/users", authorizeRoles("admin"), getAllUsers);\n' + routes_str)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated adminRoutes.js')
