with open('frontend/src/AppWorkspace.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "<img src=\"/primepro-logo-white.png\" alt=\"PrimePro\" style={{ height: '11px', filter: 'invert(1)' }} />",
    "<img src=\"/primepro-logo.png\" alt=\"PrimePro\" style={{ height: '14px', width: 'auto' }} />"
)
with open('frontend/src/AppWorkspace.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated AppWorkspace.jsx logo!')
