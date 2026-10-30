import os
import re

# Files to explicitly rebrand
EXTENSIONS = ('.jsx', '.js', '.css', '.html', '.json', '.md')
EXCLUDE_DIRS = {'node_modules', '.git', 'dist', 'build', '.system_generated'}

# Specific text replacements (ordered carefully: longer strings first)
TEXT_REPLACEMENTS = [
    # URLs and Domains
    ('https://www.oxoo.ai', 'https://primepro.ai'),
    ('http://www.oxoo.ai', 'https://primepro.ai'),
    ('https://oxoo.ai', 'https://primepro.ai'),
    ('http://oxoo.ai', 'https://primepro.ai'),
    ('www.oxoo.ai', 'www.primepro.ai'),
    ('docs.oxoo.ai', 'docs.primepro.ai'),
    ('api.oxoo.ai', 'api.primepro.ai'),
    ('app.oxoo.ai', 'app.primepro.ai'),

    # Emails
    ('support@oxoo.ai', 'support@primepro.ai'),
    ('hello@oxoo.ai', 'hello@primepro.ai'),
    ('admin@oxoo.ai', 'admin@primepro.ai'),
    ('customer@oxoo.ai', 'customer@primepro.ai'),
    ('billing@oxoo.ai', 'billing@primepro.ai'),
    ('legal@oxoo.ai', 'legal@primepro.ai'),
    ('privacy@oxoo.ai', 'privacy@primepro.ai'),

    # Brand Taglines
    ('One Intelligent Platform. Every Business.', 'Your 24/7 Workspace Is Here.'),
    ('One Platform. Every Business Workflow.', 'Your 24/7 Workspace Is Here.'),
    ('One Platform. Infinite Possibilities.', 'Your 24/7 Workspace Is Here.'),
    ('One Platform. Every Business.', 'Your 24/7 Workspace Is Here.'),
    ('One Intelligent Platform.', 'Your 24/7 Workspace Is Here.'),

    # Powered by
    ('Powered by OXOO.ai', 'Powered by PrimePro.'),
    ('Powered by Oxoo.ai', 'Powered by PrimePro.'),
    ('Powered by OXOO', 'Powered by PrimePro.'),
    ('Powered by Oxoo', 'Powered by PrimePro.'),

    # Brand Names
    ('OXOO.ai', 'PrimePro.ai'),
    ('Oxoo.ai', 'PrimePro.ai'),
    ('oxoo.ai', 'primepro.ai'),
    ('OXOO.AI', 'PrimePro.ai'),
    ('OXOO', 'PrimePro'),
    ('Oxoo', 'PrimePro'),

    # Logo Asset references in code
    ('/oxoo-logo-horizontal-white.png', '/primepro-logo-horizontal-white.png'),
    ('/oxoo-logo-horizontal.png', '/primepro-logo-horizontal.png'),
    ('/oxoo-logo-sidebar.png', '/primepro-logo-sidebar-white.png'),
    ('/oxoo-logo-white.png', '/primepro-logo-white.png'),
    ('/oxoo-logo-symbol.png', '/primepro-icon.png'),
    ('/oxoo-icon.png', '/primepro-icon.png'),
    ('/oxoo-logo-tagline.png', '/primepro-logo.png'),
    ('/oxoo-logo-tagline-trans.png', '/primepro-logo-transparent.png'),
    ('/oxoo-logo-clean.png', '/primepro-logo-clean.png'),
    ('/oxoo-logo.png', '/primepro-logo.png'),
    ('/brand/oxoo-logo.png', '/brand/primepro-logo.png'),
    ('/brand/oxoo-logo-clean.png', '/brand/primepro-logo-clean.png'),
    ('/brand/oxoo-logo-white.png', '/brand/primepro-logo-white.png'),
]

def rebrand_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        original = content

        # Do not modify binary or base64 files
        if len(content) > 5000000:
            return 0

        # Preserve sensitive database keys or system strings if necessary
        # But replace customer-facing and UI brand strings
        for old, new in TEXT_REPLACEMENTS:
            content = content.replace(old, new)

        # Clean up any accidental double periods
        content = content.replace('Powered by PrimePro..', 'Powered by PrimePro.')
        content = content.replace('PrimePro.ai.ai', 'PrimePro.ai')
        content = content.replace('primepro.ai.ai', 'primepro.ai')
        content = content.replace('PrimeProPrimePro', 'PrimePro')

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return 1
        return 0
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 0

def run():
    target_dirs = ['frontend/src', 'frontend/public', 'backend/src']
    specific_files = [
        'frontend/index.html',
        'frontend/src/AdminDashboard.jsx',
        'frontend/src/CustomerDashboard.jsx',
        'frontend/src/components.jsx',
        'frontend/src/App.jsx',
        'frontend/src/CompanyBrandLogo.jsx',
        'frontend/src/HelpPage.jsx',
        'frontend/src/CheckoutPage.jsx',
        'frontend/src/PricingPage.jsx',
        'frontend/src/AllAppsDirectory.jsx',
        'frontend/src/AppWorkspace.jsx',
        'frontend/src/AppShowcase.jsx',
        'frontend/src/PrimeProPortal.jsx',
        'frontend/src/InfoPages.jsx',
        'frontend/src/appsData.js',
        'frontend/src/demoConfig.js',
        'frontend/src/projectsConfig.js',
        'frontend/src/globalOfficesConfig.js',
        'frontend/src/legalConfig.js',
        'frontend/src/StartNowModal.jsx',
        'frontend/src/ChooseAppsPage.jsx',
        'frontend/src/AppDemoPage.jsx',
        'frontend/src/AppDemoRequestModal.jsx',
        'frontend/src/RequestDemoPage.jsx',
        'frontend/src/DemoCelebrationLaunch.jsx',
        'frontend/src/dashboards.css',
        'frontend/src/styles.css',
        'frontend/src/checkout.css',
        'frontend/src/help.css',
        'frontend/src/pricing.css',
        'frontend/src/projects.css',
        'frontend/src/components/agent/OxooAgentWidget.jsx',
        'frontend/src/components/agent/oxoo-agent.css',
        'frontend/src/demo/WebsiteDemoViewer.jsx',
        'frontend/src/demo/LiveDemoExperience.jsx',
        'frontend/src/demo/demo.css'
    ]

    modified_count = 0
    seen_files = set()

    for sf in specific_files:
        if os.path.isfile(sf):
            p = os.path.abspath(sf)
            if p not in seen_files:
                seen_files.add(p)
                modified_count += rebrand_file(sf)

    for td in target_dirs:
        for root, dirs, files in os.walk(td):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if file.endswith(EXTENSIONS):
                    p = os.path.abspath(os.path.join(root, file))
                    if p not in seen_files:
                        seen_files.add(p)
                        modified_count += rebrand_file(os.path.join(root, file))

    print(f"Total files updated with PrimePro brand identity: {modified_count}")

if __name__ == '__main__':
    run()
