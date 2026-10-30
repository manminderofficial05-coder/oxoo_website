with open('frontend/src/authStorage.js', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "sessionStorage.getItem('oxoo_token')",
    "(sessionStorage.getItem('primepro_token') || sessionStorage.getItem('oxoo_token'))"
)
text = text.replace(
    "sessionStorage.getItem('oxoo_user')",
    "(sessionStorage.getItem('primepro_user') || sessionStorage.getItem('oxoo_user'))"
)
text = text.replace(
    "sessionStorage.getItem('oxoo_admin_token')",
    "(sessionStorage.getItem('primepro_admin_token') || sessionStorage.getItem('oxoo_admin_token'))"
)
text = text.replace(
    "sessionStorage.getItem('oxoo_admin_user')",
    "(sessionStorage.getItem('primepro_admin_user') || sessionStorage.getItem('oxoo_admin_user'))"
)

text = text.replace(
    "sessionStorage.setItem('oxoo_token', token);",
    "sessionStorage.setItem('primepro_token', token); sessionStorage.setItem('oxoo_token', token);"
)
text = text.replace(
    "sessionStorage.setItem('oxoo_user', str);",
    "sessionStorage.setItem('primepro_user', str); sessionStorage.setItem('oxoo_user', str);"
)
text = text.replace(
    "sessionStorage.setItem('oxoo_admin_token', token);",
    "sessionStorage.setItem('primepro_admin_token', token); sessionStorage.setItem('oxoo_admin_token', token);"
)
text = text.replace(
    "sessionStorage.setItem('oxoo_admin_user', str);",
    "sessionStorage.setItem('primepro_admin_user', str); sessionStorage.setItem('oxoo_admin_user', str);"
)

with open('frontend/src/authStorage.js', 'w', encoding='utf-8') as f:
    f.write(text)

print('Successfully patched authStorage.js')
