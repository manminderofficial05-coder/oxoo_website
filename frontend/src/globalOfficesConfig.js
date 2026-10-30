// =============================================================
// GLOBAL OFFICES CONFIGURATION
// Configurable office names, locations, addresses, phone numbers,
// designations, badges, and department tags.
// =============================================================

export const GLOBAL_OFFICES_HEADER = {
  eyebrow: "OUR GLOBAL OFFICES",
  title: "Connecting Businesses Across Borders.",
  description: "PrimePro.ai brings connected business technology and support closer to organisations around the world."
};

export const GLOBAL_OFFICES = [
  {
    id: "india-hq",
    company: "PrimePro.ai",
    countryCode: "IN",
    countryName: "India",
    location: "Bengaluru, Karnataka, India",
    address: "Bengaluru, Karnataka, India",
    phone: "+91 79 4050 0100",
    phoneHref: "tel:+917940500100",
    officeDesignation: "Global Headquarters",
    badge: "Head Office",
    badgeType: "head-office",
    departments: [
      { name: "Global Operations", color: "blue" },
      { name: "Product Development", color: "teal" },
      { name: "Customer Support", color: "purple" }
    ]
  },
  {
    id: "hyderabad-office",
    company: "PrimePro.ai",
    countryCode: "IN",
    countryName: "India",
    location: "Hyderabad, Telangana, India",
    address: "Hyderabad, Telangana, India",
    phone: "+91 80 4060 0100",
    phoneHref: "tel:+918040600100",
    officeDesignation: "Technology & Operations",
    badge: null,
    departments: [
      { name: "Engineering", color: "blue" },
      { name: "Technology", color: "amber" },
      { name: "Business Operations", color: "purple" }
    ]
  },
  {
    id: "us-office",
    company: "PrimePro.ai",
    countryCode: "US",
    countryName: "United States",
    location: "United States",
    address: "United States",
    phone: "+1 415 800 0200",
    phoneHref: "tel:+14158000200",
    officeDesignation: "International Office",
    badge: null,
    departments: [
      { name: "International Business", color: "blue" },
      { name: "Sales", color: "teal" },
      { name: "Client Partnerships", color: "purple" }
    ]
  }
];

