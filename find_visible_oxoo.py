import os, re

visible_matches = []
for root, dirs, files in os.walk('frontend/src'):
    for f in files:
        if f.endswith(('.jsx', '.html')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fl:
                lines = fl.readlines()
            for i, l in enumerate(lines):
                clean_l = re.sub(r'className="[^"]*"', '', l)
                clean_l = re.sub(r"className='[^']*'", '', clean_l)
                clean_l = re.sub(r'className=\{`[^`]*`\}', '', clean_l)
                if re.search(r'\b(oxoo|oxoo\.ai)\b', clean_l, re.I):
                    if not any(ign in clean_l for ign in ['oxoo_auth', 'oxoo_token', 'oxoo_user', 'oxoo_admin', 'oxoo_region', 'oxoo_demo', 'oxoo_selected', 'oxoo-finance', 'oxoo_last', 'oxoo_purchased', 'oxoo123', 'oxoo_order', 'oxoo_session', 'oxoo_country']):
                        visible_matches.append((path, i+1, l.strip()[:100]))

print(f"Visible occurrences found: {len(visible_matches)}")
for p, lno, txt in visible_matches:
    print(f"{p}:{lno} -> {txt}")
