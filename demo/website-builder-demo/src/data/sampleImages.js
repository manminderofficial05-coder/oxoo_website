// High quality, reliable Unsplash imagery with curated CDN parameters for high performance
export const SAMPLE_IMAGES = {
  travel: {
    hero: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
    destinations: [
      {
        id: 'bali',
        name: 'Bali Spiritual Retreat',
        location: 'Ubud, Indonesia',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
        price: '$1,290',
        duration: '7 Days / 6 Nights',
        rating: 4.9,
        reviews: 142,
        tag: 'Most Popular'
      },
      {
        id: 'alps',
        name: 'Swiss Alpine Expedition',
        location: 'Zermatt, Switzerland',
        image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80',
        price: '$2,450',
        duration: '8 Days / 7 Nights',
        rating: 5.0,
        reviews: 98,
        tag: 'Adventure'
      },
      {
        id: 'kyoto',
        name: 'Kyoto Heritage & Zen Gardens',
        location: 'Kyoto, Japan',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        price: '$1,850',
        duration: '6 Days / 5 Nights',
        rating: 4.9,
        reviews: 165,
        tag: 'Culture'
      },
      {
        id: 'amalfi',
        name: 'Amalfi Coastline Luxury Sailing',
        location: 'Positano, Italy',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        price: '$3,100',
        duration: '9 Days / 8 Nights',
        rating: 4.95,
        reviews: 84,
        tag: 'Luxury'
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80'
    ]
  },

  ecommerce: {
    hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    products: [
      {
        id: 'prod-1',
        name: 'Minimalist Ceramic Pour-Over Set',
        category: 'Living & Home',
        price: 68.00,
        originalPrice: 85.00,
        rating: 4.9,
        reviews: 89,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        badge: 'Best Seller',
        description: 'Handcrafted stoneware matte glaze with dual-layer micro stainless filter.'
      },
      {
        id: 'prod-2',
        name: 'Nordic Oak & Linen Lounge Chair',
        category: 'Furniture',
        price: 420.00,
        originalPrice: 490.00,
        rating: 4.8,
        reviews: 56,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
        badge: 'Limited Drop',
        description: 'Sustainably sourced white oak frame upholstered in Belgian organic linen.'
      },
      {
        id: 'prod-3',
        name: 'Tactile Matte Brass Table Lamp',
        category: 'Lighting',
        price: 145.00,
        originalPrice: null,
        rating: 5.0,
        reviews: 112,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
        badge: 'Staff Pick',
        description: '3-stage touch dimming with warm 2700K ambient LED lighting.'
      },
      {
        id: 'prod-4',
        name: 'Vegetable-Tanned Leather Portfolio',
        category: 'Accessories',
        price: 110.00,
        originalPrice: 135.00,
        rating: 4.9,
        reviews: 73,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        badge: 'New Arrival',
        description: 'Full-grain Italian leather designed to develop a rich patina over decades.'
      }
    ]
  },

  restaurant: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    dishes: [
      {
        id: 'dish-1',
        name: 'Pan-Seared Hokkaido Scallops',
        category: 'Starters',
        price: '$24',
        description: 'Cauliflower velvet puree, crispy guanciale crumb, citrus brown butter reduction.',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
        dietary: 'Gluten-Free'
      },
      {
        id: 'dish-2',
        name: 'Dry-Aged Wagyu Ribeye (A5)',
        category: 'Mains',
        price: '$72',
        description: '45-day Himalayan salt aged wagyu, black truffle demi-glace, charred broccolini.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        dietary: 'Chef Choice'
      },
      {
        id: 'dish-3',
        name: 'Wild Mushroom & Black Truffle Risotto',
        category: 'Mains',
        price: '$34',
        description: 'Acquerello carnaroli rice, foraged chanterelles, 36-month aged Parmigiano Reggiano.',
        image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
        dietary: 'Vegetarian'
      },
      {
        id: 'dish-4',
        name: 'Valrhona Dark Chocolate Soufflé',
        category: 'Desserts',
        price: '$18',
        description: '70% Guanaja chocolate, Tahitian vanilla bean anglaise, salted caramel gelato.',
        image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
        dietary: 'Signature'
      }
    ],
    chef: {
      name: 'Chef Laurent Mercier',
      title: 'Executive Chef & Co-Owner',
      bio: 'Trained under 3-star Michelin masters in Lyon and San Sebastián, Laurent marries timeless French classical technique with hyper-local seasonal agriculture.',
      image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80'
    }
  },

  corporate: {
    hero: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    team: [
      {
        name: 'Elena Rostova',
        role: 'Managing Principal & Partner',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        bio: 'Ex-McKinsey leader with 18+ years leading cross-border M&A and digital transformation.'
      },
      {
        name: 'Marcus Vance',
        role: 'Chief Technology Strategist',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
        bio: 'Advises Fortune 500 boards on enterprise cloud architectures and scalable AI adoption.'
      },
      {
        name: 'Aria Chen',
        role: 'Head of Global Advisory',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
        bio: 'Specialist in capital optimization, market entry strategy, and ESG compliance frameworks.'
      }
    ],
    caseStudies: [
      {
        client: 'Global FinTech Consortium',
        result: '+240% Valuation in 24 Months',
        summary: 'Architected post-merger integration framework across 14 regulated European and Asian markets.',
        tag: 'Financial Advisory'
      },
      {
        client: 'Apex Energy Systems',
        result: '$420M Sustainable Bond Issuance',
        summary: 'Guided institutional capital structuring for clean-grid transition program.',
        tag: 'Capital Structuring'
      }
    ]
  },

  healthcare: {
    hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80',
    doctors: [
      {
        id: 'doc-1',
        name: 'Dr. Sarah Sterling, MD',
        specialty: 'Chief of Cardiology',
        experience: '16+ Years Experience',
        degrees: 'Harvard Medical School • Johns Hopkins Fellow',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
        availability: 'Mon - Thu'
      },
      {
        id: 'doc-2',
        name: 'Dr. David Kim, MD, PhD',
        specialty: 'Senior Neurologist',
        experience: '14+ Years Experience',
        degrees: 'Stanford Medicine • UCSF Medical Research',
        image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
        availability: 'Tue - Fri'
      },
      {
        id: 'doc-3',
        name: 'Dr. Maya Patel, MD',
        specialty: 'Director of Pediatrics',
        experience: '12+ Years Experience',
        degrees: 'Columbia University • Children’s Hospital of NY',
        image: 'https://images.unsplash.com/photo-1594824813515-5858022a10d1?auto=format&fit=crop&w=800&q=80',
        availability: 'Mon - Sat'
      }
    ],
    services: [
      {
        title: 'Comprehensive Health Screenings',
        desc: 'Advanced preventative diagnostics, 3D biometric scans, and personalized biomarker profiling.',
        icon: 'Activity'
      },
      {
        title: 'Pediatric & Family Medicine',
        desc: 'Dedicated round-the-clock compassionate primary care tailored to growing families.',
        icon: 'HeartHandshake'
      },
      {
        title: 'Advanced Surgical & Imaging',
        desc: 'Next-gen low-radiation 3T MRI, CT imaging, and minimally invasive robotic procedures.',
        icon: 'Stethoscope'
      },
      {
        title: '24/7 Urgent Medical Consultation',
        desc: 'Immediate clinical triage and direct telemedicine video access with board-certified physicians.',
        icon: 'ShieldAlert'
      }
    ]
  }
};
