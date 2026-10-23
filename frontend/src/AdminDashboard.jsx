import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CreditCard, Package, Layers,
  Receipt, ShieldCheck, HelpCircle, BarChart3, Mail,
  Clock, Zap, Settings, Search, Bell, Calendar, ChevronDown,
  Check, ArrowRight, TrendingUp, ArrowUpRight, DollarSign,
  Activity, AlertCircle, CheckCircle2, Plus, RefreshCw, X,
  Download, Shield, Building2, Phone, Filter, Eye, Lock,
  Edit3, Trash2, Send, ExternalLink, Sliders, Server, Globe,
  Key, UserPlus, FileText, CheckCircle, AlertTriangle
} from 'lucide-react';
import {
  getAdminMetrics, getAdminRevenueChart, getAdminGrowthChart,
  getAdminTopProducts, getAdminCustomers, getAdminTickets,
  getAdminInvoices, updateAdminTicket, updateCustomerStatus
} from './api';
import './dashboards.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Sub-tabs for Reports, Email, Settings
  const [reportsSubTab, setReportsSubTab] = useState('revenue');
  const [emailSubTab, setEmailSubTab] = useState('templates');
  const [settingsSubTab, setSettingsSubTab] = useState('general');

  // Top header state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('01 Oct 2026 – 31 Oct 2026');
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // -------------------------------------------------------------
  // DATA STATES WITH REALISTIC COMPLETE MOCK DATA FROM USER SPEC
  // -------------------------------------------------------------
  const [customers, setCustomers] = useState([
    { id: 1, name: 'RetailMart Solutions', email: 'contact@retailmart.com', plan: 'Business Plan', status: 'Active', country: 'India', joined: '23 Oct 2026', phone: '+91 98765 43210', amount: '₹12,899', apps: ['Sales Pro', 'Invoicing', 'Inventory'] },
    { id: 2, name: 'TechNova Enterprises', email: 'info@technova.com', plan: 'Professional Plan', status: 'Active', country: 'India', joined: '21 Oct 2026', phone: '+91 98111 22334', amount: '₹9,499', apps: ['HRMS Pro', 'Payroll'] },
    { id: 3, name: 'Innovate Systems', email: 'support@innovate.com', plan: 'HRMS Plan', status: 'Active', country: 'India', joined: '19 Oct 2026', phone: '+91 98222 33445', amount: '₹4,999', apps: ['HRMS Pro'] },
    { id: 4, name: 'NextGen Enterprises', email: 'admin@nextgen.com', plan: 'Starter Plan', status: 'Active', country: 'India', joined: '17 Oct 2026', phone: '+91 98333 44556', amount: '₹3,499', apps: ['CRM Essentials'] },
    { id: 5, name: 'Growth Marketing Co.', email: 'info@growthmarket.com', plan: 'Starter Plan', status: 'Active', country: 'India', joined: '16 Oct 2026', phone: '+91 98444 55667', amount: '₹3,499', apps: ['Marketing Pro'] },
    { id: 6, name: 'Global Services Ltd.', email: 'ops@globalservices.com', plan: 'Finance Plan', status: 'Active', country: 'India', joined: '14 Oct 2026', phone: '+91 98555 66778', amount: '₹4,999', apps: ['Finance Pro'] },
    { id: 7, name: 'Bright Finance Hub', email: 'info@brightfin.com', plan: 'Business Plan', status: 'Inactive', country: 'India', joined: '10 Oct 2026', phone: '+91 98666 77889', amount: '₹12,899', apps: ['Finance Pro', 'Billing Engine'] },
    { id: 8, name: 'PrimeTech Solutions', email: 'connect@primepro.ai', plan: 'Finance Plan', status: 'Active', country: 'India', joined: '02 Oct 2026', phone: '+91 89518 52227', amount: '₹4,999', apps: ['Finance Pro', 'API Hub'] }
  ]);

  const [subscriptions, setSubscriptions] = useState([
    { id: 'SUB-2026-081', customer: 'RetailMart Solutions', plan: 'OXOO Business Suite', amount: '₹12,899', cycle: 'Monthly', status: 'Active', nextBilling: '23 Nov 2026' },
    { id: 'SUB-2026-074', customer: 'TechNova Enterprises', plan: 'Professional Plan', amount: '₹9,499', cycle: 'Monthly', status: 'Active', nextBilling: '21 Nov 2026' },
    { id: 'SUB-2026-069', customer: 'Innovate Systems', plan: 'HRMS Pro', amount: '₹4,999', cycle: 'Monthly', status: 'Active', nextBilling: '19 Nov 2026' },
    { id: 'SUB-2026-055', customer: 'NextGen Enterprises', plan: 'Starter Plan', amount: '₹3,499', cycle: 'Monthly', status: 'Active', nextBilling: '17 Nov 2026' },
    { id: 'SUB-2026-042', customer: 'Growth Marketing Co.', plan: 'Marketing Pro', amount: '₹3,999', cycle: 'Monthly', status: 'Active', nextBilling: '16 Nov 2026' },
    { id: 'SUB-2026-038', customer: 'Global Services Ltd.', plan: 'Finance Pro', amount: '₹4,999', cycle: 'Yearly', status: 'Active', nextBilling: '14 Oct 2027' },
    { id: 'SUB-2026-029', customer: 'Bright Finance Hub', plan: 'OXOO Business Suite', amount: '₹12,899', cycle: 'Monthly', status: 'Expired', nextBilling: '10 Oct 2026' },
    { id: 'SUB-2026-015', customer: 'PrimeTech Solutions', plan: 'Finance Pro', amount: '₹4,999', cycle: 'Yearly', status: 'Active', nextBilling: '02 Oct 2027' },
    { id: 'SUB-2026-012', customer: 'CloudEdge Solutions', plan: 'HRMS Pro', amount: '₹4,999', cycle: 'Monthly', status: 'Cancelled', nextBilling: '01 Oct 2026' },
    { id: 'SUB-2026-008', customer: 'NetWave Digital', plan: 'Finance Plan', amount: '₹4,999', cycle: 'Monthly', status: 'Expiring Soon', nextBilling: '25 Oct 2026' }
  ]);

  const [productsPlans, setProductsPlans] = useState([
    { id: 1, product: 'OXOO Business Suite', plan: 'Starter Plan', price: '₹4,999', cycle: 'Monthly', status: 'Active' },
    { id: 2, product: 'OXOO Business Suite', plan: 'Professional Plan', price: '₹9,499', cycle: 'Monthly', status: 'Active' },
    { id: 3, product: 'OXOO Business Suite', plan: 'Business Plan', price: '₹12,899', cycle: 'Monthly', status: 'Active' },
    { id: 4, product: 'HRMS Pro', plan: 'HRMS Plan', price: '₹4,999', cycle: 'Monthly', status: 'Active' },
    { id: 5, product: 'Finance Pro', plan: 'Finance Plan', price: '₹4,999', cycle: 'Monthly', status: 'Active' },
    { id: 6, product: 'Marketing Pro', plan: 'Marketing Plan', price: '₹3,999', cycle: 'Monthly', status: 'Active' },
    { id: 7, product: 'Website Builder', plan: 'Website Plan', price: '₹2,499', cycle: 'Monthly', status: 'Active' },
    { id: 8, product: 'API Services', plan: 'API Developer Plan', price: '₹5,999', cycle: 'Monthly', status: 'Draft' }
  ]);

  const [applications, setApplications] = useState([
    { id: 'auth', name: 'Authentication (SSO)', desc: 'Manage access and single sign-on.', status: 'Active', users: '24 users', category: 'Security' },
    { id: 'finance', name: 'Finance Apps', desc: 'Accounting, invoicing and finance.', status: 'Active', users: '18 users', category: 'Finance' },
    { id: 'hrms', name: 'HRMS Apps', desc: 'Employee management and HR operations.', status: 'Active', users: '14 users', category: 'HR' },
    { id: 'marketing', name: 'Marketing Apps', desc: 'Campaigns and marketing tools.', status: 'Active', users: '12 users', category: 'Marketing' },
    { id: 'website', name: 'Website Apps', desc: 'Website builder and CMS.', status: 'Active', users: '15 users', category: 'Web' },
    { id: 'api', name: 'API Services', desc: 'API and integrations.', status: 'Active', users: '20 users', category: 'Integrations' }
  ]);

  const [invoices, setInvoices] = useState([
    { id: 'INV-2026-001', customer: 'TechSolutions Pvt Ltd', plan: 'Business Plan', amount: '₹12,899', status: 'Paid', date: '23 Oct 2026' },
    { id: 'INV-2026-002', customer: 'Innovate Systems', plan: 'Professional Plan', amount: '₹9,499', status: 'Paid', date: '21 Oct 2026' },
    { id: 'INV-2026-003', customer: 'NextGen Enterprises', plan: 'HRMS Plan', amount: '₹4,999', status: 'Paid', date: '19 Oct 2026' },
    { id: 'INV-2026-004', customer: 'Growth Marketing Co.', plan: 'Starter Plan', amount: '₹3,499', status: 'Paid', date: '17 Oct 2026' },
    { id: 'INV-2026-005', customer: 'Global Services Ltd.', plan: 'Finance Plan', amount: '₹4,999', status: 'Paid', date: '16 Oct 2026' },
    { id: 'INV-2026-006', customer: 'Bright Finance Hub', plan: 'Starter Plan', amount: '₹1,499', status: 'Pending', date: '14 Oct 2026' },
    { id: 'INV-2026-007', customer: 'Alpha Retail Pvt Ltd', plan: 'Professional Plan', amount: '₹9,499', status: 'Paid', date: '12 Oct 2026' },
    { id: 'INV-2026-008', customer: 'CloudEdge Solutions', plan: 'HRMS Plan', amount: '₹4,999', status: 'Paid', date: '10 Oct 2026' },
    { id: 'INV-2026-009', customer: 'DataMetrix India', plan: 'Starter Plan', amount: '₹3,499', status: 'Paid', date: '05 Oct 2026' },
    { id: 'INV-2026-010', customer: 'NextWave Digital', plan: 'Finance Plan', amount: '₹4,999', status: 'Paid', date: '02 Oct 2026' }
  ]);

  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Admin', email: 'admin@oxoo.ai', role: 'Super Admin', status: 'Active', joined: '01 Oct 2026' },
    { id: 2, name: 'Manminder Singh', email: 'manminder.singh@primepro.ai', role: 'Admin', status: 'Active', joined: '02 Oct 2026' },
    { id: 3, name: 'Rahul Kumar', email: 'rahul@oxoo.ai', role: 'Admin', status: 'Active', joined: '05 Oct 2026' },
    { id: 4, name: 'Priya Sharma', email: 'priya@oxoo.ai', role: 'Moderator', status: 'Active', joined: '08 Oct 2026' },
    { id: 5, name: 'Amit Verma', email: 'amit@oxoo.ai', role: 'Moderator', status: 'Active', joined: '11 Oct 2026' },
    { id: 6, name: 'Sneha Gupta', email: 'sneha@oxoo.ai', role: 'Staff', status: 'Active', joined: '15 Oct 2026' },
    { id: 7, name: 'Rohit Mehta', email: 'rohit@oxoo.ai', role: 'Staff', status: 'Active', joined: '18 Oct 2026' },
    { id: 8, name: 'Neha Jain', email: 'neha@oxoo.ai', role: 'Staff', status: 'Inactive', joined: '20 Oct 2026' }
  ]);

  const [tickets, setTickets] = useState([
    { id: 'OXOO-1142', customer: 'TechSolutions Pvt Ltd', subject: 'Email OTP not received', category: 'Technical', priority: 'Urgent', status: 'Open', date: '23 Oct 2026' },
    { id: 'OXOO-1141', customer: 'Innovate Systems', subject: 'Payment invoice clarification', category: 'Billing', priority: 'Medium', status: 'In Progress', date: '22 Oct 2026' },
    { id: 'OXOO-1140', customer: 'NextGen Enterprises', subject: 'Plan upgrade request', category: 'Subscription', priority: 'High', status: 'In Progress', date: '21 Oct 2026' },
    { id: 'OXOO-1139', customer: 'Growth Marketing Co.', subject: 'Login issue', category: 'Account Access', priority: 'High', status: 'Waiting for Customer', date: '20 Oct 2026' },
    { id: 'OXOO-1138', customer: 'Global Services Ltd.', subject: 'Invoice not received', category: 'Billing', priority: 'Low', status: 'Resolved', date: '19 Oct 2026' },
    { id: 'OXOO-1137', customer: 'Alpha Retail Pvt Ltd', subject: 'Feature request for HRMS', category: 'Feature Request', priority: 'Normal', status: 'Closed', date: '18 Oct 2026' },
    { id: 'OXOO-1136', customer: 'CloudEdge Solutions', subject: 'API integration help', category: 'Integration', priority: 'High', status: 'In Progress', date: '17 Oct 2026' },
    { id: 'OXOO-1135', customer: 'DataMetrix India', subject: 'Billing clarification', category: 'Billing', priority: 'Low', status: 'Open', date: '16 Oct 2026' }
  ]);

  const [emailTemplates, setEmailTemplates] = useState([
    { id: 1, name: 'OTP Verification', type: 'Transactional', status: 'Active', updated: '23 Oct 2026' },
    { id: 2, name: 'Welcome Email', type: 'Account', status: 'Active', updated: '22 Oct 2026' },
    { id: 3, name: 'Subscription Email', type: 'Billing', status: 'Active', updated: '21 Oct 2026' },
    { id: 4, name: 'Payment Receipt', type: 'Billing', status: 'Active', updated: '20 Oct 2026' },
    { id: 5, name: 'Invoice Generated', type: 'Billing', status: 'Active', updated: '19 Oct 2026' },
    { id: 6, name: 'Plan Upgrade Notification', type: 'Billing', status: 'Active', updated: '18 Oct 2026' },
    { id: 7, name: 'Subscription Renewal Reminder', type: 'Billing', status: 'Active', updated: '17 Oct 2026' },
    { id: 8, name: 'Password Reset', type: 'Security', status: 'Active', updated: '15 Oct 2026' },
    { id: 9, name: 'Support Ticket Update', type: 'Support', status: 'Active', updated: '14 Oct 2026' }
  ]);

  const [notificationLogs, setNotificationLogs] = useState([
    { id: 1, date: '23 Oct 2026, 12:45 PM', recipient: 'manminder.singh@primepro.ai', template: 'OTP Verification', status: 'Delivered', provider: 'Brevo' },
    { id: 2, date: '23 Oct 2026, 11:20 AM', recipient: 'contact@retailmart.com', template: 'Payment Receipt', status: 'Delivered', provider: 'Brevo' },
    { id: 3, date: '22 Oct 2026, 04:30 PM', recipient: 'info@technova.com', template: 'Invoice Generated', status: 'Delivered', provider: 'Brevo' },
    { id: 4, date: '22 Oct 2026, 02:15 PM', recipient: 'support@innovate.com', template: 'Welcome Email', status: 'Delivered', provider: 'Brevo' },
    { id: 5, date: '21 Oct 2026, 09:10 AM', recipient: 'admin@nextgen.com', template: 'Subscription Email', status: 'Delivered', provider: 'Brevo' }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 'EVT-8901', time: '23 Oct 2026, 12:45 PM', user: 'manminder.singh', action: 'Email OTP Sent', resource: 'Auth SSO', ip: '103.24.12.5', result: 'Success' },
    { id: 'EVT-8900', time: '23 Oct 2026, 11:20 AM', user: 'rahul', action: 'Customer Updated', resource: 'RetailMart Solutions', ip: '49.36.110.12', result: 'Success' },
    { id: 'EVT-8899', time: '23 Oct 2026, 09:14 AM', user: 'sales@company.com', action: 'Subscription Activated', resource: 'PrimeTech Solutions', ip: '152.58.20.91', result: 'Success' },
    { id: 'EVT-8898', time: '22 Oct 2026, 04:30 PM', user: 'priya', action: 'Plan Updated', resource: 'HRMS Pro', ip: '49.36.110.12', result: 'Success' },
    { id: 'EVT-8897', time: '22 Oct 2026, 03:15 PM', user: 'system', action: 'Payment Received', resource: 'INV-2026-001', ip: '13.235.11.89', result: 'Success' },
    { id: 'EVT-8896', time: '22 Oct 2026, 01:10 PM', user: 'amit', action: 'User Invited', resource: 'Sneha Gupta', ip: '49.36.110.15', result: 'Success' },
    { id: 'EVT-8895', time: '21 Oct 2026, 05:40 PM', user: 'manminder.singh', action: 'Application Config Updated', resource: 'Authentication (SSO)', ip: '103.24.12.5', result: 'Success' },
    { id: 'EVT-8894', time: '21 Oct 2026, 02:22 PM', user: 'priya', action: 'Support Ticket Updated', resource: 'OXOO-1142', ip: '49.36.110.12', result: 'Success' },
    { id: 'EVT-8893', time: '20 Oct 2026, 10:05 AM', user: 'unknown', action: 'Login Failed', resource: 'Admin Console', ip: '185.220.101.5', result: 'Failed' }
  ]);

  const [integrations, setIntegrations] = useState([
    { id: 'stripe', name: 'Stripe Payments', category: 'Payment Gateway', desc: 'Process online payments and subscriptions.', status: 'Connected', icon: 'S', color: '#635bff' },
    { id: 'razorpay', name: 'Razorpay', category: 'Payment Gateway', desc: 'Accept payments through supported Indian payment methods.', status: 'Connected', icon: 'R', color: '#0c2340' },
    { id: 'brevo', name: 'Brevo', category: 'Email Service', desc: 'Send OTPs, invoices and transactional emails.', status: 'Connected', icon: 'B', color: '#0b996f' },
    { id: 'resend', name: 'Resend', category: 'Email Service', desc: 'Send transactional emails through an email API.', status: 'Not Connected', icon: 'Re', color: '#000000' },
    { id: 'google', name: 'Google Workspace', category: 'Email / Identity', desc: 'Connect supported Google services.', status: 'Connected', icon: 'G', color: '#ea4335' },
    { id: 'ms365', name: 'Microsoft 365', category: 'Productivity', desc: 'Connect supported Microsoft services.', status: 'Not Connected', icon: 'M', color: '#0078d4' },
    { id: 'slack', name: 'Slack', category: 'Notifications', desc: 'Send platform alerts to Slack.', status: 'Not Connected', icon: 'Sl', color: '#4a154b' },
    { id: 'webhooks', name: 'Webhooks', category: 'API Integration', desc: 'Send platform events to external systems.', status: 'Connected', icon: 'W', color: '#0284c7' }
  ]);

  // Modals state
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showGenerateInvoiceModal, setShowGenerateInvoiceModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [selectedAppConfig, setSelectedAppConfig] = useState(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form states for adding items
  const [newCustomerForm, setNewCustomerForm] = useState({ company: '', legalName: '', contact: '', email: '', phone: '', country: 'India', address: '', gstin: '', plan: 'Business Plan' });
  const [newSubForm, setNewSubForm] = useState({ customer: 'RetailMart Solutions', plan: 'OXOO Business Suite', cycle: 'Monthly', users: '10', startDate: '2026-10-23', nextDate: '2026-11-23', status: 'Active' });
  const [newProdForm, setNewProdForm] = useState({ name: '', code: '', desc: '', category: 'Business', appUrl: '', status: 'Active' });
  const [newPlanForm, setNewPlanForm] = useState({ name: '', code: '', product: 'OXOO Business Suite', cycle: 'Monthly', price: '₹4,999', users: '10', status: 'Active' });
  const [newInvoiceForm, setNewInvoiceForm] = useState({ customer: 'RetailMart Solutions', email: 'contact@retailmart.com', number: 'INV-2026-011', date: '2026-10-23', dueDate: '2026-11-05', amount: '₹12,899', status: 'Paid' });
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', phone: '', role: 'Staff', status: 'Active', sendInvite: true });
  const [newTicketForm, setNewTicketForm] = useState({ customer: 'RetailMart Solutions', subject: '', category: 'Technical', priority: 'High', agent: 'Priya Sharma', desc: '' });

  // Sync latest checkout from localStorage
  useEffect(() => {
    try {
      const lo = localStorage.getItem('oxoo_last_order');
      if (lo) {
        const parsed = JSON.parse(lo);
        const comp = parsed.company || parsed.companyName;
        if (comp && !customers.some(c => c.name.toLowerCase() === comp.toLowerCase())) {
          setCustomers(prev => [{
            id: prev.length + 1,
            name: comp,
            email: parsed.email || parsed.customerEmail || 'admin@' + comp.toLowerCase().replace(/[^a-z]/g, '') + '.com',
            plan: parsed.plan || parsed.planName || 'Single Software',
            status: 'Active',
            country: 'India',
            joined: '23 Oct 2026',
            phone: parsed.phone || parsed.customerPhone || '+91 98765 43210',
            amount: parsed.amount || '₹660.8',
            apps: parsed.apps || ['Sales Software']
          }, ...prev]);
        }
      }
    } catch (e) {}
  }, []);

  return (
    <div className="oxoo-dashboard-layout">
      {/* ---------------------------------------------------------
          SIDEBAR NAVIGATION (13 SECTIONS MATCHING THE COMPLETE SPEC)
          --------------------------------------------------------- */}
      <aside className="oxoo-sidebar">
        <div className="oxoo-sidebar-top">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="oxoo-brand-container">
            <div className="oxoo-brand-logo-wrap">
              <img
                src="/oxoo-logo-white.png"
                alt="Oxoo"
                className="oxoo-brand-logo-img"
              />
            </div>
            <span className="oxoo-tagline-text">One Platform. Infinite Possibilities.</span>
          </Link>

          {/* Navigation Items */}
          <nav className="oxoo-nav-menu">
            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="oxoo-nav-icon" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users className="oxoo-nav-icon" />
              <span>Customers</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('subscriptions')}
            >
              <CreditCard className="oxoo-nav-icon" />
              <span>Subscriptions</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package className="oxoo-nav-icon" />
              <span>Products & Plans</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <Layers className="oxoo-nav-icon" />
              <span>Applications</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <Receipt className="oxoo-nav-icon" />
              <span>Payments & Invoices</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <ShieldCheck className="oxoo-nav-icon" />
              <span>Users & Roles</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              <HelpCircle className="oxoo-nav-icon" />
              <span>Support Tickets</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <BarChart3 className="oxoo-nav-icon" />
              <span>Reports & Analytics</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <Mail className="oxoo-nav-icon" />
              <span>Email & Notifications</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <Clock className="oxoo-nav-icon" />
              <span>Audit Logs</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
            >
              <Zap className="oxoo-nav-icon" />
              <span>Integrations</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="oxoo-nav-icon" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Profile */}
        <div className="oxoo-sidebar-bottom">
          <div className="oxoo-fluid-waves-art" />
          <div
            className="oxoo-sidebar-profile"
            onClick={() => setAdminMenuOpen(!adminMenuOpen)}
          >
            <div className="oxoo-profile-avatar-circle">A</div>
            <div className="oxoo-profile-meta">
              <span className="oxoo-profile-name">Admin</span>
              <span className="oxoo-profile-sub">Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------------
          MAIN CONTENT VIEWPORT
          --------------------------------------------------------- */}
      <div className="oxoo-main-viewport">
        {/* Top Header */}
        <header className="oxoo-top-header">
          <div className="oxoo-header-left">
            <div className="oxoo-search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                className="oxoo-search-input"
                placeholder="Search customers, subscriptions, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="oxoo-header-right">
            {/* Quick Switch to Customer Dashboard */}
            <button
              type="button"
              className="oxoo-portal-switch-pill"
              onClick={() => navigate('/customer')}
              title="Access Customer Portal"
            >
              <Users size={13} />
              <span>Customer Portal</span>
            </button>

            {/* Date-Range Selector Pill */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-date-badge-btn"
                onClick={() => setDateRangePickerOpen(!dateRangePickerOpen)}
              >
                <Calendar size={14} color="#64748b" />
                <span>{selectedDateRange}</span>
                <ChevronDown size={13} color="#94a3b8" />
              </button>

              <AnimatePresence>
                {dateRangePickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '46px',
                      width: '240px',
                      background: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      zIndex: 200
                    }}
                  >
                    {[
                      '01 Oct 2026 – 31 Oct 2026',
                      'Last 7 Days',
                      'Last 30 Days',
                      'Q3 2026 (Jul - Sep)',
                      'Year to Date (2026)'
                    ].map((range) => (
                      <button
                        key={range}
                        type="button"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          background: selectedDateRange === range ? '#f0f9ff' : 'none',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: selectedDateRange === range ? 600 : 400,
                          color: selectedDateRange === range ? '#0284c7' : '#334155',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSelectedDateRange(range);
                          setDateRangePickerOpen(false);
                          showToast(`Reporting window: ${range}`);
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-header-icon-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="oxoo-badge-dot" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '48px',
                      width: '320px',
                      background: '#ffffff',
                      borderRadius: '16px',
                      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      zIndex: 200
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>Platform Alerts (2)</strong>
                      <span style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer' }} onClick={() => setNotifOpen(false)}>Close</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '12px', padding: '10px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                        <div style={{ fontWeight: 600, color: '#065f46' }}>PostgreSQL Cluster Ready</div>
                        <div style={{ color: '#047857' }}>All system services operational.</div>
                      </div>
                      <div style={{ fontSize: '12px', padding: '10px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontWeight: 600, color: '#1e40af' }}>Brevo SMTP Active</div>
                        <div style={{ color: '#1d4ed8' }}>OTP and invoice dispatch verified.</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Help Button */}
            <button
              type="button"
              className="oxoo-header-icon-btn"
              onClick={() => showToast('Oxoo Governance SLA: 99.99% Operational')}
              aria-label="Help"
            >
              <HelpCircle size={18} />
            </button>

            {/* Admin Avatar Menu */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-user-dropdown-btn"
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              >
                <div className="oxoo-profile-avatar-circle" style={{ width: '34px', height: '34px' }}>A</div>
                <div className="oxoo-user-info-text">
                  <span className="oxoo-user-name">Admin</span>
                  <span className="oxoo-user-org">Super Administrator</span>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </button>

              <AnimatePresence>
                {adminMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '52px',
                      width: '220px',
                      background: '#ffffff',
                      borderRadius: '14px',
                      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Super Administrator</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>admin@oxoo.ai</div>
                    </div>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { setActiveTab('settings'); setAdminMenuOpen(false); }}
                    >
                      Platform Settings
                    </button>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { navigate('/customer'); setAdminMenuOpen(false); }}
                    >
                      Customer View
                    </button>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#dc2626', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => navigate('/signin')}
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Global Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                top: '24px',
                right: '32px',
                background: '#0f172a',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} color="#34d399" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            CANVAS: 13 PAGE VIEWS
            ========================================================= */}
        <main className="oxoo-content-canvas">

          {/* -------------------------------------------------------
              1. DASHBOARD
              ------------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header Row: Title & System Status Panel */}
              <div className="oxoo-admin-top-split">
                <div>
                  <h1 className="oxoo-welcome-title">Admin Dashboard</h1>
                  <p className="oxoo-welcome-sub">
                    Overview of your OXOO platform, customers, revenue and applications.
                  </p>
                </div>

                {/* System Status Panel */}
                <div className="oxoo-status-compact-card">
                  <div className="oxoo-status-card-header">
                    <span className="oxoo-status-header-title">System Status</span>
                    <span className="oxoo-status-all-good">● All Services Operational</span>
                  </div>
                  <div className="oxoo-status-item-row">
                    <span className="oxoo-status-label">Authentication (SSO)</span>
                    <span className="oxoo-status-val-green">Operational</span>
                  </div>
                  <div className="oxoo-status-item-row">
                    <span className="oxoo-status-label">Finance Apps</span>
                    <span className="oxoo-status-val-green">Operational</span>
                  </div>
                  <div className="oxoo-status-item-row">
                    <span className="oxoo-status-label">HRMS Apps</span>
                    <span className="oxoo-status-val-green">Operational</span>
                  </div>
                  <div className="oxoo-status-item-row">
                    <span className="oxoo-status-label">Marketing Apps</span>
                    <span className="oxoo-status-val-green">Operational</span>
                  </div>
                  <div className="oxoo-status-item-row">
                    <span className="oxoo-status-label">Website Apps</span>
                    <span className="oxoo-status-val-green">Operational</span>
                  </div>
                  <div className="oxoo-status-item-row">
                    <span className="oxoo-status-label">API Services</span>
                    <span className="oxoo-status-val-green">Operational</span>
                  </div>
                </div>
              </div>

              {/* KPI Cards (Exact Values from User Spec) */}
              <div className="oxoo-summary-grid">
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap blue">
                      <Users size={22} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      <TrendingUp size={12} /> +12%
                    </span>
                  </div>
                  <div>
                    <span className="oxoo-metric-value">24</span>
                    <span className="oxoo-metric-label">Total Customers</span>
                  </div>
                </div>

                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap gold">
                      <CreditCard size={22} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      <TrendingUp size={12} /> +10%
                    </span>
                  </div>
                  <div>
                    <span className="oxoo-metric-value">24</span>
                    <span className="oxoo-metric-label">Active Subscriptions</span>
                  </div>
                </div>

                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap cyan">
                      <DollarSign size={22} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      <TrendingUp size={12} /> +18%
                    </span>
                  </div>
                  <div>
                    <span className="oxoo-metric-value">₹89,302</span>
                    <span className="oxoo-metric-label">Monthly Revenue</span>
                  </div>
                </div>

                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap purple">
                      <Activity size={22} />
                    </div>
                    <span className="oxoo-metric-badge gray">
                      0% converted
                    </span>
                  </div>
                  <div>
                    <span className="oxoo-metric-value">0%</span>
                    <span className="oxoo-metric-label">Trial Conversions</span>
                  </div>
                </div>
              </div>

              {/* Charts Row: Revenue Overview & Customer Growth */}
              <div className="oxoo-charts-row">
                {/* Revenue Overview */}
                <div className="oxoo-chart-card">
                  <div className="oxoo-chart-header">
                    <div>
                      <span className="oxoo-chart-title">Revenue Overview</span>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Monthly revenue trend</span>
                    </div>
                    <select className="oxoo-chart-dropdown" defaultValue="Monthly">
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="oxoo-svg-chart-wrap">
                    <svg className="oxoo-chart-svg" viewBox="0 0 500 180">
                      {[
                        { y: 30, label: '₹100k' },
                        { y: 65, label: '₹75k' },
                        { y: 100, label: '₹50k' },
                        { y: 135, label: '₹25k' }
                      ].map((g) => (
                        <g key={g.label}>
                          <line x1="45" y1={g.y} x2="480" y2={g.y} stroke="#f1f5f9" strokeDasharray="3 3" />
                          <text x="35" y={g.y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{g.label}</text>
                        </g>
                      ))}
                      {/* Smooth Area Gradient & Line */}
                      <defs>
                        <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 50,150 Q 120,135 180,110 T 320,80 T 420,55 L 470,45 L 470,160 L 50,160 Z"
                        fill="url(#adminRevGrad)"
                      />
                      <path
                        d="M 50,150 Q 120,135 180,110 T 320,80 T 420,55 L 470,45"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="3"
                      />
                      {/* Milestone Dot on ₹89,302 */}
                      <circle cx="470" cy="45" r="5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Customer Growth */}
                <div className="oxoo-chart-card">
                  <div className="oxoo-chart-header">
                    <div>
                      <span className="oxoo-chart-title">Customer Growth</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#38bdf8' }} /> New Customers
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2563eb' }} /> Total Customers
                        </span>
                      </div>
                    </div>
                    <select className="oxoo-chart-dropdown" defaultValue="Monthly">
                      <option value="Monthly">Monthly</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>

                  <div className="oxoo-svg-chart-wrap">
                    <svg className="oxoo-chart-svg" viewBox="0 0 500 180">
                      {[
                        { y: 30, label: '30' },
                        { y: 70, label: '20' },
                        { y: 110, label: '10' },
                        { y: 150, label: '0' }
                      ].map((g) => (
                        <g key={g.label}>
                          <line x1="40" y1={g.y} x2="480" y2={g.y} stroke="#f1f5f9" strokeDasharray="3 3" />
                          <text x="30" y={g.y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{g.label}</text>
                        </g>
                      ))}
                      {/* Bar groups */}
                      {[
                        { m: 'May', x: 60, n: 25, t: 50 },
                        { m: 'Jun', x: 130, n: 30, t: 65 },
                        { m: 'Jul', x: 200, n: 35, t: 80 },
                        { m: 'Aug', x: 270, n: 40, t: 95 },
                        { m: 'Sep', x: 340, n: 50, t: 110 },
                        { m: 'Oct', x: 410, n: 60, t: 125 }
                      ].map((b) => (
                        <g key={b.m}>
                          <rect x={b.x} y={150 - b.n} width="14" height={b.n} rx="3" fill="#38bdf8" />
                          <rect x={b.x + 16} y={150 - b.t} width="14" height={b.t} rx="3" fill="#2563eb" />
                          <text x={b.x + 15} y="168" fill="#94a3b8" fontSize="10" textAnchor="middle">{b.m}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Recent Activity & Latest Payments */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Recent Activity */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h3 className="oxoo-section-title">Recent Activity</h3>
                    <span style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer' }} onClick={() => setActiveTab('audit')}>View Full Audit</span>
                  </div>
                  <table className="oxoo-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>23 Oct, 12:45 PM</td>
                        <td style={{ fontWeight: 600 }}>manminder.singh</td>
                        <td><span className="oxoo-status-tag active">Email OTP Request</span></td>
                        <td>Brevo SMTP OTP triggered</td>
                      </tr>
                      <tr>
                        <td>23 Oct, 11:20 AM</td>
                        <td style={{ fontWeight: 600 }}>rahul@oxoo.ai</td>
                        <td><span className="oxoo-status-tag active">Customer Updated</span></td>
                        <td>RetailMart plan set to Active</td>
                      </tr>
                      <tr>
                        <td>23 Oct, 09:14 AM</td>
                        <td style={{ fontWeight: 600 }}>sales@company.com</td>
                        <td><span className="oxoo-status-tag active">New Subscription</span></td>
                        <td>PrimeTech subscribed to Business Suite</td>
                      </tr>
                      <tr>
                        <td>22 Oct, 04:30 PM</td>
                        <td style={{ fontWeight: 600 }}>priya@oxoo.ai</td>
                        <td><span className="oxoo-status-tag active">Product Update</span></td>
                        <td>HRMS Pro feature flags published</td>
                      </tr>
                      <tr>
                        <td>22 Oct, 01:15 PM</td>
                        <td style={{ fontWeight: 600 }}>support@company.com</td>
                        <td><span className="oxoo-status-tag trial">Support Ticket</span></td>
                        <td>Ticket #OXOO-1142 assigned to Priya</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Latest Payments */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h3 className="oxoo-section-title">Latest Payments</h3>
                    <span style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer' }} onClick={() => setActiveTab('payments')}>View All</span>
                  </div>
                  <table className="oxoo-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Plan</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.slice(0, 5).map((inv) => (
                        <tr key={inv.id}>
                          <td>{inv.date}</td>
                          <td style={{ fontWeight: 600 }}>{inv.customer}</td>
                          <td>{inv.plan}</td>
                          <td className="oxoo-table-amount">{inv.amount}</td>
                          <td>
                            <span className={`oxoo-status-tag ${inv.status.toLowerCase()}`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              2. CUSTOMERS
              ------------------------------------------------------- */}
          {activeTab === 'customers' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Customers</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage all your customers, view details, subscriptions and activity.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setShowAddCustomerModal(true)}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> + Add Customer
                </button>
              </div>

              {/* Summary Cards */}
              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Customers</span>
                  <span className="oxoo-metric-value">24</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Active</span>
                  <span className="oxoo-metric-value" style={{ color: '#059669' }}>22</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Inactive</span>
                  <span className="oxoo-metric-value" style={{ color: '#dc2626' }}>2</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">New This Month</span>
                  <span className="oxoo-metric-value" style={{ color: '#0284c7' }}>6</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-filter-search">
                    <Search size={14} className="oxoo-filter-search-icon" />
                    <input type="text" placeholder="Search customers..." />
                  </div>
                  <select className="oxoo-filter-select" defaultValue="All Status">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Plans">
                    <option>All Plans</option>
                    <option>Business Plan</option>
                    <option>Professional Plan</option>
                    <option>HRMS Plan</option>
                    <option>Finance Plan</option>
                    <option>Starter Plan</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Countries">
                    <option>All Countries</option>
                    <option>India</option>
                    <option>United States</option>
                    <option>United Arab Emirates</option>
                    <option>Singapore</option>
                  </select>
                </div>
              </div>

              {/* Customers Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}><input type="checkbox" /></th>
                      <th>Name / Company</th>
                      <th>Email</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Country</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td><input type="checkbox" /></td>
                        <td className="oxoo-table-company">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={16} color="#0284c7" />
                            <span>{c.name}</span>
                          </div>
                        </td>
                        <td>{c.email}</td>
                        <td>{c.plan}</td>
                        <td>
                          <span className={`oxoo-status-tag ${c.status.toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>{c.country}</td>
                        <td>{c.joined}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => setSelectedCustomerDetail(c)}
                            >
                              View Customer
                            </button>
                            <button
                              type="button"
                              style={{
                                padding: '4px 8px',
                                fontSize: '11px',
                                borderRadius: '8px',
                                border: 'none',
                                background: c.status === 'Active' ? '#fef2f2' : '#ecfdf5',
                                color: c.status === 'Active' ? '#dc2626' : '#059669',
                                cursor: 'pointer',
                                fontWeight: 600
                              }}
                              onClick={() => {
                                setCustomers(customers.map(item => item.id === c.id ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' } : item));
                                showToast(`${c.name} account status updated.`);
                              }}
                            >
                              {c.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              3. SUBSCRIPTIONS
              ------------------------------------------------------- */}
          {activeTab === 'subscriptions' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Subscriptions</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage customer subscriptions, renewals and billing cycles.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setShowAddSubscriptionModal(true)}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> + New Subscription
                </button>
              </div>

              {/* Summary Cards */}
              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Subscriptions</span>
                  <span className="oxoo-metric-value">24</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Active</span>
                  <span className="oxoo-metric-value" style={{ color: '#059669' }}>22</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Cancelled</span>
                  <span className="oxoo-metric-value" style={{ color: '#dc2626' }}>1</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Expiring Soon</span>
                  <span className="oxoo-metric-value" style={{ color: '#d97706' }}>3</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-filter-search">
                    <Search size={14} className="oxoo-filter-search-icon" />
                    <input type="text" placeholder="Search subscriptions..." />
                  </div>
                  <select className="oxoo-filter-select" defaultValue="All Status">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Trialing</option>
                    <option>Pending</option>
                    <option>Past Due</option>
                    <option>Cancelled</option>
                    <option>Expired</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Plans">
                    <option>All Plans</option>
                    <option>OXOO Business Suite</option>
                    <option>HRMS Pro</option>
                    <option>Finance Pro</option>
                    <option>Starter Plan</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Billing Cycles">
                    <option>All Billing Cycles</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                    <option>One-Time</option>
                  </select>
                </div>
              </div>

              {/* Subscription Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Subscription ID</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Billing Cycle</th>
                      <th>Status</th>
                      <th>Next Billing</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s) => (
                      <tr key={s.id}>
                        <td className="oxoo-table-company">{s.customer}</td>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.id}</span></td>
                        <td>{s.plan}</td>
                        <td className="oxoo-table-amount">{s.amount}</td>
                        <td>{s.cycle}</td>
                        <td>
                          <span className={`oxoo-status-tag ${s.status.toLowerCase().replace(' ', '-')}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>{s.nextBilling}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Managing subscription ${s.id}`)}
                            >
                              Manage
                            </button>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Invoice downloaded for ${s.id}`)}
                            >
                              Invoice
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              4. PRODUCTS & PLANS
              ------------------------------------------------------- */}
          {activeTab === 'products' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Products & Plans</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage your products, pricing and features.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="oxoo-outline-btn"
                    onClick={() => setShowAddPlanModal(true)}
                  >
                    + Add Plan
                  </button>
                  <button
                    type="button"
                    className="oxoo-upgrade-btn"
                    onClick={() => setShowAddProductModal(true)}
                  >
                    <Plus size={14} style={{ marginRight: '6px' }} /> + Add Product
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Products</span>
                  <span className="oxoo-metric-value">6</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Plans</span>
                  <span className="oxoo-metric-value">18</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Active Plans</span>
                  <span className="oxoo-metric-value" style={{ color: '#059669' }}>16</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Draft Plans</span>
                  <span className="oxoo-metric-value" style={{ color: '#64748b' }}>2</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-filter-search">
                    <Search size={14} className="oxoo-filter-search-icon" />
                    <input type="text" placeholder="Search products or plans..." />
                  </div>
                  <select className="oxoo-filter-select" defaultValue="All Products">
                    <option>All Products</option>
                    <option>OXOO Business Suite</option>
                    <option>HRMS Pro</option>
                    <option>Finance Pro</option>
                    <option>Marketing Pro</option>
                    <option>Website Builder</option>
                    <option>API Services</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Status">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>

              {/* Products & Plans Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Icon</th>
                      <th>Product</th>
                      <th>Plan Name</th>
                      <th>Price</th>
                      <th>Billing Cycle</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsPlans.map((pp) => (
                      <tr key={pp.id}>
                        <td>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                            <Package size={16} />
                          </div>
                        </td>
                        <td className="oxoo-table-company">{pp.product}</td>
                        <td>{pp.plan}</td>
                        <td className="oxoo-table-amount">{pp.price}</td>
                        <td>{pp.cycle}</td>
                        <td>
                          <span className={`oxoo-status-tag ${pp.status.toLowerCase()}`}>
                            {pp.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Editing product ${pp.product}`)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Configuring modules for ${pp.plan}`)}
                            >
                              Modules
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              5. APPLICATIONS
              ------------------------------------------------------- */}
          {activeTab === 'applications' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Applications</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage all applications in your OXOO platform.
                  </p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Applications</span>
                  <span className="oxoo-metric-value">6</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Active</span>
                  <span className="oxoo-metric-value" style={{ color: '#059669' }}>6</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Under Maintenance</span>
                  <span className="oxoo-metric-value" style={{ color: '#64748b' }}>0</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Global Health</span>
                  <span className="oxoo-metric-value" style={{ color: '#0284c7' }}>100%</span>
                </div>
              </div>

              {/* Applications Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {applications.map((app) => (
                  <div key={app.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layers size={20} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '15px', color: '#0f172a' }}>{app.name}</strong>
                            <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>{app.category}</div>
                          </div>
                        </div>
                        <span className="oxoo-status-tag active">● {app.status}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{app.desc}</p>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Active Instances: <strong>{app.users}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        style={{ flex: 1 }}
                        onClick={() => setSelectedAppConfig(app)}
                      >
                        Configure
                      </button>
                      <button
                        type="button"
                        className="oxoo-upgrade-btn"
                        style={{ flex: 1, padding: '8px 14px' }}
                        onClick={() => showToast(`Launching ${app.name} enterprise interface...`)}
                      >
                        Open App
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              6. PAYMENTS & INVOICES
              ------------------------------------------------------- */}
          {activeTab === 'payments' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Payments & Invoices</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage payments, invoices and transaction history.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setShowGenerateInvoiceModal(true)}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> + Generate Invoice
                </button>
              </div>

              {/* Summary Cards */}
              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Revenue</span>
                  <span className="oxoo-metric-value">₹89,302</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Paid</span>
                  <span className="oxoo-metric-value" style={{ color: '#059669' }}>₹87,803</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Pending</span>
                  <span className="oxoo-metric-value" style={{ color: '#d97706' }}>₹1,499</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Refunds</span>
                  <span className="oxoo-metric-value" style={{ color: '#64748b' }}>₹0</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-filter-search">
                    <Search size={14} className="oxoo-filter-search-icon" />
                    <input type="text" placeholder="Search by customer, invoice or transaction..." />
                  </div>
                  <select className="oxoo-filter-select" defaultValue="All Status">
                    <option>All Status</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Failed</option>
                    <option>Refunded</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Payment Methods">
                    <option>All Payment Methods</option>
                    <option>Razorpay</option>
                    <option>Stripe</option>
                    <option>UPI / NetBanking</option>
                  </select>
                </div>
              </div>

              {/* Payments Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30px' }}><input type="checkbox" /></th>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th>Plan</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td><input type="checkbox" /></td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.id}</td>
                        <td className="oxoo-table-company">{inv.customer}</td>
                        <td>{inv.plan}</td>
                        <td className="oxoo-table-amount">{inv.amount}</td>
                        <td>
                          <span className={`oxoo-status-tag ${inv.status.toLowerCase()}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td>{inv.date}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Invoice PDF downloaded for ${inv.id}`)}
                            >
                              Download PDF
                            </button>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Invoice ${inv.id} resent to customer email.`)}
                            >
                              Resend
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              7. USERS & ROLES
              ------------------------------------------------------- */}
          {activeTab === 'users' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Users & Roles</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage your platform users, roles and permissions.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setShowAddUserModal(true)}
                >
                  <UserPlus size={14} style={{ marginRight: '6px' }} /> + Add User
                </button>
              </div>

              {/* Summary Cards */}
              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Users</span>
                  <span className="oxoo-metric-value">8</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Super Admins</span>
                  <span className="oxoo-metric-value" style={{ color: '#0284c7' }}>3</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Moderators</span>
                  <span className="oxoo-metric-value" style={{ color: '#8b5cf6' }}>2</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Staff</span>
                  <span className="oxoo-metric-value" style={{ color: '#64748b' }}>3</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-filter-search">
                    <Search size={14} className="oxoo-filter-search-icon" />
                    <input type="text" placeholder="Search users..." />
                  </div>
                  <select className="oxoo-filter-select" defaultValue="All Roles">
                    <option>All Roles</option>
                    <option>Super Admin</option>
                    <option>Admin</option>
                    <option>Moderator</option>
                    <option>Support Staff</option>
                    <option>Billing Manager</option>
                    <option>Read-Only Analyst</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Status">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Avatar</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                            {u.name.charAt(0)}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: u.role === 'Super Admin' ? '#f3e8ff' : u.role === 'Admin' ? '#e0f2fe' : '#f1f5f9', color: u.role === 'Super Admin' ? '#7e22ce' : u.role === 'Admin' ? '#0284c7' : '#475569' }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span className={`oxoo-status-tag ${u.status.toLowerCase()}`}>
                            {u.status}
                          </span>
                        </td>
                        <td>{u.joined}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Editing permissions for ${u.name}`)}
                            >
                              Permissions
                            </button>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Password reset link sent to ${u.email}`)}
                            >
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              8. SUPPORT TICKETS
              ------------------------------------------------------- */}
          {activeTab === 'tickets' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Support Tickets</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage customer support issues and requests.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setShowCreateTicketModal(true)}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> + New Ticket
                </button>
              </div>

              {/* Summary Cards */}
              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Tickets</span>
                  <span className="oxoo-metric-value">12</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Open</span>
                  <span className="oxoo-metric-value" style={{ color: '#dc2626' }}>4</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">In Progress</span>
                  <span className="oxoo-metric-value" style={{ color: '#d97706' }}>5</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Resolved</span>
                  <span className="oxoo-metric-value" style={{ color: '#059669' }}>3</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-filter-search">
                    <Search size={14} className="oxoo-filter-search-icon" />
                    <input type="text" placeholder="Search tickets..." />
                  </div>
                  <select className="oxoo-filter-select" defaultValue="All Status">
                    <option>All Status</option>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Waiting for Customer</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Priority">
                    <option>All Priority</option>
                    <option>Low</option>
                    <option>Normal</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Categories">
                    <option>All Categories</option>
                    <option>Technical</option>
                    <option>Billing</option>
                    <option>Account Access</option>
                    <option>Subscription</option>
                    <option>Feature Request</option>
                    <option>Integration</option>
                  </select>
                </div>
              </div>

              {/* Tickets Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Customer</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{t.id}</td>
                        <td className="oxoo-table-company">{t.customer}</td>
                        <td style={{ fontWeight: 500 }}>{t.subject}</td>
                        <td>{t.category}</td>
                        <td>
                          <span className={`oxoo-priority-pill ${t.priority.toLowerCase()}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`oxoo-status-tag ${t.status.toLowerCase().replace(/ /g, '-')}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>{t.date}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => {
                                setTickets(tickets.map(item => item.id === t.id ? { ...item, status: 'Resolved' } : item));
                                showToast(`Ticket ${t.id} marked as resolved.`);
                              }}
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Assigning ticket ${t.id} to engineer`)}
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              9. REPORTS & ANALYTICS
              ------------------------------------------------------- */}
          {activeTab === 'reports' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Reports & Analytics</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Detailed insights and analytics for your platform.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="oxoo-outline-btn"
                    onClick={() => showToast('Exporting analytics data to CSV...')}
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    className="oxoo-upgrade-btn"
                    onClick={() => showToast('Generating high-resolution executive PDF report...')}
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="oxoo-tab-pill-bar">
                {['revenue', 'customers', 'subscriptions', 'applications'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`oxoo-tab-pill ${reportsSubTab === tab ? 'active' : ''}`}
                    onClick={() => setReportsSubTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* KPI Cards */}
              <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Total Revenue</span>
                  <span className="oxoo-metric-value">₹89,302</span>
                  <span className="oxoo-metric-badge green" style={{ width: 'fit-content', marginTop: '6px' }}>+18% growth</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">New Customers</span>
                  <span className="oxoo-metric-value">6</span>
                  <span className="oxoo-metric-badge green" style={{ width: 'fit-content', marginTop: '6px' }}>+25%</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Active Subscriptions</span>
                  <span className="oxoo-metric-value">24</span>
                  <span className="oxoo-metric-badge green" style={{ width: 'fit-content', marginTop: '6px' }}>+10%</span>
                </div>
                <div className="oxoo-metric-card">
                  <span className="oxoo-metric-label">Churn Rate</span>
                  <span className="oxoo-metric-value" style={{ color: '#059669' }}>2%</span>
                  <span className="oxoo-metric-badge green" style={{ width: 'fit-content', marginTop: '6px' }}>-0.5% healthy</span>
                </div>
              </div>

              {/* Revenue Subtab: Revenue Trend & Revenue by Plan Donut */}
              {reportsSubTab === 'revenue' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                  <div className="oxoo-chart-card">
                    <span className="oxoo-chart-title">Revenue Trend</span>
                    <div className="oxoo-svg-chart-wrap" style={{ marginTop: '16px' }}>
                      <svg className="oxoo-chart-svg" viewBox="0 0 500 180">
                        {[
                          { y: 30, label: '₹100k' },
                          { y: 70, label: '₹75k' },
                          { y: 110, label: '₹50k' },
                          { y: 150, label: '₹25k' }
                        ].map((g) => (
                          <g key={g.label}>
                            <line x1="45" y1={g.y} x2="480" y2={g.y} stroke="#f1f5f9" strokeDasharray="3 3" />
                            <text x="35" y={g.y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{g.label}</text>
                          </g>
                        ))}
                        <path
                          d="M 50,150 L 120,135 L 190,115 L 260,95 L 330,70 L 400,55 L 470,45"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="3"
                        />
                        {/* Dots */}
                        {[
                          { x: 50, y: 150 }, { x: 120, y: 135 }, { x: 190, y: 115 },
                          { x: 260, y: 95 }, { x: 330, y: 70 }, { x: 400, y: 55 }, { x: 470, y: 45 }
                        ].map((pt, idx) => (
                          <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Revenue by Plan */}
                  <div className="oxoo-chart-card">
                    <span className="oxoo-chart-title">Revenue by Plan</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                      {[
                        { plan: 'Business Plan', pct: '35%', color: '#0284c7', amount: '₹31,255' },
                        { plan: 'Professional Plan', pct: '25%', color: '#2563eb', amount: '₹22,325' },
                        { plan: 'HRMS Plan', pct: '20%', color: '#06b6d4', amount: '₹17,860' },
                        { plan: 'Finance Plan', pct: '12%', color: '#f59e0b', amount: '₹10,716' },
                        { plan: 'Starter Plan', pct: '8%', color: '#8b5cf6', amount: '₹7,146' }
                      ].map((item) => (
                        <div key={item.plan}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{item.plan}</span>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.amount} ({item.pct})</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: item.pct, height: '100%', background: item.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Customers Subtab */}
              {reportsSubTab === 'customers' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Total Customers</span>
                    <span className="oxoo-metric-value">24</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Active Customers</span>
                    <span className="oxoo-metric-value" style={{ color: '#059669' }}>22</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Inactive Customers</span>
                    <span className="oxoo-metric-value" style={{ color: '#dc2626' }}>2</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Customer Retention</span>
                    <span className="oxoo-metric-value" style={{ color: '#0284c7' }}>98%</span>
                  </div>
                </div>
              )}

              {/* Subscriptions Subtab */}
              {reportsSubTab === 'subscriptions' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Active Subscriptions</span>
                    <span className="oxoo-metric-value">24</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Trial Conversions</span>
                    <span className="oxoo-metric-value">0%</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Renewals This Month</span>
                    <span className="oxoo-metric-value" style={{ color: '#059669' }}>18</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Cancellations</span>
                    <span className="oxoo-metric-value" style={{ color: '#dc2626' }}>1</span>
                  </div>
                </div>
              )}

              {/* Applications Subtab */}
              {reportsSubTab === 'applications' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">API Requests (24h)</span>
                    <span className="oxoo-metric-value">12,450</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Failed Requests</span>
                    <span className="oxoo-metric-value" style={{ color: '#059669' }}>42 (0.3%)</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Service Availability</span>
                    <span className="oxoo-metric-value" style={{ color: '#0284c7' }}>99.98%</span>
                  </div>
                  <div className="oxoo-metric-card">
                    <span className="oxoo-metric-label">Active Organisations</span>
                    <span className="oxoo-metric-value">24</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------
              10. EMAIL & NOTIFICATIONS
              ------------------------------------------------------- */}
          {activeTab === 'email' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Email & Notifications</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage email templates, notifications and delivery settings.
                  </p>
                </div>
                {emailSubTab === 'templates' && (
                  <button
                    type="button"
                    className="oxoo-upgrade-btn"
                    onClick={() => {
                      setSelectedTemplate({ name: '', type: 'Transactional', subject: '', body: '' });
                    }}
                  >
                    <Plus size={14} style={{ marginRight: '6px' }} /> + New Template
                  </button>
                )}
              </div>

              {/* Sub-tabs */}
              <div className="oxoo-tab-pill-bar">
                {['templates', 'logs', 'settings'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`oxoo-tab-pill ${emailSubTab === tab ? 'active' : ''}`}
                    onClick={() => setEmailSubTab(tab)}
                  >
                    {tab === 'templates' ? 'Email Templates' : tab === 'logs' ? 'Notification Logs' : 'Settings'}
                  </button>
                ))}
              </div>

              {/* Tab 1: Email Templates */}
              {emailSubTab === 'templates' && (
                <div style={{ overflowX: 'auto' }}>
                  <table className="oxoo-table">
                    <thead>
                      <tr>
                        <th>Template Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailTemplates.map((tpl) => (
                        <tr key={tpl.id}>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{tpl.name}</td>
                          <td>
                            <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              {tpl.type}
                            </span>
                          </td>
                          <td>
                            <span className="oxoo-status-tag active">
                              {tpl.status}
                            </span>
                          </td>
                          <td>{tpl.updated}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="oxoo-outline-btn"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => setSelectedTemplate(tpl)}
                              >
                                Edit Template
                              </button>
                              <button
                                type="button"
                                className="oxoo-outline-btn"
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => showToast(`Test email dispatched for ${tpl.name}`)}
                              >
                                Send Test
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Notification Logs */}
              {emailSubTab === 'logs' && (
                <div style={{ overflowX: 'auto' }}>
                  <table className="oxoo-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Recipient</th>
                        <th>Template</th>
                        <th>Delivery Status</th>
                        <th>Provider</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificationLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.date}</td>
                          <td style={{ fontWeight: 600 }}>{log.recipient}</td>
                          <td>{log.template}</td>
                          <td>
                            <span className="oxoo-status-tag active">
                              {log.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>{log.provider}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="oxoo-outline-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => showToast(`Viewing delivery receipt for message #${log.id}`)}
                            >
                              View Payload
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Email Settings */}
              {emailSubTab === 'settings' && (
                <div style={{ maxWidth: '700px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Email Service Provider</label>
                      <select className="oxoo-form-input" defaultValue="Brevo">
                        <option>Brevo (SMTP & Transactional API)</option>
                        <option>Resend API</option>
                        <option>Amazon SES</option>
                        <option>Custom SMTP Relay</option>
                      </select>
                    </div>

                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Verified Sender Address</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        defaultValue="manminder.singh@primepro.ai"
                      />
                    </div>

                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">SMTP Host</label>
                        <input type="text" className="oxoo-form-input" defaultValue="smtp-relay.brevo.com" disabled style={{ background: '#f8fafc' }} />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Port</label>
                        <input type="text" className="oxoo-form-input" defaultValue="587" disabled style={{ background: '#f8fafc' }} />
                      </div>
                    </div>

                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Retry Failed Emails</label>
                        <select className="oxoo-form-input" defaultValue="Enabled">
                          <option>Enabled</option>
                          <option>Disabled</option>
                        </select>
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Maximum Retry Attempts</label>
                        <input type="number" className="oxoo-form-input" defaultValue="3" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="oxoo-upgrade-btn"
                        onClick={() => showToast('Email configuration saved successfully.')}
                      >
                        Save Settings
                      </button>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('SMTP connection ping passed! Latency: 42ms')}
                      >
                        Test Connection
                      </button>
                    </div>

                    {/* Security Notice */}
                    <div className="oxoo-security-banner">
                      <Lock size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong>Security:</strong> Keep API keys, SMTP passwords and provider secrets exclusively in backend environment variables. Never display full secrets in the admin dashboard.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------
              11. AUDIT LOGS
              ------------------------------------------------------- */}
          {activeTab === 'audit' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Audit Logs</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Track all important events and changes on your platform.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-outline-btn"
                  onClick={() => showToast('Exporting audit trail to CSV...')}
                >
                  <Download size={14} style={{ marginRight: '6px' }} /> Export
                </button>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-filter-search">
                    <Search size={14} className="oxoo-filter-search-icon" />
                    <input type="text" placeholder="Search logs..." />
                  </div>
                  <select className="oxoo-filter-select" defaultValue="All Actions">
                    <option>All Actions</option>
                    <option>Customer Created</option>
                    <option>Subscription Activated</option>
                    <option>Plan Updated</option>
                    <option>Payment Received</option>
                    <option>Login Successful</option>
                    <option>Login Failed</option>
                  </select>
                  <select className="oxoo-filter-select" defaultValue="All Users">
                    <option>All Users</option>
                    <option>manminder.singh</option>
                    <option>rahul</option>
                    <option>priya</option>
                    <option>amit</option>
                    <option>system</option>
                  </select>
                </div>
              </div>

              {/* Audit Log Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Date / Time</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>IP Address</th>
                      <th>Result</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.time}</td>
                        <td style={{ fontWeight: 600 }}>{log.user}</td>
                        <td>{log.action}</td>
                        <td><span style={{ fontFamily: 'monospace' }}>{log.resource}</span></td>
                        <td>{log.ip}</td>
                        <td>
                          <span className={`oxoo-status-tag ${log.result === 'Success' ? 'active' : 'open'}`}>
                            {log.result}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="oxoo-outline-btn"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => setSelectedAuditLog(log)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Security Notice */}
              <div className="oxoo-security-banner">
                <Shield size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Security:</strong> Audit logs should be append-only for normal application users. Never log passwords, OTP values, access tokens or full payment credentials.
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              12. INTEGRATIONS
              ------------------------------------------------------- */}
          {activeTab === 'integrations' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Integrations</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage payment, email, analytics and API connections.
                  </p>
                </div>
              </div>

              {/* Integration Cards Grid */}
              <div className="oxoo-integration-grid">
                {integrations.map((item) => (
                  <div key={item.id} className="oxoo-integration-card">
                    <div>
                      <div className="oxoo-integration-header">
                        <div
                          className="oxoo-integration-icon"
                          style={{ background: item.color + '15', color: item.color }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <span className="oxoo-integration-category">{item.category}</span>
                          <h3 className="oxoo-integration-name">{item.name}</h3>
                        </div>
                      </div>
                      <p className="oxoo-integration-desc">{item.desc}</p>
                    </div>

                    <div className="oxoo-integration-footer">
                      <span className={`oxoo-status-tag ${item.status === 'Connected' ? 'active' : 'suspended'}`}>
                        ● {item.status}
                      </span>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                        onClick={() => setSelectedIntegration(item)}
                      >
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Notice */}
              <div className="oxoo-security-banner" style={{ marginTop: '24px' }}>
                <Lock size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Security:</strong> Mask secret values. Keep secrets in backend environment variables or a secret manager. Validate webhook signatures. Record configuration changes in audit logs.
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------
              13. SETTINGS
              ------------------------------------------------------- */}
          {activeTab === 'settings' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header">
                <div>
                  <h2 className="oxoo-section-title">Settings</h2>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Manage platform settings, security and configurations.
                  </p>
                </div>
              </div>

              {/* Subnav Tabs */}
              <div className="oxoo-settings-subnav">
                {['general', 'branding', 'email', 'payments', 'security', 'api', 'billing', 'system'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`oxoo-settings-tab-btn ${settingsSubTab === tab ? 'active' : ''}`}
                    onClick={() => setSettingsSubTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Settings Tab Content */}
              <div style={{ maxWidth: '720px' }}>
                {/* 1. General */}
                {settingsSubTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Platform Name</label>
                      <input type="text" className="oxoo-form-input" defaultValue="OXOO" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Tagline</label>
                      <input type="text" className="oxoo-form-input" defaultValue="One Platform. Infinite Possibilities." />
                    </div>
                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Default Currency</label>
                        <input type="text" className="oxoo-form-input" defaultValue="INR (₹)" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Default Timezone</label>
                        <input type="text" className="oxoo-form-input" defaultValue="Asia/Kolkata" />
                      </div>
                    </div>
                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Default Language</label>
                        <input type="text" className="oxoo-form-input" defaultValue="English" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Support Email</label>
                        <input type="text" className="oxoo-form-input" defaultValue="support@oxoo.ai" />
                      </div>
                    </div>
                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Support Phone</label>
                        <input type="text" className="oxoo-form-input" defaultValue="+91 89518 52227" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Company Website</label>
                        <input type="text" className="oxoo-form-input" defaultValue="https://oxoo.ai" />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      style={{ width: 'fit-content', marginTop: '12px' }}
                      onClick={() => showToast('General settings saved successfully.')}
                    >
                      Save Changes
                    </button>
                  </div>
                )}

                {/* 2. Branding */}
                {settingsSubTab === 'branding' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Platform Logo</label>
                      <input type="text" className="oxoo-form-input" defaultValue="/oxoo-logo-white.png" />
                    </div>
                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Primary Colour</label>
                        <input type="text" className="oxoo-form-input" defaultValue="#0284c7" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Secondary Colour</label>
                        <input type="text" className="oxoo-form-input" defaultValue="#0f172a" />
                      </div>
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Accent Colour</label>
                      <input type="text" className="oxoo-form-input" defaultValue="#38bdf8" />
                    </div>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      style={{ width: 'fit-content', marginTop: '12px' }}
                      onClick={() => showToast('Branding settings saved successfully.')}
                    >
                      Save Branding
                    </button>
                  </div>
                )}

                {/* 3. Email */}
                {settingsSubTab === 'email' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Default Sender Name</label>
                      <input type="text" className="oxoo-form-input" defaultValue="OXOO Platform" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Verified Sender Email</label>
                      <input type="text" className="oxoo-form-input" defaultValue="manminder.singh@primepro.ai" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Email Provider</label>
                      <input type="text" className="oxoo-form-input" defaultValue="Brevo (Active)" disabled style={{ background: '#f8fafc' }} />
                    </div>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      style={{ width: 'fit-content', marginTop: '12px' }}
                      onClick={() => showToast('Email settings saved successfully.')}
                    >
                      Save Settings
                    </button>
                  </div>
                )}

                {/* 4. Payments */}
                {settingsSubTab === 'payments' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Default Payment Provider</label>
                      <input type="text" className="oxoo-form-input" defaultValue="Razorpay Gateway" />
                    </div>
                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Supported Currencies</label>
                        <input type="text" className="oxoo-form-input" defaultValue="INR, USD, EUR" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Tax Configuration (GST)</label>
                        <input type="text" className="oxoo-form-input" defaultValue="18% Standard GST" />
                      </div>
                    </div>
                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Invoice Prefix</label>
                        <input type="text" className="oxoo-form-input" defaultValue="INV-2026-" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Invoice Numbering</label>
                        <input type="text" className="oxoo-form-input" defaultValue="Sequential (001-999)" />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      style={{ width: 'fit-content', marginTop: '12px' }}
                      onClick={() => showToast('Payment settings saved successfully.')}
                    >
                      Save Payment Settings
                    </button>
                  </div>
                )}

                {/* 5. Security */}
                {settingsSubTab === 'security' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Lock size={18} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>Two-Factor Authentication (2FA)</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Require OTP verification on all administrative logins.</div>
                        </div>
                      </div>
                      <label className="oxoo-switch-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="oxoo-slider" />
                      </label>
                    </div>

                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Session Timeout</label>
                        <input type="text" className="oxoo-form-input" defaultValue="30 minutes" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Login Attempt Limit</label>
                        <input type="number" className="oxoo-form-input" defaultValue="5" />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      style={{ width: 'fit-content', marginTop: '12px' }}
                      onClick={() => showToast('Security policies applied.')}
                    >
                      Save Security Settings
                    </button>
                  </div>
                )}

                {/* 6. API */}
                {settingsSubTab === 'api' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">API Base URL</label>
                      <input type="text" className="oxoo-form-input" defaultValue="https://api.oxoo.ai" disabled style={{ background: '#f8fafc' }} />
                    </div>
                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">API Version</label>
                        <input type="text" className="oxoo-form-input" defaultValue="v2.4" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Rate Limits</label>
                        <input type="text" className="oxoo-form-input" defaultValue="10,000 req/day" />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      style={{ width: 'fit-content', marginTop: '12px' }}
                      onClick={() => showToast('API configurations saved.')}
                    >
                      Save API Settings
                    </button>
                  </div>
                )}

                {/* 7. Billing */}
                {settingsSubTab === 'billing' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Billing Support Email</label>
                      <input type="text" className="oxoo-form-input" defaultValue="billing@oxoo.ai" />
                    </div>
                    <div className="oxoo-form-grid-2">
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Default Billing Cycle</label>
                        <input type="text" className="oxoo-form-input" defaultValue="Monthly" />
                      </div>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Grace Period</label>
                        <input type="text" className="oxoo-form-input" defaultValue="7 Days" />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      style={{ width: 'fit-content', marginTop: '12px' }}
                      onClick={() => showToast('Billing settings updated.')}
                    >
                      Save Billing Settings
                    </button>
                  </div>
                )}

                {/* 8. System */}
                {settingsSubTab === 'system' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Database Cluster</label>
                      <input type="text" className="oxoo-form-input" defaultValue="Neon PostgreSQL (Multi-Tenant Isolated Pool) — Operational" disabled style={{ background: '#f8fafc' }} />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Background Jobs</label>
                      <input type="text" className="oxoo-form-input" defaultValue="0 queued, 24 completed in last hour" disabled style={{ background: '#f8fafc' }} />
                    </div>
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <AlertTriangle size={18} color="#d97706" />
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>Platform Maintenance Mode</strong>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Temporarily show maintenance page to all non-admin users.</div>
                        </div>
                      </div>
                      <label className="oxoo-switch-toggle">
                        <input type="checkbox" />
                        <span className="oxoo-slider" />
                      </label>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="oxoo-upgrade-btn"
                        onClick={() => showToast('All system health checks passed 100%')}
                      >
                        Run System Diagnostics
                      </button>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('Cache cleared successfully.')}
                      >
                        Flush Redis Cache
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* -------------------------------------------------------
            MODAL 1: ADD CUSTOMER
            ------------------------------------------------------- */}
        <AnimatePresence>
          {showAddCustomerModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setShowAddCustomerModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '640px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Add Customer</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setShowAddCustomerModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Company Name *</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        placeholder="e.g. RetailMart Solutions"
                        value={newCustomerForm.company}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, company: e.target.value })}
                      />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Legal Business Name</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        placeholder="e.g. RetailMart Pvt Ltd"
                        value={newCustomerForm.legalName}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, legalName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Contact Person</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        placeholder="e.g. Rajesh Sharma"
                        value={newCustomerForm.contact}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contact: e.target.value })}
                      />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Business Email *</label>
                      <input
                        type="email"
                        className="oxoo-form-input"
                        placeholder="contact@retailmart.com"
                        value={newCustomerForm.email}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Phone Number</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        placeholder="+91 98765 43210"
                        value={newCustomerForm.phone}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Country</label>
                      <select
                        className="oxoo-form-input"
                        value={newCustomerForm.country}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, country: e.target.value })}
                      >
                        <option>India</option>
                        <option>United States</option>
                        <option>United Arab Emirates</option>
                        <option>Singapore</option>
                      </select>
                    </div>
                  </div>

                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Tax ID / GSTIN</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        placeholder="27AAAAA0000A1Z5"
                        value={newCustomerForm.gstin}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })}
                      />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Select Plan</label>
                      <select
                        className="oxoo-form-input"
                        value={newCustomerForm.plan}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, plan: e.target.value })}
                      >
                        <option>Business Plan</option>
                        <option>Professional Plan</option>
                        <option>HRMS Plan</option>
                        <option>Finance Plan</option>
                        <option>Starter Plan</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setShowAddCustomerModal(false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        if (!newCustomerForm.company) {
                          showToast('Please enter company name');
                          return;
                        }
                        const created = {
                          id: customers.length + 1,
                          name: newCustomerForm.company,
                          email: newCustomerForm.email || 'admin@' + newCustomerForm.company.toLowerCase().replace(/[^a-z]/g, '') + '.com',
                          plan: newCustomerForm.plan,
                          status: 'Active',
                          country: newCustomerForm.country,
                          joined: 'Today',
                          phone: newCustomerForm.phone || '+91 98765 43210',
                          amount: '₹12,899',
                          apps: ['All Business Apps']
                        };
                        setCustomers([created, ...customers]);
                        setShowAddCustomerModal(false);
                        showToast('Customer created successfully.');
                      }}
                    >
                      Create Customer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 2: NEW SUBSCRIPTION
              ------------------------------------------------------- */}
        <AnimatePresence>
          {showAddSubscriptionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setShowAddSubscriptionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '600px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Create Subscription</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setShowAddSubscriptionModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Select Customer</label>
                    <select
                      className="oxoo-form-input"
                      value={newSubForm.customer}
                      onChange={(e) => setNewSubForm({ ...newSubForm, customer: e.target.value })}
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Select Plan</label>
                      <select
                        className="oxoo-form-input"
                        value={newSubForm.plan}
                        onChange={(e) => setNewSubForm({ ...newSubForm, plan: e.target.value })}
                      >
                        <option>OXOO Business Suite</option>
                        <option>HRMS Pro</option>
                        <option>Finance Pro</option>
                        <option>Marketing Pro</option>
                        <option>Website Builder</option>
                      </select>
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Billing Interval</label>
                      <select
                        className="oxoo-form-input"
                        value={newSubForm.cycle}
                        onChange={(e) => setNewSubForm({ ...newSubForm, cycle: e.target.value })}
                      >
                        <option>Monthly</option>
                        <option>Yearly</option>
                        <option>One-Time</option>
                      </select>
                    </div>
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Number of Users</label>
                      <input type="number" className="oxoo-form-input" defaultValue="10" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Next Billing Date</label>
                      <input type="date" className="oxoo-form-input" defaultValue="2026-11-23" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setShowAddSubscriptionModal(false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        const newId = `SUB-2026-${Math.floor(100 + Math.random() * 900)}`;
                        setSubscriptions([{
                          id: newId,
                          customer: newSubForm.customer,
                          plan: newSubForm.plan,
                          amount: newSubForm.cycle === 'Yearly' ? '₹49,999' : '₹12,899',
                          cycle: newSubForm.cycle,
                          status: 'Active',
                          nextBilling: '23 Nov 2026'
                        }, ...subscriptions]);
                        setShowAddSubscriptionModal(false);
                        showToast('Subscription created successfully.');
                      }}
                    >
                      Create Subscription
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 3: ADD PRODUCT
              ------------------------------------------------------- */}
        <AnimatePresence>
          {showAddProductModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setShowAddProductModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '540px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Add Product</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setShowAddProductModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Product Name *</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      placeholder="e.g. OXOO ERP Ultimate"
                      value={newProdForm.name}
                      onChange={(e) => setNewProdForm({ ...newProdForm, name: e.target.value })}
                    />
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Product Code</label>
                      <input type="text" className="oxoo-form-input" placeholder="OXOO-ERP" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Category</label>
                      <select className="oxoo-form-input">
                        <option>Business Suite</option>
                        <option>Finance</option>
                        <option>HRMS</option>
                        <option>Marketing</option>
                        <option>Developer Tools</option>
                      </select>
                    </div>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Description</label>
                    <textarea className="oxoo-form-input" rows="3" placeholder="Enter product overview..."></textarea>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setShowAddProductModal(false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        setShowAddProductModal(false);
                        showToast('Product saved successfully.');
                      }}
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 4: ADD PLAN
              ------------------------------------------------------- */}
        <AnimatePresence>
          {showAddPlanModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setShowAddPlanModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '580px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Add Plan</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setShowAddPlanModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Plan Name *</label>
                      <input type="text" className="oxoo-form-input" placeholder="e.g. Enterprise Tier" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Product</label>
                      <select className="oxoo-form-input">
                        <option>OXOO Business Suite</option>
                        <option>HRMS Pro</option>
                        <option>Finance Pro</option>
                        <option>API Services</option>
                      </select>
                    </div>
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Price (INR)</label>
                      <input type="text" className="oxoo-form-input" defaultValue="₹14,999" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Billing Cycle</label>
                      <select className="oxoo-form-input">
                        <option>Monthly</option>
                        <option>Yearly</option>
                      </select>
                    </div>
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">User Limit</label>
                      <input type="number" className="oxoo-form-input" defaultValue="50" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Storage Limit (GB)</label>
                      <input type="number" className="oxoo-form-input" defaultValue="100" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setShowAddPlanModal(false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        setShowAddPlanModal(false);
                        showToast('Plan created successfully.');
                      }}
                    >
                      Save Plan
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 5: APPLICATION CONFIGURATION
              ------------------------------------------------------- */}
        <AnimatePresence>
          {selectedAppConfig && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setSelectedAppConfig(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '600px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Configure {selectedAppConfig.name}</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setSelectedAppConfig(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Service URL</label>
                    <input type="text" className="oxoo-form-input" defaultValue={`https://${selectedAppConfig.id}.oxoo.ai`} />
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Environment</label>
                      <select className="oxoo-form-input" defaultValue="Production">
                        <option>Production</option>
                        <option>Staging</option>
                        <option>Development</option>
                      </select>
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Authentication Method</label>
                      <select className="oxoo-form-input" defaultValue="SSO / OIDC">
                        <option>SSO / OIDC</option>
                        <option>Bearer Token</option>
                        <option>mTLS</option>
                      </select>
                    </div>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Health Check URL</label>
                    <input type="text" className="oxoo-form-input" defaultValue={`https://${selectedAppConfig.id}.oxoo.ai/healthz`} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setSelectedAppConfig(null)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        setSelectedAppConfig(null);
                        showToast(`${selectedAppConfig.name} configuration saved.`);
                      }}
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 6: GENERATE INVOICE
              ------------------------------------------------------- */}
        <AnimatePresence>
          {showGenerateInvoiceModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setShowGenerateInvoiceModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '620px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Generate Invoice</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setShowGenerateInvoiceModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Customer / Organisation</label>
                      <select
                        className="oxoo-form-input"
                        value={newInvoiceForm.customer}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, customer: e.target.value })}
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Billing Email</label>
                      <input
                        type="email"
                        className="oxoo-form-input"
                        value={newInvoiceForm.email}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Invoice Number</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        value={newInvoiceForm.number}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, number: e.target.value })}
                      />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Total Amount (INR)</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        value={newInvoiceForm.amount}
                        onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Invoice Date</label>
                      <input type="date" className="oxoo-form-input" defaultValue="2026-10-23" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Due Date</label>
                      <input type="date" className="oxoo-form-input" defaultValue="2026-11-05" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setShowGenerateInvoiceModal(false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        setInvoices([{
                          id: newInvoiceForm.number,
                          customer: newInvoiceForm.customer,
                          plan: 'Business Plan',
                          amount: newInvoiceForm.amount,
                          status: 'Paid',
                          date: '23 Oct 2026'
                        }, ...invoices]);
                        setShowGenerateInvoiceModal(false);
                        showToast('Invoice generated successfully.');
                      }}
                    >
                      Generate Invoice
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 7: ADD USER
              ------------------------------------------------------- */}
        <AnimatePresence>
          {showAddUserModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setShowAddUserModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '580px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Add User</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setShowAddUserModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Full Name *</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        placeholder="e.g. Kavita Patel"
                        value={newUserForm.name}
                        onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Email Address *</label>
                      <input
                        type="email"
                        className="oxoo-form-input"
                        placeholder="kavita@oxoo.ai"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Phone Number</label>
                      <input type="text" className="oxoo-form-input" placeholder="+91 98765 43210" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Role</label>
                      <select
                        className="oxoo-form-input"
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      >
                        <option>Super Admin</option>
                        <option>Admin</option>
                        <option>Moderator</option>
                        <option>Staff</option>
                        <option>Billing Manager</option>
                        <option>Read-Only Analyst</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="oxoo-form-label" style={{ marginBottom: '8px', display: 'block' }}>Permissions</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      {['Dashboard Access', 'Customer Management', 'Subscription Management', 'Product and Plan Management', 'Payments and Invoices', 'User and Role Management', 'Support Ticket Management', 'Reports and Analytics'].map((p) => (
                        <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <input type="checkbox" defaultChecked /> {p}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setShowAddUserModal(false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        if (!newUserForm.name) {
                          showToast('Please enter full name');
                          return;
                        }
                        setUsersList([...usersList, {
                          id: usersList.length + 1,
                          name: newUserForm.name,
                          email: newUserForm.email || 'user@oxoo.ai',
                          role: newUserForm.role,
                          status: 'Active',
                          joined: 'Today'
                        }]);
                        setShowAddUserModal(false);
                        showToast('User created and invitation dispatched.');
                      }}
                    >
                      Create User
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 8: CREATE TICKET
              ------------------------------------------------------- */}
        <AnimatePresence>
          {showCreateTicketModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setShowCreateTicketModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '600px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Create Support Ticket</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setShowCreateTicketModal(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Customer</label>
                    <select
                      className="oxoo-form-input"
                      value={newTicketForm.customer}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, customer: e.target.value })}
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Subject *</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      placeholder="e.g. Webhook delivery failure on payment receipt"
                      value={newTicketForm.subject}
                      onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                    />
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Category</label>
                      <select
                        className="oxoo-form-input"
                        value={newTicketForm.category}
                        onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                      >
                        <option>Technical</option>
                        <option>Billing</option>
                        <option>Account Access</option>
                        <option>Subscription</option>
                        <option>Feature Request</option>
                        <option>Integration</option>
                        <option>General Inquiry</option>
                      </select>
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Priority</label>
                      <select
                        className="oxoo-form-input"
                        value={newTicketForm.priority}
                        onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                      >
                        <option>Low</option>
                        <option>Normal</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Description</label>
                    <textarea className="oxoo-form-input" rows="3" placeholder="Enter detailed issue summary..."></textarea>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setShowCreateTicketModal(false)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        if (!newTicketForm.subject) {
                          showToast('Please enter ticket subject');
                          return;
                        }
                        const newId = `OXOO-${Math.floor(1143 + Math.random() * 50)}`;
                        setTickets([{
                          id: newId,
                          customer: newTicketForm.customer,
                          subject: newTicketForm.subject,
                          category: newTicketForm.category,
                          priority: newTicketForm.priority,
                          status: 'Open',
                          date: '23 Oct 2026'
                        }, ...tickets]);
                        setShowCreateTicketModal(false);
                        showToast(`Ticket ${newId} logged successfully.`);
                      }}
                    >
                      Create Ticket
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 9: INTEGRATION CONFIGURATION
              ------------------------------------------------------- */}
        <AnimatePresence>
          {selectedIntegration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setSelectedIntegration(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '600px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Configure {selectedIntegration.name}</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setSelectedIntegration(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Environment</label>
                      <select className="oxoo-form-input" defaultValue="Production">
                        <option>Production</option>
                        <option>Sandbox</option>
                      </select>
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Connection Status</label>
                      <input type="text" className="oxoo-form-input" defaultValue={selectedIntegration.status} disabled style={{ background: '#f8fafc' }} />
                    </div>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">API Endpoint</label>
                    <input type="text" className="oxoo-form-input" defaultValue={`https://api.${selectedIntegration.id}.com/v1`} />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">API Key / Secret (Masked)</label>
                    <input type="password" className="oxoo-form-input" defaultValue="xsmtpsib-5eb3e4c990ed9033b14b" readOnly />
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Webhook URL</label>
                    <input type="text" className="oxoo-form-input" defaultValue={`https://api.oxoo.ai/webhooks/${selectedIntegration.id}`} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      style={{ color: '#dc2626' }}
                      onClick={() => {
                        setIntegrations(integrations.map(it => it.id === selectedIntegration.id ? { ...it, status: 'Not Connected' } : it));
                        setSelectedIntegration(null);
                        showToast(`${selectedIntegration.name} disconnected.`);
                      }}
                    >
                      Disconnect Integration
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('Ping successful: 200 OK')}
                      >
                        Test Connection
                      </button>
                      <button
                        type="button"
                        className="oxoo-upgrade-btn"
                        onClick={() => {
                          setSelectedIntegration(null);
                          showToast('Integration configuration updated successfully.');
                        }}
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 10: AUDIT LOG DETAILS
              ------------------------------------------------------- */}
        <AnimatePresence>
          {selectedAuditLog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setSelectedAuditLog(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '540px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">Audit Event: {selectedAuditLog.id}</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setSelectedAuditLog(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '13px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Actor</span>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedAuditLog.user}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Action</span>
                      <div style={{ fontWeight: 700, color: '#0284c7' }}>{selectedAuditLog.action}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Affected Resource</span>
                      <div style={{ fontWeight: 600 }}>{selectedAuditLog.resource}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Result</span>
                      <div><span className="oxoo-status-tag active">{selectedAuditLog.result}</span></div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>IP Address</span>
                      <div style={{ fontFamily: 'monospace' }}>{selectedAuditLog.ip}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Timestamp</span>
                      <div>{selectedAuditLog.time}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button type="button" className="oxoo-upgrade-btn" onClick={() => setSelectedAuditLog(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 11: CUSTOMER DETAIL INSPECTION
              ------------------------------------------------------- */}
        <AnimatePresence>
          {selectedCustomerDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setSelectedCustomerDetail(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '580px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">{selectedCustomerDetail.name}</h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setSelectedCustomerDetail(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{selectedCustomerDetail.email}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Phone</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{selectedCustomerDetail.phone}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Subscribed Plan</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{selectedCustomerDetail.plan}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Billing Value</span>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{selectedCustomerDetail.amount}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Status</span>
                      <div>
                        <span className={`oxoo-status-tag ${selectedCustomerDetail.status.toLowerCase()}`}>
                          {selectedCustomerDetail.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Joined</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{selectedCustomerDetail.joined}</div>
                    </div>
                  </div>

                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>Active Enterprise Software Modules</strong>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {selectedCustomerDetail.apps.map((app, idx) => (
                        <span key={idx} style={{ fontSize: '12px', background: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                          ✓ {app}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setSelectedCustomerDetail(null)}>
                      Close
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        setSelectedCustomerDetail(null);
                        showToast(`Impersonating ${selectedCustomerDetail.name} portal session...`);
                        navigate('/customer');
                      }}
                    >
                      Login As Customer
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* -------------------------------------------------------
              MODAL 12: EMAIL TEMPLATE EDITOR
              ------------------------------------------------------- */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="oxoo-modal-backdrop"
              onClick={() => setSelectedTemplate(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="oxoo-modal-window"
                style={{ maxWidth: '640px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="oxoo-modal-header">
                  <h3 className="oxoo-modal-title">
                    {selectedTemplate.id ? `Edit Template: ${selectedTemplate.name}` : 'New Email Template'}
                  </h3>
                  <button type="button" className="oxoo-modal-close-btn" onClick={() => setSelectedTemplate(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Template Name *</label>
                      <input
                        type="text"
                        className="oxoo-form-input"
                        defaultValue={selectedTemplate.name || 'OTP Verification'}
                      />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Template Type</label>
                      <select className="oxoo-form-input" defaultValue={selectedTemplate.type || 'Transactional'}>
                        <option>Transactional</option>
                        <option>Account</option>
                        <option>Billing</option>
                        <option>Security</option>
                        <option>Support</option>
                        <option>Marketing</option>
                      </select>
                    </div>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Email Subject</label>
                    <input
                      type="text"
                      className="oxoo-form-input"
                      defaultValue="Your OXOO Verification Code: {{otp_code}}"
                    />
                  </div>
                  <div className="oxoo-form-grid-2">
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Sender Name</label>
                      <input type="text" className="oxoo-form-input" defaultValue="OXOO Platform" />
                    </div>
                    <div className="oxoo-form-group">
                      <label className="oxoo-form-label">Sender Email</label>
                      <input type="email" className="oxoo-form-input" defaultValue="manminder.singh@primepro.ai" />
                    </div>
                  </div>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Email Body (HTML Content)</label>
                    <textarea
                      className="oxoo-form-input"
                      rows="4"
                      defaultValue="Hello {{customer_name}},&#10;&#10;Your OTP code is {{otp_code}}. Valid for 10 minutes.&#10;&#10;Regards,&#10;OXOO Team"
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Available variables: <span style={{ fontFamily: 'monospace', color: '#0284c7' }}>{'{{customer_name}}, {{otp_code}}, {{plan_name}}, {{invoice_amount}}'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button type="button" className="oxoo-outline-btn" onClick={() => setSelectedTemplate(null)}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Test email sent to verified admin')}
                    >
                      Send Test
                    </button>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => {
                        setSelectedTemplate(null);
                        showToast('Template saved successfully.');
                      }}
                    >
                      Save Template
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
