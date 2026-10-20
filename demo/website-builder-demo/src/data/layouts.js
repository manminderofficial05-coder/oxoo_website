export const WEBSITE_LAYOUTS = [
  {
    id: 'modern-clean',
    name: 'Modern & Clean',
    subtitle: 'Spacious layouts, crisp typography, soft cards',
    description: 'A balanced, airy layout engineered for startups, digital platforms, and innovators who value clean whitespace and modern clarity.',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    heroStyle: 'split-hero',
    badge: 'Popular',
    features: ['Spacious Layouts', 'Crisp Typography', 'Soft Cards', 'Pill Badges']
  },
  {
    id: 'premium-luxury',
    name: 'Premium & Luxury',
    subtitle: 'Elegant typography, dark accents, refined details',
    description: 'Bespoke editorial elegance crafted for luxury hospitality, fine dining, private banking, jewelry, and couture brands.',
    fontFamily: "'Playfair Display', serif",
    heroStyle: 'centered-editorial',
    badge: 'Exclusive',
    features: ['Serif Typography', 'Gold Accents', 'Refined Details', 'Editorial Depth']
  },
  {
    id: 'creative-image',
    name: 'Creative & Image Focused',
    subtitle: 'Large images, bold visuals, immersive sections',
    description: 'An image-centric showcase built for travel expeditions, design studios, photographers, creators, and visual storytelling.',
    fontFamily: "'Outfit', sans-serif",
    heroStyle: 'full-bleed-visual',
    badge: 'Visual',
    features: ['Cinematic Visuals', 'Masonry Tiles', 'Full-Bleed Hero', 'Hover Zoom']
  },
  {
    id: 'ecommerce-style',
    name: 'E-commerce Style',
    subtitle: 'Product grids, shopping features, clear product cards',
    description: 'Optimized conversion structure designed for direct-to-consumer storefronts, artisan shops, digital drops, and curated retail.',
    fontFamily: "'Inter', sans-serif",
    heroStyle: 'promotional-split',
    badge: 'Commerce',
    features: ['Product Shelf Grid', 'Instant Cart Drawer', 'Discount Banners', 'Rating Badges']
  },
  {
    id: 'portfolio-style',
    name: 'Portfolio Style',
    subtitle: 'Project galleries, personal branding, creative layouts',
    description: 'Dynamic bento-grid layout tailored for independent creators, consulting partners, architects, and agency portfolios.',
    fontFamily: "'Space Grotesk', sans-serif",
    heroStyle: 'bento-hero',
    badge: 'Showcase',
    features: ['Bento Gallery', 'Case Studies', 'Stat Counters', 'Tech Stack Badges']
  },
  {
    id: 'corporate-style',
    name: 'Corporate Style',
    subtitle: 'Professional sections, services, statistics, and testimonials',
    description: 'Executive structure built for enterprise advisory, healthcare networks, financial institutions, and global corporate leaders.',
    fontFamily: "'DM Sans', sans-serif",
    heroStyle: 'corporate-structured',
    badge: 'Enterprise',
    features: ['Trust Indicators', 'Structured Services', 'Key Business Metrics', 'Client Logos']
  }
];

export const getLayoutById = (id) => {
  return WEBSITE_LAYOUTS.find((l) => l.id === id) || WEBSITE_LAYOUTS[0];
};
