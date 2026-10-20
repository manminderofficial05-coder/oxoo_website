import React, { createContext, useContext, useState, useEffect } from 'react';
import { WEBSITE_TEMPLATES, getTemplateById } from '../data/templates';
import {
  getSavedConfig,
  saveConfig,
  getSavedSites,
  saveSiteToLibrary,
  deleteSavedSite,
  getActiveStep,
  setActiveStep as persistActiveStep,
  getLeadEnquiries,
  saveLeadEnquiry,
  clearAllDemoData
} from '../utils/storage';
import confetti from 'canvas-confetti';

const BuilderContext = createContext(null);

export const BuilderProvider = ({ children }) => {
  // Always start with default clean Travel & Tourism template on load/refresh
  const [config, setConfigState] = useState(() => ({ ...WEBSITE_TEMPLATES[0] }));

  // Always start at Step 1 (starting task point) on load/refresh
  const [step, setStepState] = useState(1);
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [savedSites, setSavedSites] = useState([]);
  const [leadEnquiries, setLeadEnquiries] = useState([]);

  // Interactive UI Modals & Drawers
  const [isSavedSitesOpen, setIsSavedSitesOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingContext, setBookingContext] = useState({ type: 'table', title: 'Make a Reservation' });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: 'prod-1',
      name: 'Minimalist Ceramic Pour-Over Set',
      price: 68.00,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    }
  ]);

  // Toast System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', duration = 3500) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Ensure clean demo slate: always reset to Step 1 and purge persistent data on mount & unload
  useEffect(() => {
    clearAllDemoData();
    setStepState(1);

    const handleClean = () => {
      clearAllDemoData();
    };
    window.addEventListener('beforeunload', handleClean);
    return () => {
      clearAllDemoData();
      window.removeEventListener('beforeunload', handleClean);
    };
  }, []);

  // Update in-memory config for interactive demo experience
  const updateConfig = (newConfig) => {
    setConfigState(newConfig);
  };

  const updateConfigField = (field, value) => {
    setConfigState((prev) => {
      const updated = { ...prev, [field]: value };
      saveConfig(updated);
      return updated;
    });
  };

  const updateNestedField = (parent, field, value) => {
    setConfigState((prev) => {
      const updated = {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      };
      saveConfig(updated);
      return updated;
    });
  };

  const setStep = (newStep) => {
    setStepState(newStep);
    persistActiveStep(newStep);
  };

  const loadTemplate = (templateId) => {
    const template = getTemplateById(templateId);
    if (template) {
      const freshConfig = JSON.parse(JSON.stringify(template));
      updateConfig(freshConfig);
      showToast(`Loaded "${freshConfig.title}" template!`, 'info');
    }
  };

  const resetToScratch = () => {
    const scratchConfig = {
      id: 'custom-site',
      title: 'My Custom Business',
      tagline: 'Built From Scratch with Precision',
      description: 'Describe your products, team, or services here.',
      category: 'Business Website',
      type: 'Business Website',
      paletteId: 'ocean-blue',
      layoutId: 'modern-clean',
      targetAudience: 'General audience and prospective customers',
      desiredPages: ['Home', 'About Us', 'Services', 'Contact'],
      heroImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80',
      stats: [
        { label: 'Happy Clients', value: '1,000+' },
        { label: 'Customer Rating', value: '4.9/5' },
        { label: 'Years Experience', value: '10+' }
      ],
      featuresTitle: 'Core Capabilities',
      features: [
        {
          icon: 'Sparkles',
          title: 'Premium Quality',
          desc: 'High standard of execution across all product and service touchpoints.'
        },
        {
          icon: 'ShieldCheck',
          title: 'Trusted Reliability',
          desc: 'Tested and proven processes ensuring seamless client satisfaction.'
        },
        {
          icon: 'Headphones',
          title: '24/7 Client Support',
          desc: 'Attentive, friendly customer care whenever you need assistance.'
        }
      ],
      testimonials: [
        {
          quote: "Working with this team transformed our brand presence and customer engagement.",
          author: "Alex Morgan",
          location: "New York, NY",
          rating: 5,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        }
      ],
      faqs: [
        {
          q: "How can I get started?",
          a: "Contact our team via the form below or phone to receive a personalized quote."
        }
      ],
      contactInfo: {
        phone: "+1 (800) 555-0199",
        email: "hello@mybusiness.com",
        address: "500 Innovation Blvd, Suite 200, Austin, TX 78701",
        hours: "Mon - Fri: 9:00 AM - 6:00 PM CST"
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
    };
    updateConfig(scratchConfig);
    setStep(2);
    showToast('Started from scratch! Enter your business info.', 'info');
  };

  const saveCurrentSite = () => {
    const saved = saveSiteToLibrary(config);
    if (saved) {
      setSavedSites(getSavedSites());
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      showToast(`Website "${config.title}" saved to your library!`, 'success');
    }
  };

  const loadSiteFromLibrary = (site) => {
    updateConfig(site);
    setIsSavedSitesOpen(false);
    showToast(`Loaded "${site.title}" from saved library!`, 'info');
  };

  const removeSiteFromLibrary = (savedId) => {
    const updated = deleteSavedSite(savedId);
    setSavedSites(updated);
    showToast('Saved website removed', 'info');
  };

  const submitEnquiry = (lead) => {
    const savedLead = saveLeadEnquiry({
      ...lead,
      websiteTitle: config.title
    });
    if (savedLead) {
      setLeadEnquiries(getLeadEnquiries());
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 }
      });
      showToast('Client enquiry received successfully! Stored in lead inbox.', 'success');
      setIsEnquiryModalOpen(false);
    }
  };

  // E-commerce Cart Operations
  const addToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const updateCartQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from cart', 'info');
  };

  const openBookingModal = (type = 'table', title = 'Make a Reservation') => {
    setBookingContext({ type, title });
    setIsBookingOpen(true);
  };

  return (
    <BuilderContext.Provider
      value={{
        config,
        updateConfig,
        updateConfigField,
        updateNestedField,
        step,
        setStep,
        deviceMode,
        setDeviceMode,
        toast,
        showToast,
        savedSites,
        saveCurrentSite,
        loadSiteFromLibrary,
        removeSiteFromLibrary,
        loadTemplate,
        resetToScratch,
        isSavedSitesOpen,
        setIsSavedSitesOpen,
        isEnquiryModalOpen,
        setIsEnquiryModalOpen,
        leadEnquiries,
        submitEnquiry,
        // Cart
        isCartOpen,
        setIsCartOpen,
        cartItems,
        addToCart,
        updateCartQty,
        removeFromCart,
        // Booking
        isBookingOpen,
        setIsBookingOpen,
        bookingContext,
        openBookingModal
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
};
