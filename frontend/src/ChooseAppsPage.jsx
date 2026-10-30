import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Header, Footer } from './components';
import { ALL_APPS_CATEGORIES } from './AllAppsDirectory';

export default function ChooseAppsPage() {
  const navigate = useNavigate();

  // Default: start with NO apps preselected (shown after user selects)
  const [selectedAppSlugs, setSelectedAppSlugs] = useState([]);

  // Flatten all apps to easily look up selected apps
  const allApps = ALL_APPS_CATEGORIES.flatMap((c) => c.apps);
  const selectedApps = allApps.filter((a) => selectedAppSlugs.includes(a.slug));

  // Toggle selection
  const handleToggleApp = (slug) => {
    setSelectedAppSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  // Launch workspace with selected apps
  const handleContinue = () => {
    if (selectedApps.length === 0) {
      alert('Please select at least one application to launch your demo.');
      return;
    }

    const slugs = selectedApps.map((a) => a.slug);
    try {
      localStorage.setItem('oxoo_demo_company', 'demo.primepro.ai');
      localStorage.setItem('oxoo_selected_apps', JSON.stringify(slugs));
    } catch (e) {}

    const slugsParam = slugs.join(',');
    navigate(`/apps/${slugs[0]}/demo?apps=${encodeURIComponent(slugsParam)}`);
  };

  return (
    <div className="one-need-page choose-apps-page-root">
      <Header />

      <main className="choose-apps-main">
        {/* Top Header (Cursive "Choose your Apps") */}
        <div className="choose-apps-header">
          <h1 className="choose-apps-title">
            Choose your{' '}
            <span className="choose-apps-highlight">
              Apps
              <svg
                className="choose-apps-brush"
                viewBox="0 0 100 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8 C30 3, 70 3, 97 7"
                  stroke="#10b981"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="choose-apps-subtitle">
            Free instant access. No credit card required.
          </p>
        </div>

        {/* Content Container (Exact Same Container and Categories Layout as /apps) */}
        <div className="one-need-content-container">
          {ALL_APPS_CATEGORIES.map((category) => (
            <section key={category.id} className="one-need-category-section" id={category.id}>
              <div className="one-need-cat-header">
                <h2 className="one-need-cat-title">
                  {category.name}
                </h2>
                <div className="cat-brush-stroke-wrap" aria-hidden="true">
                  <svg viewBox="0 0 160 14" width="140" height="12" fill="none">
                    <path
                      d="M4 8 C45 3, 115 4, 156 8"
                      stroke={category.underlineColor || '#06b6d4'}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="one-need-cards-grid">
                {category.apps.map((app) => {
                  const isSelected = selectedAppSlugs.includes(app.slug);

                  return (
                    <div
                      key={app.slug}
                      className={`one-need-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handleToggleApp(app.slug)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      style={{ cursor: 'pointer', position: 'relative' }}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleToggleApp(app.slug);
                        }
                      }}
                      title={`${app.name} - ${app.desc}`}
                    >
                      {/* Selected Checkmark Badge (Overlapping top-right corner) */}
                      {isSelected && (
                        <div className="choose-app-check-badge">
                          <Check size={11} strokeWidth={3.5} color="#714b67" />
                        </div>
                      )}

                      <div className="one-need-icon-box" style={{ backgroundColor: app.bgColor }}>
                        <img
                          src={app.icon}
                          alt={`${app.name} icon`}
                          className="one-need-icon-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/primepro-icon.png';
                          }}
                        />
                      </div>

                      <div className="one-need-card-text">
                        <span className="one-need-card-name">{app.name}</span>
                        <p className="one-need-card-desc">{app.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Floating Right Sidebar (Shown ONLY after the user selects at least one app) */}
        {selectedApps.length > 0 && (
          <aside className="choose-apps-floating-sidebar" aria-label="Selected applications">
            <div className="choose-apps-sidebar-card">
              <h3 className="sidebar-selection-title">
                {selectedApps.length} {selectedApps.length === 1 ? 'App' : 'Apps'} selected
              </h3>

              {/* Selected Apps List */}
              <div className="sidebar-selected-list">
                {selectedApps.map((app) => (
                  <div key={app.slug} className="sidebar-selected-item">
                    <img
                      src={app.icon}
                      alt=""
                      className="sidebar-app-icon"
                      onError={(e) => {
                        e.currentTarget.src = '/primepro-icon.png';
                      }}
                    />
                    <span className="sidebar-app-name">{app.name}</span>
                  </div>
                ))}
              </div>

              {/* Green Promo Banner */}
              <div className="sidebar-green-banner">
                <span>Free, with <strong>unlimited</strong> users, forever.</span>
              </div>

              {/* Purple Continue Button */}
              <button
                type="button"
                className="sidebar-continue-btn"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </aside>
        )}
      </main>

      <Footer />
    </div>
  );
}
