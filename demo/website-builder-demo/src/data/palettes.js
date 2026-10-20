// 9 Curated Color Palettes as specified in requirements
export const COLOR_PALETTES = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Refreshing, reliable and professional maritime hues',
    primary: '#0284c7',       // Sky 600
    primaryLight: '#e0f2fe',  // Sky 100
    primaryDark: '#0369a1',   // Sky 700
    accent: '#38bdf8',        // Sky 400
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    swatches: ['#0284c7', '#0369a1', '#38bdf8', '#e0f2fe'],
    category: 'Corporate & Tech'
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Organic, tranquil and eco-conscious natural tones',
    primary: '#16a34a',       // Green 600
    primaryLight: '#dcfce7',  // Green 100
    primaryDark: '#15803d',   // Green 700
    accent: '#4ade80',        // Green 400
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    swatches: ['#16a34a', '#15803d', '#4ade80', '#dcfce7'],
    category: 'Nature & Wellness'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Energetic, warm and inspiring twilight shades',
    primary: '#ea580c',       // Orange 600
    primaryLight: '#ffedd5',  // Orange 100
    primaryDark: '#c2410c',   // Orange 700
    accent: '#fb923c',        // Orange 400
    background: '#fffaf5',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    border: '#fed7aa',
    swatches: ['#ea580c', '#c2410c', '#fb923c', '#ffedd5'],
    category: 'Creative & Food'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Regal, visionary and cutting-edge creative elegance',
    primary: '#7c3aed',       // Violet 600
    primaryLight: '#ede9fe',  // Violet 100
    primaryDark: '#6d28d9',   // Violet 700
    accent: '#c084fc',        // Violet 400
    background: '#faf5ff',
    surface: '#ffffff',
    text: '#1e1b4b',
    muted: '#6b7280',
    border: '#e9d5ff',
    swatches: ['#7c3aed', '#6d28d9', '#c084fc', '#ede9fe'],
    category: 'Tech & Agency'
  },
  {
    id: 'rose-pink',
    name: 'Rose Pink',
    description: 'Chic, romantic and modern boutique aesthetics',
    primary: '#e11d48',       // Rose 600
    primaryLight: '#ffe4e6',  // Rose 100
    primaryDark: '#be123c',   // Rose 700
    accent: '#fb7185',        // Rose 400
    background: '#fff1f2',
    surface: '#ffffff',
    text: '#1f1315',
    muted: '#881337',
    border: '#fecdd3',
    swatches: ['#e11d48', '#be123c', '#fb7185', '#ffe4e6'],
    category: 'Fashion & Lifestyle'
  },
  {
    id: 'earth-brown',
    name: 'Earth Brown',
    description: 'Grounded, warm artisanal terracotta and coffee tones',
    primary: '#854d0e',       // Yellow/Brown 800
    primaryLight: '#fef3c7',  // Amber 100
    primaryDark: '#713f12',   // Yellow 900
    accent: '#d97706',        // Amber 600
    background: '#fdfbf7',
    surface: '#ffffff',
    text: '#292524',
    muted: '#78716c',
    border: '#e7e5e4',
    swatches: ['#854d0e', '#713f12', '#d97706', '#fef3c7'],
    category: 'Artisanal & Coffee'
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    description: 'Monochrome, sleek architectural poise and subtlety',
    primary: '#334155',       // Slate 700
    primaryLight: '#f1f5f9',  // Slate 100
    primaryDark: '#0f172a',   // Slate 900
    accent: '#64748b',        // Slate 500
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#020617',
    muted: '#64748b',
    border: '#e2e8f0',
    swatches: ['#334155', '#0f172a', '#64748b', '#f1f5f9'],
    category: 'Minimalist & Architecture'
  },
  {
    id: 'vibrant-red',
    name: 'Vibrant Red',
    description: 'High impact, bold and passionate conversion-focused hue',
    primary: '#dc2626',       // Red 600
    primaryLight: '#fee2e2',  // Red 100
    primaryDark: '#b91c1c',   // Red 700
    accent: '#f87171',        // Red 400
    background: '#fef2f2',
    surface: '#ffffff',
    text: '#1e1b18',
    muted: '#7f1d1d',
    border: '#fecaca',
    swatches: ['#dc2626', '#b91c1c', '#f87171', '#fee2e2'],
    category: 'High Energy & Sports'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Opulent, prestigious champagne and polished brass luster',
    primary: '#b45309',       // Amber 700
    primaryLight: '#fef3c7',  // Amber 100
    primaryDark: '#78350f',   // Amber 900
    accent: '#f59e0b',        // Amber 500
    background: '#fffdf5',
    surface: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
    border: '#fde68a',
    swatches: ['#b45309', '#78350f', '#f59e0b', '#fef3c7'],
    category: 'Luxury & Jewelry'
  }
];

export const getPaletteById = (id) => {
  return COLOR_PALETTES.find((p) => p.id === id) || COLOR_PALETTES[0];
};
