import os

files = [
    r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js',
    r'c:\Users\manik\Music\campx final\server\controllers\resourceController.js',
    r'c:\Users\manik\Music\campx final\server\controllers\uploadController.js',
    r'c:\Users\manik\Music\campx final\server\controllers\studentController.js'
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the incorrectly escaped string
        new_content = content.replace(r"toString(\'hex\')", "toString('hex')")
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed syntax error in {filepath}")
