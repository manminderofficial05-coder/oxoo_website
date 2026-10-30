with open('frontend/src/CustomerDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "<img src=\"/primepro-logo-white.png\" alt=\"PrimePro\" style={{ height: '9px', opacity: 0.85 }} />",
    "<img src=\"/primepro-logo-white.png\" alt=\"PrimePro\" style={{ height: '14px', width: 'auto', opacity: 0.95 }} />"
)

text = text.replace(
    "<span>Dashboard</span>",
    "<span>My PrimePro Workspace</span>"
)

text = text.replace(
    "<span>Billing & Subscriptions</span>",
    "<span>My Subscription & Invoices</span>"
)

text = text.replace(
    "<span>Team Management</span>",
    "<span>My Team</span>"
)

text = text.replace(
    "<span>Support</span>",
    "<span>My Support Tickets</span>"
)

text = text.replace(
    "<span>Settings</span>",
    "<span>Account Settings</span>"
)

text = text.replace(
    "Manage your business with PrimePro. Access all your purchased apps in one place.",
    "Welcome to PrimePro. Your 24/7 Workspace Is Here."
)

with open('frontend/src/CustomerDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Successfully updated CustomerDashboard.jsx')

# Update AdminDashboard.jsx
with open('frontend/src/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    adm = f.read()

adm = adm.replace(
    ">Admin Dashboard<",
    ">PrimePro Control Center & Admin Dashboard<"
)
adm = adm.replace(
    ">Customers<",
    ">PrimePro Customer Management<"
)
adm = adm.replace(
    ">Subscriptions<",
    ">PrimePro Billing & Subscriptions<"
)
adm = adm.replace(
    "<span>Analytics</span>",
    "<span>PrimePro Reports & Analytics</span>"
)
adm = adm.replace(
    "<span>Support</span>",
    "<span>PrimePro Support Center</span>"
)

with open('frontend/src/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(adm)

print('Successfully updated AdminDashboard.jsx')
