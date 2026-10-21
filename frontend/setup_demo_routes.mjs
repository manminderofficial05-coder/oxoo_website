import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, 'public');

// 1. AI DEMO dashboard pages
const aiDashboardDir = path.join(publicDir, 'ai-demo/dashboard');
if (fs.existsSync(aiDashboardDir)) {
  const files = fs.readdirSync(aiDashboardDir);
  for (const f of files) {
    if (f.endsWith('.html') && f !== 'index.html') {
      const name = path.basename(f, '.html');
      const dir = path.join(aiDashboardDir, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(path.join(aiDashboardDir, f), path.join(dir, 'index.html'));
    }
  }
  // Copy overview.html as dashboard/index.html
  if (fs.existsSync(path.join(aiDashboardDir, 'overview.html'))) {
    fs.copyFileSync(
      path.join(aiDashboardDir, 'overview.html'),
      path.join(aiDashboardDir, 'index.html')
    );
    // Also copy to ai-demo/index.html so opening /ai-demo directly shows the overview!
    fs.copyFileSync(
      path.join(aiDashboardDir, 'overview.html'),
      path.join(publicDir, 'ai-demo/index.html')
    );
  }
}

// 2. AI DEMO root pages
const aiRoot = path.join(publicDir, 'ai-demo');
['demo', 'landing', 'sign-in', 'sign-up'].forEach((page) => {
  const src = path.join(aiRoot, `${page}.html`);
  if (fs.existsSync(src)) {
    const dir = path.join(aiRoot, page);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, path.join(dir, 'index.html'));
  }
});

// 3. SALES DEMO pages
const salesRoot = path.join(publicDir, 'sales-demo');
['dashboard', 'dialer', 'leads'].forEach((page) => {
  const src = path.join(salesRoot, `${page}.html`);
  if (fs.existsSync(src)) {
    const dir = path.join(salesRoot, page);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, path.join(dir, 'index.html'));
  }
});
if (fs.existsSync(path.join(salesRoot, 'dashboard.html'))) {
  fs.copyFileSync(
    path.join(salesRoot, 'dashboard.html'),
    path.join(salesRoot, 'index.html')
  );
}

console.log('SUCCESS: All static clean-URL demo directories created!');
