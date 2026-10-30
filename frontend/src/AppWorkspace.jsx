import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Plus, Filter, Download, Settings, ChevronRight,
  Sparkles, CheckCircle2, AlertCircle, Clock, ExternalLink, RefreshCw,
  Share2, ArrowUpRight, Check, Send, ShoppingCart, MessageSquare,
  FileText, Shield, BarChart3, Layers, SlidersHorizontal, Info,
  Lock, Copy, Globe, Building2
} from 'lucide-react';
import { Header, Footer } from './components';
import { APPS_DATA, getAppBySlug } from './appsData';
import { resolveWorkspace } from './api';

export default function AppWorkspace() {
  const { appSlug, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const app = getAppBySlug(appSlug || slug) || APPS_DATA[0];

  // Retrieve company domain (e.g., maan.primepro.ai or abcd.oxoo) from query params, state, or localStorage
  const queryParams = new URLSearchParams(location.search);
  const companyFromQuery = queryParams.get('company') || queryParams.get('workspace') || queryParams.get('org');
  const companyFromState = location.state?.companyName;
  const companyFromStorage = typeof window !== 'undefined' ? localStorage.getItem('oxoo_demo_company') : null;
  const rawCompany = companyFromQuery || companyFromState || companyFromStorage || 'maan.primepro.ai';
  const companyDomain = rawCompany.includes('.') ? rawCompany : `${rawCompany}.primepro.ai`;

  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [companyName, setCompanyName] = useState(() => {
    if (companyFromQuery) return companyFromQuery.replace(/\.(oxoo\.ai|oxoo|com)$/i, '');
    return companyFromState || companyFromStorage || 'Maan Corp';
  });

  useEffect(() => {
    let isMounted = true;
    const lookupTarget = companyFromQuery || (typeof window !== 'undefined' ? window.location.hostname : '');
    resolveWorkspace({ host: lookupTarget, subdomain: lookupTarget })
      .then(res => {
        if (isMounted && res && res.workspace) {
          setWorkspaceInfo(res.workspace);
          if (res.workspace.company_name) {
            setCompanyName(res.workspace.company_name);
          }
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [companyFromQuery, location.search]);

  const [copiedUrl, setCopiedUrl] = useState(false);
  const handleCopyUrl = () => {
    const finalHost = workspaceInfo?.workspace_domain || companyDomain;
    navigator.clipboard?.writeText(`https://${finalHost}/apps/${app.slug}`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const [activeTab, setActiveTab] = useState('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // AI workspace state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // POS workspace state
  const [posCart, setPosCart] = useState([]);

  // Discuss workspace state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Priya Sharma', time: '10:14 AM', text: 'Welcome to the #general channel. Please review Q4 deliverables.' },
    { sender: 'Rahul Mehta', time: '10:18 AM', text: 'Confirmed. The new quotation templates are live in PrimePro.ai Sales.' }
  ]);
  const [newMsg, setNewMsg] = useState('');

  const triggerAction = (actionName) => {
    setFeedbackMsg(`Action "${actionName}" triggered successfully for ${app.name}.`);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    setTimeout(() => {
      setAiResponse(`PrimePro.ai AI Analysis for "${aiPrompt}":\n\n1. Key Trend: Operational throughput increased by 18% with zero bottlenecks detected.\n2. Recommended Next Step: Auto-trigger approval sequence for pending records and sync with Accounting.\n3. Estimated Resource Savings: 4.5 team hours.`);
      setAiLoading(false);
    }, 700);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setChatMessages([...chatMessages, { sender: 'You', time: 'Just now', text: newMsg }]);
    setNewMsg('');
  };

  const filteredRecords = app.records.filter((rec) => {
    const text = JSON.stringify(rec).toLowerCase();
    const matchSearch = text.includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || (rec.status && rec.status.toLowerCase() === filterStatus.toLowerCase());
    return matchSearch && matchStatus;
  });

  return (
    <>
      <Header />
      <main className="workspace-main-container">
        {/* TOP BREADCRUMB & VERIFIED DOMAIN BAR */}
        <div className="workspace-top-bar">
          <div className="workspace-container">
            <div className="workspace-top-flex">
              <nav className="workspace-breadcrumbs" aria-label="Breadcrumb">
                <Link to="/" className="crumb-link">Home</Link>
                <ChevronRight size={14} className="crumb-separator" />
                <Link to="/apps" className="crumb-link">Apps</Link>
                <ChevronRight size={14} className="crumb-separator" />
                <span className="crumb-company-tag">{companyDomain}</span>
                <ChevronRight size={14} className="crumb-separator" />
                <span className="crumb-current">{app.name}</span>
              </nav>

              {/* Subdomain address bar showing abcd.oxoo */}
              <div className="workspace-subdomain-bar">
                <div className="subdomain-ssl-badge">
                  <Lock size={12} className="ssl-lock-icon" />
                  <span>https://</span>
                </div>
                <span className="subdomain-highlight-host">{companyDomain}</span>
                <span className="subdomain-path">/apps/{app.slug}</span>
                <button
                  type="button"
                  className="subdomain-copy-btn"
                  onClick={handleCopyUrl}
                  title="Copy workspace domain"
                >
                  {copiedUrl ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              className="workspace-toast-alert"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CheckCircle2 size={18} />
              <span>{feedbackMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE HEADER HERO */}
        <section className="workspace-hero-header">
          <div className="workspace-container">
            <div className="workspace-header-grid">
              <div className="workspace-identity">
                <div className="workspace-icon-wrapper" style={{ backgroundColor: app.bgColor }}>
                  <img
                    src={app.iconSrc}
                    alt={`${app.name} icon`}
                    className="workspace-hero-img"
                    onError={(e) => {
                      if (app.svgSrc) e.currentTarget.src = app.svgSrc;
                    }}
                  />
                </div>
                <div className="workspace-meta">
                  <div className="workspace-pill-row">
                    <span className="workspace-company-badge" style={{ fontWeight: 700, background: '#0284c7', color: '#fff' }}>
                      <Building2 size={13} /> {companyName}
                    </span>
                    <span className="workspace-category-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <img src="/primepro-logo.png" alt="PrimePro" style={{ height: '14px', width: 'auto' }} />
                      <span>Powered by PrimePro.</span>
                    </span>
                    <span className="workspace-category-badge">{workspaceInfo?.workspace_domain || companyDomain}</span>
                    <span className="workspace-status-badge">
                      <span className="online-dot" /> Live Workspace
                    </span>
                  </div>
                  <h1 className="workspace-title">{companyName} — {app.name}</h1>
                  <p className="workspace-tagline">
                    Connected customer workspace for <strong>{companyName}</strong> ({workspaceInfo?.workspace_domain || companyDomain}) — {app.tagline}
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="workspace-header-actions">
                <button
                  type="button"
                  className="ws-btn-primary"
                  onClick={() => setModalOpen(true)}
                >
                  <Plus size={16} /> New {app.name} Entry
                </button>
                <button
                  type="button"
                  className="ws-btn-secondary"
                  onClick={() => triggerAction('Export Dataset (CSV/PDF)')}
                >
                  <Download size={16} /> Export
                </button>
                <button
                  type="button"
                  className="ws-btn-secondary"
                  onClick={() => triggerAction('Module Settings')}
                  title="Configure Module Settings"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            {/* KPI METRICS ROW */}
            <div className="workspace-kpi-grid">
              {app.kpis.map((kpi, idx) => (
                <div key={idx} className="ws-kpi-card">
                  <div className="ws-kpi-header">
                    <span className="ws-kpi-label">{kpi.label}</span>
                    <span className={`ws-kpi-change ${kpi.change.startsWith('+') ? 'pos' : ''}`}>
                      {kpi.change}
                    </span>
                  </div>
                  <div className="ws-kpi-value">{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* NAVIGATION TABS */}
            <div className="workspace-tab-bar">
              <button
                type="button"
                className={`ws-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
                onClick={() => setActiveTab('records')}
              >
                <Layers size={15} /> Records & Operations ({app.records.length})
              </button>
              <button
                type="button"
                className={`ws-tab-btn ${activeTab === 'interactive' ? 'active' : ''}`}
                onClick={() => setActiveTab('interactive')}
              >
                <Sparkles size={15} /> Live {app.name} Workspace
              </button>
              <button
                type="button"
                className={`ws-tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                <Info size={15} /> Capabilities & Specs
              </button>
            </div>
          </div>
        </section>

        {/* WORKSPACE CONTENT BODY */}
        <section className="workspace-body-section">
          <div className="workspace-container">
            {/* TAB 1: RECORDS & TABLE */}
            {activeTab === 'records' && (
              <div className="ws-records-panel">
                <div className="ws-table-toolbar">
                  <div className="ws-search-input-wrap">
                    <Search size={16} className="ws-search-icon" />
                    <input
                      type="text"
                      placeholder={`Filter ${app.name} records...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="ws-clear-search"
                        onClick={() => setSearchTerm('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="ws-filter-group">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="ws-select-filter"
                    >
                      <option value="all">All Statuses</option>
                      <option value="paid">Paid / Confirmed</option>
                      <option value="pending">Pending / Active</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      type="button"
                      className="ws-icon-btn"
                      onClick={() => triggerAction('Refresh Dataset')}
                      title="Refresh"
                    >
                      <RefreshCw size={15} />
                    </button>
                  </div>
                </div>

                {/* RECORDS TABLE */}
                <div className="ws-table-card">
                  <table className="ws-data-table">
                    <thead>
                      <tr>
                        <th>Identifier</th>
                        {Object.keys(app.records[0] || {})
                          .filter((k) => k !== 'id')
                          .map((key) => (
                            <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
                          ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((row) => (
                          <tr key={row.id}>
                            <td className="record-id-cell">
                              <code>{row.id}</code>
                            </td>
                            {Object.entries(row)
                              .filter(([k]) => k !== 'id')
                              .map(([k, val]) => (
                                <td key={k}>
                                  {k === 'status' ? (
                                    <span className={`ws-badge status-${String(val).toLowerCase().replace(/\s+/g, '-')}`}>
                                      {String(val)}
                                    </span>
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              ))}
                            <td>
                              <button
                                type="button"
                                className="ws-action-link"
                                onClick={() => triggerAction(`Inspect ${row.id}`)}
                              >
                                View Details <ArrowUpRight size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="ws-empty-table">
                            <AlertCircle size={22} className="empty-icon" />
                            <p>No {app.name} records match your search filter.</p>
                            <button
                              type="button"
                              className="ws-btn-secondary"
                              onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                              }}
                            >
                              Reset Filters
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE MODULE DEMO */}
            {activeTab === 'interactive' && (
              <div className="ws-interactive-panel">
                {app.id === 'ai' && (
                  <div className="interactive-card ai-interactive">
                    <h3>PrimePro.ai Assistant Console</h3>
                    <p>Execute real-time generative tasks across your business data.</p>
                    <form onSubmit={handleAiSubmit} className="ai-console-form">
                      <textarea
                        rows={3}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Analyze Q3 financial discrepancies, draft executive briefing..."
                      />
                      <div className="ai-form-actions">
                        <div className="prompt-pills">
                          <button
                            type="button"
                            onClick={() => setAiPrompt('Forecast inventory replenishment for November peak.')}
                          >
                            Inventory Forecast
                          </button>
                          <button
                            type="button"
                            onClick={() => setAiPrompt('Draft email to client with 10% prepayment discount.')}
                          >
                            Draft Offer
                          </button>
                        </div>
                        <button type="submit" className="ws-btn-primary" disabled={aiLoading}>
                          <Sparkles size={16} /> {aiLoading ? 'Synthesizing...' : 'Run Query'}
                        </button>
                      </div>
                    </form>
                    {aiResponse && (
                      <div className="ai-response-box">
                        <div className="ai-resp-header">
                          <CheckCircle2 size={16} color="#10b981" />
                          <span>Generated by PrimePro.ai Agent</span>
                        </div>
                        <pre>{aiResponse}</pre>
                      </div>
                    )}
                  </div>
                )}

                {app.id === 'pos' && (
                  <div className="interactive-card pos-interactive">
                    <h3>Point of Sale Terminal Simulation</h3>
                    <p>Real-time retail register with instant inventory sync.</p>
                    <div className="pos-sim-grid">
                      <div className="pos-catalog-col">
                        <h4>Popular Items</h4>
                        <div className="pos-item-buttons">
                          {[
                            { name: 'Industrial Servo 24V', price: 1450 },
                            { name: 'Bar Clamp 120mm', price: 420 },
                            { name: 'Sensor Module Pack', price: 890 },
                            { name: 'Thermal Receipt Rolls (5x)', price: 350 }
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="pos-item-btn"
                              onClick={() => setPosCart([...posCart, item])}
                            >
                              <span>{item.name}</span>
                              <strong>₹{item.price}</strong>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="pos-cart-col">
                        <h4>Current Receipt ({posCart.length} items)</h4>
                        <div className="pos-cart-list">
                          {posCart.map((c, i) => (
                            <div key={i} className="pos-cart-row">
                              <span>{c.name}</span>
                              <strong>₹{c.price}</strong>
                            </div>
                          ))}
                        </div>
                        <div className="pos-total-row">
                          <span>Total Amount:</span>
                          <strong>₹{posCart.reduce((acc, x) => acc + x.price, 0)}</strong>
                        </div>
                        <button
                          type="button"
                          className="ws-btn-primary full-w"
                          disabled={posCart.length === 0}
                          onClick={() => {
                            triggerAction(`Completed checkout for ₹${posCart.reduce((acc, x) => acc + x.price, 0)}!`);
                            setPosCart([]);
                          }}
                        >
                          <Check size={16} /> Complete Checkout & Print Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {app.id === 'discuss' && (
                  <div className="interactive-card discuss-interactive">
                    <h3>PrimePro.ai Discuss — #general-announcements</h3>
                    <div className="chat-window">
                      <div className="chat-msg-list">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className="chat-bubble-row">
                            <div className="chat-avatar">{msg.sender.charAt(0)}</div>
                            <div className="chat-bubble-content">
                              <div className="chat-header-meta">
                                <strong>{msg.sender}</strong>
                                <small>{msg.time}</small>
                              </div>
                              <p>{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <form onSubmit={handleSendChat} className="chat-input-bar">
                        <input
                          type="text"
                          placeholder="Type your message to the team..."
                          value={newMsg}
                          onChange={(e) => setNewMsg(e.target.value)}
                        />
                        <button type="submit" className="ws-btn-primary">
                          <Send size={15} /> Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {app.id !== 'ai' && app.id !== 'pos' && app.id !== 'discuss' && (
                  <div className="interactive-card default-interactive">
                    <div className="generic-workspace-visual">
                      <div className="generic-hero-badge" style={{ backgroundColor: app.bgColor, color: app.mainColor }}>
                        <Sparkles size={18} /> PrimePro.ai {app.name} Enterprise Engine
                      </div>
                      <h3>Real-Time Operational Center</h3>
                      <p>{app.description}</p>
                      <div className="generic-feature-checklist">
                        {app.features.map((feat, idx) => (
                          <div key={idx} className="feat-check-item">
                            <span className="feat-check-icon"><Check size={14} /></span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                      <div className="generic-action-row">
                        <button
                          type="button"
                          className="ws-btn-primary"
                          onClick={() => triggerAction(`Simulated action on ${app.name}`)}
                        >
                          Execute Automated Task
                        </button>
                        <button
                          type="button"
                          className="ws-btn-secondary"
                          onClick={() => triggerAction(`Triggered data sync for ${app.name}`)}
                        >
                          Sync with Cloud DB
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FEATURES & SPECS */}
            {activeTab === 'features' && (
              <div className="ws-features-panel">
                <div className="feature-specs-grid">
                  <div className="feature-specs-card">
                    <h3>Built-in Enterprise Capabilities</h3>
                    <p className="spec-desc">Every PrimePro.ai module is interconnected with the remaining 23 business applications with single sign-on and unified data modeling.</p>
                    <ul className="spec-list">
                      {app.features.map((f, i) => (
                        <li key={i}>
                          <CheckCircle2 size={16} className="spec-icon" />
                          <span><strong>{f}</strong>: Full REST API, automated webhooks, audit timestamps, and role-based access control.</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="feature-specs-card">
                    <h3>Integration & Compliance</h3>
                    <div className="spec-info-row">
                      <strong>Category:</strong>
                      <span>{app.category}</span>
                    </div>
                    <div className="spec-info-row">
                      <strong>Data Residency:</strong>
                      <span>Encrypted at rest & in transit (AES-256)</span>
                    </div>
                    <div className="spec-info-row">
                      <strong>Audit Logging:</strong>
                      <span>Enabled by default with ISO 27001 compliance</span>
                    </div>
                    <div className="spec-info-row">
                      <strong>REST API:</strong>
                      <span><code>/api/v1/{app.slug}/*</code></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM CROSS-NAVIGATION TO OTHER 23 APPS */}
            <div className="workspace-all-apps-nav">
              <div className="nav-heading-row">
                <h3>Switch to Another Business Application</h3>
                <Link to="/services" className="see-all-link">
                  View Full Directory <ChevronRight size={14} />
                </Link>
              </div>

              <div className="apps-quick-picker-grid">
                {APPS_DATA.filter((a) => a.id !== app.id).map((otherApp) => (
                  <Link
                    key={otherApp.id}
                    to={`/apps/${otherApp.slug}`}
                    className="quick-picker-item"
                    title={otherApp.name}
                  >
                    <div className="quick-picker-icon-box" style={{ backgroundColor: otherApp.bgColor }}>
                      <img
                        src={otherApp.iconSrc}
                        alt={otherApp.name}
                        onError={(e) => {
                          if (otherApp.svgSrc) e.currentTarget.src = otherApp.svgSrc;
                        }}
                      />
                    </div>
                    <span className="quick-picker-name">{otherApp.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL FOR NEW ENTRY */}
      <AnimatePresence>
        {modalOpen && (
          <div className="ws-modal-backdrop" onClick={() => setModalOpen(false)}>
            <motion.div
              className="ws-modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ws-modal-header">
                <h3>Create New {app.name} Record</h3>
                <button
                  type="button"
                  className="ws-close-modal"
                  onClick={() => setModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setModalOpen(false);
                  triggerAction(`Created new ${app.name} record`);
                }}
                className="ws-modal-form"
              >
                <div className="ws-form-group">
                  <label>Record Name / Title</label>
                  <input type="text" placeholder={`e.g. Q4 ${app.name} Entry`} required />
                </div>
                <div className="ws-form-group">
                  <label>Category / Reference</label>
                  <input type="text" defaultValue={app.category} />
                </div>
                <div className="ws-form-group">
                  <label>Notes / Description</label>
                  <textarea rows={3} placeholder="Provide relevant details or assignees..." />
                </div>
                <div className="ws-modal-actions">
                  <button
                    type="button"
                    className="ws-btn-secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="ws-btn-primary">
                    <Check size={16} /> Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
