import os
import re

def update_supabase_upload(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace `Date.now() + "-" + ...` with `Date.now() + "-" + require('crypto').randomBytes(4).toString('hex') + "-"`
    # Wait, usually it is `const filename = `${Date.now()}-${file.originalname}`;`
    # Let's search for `Date.now()`
    
    if "crypto.randomBytes(4).toString('hex')" not in content and "Date.now()" in content:
        # We need to make sure 'crypto' is required or just use `crypto = require('crypto');` inline.
        # It's safer to just inject it at the top if not present.
        if "require('crypto')" not in content and "require(\"crypto\")" not in content:
            content = "const crypto = require('crypto');\n" + content

        # Replace standard Date.now() + something with Date.now() + "-" + crypto.randomBytes(4).toString('hex') + "-"
        # Typical pattern: `${Date.now()}-${
        content = re.sub(r'\$\{Date\.now\(\)\}-\$\{', r'${Date.now()}-${crypto.randomBytes(4).toString(\'hex\')}-${', content)
        
        # If it's `Date.now() + "-" +`
        content = re.sub(r'Date\.now\(\)\s*\+\s*"-"', r'Date.now() + "-" + crypto.randomBytes(4).toString("hex") + "-"', content)
        
        # Another pattern: `Date.now() + file.originalname`
        content = re.sub(r'Date\.now\(\)\s*\+\s*file\.originalname', r'Date.now() + "-" + crypto.randomBytes(4).toString("hex") + "-" + file.originalname', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"No changes needed or already updated for {filepath}")

update_supabase_upload(r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js')
update_supabase_upload(r'c:\Users\manik\Music\campx final\server\controllers\resourceController.js')
update_supabase_upload(r'c:\Users\manik\Music\campx final\server\controllers\uploadController.js')
update_supabase_upload(r'c:\Users\manik\Music\campx final\server\controllers\studentController.js')
