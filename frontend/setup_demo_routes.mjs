import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, 'public');

// 1. PATCH AI-DEMO AUTH GATES & SESSION VERIFICATION
const aiChunksDir = path.join(publicDir, 'ai-demo/_next/static/chunks');

// A) Patch layout chunk to disable DemoGate blocker & redirect completely
const layoutChunkPath = path.join(aiChunksDir, 'app/dashboard/layout-318123991376069f.js');
if (fs.existsSync(layoutChunkPath)) {
  let content = fs.readFileSync(layoutChunkPath, 'utf8');
  // Replace DemoGate function body so it directly renders children without checking auth or redirecting
  const demoGateRegex = /21530:\s*\((?:[a-zA-Z0-9_,\s]+)\)\s*=>\s*\{"use strict";[\s\S]*?DemoGate:\s*\(\)\s*=>\s*([a-zA-Z0-9_]+)[\s\S]*?function\s+\1\s*\([a-zA-Z0-9_]+\)\s*\{[\s\S]*?minHeight:\s*"100vh",background:\s*"#0a0a0f"\}\)\)\}\}/;
  if (demoGateRegex.test(content)) {
    content = content.replace(demoGateRegex, (match, fnName) => {
      return `21530:(e,t,n)=>{"use strict";n.d(t,{DemoGate:()=>s});var a=n(95155);function s(e){return (0,a.jsx)(a.Fragment,{children:e.children})}}`;
    });
    fs.writeFileSync(layoutChunkPath, content, 'utf8');
    console.log('✓ Successfully patched DemoGate in layout chunk to allow immediate demo access');
  } else if (!content.includes('children:e.children')) {
    // Fallback direct string replacement
    const targetPattern = 'window.location.replace("/sign-in?redirect=';
    if (content.includes(targetPattern)) {
      content = content.replace(/window\.location\.replace\("\/sign-in\?redirect=.*?\)/g, 's(!0)');
      fs.writeFileSync(layoutChunkPath, content, 'utf8');
      console.log('✓ Replaced window.location.replace in layout chunk');
    }
  }
}

// B) Patch 238 chunk module 93308 to always return true for isAuthenticated
const chunk238Path = path.join(aiChunksDir, '238-9bee99d52d0d0284.js');
if (fs.existsSync(chunk238Path)) {
  let content = fs.readFileSync(chunk238Path, 'utf8');
  const oldCheck = 'o=()=>{try{return"1"===window.localStorage.getItem(s)}catch(e){return!1}}';
  if (content.includes(oldCheck)) {
    content = content.replace(oldCheck, 'o=()=>!0');
    fs.writeFileSync(chunk238Path, content, 'utf8');
    console.log('✓ Patched module 93308 in chunk 238 to always authenticate session');
  }
}

// C) Patch sign-in & demo page chunks
const demoPageChunk = path.join(aiChunksDir, 'app/demo/page-2909ea2a4bffc622.js');
if (fs.existsSync(demoPageChunk)) {
  let content = fs.readFileSync(demoPageChunk, 'utf8');
  const oldCheck = 's=()=>{try{return"1"===window.localStorage.getItem(r)}catch(e){return!1}}';
  if (content.includes(oldCheck)) {
    content = content.replace(oldCheck, 's=()=>!0');
    fs.writeFileSync(demoPageChunk, content, 'utf8');
  }
}

const signinPageChunk = path.join(aiChunksDir, 'app/(auth)/sign-in/page-44245778bef0712f.js');
if (fs.existsSync(signinPageChunk)) {
  let content = fs.readFileSync(signinPageChunk, 'utf8');
  const oldCheck = 'n=()=>{try{return"1"===window.localStorage.getItem(a)}catch(e){return!1}}';
  if (content.includes(oldCheck)) {
    content = content.replace(oldCheck, 'n=()=>!0');
    fs.writeFileSync(signinPageChunk, content, 'utf8');
  }
}

// D) Patch DemoBootstrap in layout chunk to ensure localStorage is always populated
const appLayoutChunk = path.join(aiChunksDir, 'app/layout-550da851f8a2126f.js');
if (fs.existsSync(appLayoutChunk)) {
  let content = fs.readFileSync(appLayoutChunk, 'utf8');
  if (!content.includes("hospital-cart-demo:session")) {
    content = content.replace(
      'function s(){return null}',
      'function s(){try{localStorage.setItem("hospital-cart-demo:session","1")}catch(e){}return null}'
    );
    fs.writeFileSync(appLayoutChunk, content, 'utf8');
    console.log('✓ Injected auto-session into DemoBootstrap layout');
  }
}

// 2. INJECT AUTO-SESSION SCRIPT IN ALL AI-DEMO HTML FILES
const sessionScript = `<script>try{localStorage.setItem('hospital-cart-demo:session','1');}catch(e){}</script>`;

function injectSessionScriptIntoHtml(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('hospital-cart-demo:session')) {
    html = html.replace(/<head>/i, `<head>${sessionScript}`);
    fs.writeFileSync(filePath, html, 'utf8');
  }
}

// 3. AI DEMO dashboard pages
const aiDashboardDir = path.join(publicDir, 'ai-demo/dashboard');
if (fs.existsSync(aiDashboardDir)) {
  const files = fs.readdirSync(aiDashboardDir);
  for (const f of files) {
    if (f.endsWith('.html') && f !== 'index.html') {
      const name = path.basename(f, '.html');
      const dir = path.join(aiDashboardDir, name);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const destPath = path.join(dir, 'index.html');
      fs.copyFileSync(path.join(aiDashboardDir, f), destPath);
      injectSessionScriptIntoHtml(destPath);
    }
  }
  // Copy overview.html as dashboard/index.html
  if (fs.existsSync(path.join(aiDashboardDir, 'overview.html'))) {
    injectSessionScriptIntoHtml(path.join(aiDashboardDir, 'overview.html'));
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

// 4. AI DEMO root pages
const aiRoot = path.join(publicDir, 'ai-demo');
['demo', 'landing', 'sign-in', 'sign-up'].forEach((page) => {
  const src = path.join(aiRoot, `${page}.html`);
  if (fs.existsSync(src)) {
    injectSessionScriptIntoHtml(src);
    const dir = path.join(aiRoot, page);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const dest = path.join(dir, 'index.html');
    fs.copyFileSync(src, dest);
    injectSessionScriptIntoHtml(dest);
  }
});

// Also inject into any other HTML files in ai-demo
if (fs.existsSync(aiRoot)) {
  const allFiles = fs.readdirSync(aiRoot);
  for (const f of allFiles) {
    if (f.endsWith('.html')) {
      injectSessionScriptIntoHtml(path.join(aiRoot, f));
    }
  }
}

// 5. Ensure missing public root assets (like logo.png & icon.png) are available
if (fs.existsSync(path.join(aiRoot, 'logo.png')) && !fs.existsSync(path.join(publicDir, 'logo.png'))) {
  fs.copyFileSync(path.join(aiRoot, 'logo.png'), path.join(publicDir, 'logo.png'));
}
if (fs.existsSync(path.join(aiRoot, 'icon.png')) && !fs.existsSync(path.join(publicDir, 'icon.png'))) {
  fs.copyFileSync(path.join(aiRoot, 'icon.png'), path.join(publicDir, 'icon.png'));
}
if (fs.existsSync(path.join(aiRoot, 'icon-512.png')) && !fs.existsSync(path.join(publicDir, 'icon-512.png'))) {
  fs.copyFileSync(path.join(aiRoot, 'icon-512.png'), path.join(publicDir, 'icon-512.png'));
}

// 6. SALES DEMO pages
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

console.log('SUCCESS: All static clean-URL demo directories and session patches applied!');
