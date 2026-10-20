# Website Builder Studio Demo

A completely standalone, modern website builder application built with **React**, **Vite**, **Tailwind CSS v4**, **React Router**, **Lucide React**, and **JSZip**.

---

## 🚀 Quick Start Instructions

This project is completely independent with its own `package.json`, styles, components, and configuration. To run it locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Then open your browser at the URL shown in terminal (typically `http://localhost:5173`).

---

## 🌟 Key Features & Complete Flow

### 1. Step 1: Project Onboarding & Website Type Selection
- **Sentence-based dropdown**: *"I want a [Type] website for [Industry/Purpose]"*.
- Supported website types:
  - **Business Website**
  - **E-commerce**
  - **Blog**
  - **Event Website**
  - **E-learning**
- **"Skip and start from scratch"** button to quickly initialize a clean layout.
- Direct template pickers to immediately jumpstart with one of the 5 pre-built industry websites.
- Light dotted background pattern (`bg-dot-pattern`).

### 2. Step 2: Business Information
- Dynamic forms collecting:
  - Business Name (with validation)
  - Industry / Sector
  - Target Audience
  - Tagline & Value Proposition
  - Detailed Description & History
  - Desired Pages multi-select chips (*Home, About Us, Services, Products, Menu, Pricing, Blog, Testimonials, FAQ, Gallery, Contact*)
- Full state preservation when navigating forward and backward.

### 3. Step 3: Color Palette Selection
- 9 curated color schemes with primary, accent, light, dark, surface, and text tokens:
  1. **Ocean Blue** (`#0284c7`) - Maritime corporate & tech
  2. **Forest Green** (`#16a34a`) - Nature, clinic & wellness
  3. **Sunset Orange** (`#ea580c`) - Creative & dining
  4. **Royal Purple** (`#7c3aed`) - High-tech & strategic advisory
  5. **Rose Pink** (`#e11d48`) - Boutique & modern lifestyle
  6. **Earth Brown** (`#854d0e`) - Artisanal & handcrafted
  7. **Minimal Gray** (`#334155`) - Architectural & minimalist
  8. **Vibrant Red** (`#dc2626`) - High energy & sports
  9. **Luxury Gold** (`#b45309`) - Champagne & fine dining
- **Instant Reactive Preview**: The mini preview card updates in real time as swatches are clicked.

### 4. Step 4: Website Layout Style
- 6 structural layouts with wireframe previews and typography pairings:
  - **Modern & Clean** (*Plus Jakarta Sans*)
  - **Premium & Luxury** (*Playfair Display*)
  - **Creative & Image Focused** (*Outfit*)
  - **E-commerce Style** (*Inter*)
  - **Portfolio Style** (*Space Grotesk*)
  - **Corporate Style** (*DM Sans*)

### 5. Step 5: Full Template Preview
- Renders the generated website with chosen content, colors, and layout.
- **Interactive Responsive Device Switcher**:
  - **Desktop** (100% full fluid width)
  - **Tablet** (768px with realistic bezel)
  - **Mobile** (390px with camera notch & status bar)

### 6. Step 6: Customize Website (Studio Editor)
- Dedicated split-view editor:
  - **Content & Text Panel**: Edit title, tagline, description, phone, email, address, and operating hours.
  - **Hero & Media Panel**: Browse a curated high-resolution Unsplash gallery or paste custom URLs.
  - **Design & Typography Panel**: Change palettes, layouts, and font families.
  - **Sections Manager**: Instant toggle eye icons to show/hide individual sections (*Hero, Stats, Features, Showcase, Testimonials, FAQ, Contact, Footer*).
  - **Reset to Template**: Restore default configurations anytime.

### 7. Step 7: Live Website Preview
- Dedicated route (`/preview`) rendering the site as a full-screen, real responsive page.
- Demo preview banner at top with quick action tools.
- Working navigation anchors with smooth scrolling.
- Functional interactive components:
  - **E-commerce Shopping Bag**: Live quantity controls, free shipping meter, discount codes (`SAVE20`), and checkout simulation with confetti.
  - **Table Reservation & Clinic Booking**: Functional date/time pickers with instant confirmation dialogs.
  - **Inquiry Contact Form**: Submissions are preserved in your local lead inbox.

### 8. Step 8: Final Actions
- **Save Configuration**: Stores custom sites into local storage.
- **My Saved Websites & Leads Library**: Drawer to load, preview, or delete saved designs, and view submitted client leads.
- **Export ZIP**: Generates a self-contained static website (`index.html`, `styles.css`, `script.js`, `README.md`) ready for hosting on Netlify, Vercel, or GitHub Pages.
- **Submit Sample Client Enquiry**: Realistic client simulation modal.
- **Start New Website**: Reset wizard.

---

## 🎨 Five Pre-Built Complete Industry Templates

| # | Industry | Template Name | Layout | Color Scheme | Special Features |
|---|----------|---------------|--------|--------------|------------------|
| 1 | **Travel & Tourism** | *Wanderlust Expeditions* | Creative & Image | Ocean Blue | Destination tour packages, booking widget, travel reviews |
| 2 | **E-commerce & Retail** | *LuxeAura Living* | E-commerce Style | Minimal Gray | Product catalog, cart drawer, promo codes, stock badges |
| 3 | **Restaurant & Food** | *Saffron & Sage Bistro* | Premium & Luxury | Luxury Gold | Interactive menu tabs (Starters, Mains, Desserts), Chef spotlight, table reservations |
| 4 | **Corporate Business** | *Apex Strategic Advisory* | Corporate Style | Royal Purple | Impact metrics ($4.2B+), advisory case studies, leadership team |
| 5 | **Healthcare & Clinic** | *AuraHealth Clinic* | Modern & Clean | Forest Green | 24/7 hotline, doctor directory, appointment booking modal |

---

## 📁 Project Architecture

```
website-builder-demo/
├── index.html                 # HTML shell with Google Fonts
├── package.json               # Independent dependencies & scripts
├── vite.config.js             # Vite + Tailwind v4 + Rollup code splitting
└── src/
    ├── main.jsx               # React 19 entry
    ├── App.jsx                # Router, providers, and global modals
    ├── index.css              # Tailwind v4, glassmorphism, dot pattern
    ├── context/
    │   └── BuilderContext.jsx # Global builder state, LocalStorage sync
    ├── data/
    │   ├── palettes.js        # 9 curated color palettes
    │   ├── layouts.js         # 6 layout styles
    │   ├── templates.js       # 5 complete industry websites
    │   └── sampleImages.js    # Curated high-res Unsplash imagery
    ├── utils/
    │   ├── storage.js         # LocalStorage persistence & leads
    │   └── zipExport.js       # Standalone ZIP generation (JSZip)
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx     # Claymorphism navigation bar (Logo, Templates, Library, Enquiry, Customize)
    │   │   ├── DeviceFrame.jsx# Desktop / Tablet / Mobile responsive frame
    │   │   └── Toast.jsx      # Animated feedback notifications
    │   ├── builder/
    │   │   ├── Step1Type.jsx  # Hero, sentence dropdowns, laptop/phone mockup & templates
    │   │   ├── Step2Info.jsx  # Business details & desired pages
    │   │   ├── Step3Palette.jsx # 9 color swatches & live preview
    │   │   ├── Step4Layout.jsx  # 6 layout cards
    │   │   ├── Step5Preview.jsx # Integrated template preview
    │   │   └── TemplateQuickPreviewModal.jsx # Quick template inspection modal
    │   ├── editor/
    │   │   ├── EditorSidebar.jsx # Content, media, design, & section toggles
    │   │   └── ImagePickerModal.jsx # Curated media library modal
    │   ├── rendered/
    │   │   ├── RenderedWebsite.jsx # Master dynamic website renderer
    │   │   ├── HeaderSection.jsx
    │   │   ├── HeroSection.jsx
    │   │   ├── StatsSection.jsx
    │   │   ├── FeaturesSection.jsx
    │   │   ├── ShowcaseSection.jsx
    │   │   ├── TestimonialsSection.jsx
    │   │   ├── FaqSection.jsx
    │   │   ├── ContactSection.jsx
    │   │   ├── FooterSection.jsx
    │   │   ├── CartDrawer.jsx   # E-commerce cart
    │   │   ├── BookingModal.jsx # Reservations & appointments
    │   │   └── EnquiryModal.jsx # Client enquiry simulation
    │   └── saved/
    │       └── SavedSitesModal.jsx # Library & lead inbox
    └── pages/
        ├── BuilderPage.jsx
        ├── EditorPage.jsx
        ├── LivePreviewPage.jsx
        └── TemplatesGalleryPage.jsx
```

---

## 🛠️ Testing Verification

The project compiles cleanly:
```bash
npm run build
# ✓ built in 1.16s with 0 errors
```

- **Persistence Verified**: Configuration and saved websites persist in browser `localStorage`.
- **Responsive Testing**: Verified seamlessly across 100% fluid, 768px tablet, and 390px mobile viewports.
- **Export Verified**: Standalone ZIP generation tested with full static HTML/CSS/JS package.
