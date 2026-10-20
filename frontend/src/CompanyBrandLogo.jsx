import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CompanyBrandLogo
 * Dynamically generates a brand logo based on customer's company name.
 * Matches user reference mockup (Screenshot 1 & 2):
 *  1. Top-right sweeping cyan swoosh arc
 *  2. Bold deep-navy company name lettering
 *  3. Cyan glowing horizontal separator line with centered oxoo mark
 *  4. Clean rounded pill badge with {companyName}.oxoo
 */
export default function CompanyBrandLogo({
  companyName = 'maan',
  size = 'md', // 'sm' | 'md' | 'lg' | 'header'
  showPill = true,
  className = '',
  linkTo = null
}) {
  // Clean company name for display (strip .oxoo or .odoo.com if present)
  const cleanName = (companyName || 'maan')
    .toString()
    .trim()
    .replace(/\.(oxoo|odoo\.com|com|ai|io)$/i, '')
    .trim() || 'maan';

  // Subdomain handle
  const subdomainHandle = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'maan';

  const isHeader = size === 'header';
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  // Font sizing based on mode
  const titleFontSize = isHeader ? '20px' : isSm ? '18px' : isLg ? '36px' : '28px';
  const logoHeight = isHeader ? '11px' : isSm ? '10px' : isLg ? '16px' : '13px';
  const swooshHeight = isHeader ? '16px' : isSm ? '14px' : isLg ? '28px' : '22px';
  const swooshRight = isHeader ? '-8px' : isSm ? '-6px' : isLg ? '-14px' : '-10px';
  const swooshTop = isHeader ? '-9px' : isSm ? '-8px' : isLg ? '-16px' : '-12px';

  const content = (
    <div
      className={`company-brand-logo-root ${isHeader ? 'variant-header' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* 1. Main Company Wordmark with Sweeping Cyan Swoosh Arc */}
      <div
        className="company-logo-text-wrap"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1
        }}
      >
        {/* Dynamic Curved Cyan Swoosh Arc (Exact Match to Screenshot 1) */}
        <svg
          viewBox="0 0 160 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="company-logo-swoosh-svg"
          style={{
            position: 'absolute',
            top: swooshTop,
            right: swooshRight,
            width: isHeader ? '90px' : isSm ? '80px' : isLg ? '170px' : '130px',
            height: swooshHeight,
            pointerEvents: 'none',
            zIndex: 2,
            overflow: 'visible'
          }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`swooshGrad-${subdomainHandle}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d2ff" stopOpacity="0.2" />
              <stop offset="25%" stopColor="#00d2ff" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#00a3e0" stopOpacity="1" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.95" />
            </linearGradient>
            <filter id={`swooshGlow-${subdomainHandle}`} x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Tapered crescent wing arching over top-right */}
          <path
            d="M 15 32 C 45 4, 115 2, 156 26 C 158 27.5, 156 31, 152 29 C 114 9, 52 11, 18 35 C 15 37, 13 34, 15 32 Z"
            fill={`url(#swooshGrad-${subdomainHandle})`}
            filter={`url(#swooshGlow-${subdomainHandle})`}
          />
        </svg>

        {/* Company Name in Deep Navy Bold Typography */}
        <span
          className="company-logo-title"
          style={{
            fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: titleFontSize,
            fontWeight: '900',
            color: '#002b49',
            letterSpacing: '-0.6px',
            textTransform: 'lowercase',
            position: 'relative',
            zIndex: 1
          }}
        >
          {cleanName}
        </span>
      </div>

      {/* 2. Cyan Glowing Horizontal Separator with Centered Oxoo Mark */}
      <div
        className="company-logo-divider-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isHeader ? '4px' : '6px',
          width: '100%',
          marginTop: isHeader ? '2px' : '4px',
          marginBottom: showPill && !isHeader ? '8px' : '0'
        }}
      >
        {/* Left Glowing Cyan Line */}
        <span
          className="company-logo-line left"
          style={{
            flex: 1,
            height: '1.5px',
            background: 'linear-gradient(90deg, rgba(0, 210, 255, 0) 0%, rgba(0, 210, 255, 0.9) 100%)',
            borderRadius: '999px',
            boxShadow: '0 0 6px rgba(0, 210, 255, 0.4)'
          }}
        />

        {/* Stylized Oxoo Cursive Mark in Center */}
        <div
          className="company-logo-oxoo-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            flexShrink: 0
          }}
        >
          <img
            src="/oxoo-logo.png"
            alt="Oxoo"
            style={{
              height: logoHeight,
              width: 'auto',
              display: 'block',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Right Glowing Cyan Line */}
        <span
          className="company-logo-line right"
          style={{
            flex: 1,
            height: '1.5px',
            background: 'linear-gradient(90deg, rgba(0, 210, 255, 0.9) 0%, rgba(0, 210, 255, 0) 100%)',
            borderRadius: '999px',
            boxShadow: '0 0 6px rgba(0, 210, 255, 0.4)'
          }}
        />
      </div>

      {/* 3. Subdomain Pill Badge (maan.oxoo) */}
      {showPill && !isHeader && (
        <div
          className="company-logo-pill-badge"
          style={{
            background: '#f0f6fc',
            border: '1px solid #e1edf8',
            borderRadius: '999px',
            padding: isSm ? '2px 10px' : '4px 14px',
            fontSize: isSm ? '11px' : '12.5px',
            fontWeight: '600',
            color: '#1e293b',
            letterSpacing: '-0.1px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
          }}
        >
          <span>{subdomainHandle}.oxoo</span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {content}
      </Link>
    );
  }

  return content;
}
