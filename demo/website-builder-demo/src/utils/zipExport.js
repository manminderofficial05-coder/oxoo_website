import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getPaletteById } from '../data/palettes';
import { getLayoutById } from '../data/layouts';

export const exportWebsiteAsZip = async (config) => {
  const zip = new JSZip();
  const palette = getPaletteById(config.paletteId);
  const layout = getLayoutById(config.layoutId);

  const cleanName = (config.title || 'my-website')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  // 1. Generate HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title || 'My Website'} - ${config.tagline || ''}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Navigation Header -->
  <header class="site-header">
    <div class="container header-container">
      <a href="#" class="brand-logo">
        <span class="logo-mark">●</span>
        <span class="logo-text">${config.title || 'Brand'}</span>
      </a>
      <nav class="site-nav" id="siteNav">
        <a href="#about">About</a>
        <a href="#services">Features</a>
        <a href="#showcase">Highlights</a>
        <a href="#testimonials">Reviews</a>
        <a href="#contact" class="btn btn-primary btn-sm">Get in Touch</a>
      </nav>
      <button class="mobile-toggle" id="menuToggle" aria-label="Toggle menu">☰</button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container hero-container">
      <div class="hero-content">
        <span class="badge">${config.category || 'Professional Services'}</span>
        <h1 class="hero-title">${config.title || 'Welcome'}</h1>
        <p class="hero-tagline">${config.tagline || ''}</p>
        <p class="hero-description">${config.description || ''}</p>
        <div class="hero-actions">
          <a href="#contact" class="btn btn-primary">Get Started Now</a>
          <a href="#services" class="btn btn-outline">Explore More</a>
        </div>
      </div>
      <div class="hero-visual">
        <img src="${config.heroImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'}" alt="${config.title}" class="hero-img" />
      </div>
    </div>
  </section>

  <!-- Key Metrics / Stats -->
  ${config.stats && config.stats.length > 0 ? `
  <section class="stats-section">
    <div class="container stats-grid">
      ${config.stats.map(s => `
        <div class="stat-card">
          <div class="stat-value">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        </div>
      `).join('')}
    </div>
  </section>` : ''}

  <!-- Features / Services -->
  ${config.features && config.features.length > 0 ? `
  <section class="features-section" id="services">
    <div class="container">
      <div class="section-header">
        <span class="badge">What We Offer</span>
        <h2>${config.featuresTitle || 'Key Capabilities & Offerings'}</h2>
      </div>
      <div class="features-grid">
        ${config.features.map(f => `
          <div class="feature-card">
            <div class="feature-icon">✦</div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Testimonials Section -->
  ${config.testimonials && config.testimonials.length > 0 ? `
  <section class="testimonials-section" id="testimonials">
    <div class="container">
      <div class="section-header">
        <span class="badge">Client Praise</span>
        <h2>Trusted By Those Who Expect The Best</h2>
      </div>
      <div class="testimonials-grid">
        ${config.testimonials.map(t => `
          <div class="testimonial-card">
            <div class="stars">★★★★★</div>
            <p class="quote">"${t.quote}"</p>
            <div class="author-info">
              <strong>${t.author}</strong>
              <span>${t.location || ''}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  <!-- Contact & Enquiry Section -->
  <section class="contact-section" id="contact">
    <div class="container contact-container">
      <div class="contact-details">
        <span class="badge">Direct Contact</span>
        <h2>Let's Start a Conversation</h2>
        <p>Reach out directly to learn how we can bring our solutions to your goals.</p>
        <ul class="contact-list">
          <li><strong>Phone:</strong> ${config.contactInfo?.phone || '+1 (800) 555-0199'}</li>
          <li><strong>Email:</strong> ${config.contactInfo?.email || 'contact@example.com'}</li>
          <li><strong>Address:</strong> ${config.contactInfo?.address || '100 Innovation Way, Suite 400'}</li>
        </ul>
      </div>
      <form class="contact-form" id="enquiryForm">
        <h3>Send an Enquiry</h3>
        <input type="text" placeholder="Your Name" required class="form-input" id="name">
        <input type="email" placeholder="Email Address" required class="form-input" id="email">
        <textarea placeholder="Tell us about your requirements..." rows="4" required class="form-input" id="message"></textarea>
        <button type="submit" class="btn btn-primary btn-block">Submit Enquiry</button>
      </form>
    </div>
  </section>

  <!-- Footer -->
  <footer class="site-footer">
    <div class="container footer-container">
      <div class="footer-brand">
        <h3>${config.title || 'Brand'}</h3>
        <p>${config.tagline || ''}</p>
      </div>
      <div class="footer-copy">
        <p>&copy; ${new Date().getFullYear()} ${config.title || 'Brand'}. Built with Website Builder Studio.</p>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  // 2. Generate CSS
  const cssContent = `/* Generated by Website Builder Studio */
:root {
  --primary: ${palette.primary};
  --primary-light: ${palette.primaryLight};
  --primary-dark: ${palette.primaryDark};
  --accent: ${palette.accent};
  --bg: ${palette.background};
  --surface: ${palette.surface};
  --text: ${palette.text};
  --muted: ${palette.muted};
  --border: ${palette.border};
  --font-body: ${layout.fontFamily || "'Plus Jakarta Sans', sans-serif"};
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
  z-index: 100;
  padding: 1rem 0;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-mark {
  color: var(--primary);
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.site-nav a {
  text-decoration: none;
  color: var(--muted);
  font-weight: 500;
  transition: color 0.2s;
}

.site-nav a:hover {
  color: var(--primary);
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* Hero */
.hero-section {
  padding: 5rem 0;
  background: linear-gradient(180deg, var(--primary-light) 0%, var(--bg) 100%);
}

.hero-container {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
  align-items: center;
}

.badge {
  display: inline-block;
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--primary-light);
  color: var(--primary-dark);
  border-radius: 9999px;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1rem;
}

.hero-tagline {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--muted);
  margin-bottom: 2rem;
  max-width: 540px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.hero-img {
  width: 100%;
  height: 420px;
  object-fit: cover;
  border-radius: 1.5rem;
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.15);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary);
  color: #ffffff;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-sm {
  padding: 0.5rem 1.1rem;
  font-size: 0.9rem;
}

.btn-block {
  width: 100%;
}

/* Stats */
.stats-section {
  padding: 3rem 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Features */
.features-section {
  padding: 5rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-header h2 {
  font-size: 2.25rem;
  font-weight: 700;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--surface);
  padding: 2.2rem;
  border-radius: 1.25rem;
  border: 1px solid var(--border);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px -10px rgba(0,0,0,0.08);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.6rem;
}

.feature-card p {
  color: var(--muted);
  font-size: 0.95rem;
}

/* Testimonials */
.testimonials-section {
  padding: 5rem 0;
  background: var(--surface);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: var(--bg);
  padding: 2.5rem;
  border-radius: 1.25rem;
  border: 1px solid var(--border);
}

.stars {
  color: #f59e0b;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.quote {
  font-style: italic;
  margin-bottom: 1.5rem;
  color: var(--text);
  font-size: 1.05rem;
}

.author-info strong {
  display: block;
}

.author-info span {
  font-size: 0.85rem;
  color: var(--muted);
}

/* Contact */
.contact-section {
  padding: 5rem 0;
}

.contact-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.contact-list {
  list-style: none;
  margin-top: 1.5rem;
}

.contact-list li {
  margin-bottom: 0.75rem;
  color: var(--muted);
}

.contact-form {
  background: var(--surface);
  padding: 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
}

.contact-form h3 {
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  font-family: inherit;
  font-size: 0.95rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

/* Footer */
.site-footer {
  background: var(--text);
  color: #ffffff;
  padding: 3rem 0;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer-copy {
  color: #94a3b8;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 860px) {
  .hero-container,
  .contact-container {
    grid-template-columns: 1fr;
  }
  .mobile-toggle {
    display: block;
  }
  .site-nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #ffffff;
    flex-direction: column;
    padding: 1.5rem;
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  }
  .site-nav.open {
    display: flex;
  }
}
`;

  // 3. Generate JavaScript
  const jsContent = `// Interactive functionality for ${config.title}
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('siteNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        if (nav) nav.classList.remove('open');
      }
    });
  });

  // Client Enquiry Form submission
  const form = document.getElementById('enquiryForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      alert('Thank you, ' + name + '! Your message has been received.');
      form.reset();
    });
  }
});
`;

  // 4. Generate README.md
  const readmeContent = `# ${config.title || 'Generated Website'}

This standalone responsive website was generated by **Website Builder Studio**.

## Palette & Layout
- **Color Palette:** ${palette.name} (${palette.primary})
- **Layout Style:** ${layout.name}
- **Industry / Category:** ${config.category || 'General'}

## How to Run
1. Double-click \`index.html\` to view the site directly in your web browser.
2. Or serve it using any local static file server:
   \`\`\`bash
   npx serve .
   \`\`\`
3. Deploy for free by dragging and dropping this folder onto [Netlify](https://app.netlify.com/drop) or [Vercel](https://vercel.com).
`;

  // Build ZIP
  zip.file('index.html', htmlContent);
  zip.file('styles.css', cssContent);
  zip.file('script.js', jsContent);
  zip.file('README.md', readmeContent);

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${cleanName}-website-source.zip`);
  return true;
};
