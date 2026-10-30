import React, { useState } from 'react';
import { Building2, MapPin, Phone, Globe2 } from 'lucide-react';
import { GLOBAL_OFFICES_HEADER, GLOBAL_OFFICES } from '../globalOfficesConfig';

// Inline Country Flag Helper with resilient fallback to Globe2
function OfficeFlag({ code, countryName, size = 18 }) {
  const [imgErr, setImgErr] = useState(false);
  const norm = (code || '').trim().toUpperCase();

  if (!norm || norm.length !== 2 || imgErr) {
    return <Globe2 size={size - 2} className="oxoo-office-flag-fallback" aria-hidden="true" />;
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${norm.toLowerCase()}.png`}
      alt={countryName || norm}
      width={size}
      height={Math.round(size * 0.72)}
      onError={() => setImgErr(true)}
      className="oxoo-office-flag-img"
      loading="lazy"
    />
  );
}

// World Map Illustration SVG with connected network arcs and pins
function GlobalOfficesMapGraphic() {
  return (
    <div className="oxoo-offices-map-art" aria-hidden="true">
      <svg
        viewBox="0 0 520 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="oxoo-offices-map-svg"
      >
        <defs>
          <linearGradient id="arcGradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="arcGradPurple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Simplified Vector World Map Continents */}
        <g fill="#cbd5e1" fillOpacity="0.45" className="oxoo-map-continents">
          {/* North America */}
          <path d="M40 38 Q65 18 105 22 Q125 30 145 42 Q155 60 148 78 Q130 92 110 88 Q95 72 80 75 Q60 85 45 68 Z" />
          {/* South America */}
          <path d="M115 95 Q135 98 140 115 Q135 140 120 152 Q110 135 105 118 Z" />
          {/* Europe */}
          <path d="M225 30 Q255 22 280 32 Q290 48 275 60 Q245 62 230 48 Z" />
          {/* Africa */}
          <path d="M235 65 Q265 65 278 85 Q282 115 260 135 Q240 130 235 100 Q225 80 235 65 Z" />
          {/* Asia */}
          <path d="M290 28 Q345 20 420 32 Q450 55 440 85 Q395 88 360 80 Q340 70 320 78 Q305 60 290 28 Z" />
          {/* India subcontinent */}
          <path d="M335 75 Q355 76 352 98 Q342 112 334 98 Z" />
          {/* Australia */}
          <path d="M420 110 Q450 108 458 125 Q450 145 425 140 Q415 125 420 110 Z" />
        </g>

        {/* Dotted Grid / Matrix Ambience */}
        <g fill="#94a3b8" fillOpacity="0.35">
          <circle cx="70" cy="45" r="1.5" />
          <circle cx="95" cy="35" r="1.5" />
          <circle cx="125" cy="55" r="1.5" />
          <circle cx="210" cy="40" r="1.5" />
          <circle cx="250" cy="45" r="1.5" />
          <circle cx="270" cy="85" r="1.5" />
          <circle cx="310" cy="50" r="1.5" />
          <circle cx="360" cy="45" r="1.5" />
          <circle cx="395" cy="65" r="1.5" />
          <circle cx="430" cy="50" r="1.5" />
        </g>

        {/* Curved Connection Arcs between Locations */}
        {/* US (125, 52) to India / Bengaluru (342, 92) */}
        <path
          d="M 125 52 Q 225 10 342 92"
          stroke="url(#arcGradBlue)"
          strokeWidth="1.8"
          strokeDasharray="4 4"
          fill="none"
        />

        {/* India / Bengaluru (342, 92) to Asia Partner Hub (420, 68) */}
        <path
          d="M 342 92 Q 380 45 420 68"
          stroke="url(#arcGradPurple)"
          strokeWidth="1.8"
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Pin 1: United States (cx: 125, cy: 52) */}
        <g transform="translate(125, 52)">
          <circle cx="0" cy="0" r="8" fill="#0284c7" fillOpacity="0.18" />
          <circle cx="0" cy="0" r="4" fill="#0284c7" />
          {/* Small Location Pin Icon */}
          <path
            d="M 0 -18 C -5 -18 -9 -14 -9 -9 C -9 -2 0 6 0 6 C 0 6 9 -2 9 -9 C 9 -14 5 -18 0 -18 Z"
            fill="#0284c7"
          />
          <circle cx="0" cy="-9" r="3" fill="#ffffff" />
        </g>

        {/* Pin 2: India — Bengaluru / Hyderabad (cx: 342, cy: 92) */}
        <g transform="translate(342, 92)">
          <circle cx="0" cy="0" r="9" fill="#06b6d4" fillOpacity="0.22" />
          <circle cx="0" cy="0" r="4.5" fill="#06b6d4" />
          {/* Small Location Pin Icon */}
          <path
            d="M 0 -18 C -5 -18 -9 -14 -9 -9 C -9 -2 0 6 0 6 C 0 6 9 -2 9 -9 C 9 -14 5 -18 0 -18 Z"
            fill="#06b6d4"
          />
          <circle cx="0" cy="-9" r="3" fill="#ffffff" />
        </g>

        {/* Pin 3: International Partnerships Hub (cx: 420, cy: 68) */}
        <g transform="translate(420, 68)">
          <circle cx="0" cy="0" r="7.5" fill="#a855f7" fillOpacity="0.2" />
          <circle cx="0" cy="0" r="3.5" fill="#a855f7" />
          {/* Small Location Pin Icon */}
          <path
            d="M 0 -16 C -4.5 -16 -8 -12.5 -8 -8 C -8 -2 0 5 0 5 C 0 5 8 -2 8 -8 C 8 -12.5 4.5 -16 0 -16 Z"
            fill="#a855f7"
          />
          <circle cx="0" cy="-8" r="2.8" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

export default function GlobalOffices({
  header = GLOBAL_OFFICES_HEADER,
  offices = GLOBAL_OFFICES
}) {
  return (
    <section className="oxoo-global-offices-section" id="global-offices" aria-labelledby="global-offices-heading">
      <div className="oxoo-offices-container">
        {/* Section Header with Eyebrow, Title, Subtitle & Map Graphic */}
        <div className="oxoo-offices-header-row">
          <div className="oxoo-offices-header-text">
            <span className="oxoo-offices-eyebrow">
              {header.eyebrow}
            </span>
            <h2 id="global-offices-heading" className="oxoo-offices-title">
              {header.title}
            </h2>
            <p className="oxoo-offices-subtitle">
              {header.description}
            </p>
          </div>

          <GlobalOfficesMapGraphic />
        </div>

        {/* Three Horizontal Equal-Width Office Cards */}
        <div className="oxoo-offices-grid">
          {offices.map((office) => {
            const cleanPhone = (office.phone || '').replace(/[^0-9+]/g, '');
            const phoneHref = office.phoneHref || `tel:${cleanPhone}`;

            return (
              <div
                key={office.id}
                className={`oxoo-office-card ${office.badge ? 'has-badge' : ''}`}
              >
                {/* Top Row: Flag, Country Code, Divider, Brand & Optional Badge */}
                <div className="oxoo-office-top-row">
                  <div className="oxoo-office-brand-meta">
                    <OfficeFlag code={office.countryCode} countryName={office.countryName} size={19} />
                    <span className="oxoo-office-cc">{office.countryCode}</span>
                    <span className="oxoo-office-pipe" aria-hidden="true">|</span>
                    <span className="oxoo-office-company">{office.company}</span>
                  </div>

                  {office.badge && (
                    <span className="oxoo-office-badge">
                      <Building2 size={13} className="oxoo-office-badge-icon" aria-hidden="true" />
                      <span>{office.badge}</span>
                    </span>
                  )}
                </div>

                {/* Office Location Heading */}
                <h3 className="oxoo-office-heading">
                  {office.location}
                </h3>

                {/* Department Tags */}
                {Array.isArray(office.departments) && office.departments.length > 0 && (
                  <div className="oxoo-office-depts">
                    {office.departments.map((dept) => (
                      <span
                        key={dept.name}
                        className={`oxoo-dept-tag tag-${dept.color || 'blue'}`}
                      >
                        {dept.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta details: Location Pin & Phone */}
                <div className="oxoo-office-meta">
                  <div className="oxoo-office-meta-item">
                    <MapPin size={16} className="oxoo-office-pin-icon" aria-hidden="true" />
                    <span>{office.address || office.location}</span>
                  </div>

                  {office.phone && (
                    <a
                      href={phoneHref}
                      className="oxoo-office-meta-item oxoo-office-phone-link"
                      title={`Call ${office.location}`}
                    >
                      <Phone size={15} className="oxoo-office-phone-icon" aria-hidden="true" />
                      <span>{office.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
