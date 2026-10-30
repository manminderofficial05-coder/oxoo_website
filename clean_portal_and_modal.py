with open('frontend/src/PrimeProPortal.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('manage oxoo, track payments', 'manage finances, track payments')
text = text.replace('simplify your oxoo process', 'simplify your business process')
text = text.replace("'abcd.oxoo'", "'abcd.primepro.ai'")
text = text.replace(".endsWith('.oxoo') ? rawCompany : `${rawCompany}.oxoo`", ".endsWith('.primepro.ai') ? rawCompany : `${rawCompany}.primepro.ai`")

with open('frontend/src/PrimeProPortal.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('frontend/src/StartNowModal.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('company=demo.oxoo', 'company=demo.primepro.ai')
with open('frontend/src/StartNowModal.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Cleaned PrimeProPortal.jsx and StartNowModal.jsx!')
