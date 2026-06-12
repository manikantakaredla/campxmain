import os

forgot_file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\auth\ForgotPassword.jsx'
with open(forgot_file, 'r', encoding='utf-8') as f:
    f_content = f.read()

f_content = f_content.replace("setUserEmail(response.email)", "setUserEmail(identifier.trim())")
f_content = f_content.replace("navigate(`/reset-password?email=${encodeURIComponent(userEmail)}`)", "navigate(`/reset-password?identifier=${encodeURIComponent(userEmail)}`)")

with open(forgot_file, 'w', encoding='utf-8') as f:
    f.write(f_content)
    
reset_file = r'c:\Users\manik\Music\campx final\campx-client\src\pages\auth\ResetPassword.jsx'
with open(reset_file, 'r', encoding='utf-8') as f:
    r_content = f.read()

r_content = r_content.replace("const email = new URLSearchParams(location.search).get('email')", "const identifier = new URLSearchParams(location.search).get('identifier')")
r_content = r_content.replace("if (!email) {", "if (!identifier) {")
r_content = r_content.replace("}, [email, navigate])", "}, [identifier, navigate])")
r_content = r_content.replace("email,", "identifier,")

with open(reset_file, 'w', encoding='utf-8') as f:
    f.write(r_content)
    
print("Updated ForgotPassword and ResetPassword components")
