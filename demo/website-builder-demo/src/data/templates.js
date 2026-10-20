import { SAMPLE_IMAGES } from './sampleImages';

export const WEBSITE_TEMPLATES = [
  {
    id: 'travel-tourism',
    slug: 'travel-and-tourism',
    category: 'Travel & Tourism',
    type: 'Business Website',
    title: 'Wanderlust Expeditions',
    tagline: 'Discover Extraordinary Journeys Across The Globe',
    description: 'Bespoke eco-luxury expeditions, immersive cultural retreats, and private small-group adventures crafted for curious travelers.',
    paletteId: 'ocean-blue',
    layoutId: 'creative-image',
    targetAudience: 'Adventure seekers, couples, luxury globetrotters, and cultural enthusiasts',
    desiredPages: ['Home', 'Destinations', 'Expeditions', 'Custom Itinerary', 'Reviews', 'Contact'],
    heroImage: SAMPLE_IMAGES.travel.hero,
    stats: [
      { label: 'Destinations Worldwide', value: '48+' },
      { label: 'Satisfied Explorers', value: '18,500+' },
      { label: 'Expedition Guides', value: '120+' },
      { label: '5-Star Trip Rating', value: '99.2%' }
    ],
    featuresTitle: 'Why Explore With Wanderlust',
    features: [
      {
        icon: 'Compass',
        title: 'Bespoke Curated Itineraries',
        desc: 'Every voyage is tailored to your personal travel tempo, passions, and culinary tastes.'
      },
      {
        icon: 'ShieldCheck',
        title: '100% Carbon-Neutral Travel',
        desc: 'We preserve every trail and community we visit by matching all flights with certified offset credits.'
      },
      {
        icon: 'Users',
        title: 'Local Master Guides',
        desc: 'Explore hidden sanctuaries led by resident historians, naturalists, and native storytellers.'
      },
      {
        icon: 'Headphones',
        title: '24/7 Global Concierge',
        desc: 'Direct hotline to our private travel coordinators ready to assist before, during, and after your trip.'
      }
    ],
    destinations: SAMPLE_IMAGES.travel.destinations,
    testimonials: [
      {
        quote: "The Kyoto Zen experience was life-changing. Everything from the private temple teas to the ryokan was immaculate.",
        author: "Victoria Sterling",
        location: "London, UK",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
      },
      {
        quote: "Hiking the Swiss Alps with Wanderlust gave our family memories we will cherish forever. Unmatched safety and elegance.",
        author: "Julian & Clara Rossi",
        location: "Geneva, Switzerland",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
      }
    ],
    faqs: [
      {
        q: "How far in advance should I reserve an expedition?",
        a: "We recommend booking bespoke private itineraries 3 to 6 months in advance to ensure premier boutique accommodations and permits."
      },
      {
        q: "Can itineraries be customized for dietary requirements?",
        a: "Yes, our culinary concierges coordinate directly with local chefs to accommodate plant-based, gluten-free, or specific dietary preferences."
      },
      {
        q: "What is your cancellation and flexible rescheduling policy?",
        a: "We offer flexible date transfers up to 30 days prior to departure with zero penalty fees on all standard packages."
      }
    ],
    contactInfo: {
      phone: "+1 (800) 492-6337",
      email: "concierge@wanderlust-expeditions.com",
      address: "88 Ocean Boulevard, Suite 500, Santa Monica, CA 90401",
      hours: "Mon - Sat: 8:00 AM - 7:00 PM PST"
    },
    sectionsVisible: {
      hero: true,
      stats: true,
      features: true,
      showcase: true,
      testimonials: true,
      faq: true,
      cta: true,
      contact: true,
      footer: true
    }
  },

  {
    id: 'ecommerce-retail',
    slug: 'ecommerce',
    category: 'E-commerce & Retail',
    type: 'E-commerce',
    title: 'LuxeAura Living',
    tagline: 'Curated Essentials Designed for Conscious Living',
    description: 'Handcrafted stoneware, artisanal home lighting, and organic materials engineered to bring harmony and quiet luxury to your living space.',
    paletteId: 'minimal-gray',
    layoutId: 'ecommerce-style',
    targetAudience: 'Design lovers, interior decorators, conscious consumers, and modern urban homeowners',
    desiredPages: ['Home', 'Shop All', 'Living', 'Lighting', 'Our Philosophy', 'Cart', 'Track Order'],
    heroImage: SAMPLE_IMAGES.ecommerce.hero,
    stats: [
      { label: 'Artisan Partners', value: '34' },
      { label: 'Organic Materials', value: '100%' },
      { label: 'Orders Delivered', value: '42,000+' },
      { label: 'Customer Satisfaction', value: '4.9/5' }
    ],
    featuresTitle: 'The LuxeAura Standard',
    features: [
      {
        icon: 'Sparkles',
        title: 'Heirloom Craftsmanship',
        desc: 'Each piece is hand-finished by master craftspeople using renewable timber, brass, and stoneware.'
      },
      {
        icon: 'Truck',
        title: 'Complimentary Express Shipping',
        desc: 'Enjoy carbon-neutral delivery on all orders over $90 within 2 to 4 business days.'
      },
      {
        icon: 'RotateCcw',
        title: '30-Day In-Home Trial',
        desc: 'Experience our goods in your home. If it does not spark joy, returns are easy and free.'
      },
      {
        icon: 'ShieldCheck',
        title: '10-Year Craft Warranty',
        desc: 'Built to endure lifetimes, guaranteed against structural defects and material failures.'
      }
    ],
    products: SAMPLE_IMAGES.ecommerce.products,
    testimonials: [
      {
        quote: "The ceramic pour-over set has turned my morning ritual into a work of art. The quality is breathtaking.",
        author: "Marcus Aurelius Lin",
        location: "San Francisco, CA",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
      },
      {
        quote: "The Nordic oak chair arrived packaged like a museum piece. Sturdy, elegant, and effortlessly comfortable.",
        author: "Camille Dubois",
        location: "Montreal, Canada",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
      }
    ],
    faqs: [
      {
        q: "What materials do you use?",
        a: "We only use FSC-certified hardwoods, nontoxic organic linen, pure lead-free brass, and natural clay ceramic glazes."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes! We ship to over 50 countries worldwide with duties prepaid at checkout so there are never surprise fees."
      },
      {
        q: "How do I care for stoneware and wood items?",
        a: "Each piece comes with a customized care booklet. Wood items benefit from occasional food-safe wax, and stoneware is dishwasher safe."
      }
    ],
    contactInfo: {
      phone: "+1 (888) 723-5893",
      email: "support@luxeauraliving.com",
      address: '742 Design District, Soho, New York, NY 10012',
      hours: "Mon - Fri: 9:00 AM - 6:00 PM EST"
    },
    sectionsVisible: {
      hero: true,
      stats: true,
      features: true,
      showcase: true,
      testimonials: true,
      faq: true,
      cta: true,
      contact: true,
      footer: true
    }
  },

  {
    id: 'restaurant-food',
    slug: 'restaurant-and-food',
    category: 'Restaurant and Food',
    type: 'Business Website',
    title: 'Saffron & Sage Bistro',
    tagline: 'Farm-To-Table Culinary Artistry & Timeless Dining',
    description: 'An intimate culinary haven marrying classical French technique with biodynamic micro-farms, rare vintage cellars, and seasonal tasting menus.',
    paletteId: 'luxury-gold',
    layoutId: 'premium-luxury',
    targetAudience: 'Fine dining connoisseurs, wine enthusiasts, anniversary celebrations, and corporate hosts',
    desiredPages: ['Home', 'Menu', 'The Story', 'Private Dining', 'Chef Profile', 'Reservations', 'Location'],
    heroImage: SAMPLE_IMAGES.restaurant.hero,
    stats: [
      { label: 'Local Farm Partners', value: '28' },
      { label: 'Wine Cellar Selections', value: '450+' },
      { label: 'Culinary Awards', value: '14' },
      { label: 'Michelin Guide Listed', value: '2024' }
    ],
    featuresTitle: 'The Gastronomic Experience',
    features: [
      {
        icon: 'Utensils',
        title: 'Hyper-Local Seasonal Harvest',
        desc: 'Our menu evolves every fortnight based on morning harvests from our partner coastal biodynamic growers.'
      },
      {
        icon: 'Wine',
        title: 'Sommelier Curated Cellar',
        desc: 'Rare vintages, natural biodynamic pours, and artisanal cocktail pairings crafted by Master Sommelier.'
      },
      {
        icon: 'Flame',
        title: 'Open-Hearth Oak Wood Fire',
        desc: 'Primal wood-fire roasting techniques that unlock deep caramelization and unforgettable aromas.'
      },
      {
        icon: 'Sparkles',
        title: 'Private Salon Dining',
        desc: 'Exclusive private dining rooms available for bespoke 8-course chef tastings and private celebrations.'
      }
    ],
    dishes: SAMPLE_IMAGES.restaurant.dishes,
    chef: SAMPLE_IMAGES.restaurant.chef,
    testimonials: [
      {
        quote: "The A5 Wagyu Ribeye paired with the 2016 Barolo was one of the finest meals I have experienced anywhere in North America.",
        author: "Chef Antoine Moreau",
        location: "Culinary Reviewer",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80"
      },
      {
        quote: "Flawless hospitality. The ambiance is warm, candlelit, and genuinely memorable for our 10th anniversary.",
        author: "Eleanor & James Sterling",
        location: "Boston, MA",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80"
      }
    ],
    faqs: [
      {
        q: "What is your dress code?",
        a: "We welcome elegant casual to cocktail attire. We request no athletic wear or beachwear."
      },
      {
        q: "Do you accommodate vegan or gluten allergies?",
        a: "Yes. Chef Laurent prepares a complete dedicated 5-course vegan tasting menu with 24 hours advance notice."
      },
      {
        q: "Can I host a private event?",
        a: "Yes, our private mezzanine accommodates up to 28 guests, and full restaurant buyouts are available."
      }
    ],
    contactInfo: {
      phone: "+1 (212) 555-8390",
      email: "reservations@saffronandsage.com",
      address: "410 Hudson Street, West Village, New York, NY 10014",
      hours: "Dinner: Tue - Sun: 5:00 PM - 11:00 PM | Weekend Brunch: 10:30 AM - 2:30 PM"
    },
    sectionsVisible: {
      hero: true,
      stats: true,
      features: true,
      showcase: true,
      testimonials: true,
      faq: true,
      cta: true,
      contact: true,
      footer: true
    }
  },

  {
    id: 'corporate-business',
    slug: 'corporate-business',
    category: 'Corporate Business',
    type: 'Business Website',
    title: 'Apex Strategic Advisory',
    tagline: 'Empowering Next-Generation Enterprises with Strategic Precision',
    description: 'We partner with Fortune 500 boards and visionary founders to navigate M&A, cross-border digital transformation, and sustainable capital structuring.',
    paletteId: 'royal-purple',
    layoutId: 'corporate-style',
    targetAudience: 'Enterprise executives, private equity funds, board directors, and tech scaleups',
    desiredPages: ['Home', 'Advisory Services', 'Case Studies', 'Leadership Team', 'Insights', 'Schedule Consultation'],
    heroImage: SAMPLE_IMAGES.corporate.hero,
    stats: [
      { label: 'Transactions Advised', value: '$4.2B+' },
      { label: 'Global Offices', value: '7' },
      { label: 'Client Retention Rate', value: '98.6%' },
      { label: 'Industry Recognition', value: 'Top 10 Global' }
    ],
    featuresTitle: 'Strategic Advisory Disciplines',
    features: [
      {
        icon: 'TrendingUp',
        title: 'Mergers & Strategic Acquisitions',
        desc: 'End-to-end target valuation, deal structuring, due diligence, and cultural integration roadmap.'
      },
      {
        icon: 'Cpu',
        title: 'Enterprise AI & Cloud Transformation',
        desc: 'Modernizing legacy architectures into scalable, high-throughput autonomous intelligence infrastructure.'
      },
      {
        icon: 'Layers',
        title: 'Capital Optimization & ESG',
        desc: 'Connecting institutional balance sheets to sustainable high-yield green bond and equity financing.'
      },
      {
        icon: 'Shield',
        title: 'Regulatory & Risk Mitigation',
        desc: 'Navigating multi-jurisdiction compliance across SEC, EU GDPR, and financial governance standards.'
      }
    ],
    caseStudies: SAMPLE_IMAGES.corporate.caseStudies,
    team: SAMPLE_IMAGES.corporate.team,
    testimonials: [
      {
        quote: "Apex transformed our board’s approach to international expansion. Their analytical rigor and deep bench of talent are unmatched.",
        author: "Harrison Wells",
        location: "CEO, Vanguard Technologies",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
      },
      {
        quote: "They delivered actionable strategies that saved our organization over $40M during our cross-border merger.",
        author: "Samantha Greene",
        location: "CFO, Horizon Energy",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80"
      }
    ],
    faqs: [
      {
        q: "What typical engagement models do you support?",
        a: "We offer retained advisory, sprint-based transaction advisory, and dedicated interim executive consulting."
      },
      {
        q: "How do you safeguard client confidentiality?",
        a: "All engagements operate under bank-grade NDAs with dedicated air-gapped data rooms and strict partner oversight."
      },
      {
        q: "How quickly can your advisory team initiate an audit?",
        a: "Our rapid-deployment taskforce can mobilize on-site or virtually within 48 to 72 business hours."
      }
    ],
    contactInfo: {
      phone: "+1 (212) 840-7700",
      email: "inquiries@apexstrategic.com",
      address: "100 Park Avenue, 34th Floor, New York, NY 10017",
      hours: "Mon - Fri: 8:00 AM - 7:00 PM EST"
    },
    sectionsVisible: {
      hero: true,
      stats: true,
      features: true,
      showcase: true,
      testimonials: true,
      faq: true,
      cta: true,
      contact: true,
      footer: true
    }
  },

  {
    id: 'healthcare-clinic',
    slug: 'healthcare-and-clinic',
    category: 'Healthcare and Clinic',
    type: 'Business Website',
    title: 'AuraHealth Medical & Wellness',
    tagline: 'Compassionate, Advanced Healthcare for You and Your Family',
    description: 'Providing world-class multi-specialty clinical care, rapid on-site diagnostics, preventative wellness screenings, and empathetic medical professionals.',
    paletteId: 'forest-green',
    layoutId: 'modern-clean',
    targetAudience: 'Families, seniors, working professionals, and preventative health seekers',
    desiredPages: ['Home', 'Specialties', 'Doctors', 'Patient Portal', 'Appointments', 'Emergency Info', 'Contact'],
    heroImage: SAMPLE_IMAGES.healthcare.hero,
    stats: [
      { label: 'Board-Certified Doctors', value: '45+' },
      { label: 'Specialist Departments', value: '18' },
      { label: 'Patient Trust Score', value: '99.4%' },
      { label: 'Emergency Response', value: '< 4 Mins' }
    ],
    featuresTitle: 'Complete Patient Care',
    features: SAMPLE_IMAGES.healthcare.services,
    doctors: SAMPLE_IMAGES.healthcare.doctors,
    testimonials: [
      {
        quote: "Dr. Sterling and the cardiovascular team provided unmatched care during my surgery and recovery. Truly life-saving.",
        author: "Robert Chen",
        location: "Patient since 2019",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
      },
      {
        quote: "The digital booking and zero wait times in the clinic make managing my kids' pediatrician visits completely stress-free.",
        author: "Maria Gonzalez",
        location: "Mother of three",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
      }
    ],
    faqs: [
      {
        q: "What insurance providers do you accept?",
        a: "We accept all major PPO, Medicare, Blue Cross Blue Shield, Aetna, Cigna, and UnitedHealthcare plans."
      },
      {
        q: "How can I book an appointment?",
        a: "You can book instantly online using our appointment scheduler or call our 24/7 patient helpline."
      },
      {
        q: "Do you offer same-day urgent care visits?",
        a: "Yes, our urgent care department accommodates walk-in patients and same-day virtual triage consultations."
      }
    ],
    contactInfo: {
      phone: "+1 (800) 789-2273",
      emergencyPhone: "+1 (800) 911-AURA",
      email: "care@aurahealthclinic.org",
      address: "620 Medical Center Drive, Suite 400, Chicago, IL 60611",
      hours: "Mon - Sat: 7:00 AM - 8:00 PM | Urgent Care: 24/7"
    },
    sectionsVisible: {
      hero: true,
      stats: true,
      features: true,
      showcase: true,
      testimonials: true,
      faq: true,
      cta: true,
      contact: true,
      footer: true
    }
  }
];

export const getTemplateById = (id) => {
  return WEBSITE_TEMPLATES.find((t) => t.id === id || t.slug === id) || WEBSITE_TEMPLATES[0];
};

export const getDefaultConfigForType = (websiteType) => {
  switch (websiteType) {
    case 'E-commerce':
      return { ...WEBSITE_TEMPLATES[1] };
    case 'Blog':
    case 'Event Website':
    case 'Travel':
      return { ...WEBSITE_TEMPLATES[0] };
    case 'E-learning':
    case 'Healthcare':
      return { ...WEBSITE_TEMPLATES[4] };
    case 'Restaurant':
      return { ...WEBSITE_TEMPLATES[2] };
    default:
      return { ...WEBSITE_TEMPLATES[3] }; // Corporate
  }
};
