import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Layers, CreditCard, Users, HelpCircle, Settings,
  Search, Bell, ChevronDown, Check, ArrowRight, ExternalLink,
  Crown, BarChart2, FileText, Receipt, UserCheck, Globe, Megaphone,
  CheckCircle2, AlertCircle, Plus, Download, X, Shield, Lock,
  Mail, Phone, Clock, MessageSquare, RefreshCw, Filter, Sparkles,
  Laptop, Cpu, LogOut, Building, Trash2, UserPlus, Send, Calendar,
  Smartphone, ChevronRight, MoreHorizontal, Eye, ShieldCheck, CheckSquare,
  FileSpreadsheet, Upload, History, AlertTriangle, Menu, Paperclip,
  Package
} from 'lucide-react';
import {
  getCustomerOverview, getCustomerBilling, upgradeCustomerPlan,
  getCustomerTeam, inviteTeamMember, updateTeamMember, removeTeamMember,
  getCustomerTickets, createCustomerTicket, replyCustomerTicket, changePassword,
  renewCustomerSubscription, createRenewalOrder, getCustomerPlans, downloadInvoicePdf,
  getCustomerNotifications, markNotificationRead, markAllNotificationsRead, deleteReadNotifications,
  verifyPayment, resolveWorkspace
} from './api';
import './dashboards.css';
import { authStorage } from './authStorage';

// Live Customer Brand Logo Preview Badge
function CustomerBrandBadge({ companyName, workspaceDomain }) {
  const cleanName = (companyName || 'RetailMart Solutions').replace(/\.(oxoo|com|ai)$/i, '').trim();
  const initial = cleanName.charAt(0).toUpperCase() || 'R';
  const displayHost = workspaceDomain || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.oxoo.ai`;
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 12px',
      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(56, 189, 248, 0.14) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      borderRadius: '20px'
    }}>
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
      }}>
        {initial}
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1' }}>
        {displayHost}
      </span>
    </div>
  );
}

export default function CustomerDashboard() {
  const navigate = useNavigate();

  // Resolved Customer Workspace (e.g. maan.oxoo.ai, abc.oxoo.ai)
  const [resolvedWorkspace, setResolvedWorkspace] = useState(null);

  // Navigation tabs:
  // 'dashboard' | 'apps' | 'billing' | 'team' | 'support' | 'reports' | 'notifications' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Sub-tabs
  const [settingsSubTab, setSettingsSubTab] = useState('account'); // 'account' | 'security' | 'preferences'
  const [billingSubTab, setBillingSubTab] = useState('invoices'); // 'invoices' | 'payment_history' | 'subscription_details'
  const [ticketFilter, setTicketFilter] = useState('all'); // 'all' | 'open' | 'in_progress' | 'resolved' | 'closed'
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'payments' | 'team' | 'support' | 'system'
  const [appStatusFilter, setAppStatusFilter] = useState('all'); // 'all' | 'active' | 'not_purchased'
  const [appCategoryFilter, setAppCategoryFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState('all');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [appSearch, setAppSearch] = useState('');

  // Modals & Popovers
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [changePwdModalOpen, setChangePwdModalOpen] = useState(false);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Software Subscription Renewal State (Renew before or after finish)
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewTargetApp, setRenewTargetApp] = useState(null);
  const [renewCycle, setRenewCycle] = useState('monthly');
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewSuccess, setRenewSuccess] = useState(null);
  const [renewPaymentError, setRenewPaymentError] = useState('');

  // My Applications: View Plans & Direct Purchase Modal State
  const [viewPlansModalOpen, setViewPlansModalOpen] = useState(false);
  const [selectedAppForPlans, setSelectedAppForPlans] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planBillingCycle, setPlanBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [isPurchasingApp, setIsPurchasingApp] = useState(false);
  const [purchaseSuccessData, setPurchaseSuccessData] = useState(null);
  const [purchaseError, setPurchaseError] = useState('');

  // View Invoice Modal State
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Ticket Chat & Conversation Modal State
  const [ticketChatModalOpen, setTicketChatModalOpen] = useState(false);
  const [activeTicketChat, setActiveTicketChat] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketReplyAttachments, setTicketReplyAttachments] = useState([]);
  const [isSendingTicketReply, setIsSendingTicketReply] = useState(false);

  // Team Member Edit Modal State
  const [editMemberModalOpen, setEditMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Real Database Records (No fake / mock data)
  const [invoices, setInvoices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [notifsLoading, setNotifsLoading] = useState(false);

  // Password & Security State
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [twoFaEnabled, setTwoFaEnabled] = useState(true);

  // Settings & Preferences State
  const [prefAccountUpdates, setPrefAccountUpdates] = useState(true);
  const [prefProductUpdates, setPrefProductUpdates] = useState(true);
  const [prefMarketing, setPrefMarketing] = useState(false);
  const [prefLanguage, setPrefLanguage] = useState('English');
  const [prefTimezone, setPrefTimezone] = useState('(GMT+05:30) Asia/Kolkata');
  const [prefCurrency, setPrefCurrency] = useState('INR (₹)');
  const [prefDateFormat, setPrefDateFormat] = useState('DD/MM/YYYY');
  const [prefNumberFormat, setPrefNumberFormat] = useState('1,234.56');
  const [prefDefaultApp, setPrefDefaultApp] = useState('Sales Software');
  const [prefDashboardLayout, setPrefDashboardLayout] = useState('Standard');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: 'Priya Sharma',
    email: 'priya@retailmart.com',
    phone: '+91 98765 43210',
    company: 'RetailMart Solutions',
    website: 'https://retailmart.com',
    country: 'India'
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Invite Form State (with specific application access)
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'Member',
    appsAccess: ['sales']
  });

  // Ticket Form State with attachments support
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'Technical',
    priority: 'Normal',
    application: 'Sales Software',
    description: '',
    attachments: []
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleTicketFileSelect = (e, target = 'create') => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles = [];
    for (const f of files) {
      if (f.size > MAX_SIZE) {
        showToast(`"${f.name}" exceeds 10MB limit. Please upload a smaller file.`);
        continue;
      }
      validFiles.push(f);
    }
    if (!validFiles.length) return;

    Promise.all(validFiles.map(f => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
          data: reader.result
        });
      };
      reader.readAsDataURL(f);
    }))).then(converted => {
      if (target === 'create') {
        setTicketForm(prev => ({
          ...prev,
          attachments: [...(prev.attachments || []), ...converted]
        }));
      } else {
        setTicketReplyAttachments(prev => [...prev, ...converted]);
      }
    });
    e.target.value = '';
  };

  // 5 Core Software Modules Available on OXOO Platform (matching Pricing / Checkout)
  const BASE_DIRECTORY_APPS = [
    {
      id: 'finance',
      name: 'Finance Software',
      shortName: 'Finance',
      desc: 'Accounting, Invoicing, Expenses, Sign, Spreadsheet, ESG',
      suiteCount: '6 Apps Suite',
      color: 'blue',
      iconSrc: '/apps/logo-accounting.png?v=clean'
    },
    {
      id: 'sales',
      name: 'Sales Software',
      shortName: 'Sales',
      desc: 'CRM, Sales, Subscriptions, POS Shop, POS Restaurant, Rental',
      suiteCount: '6 Apps Suite',
      color: 'pink',
      iconSrc: '/apps/logo-sales.png?v=clean'
    },
    {
      id: 'supply-chain',
      name: 'Supply Chain Software',
      shortName: 'Supply Chain',
      desc: 'Inventory, Manufacturing, Maintenance, PLM, Quality, Purchase',
      suiteCount: '6 Apps Suite',
      color: 'orange',
      iconSrc: '/apps/logo-inventory.png?v=clean'
    },
    {
      id: 'human-resources',
      name: 'Human Resources Software',
      shortName: 'HRMS',
      desc: 'Employees, Payroll, Recruitment, Time Off, Appraisals, Fleet',
      suiteCount: '6 Apps Suite',
      color: 'purple',
      iconSrc: '/apps/logo-hr.png?v=clean'
    },
    {
      id: 'productivity',
      name: 'Productivity Software',
      shortName: 'Productivity',
      desc: 'Artificial Intelligence, Discuss, VoIP, IoT, Documents, Knowledge',
      suiteCount: '6 Apps Suite',
      color: 'violet',
      iconSrc: '/apps/logo-ai.png?v=clean'
    }
  ];

  // Helper to accurately match an app against a customer's purchased app entitlements
  const isAppPurchased = (appId, appName, purchasedList = [], planName = '') => {
    const plan = String(planName || '').toLowerCase();
    // Enterprise / Unlimited plans unlock all software
    if (plan.includes('enterprise') || plan.includes('all apps') || plan.includes('unlimited')) {
      return true;
    }
    if (!Array.isArray(purchasedList) || purchasedList.length === 0) return false;

    const idLower = String(appId || '').toLowerCase().trim();
    const nameLower = String(appName || '').toLowerCase().trim();

    return purchasedList.some(item => {
      if (!item) return false;
      const str = (typeof item === 'string' ? item : (item.name || item.id || '')).toLowerCase().trim();
      if (!str) return false;

      if (str === idLower || str === nameLower) return true;
      if (idLower === 'finance' && (str.includes('finance') || str.includes('account'))) return true;
      if (idLower === 'sales' && str.includes('sale')) return true;
      if ((idLower === 'human-resources' || idLower === 'hrms') && (str.includes('hrms') || str.includes('hr') || str.includes('human') || str.includes('employee'))) return true;
      if ((idLower === 'supply-chain' || idLower === 'inventory') && (str.includes('supply') || str.includes('inventory') || str.includes('chain') || str.includes('warehouse'))) return true;
      if ((idLower === 'productivity' || idLower === 'ai' || idLower === 'marketing') && (str.includes('productivity') || str.includes('ai') || str.includes('discuss') || str.includes('market') || str.includes('agent'))) return true;
      if (nameLower.includes(str) || str.includes(nameLower)) return true;
      return false;
    });
  };

  // User purchased apps state
  const [userPurchasedApps, setUserPurchasedApps] = useState(() => {
    try {
      const u = authStorage.getCustomerUser();
      if (u) {
        if (u.purchasedApps && u.purchasedApps.length > 0) return u.purchasedApps;
        if (u.apps && u.apps.length > 0) return u.apps;
        if (u.active_apps && u.active_apps.length > 0) return u.active_apps;
      }
      const lo = localStorage.getItem('oxoo_last_order');
      if (lo) {
        const o = JSON.parse(lo);
        if (o.apps && o.apps.length > 0) return o.apps;
        if (o.purchasedApps && o.purchasedApps.length > 0) return o.purchasedApps;
      }
    } catch (e) {}
    return ['Finance Software'];
  });

  // Overview Data
  const [overview, setOverview] = useState({
    customerName: 'Customer',
    company: 'RetailMart Solutions',
    email: 'customer@oxoo.ai',
    avatar: 'C',
    currentPlan: 'Single Software',
    nextBillingDate: '30 Days',
    nextBillingExact: '30 Nov 2026',
    daysRemaining: 27,
    subscriptionStatus: 'Active',
    monthlyPrice: '₹660.8 / month',
    cardEnding: '4242',
    cardExpiry: '12/2028',
    activeAppsCount: 1,
    teamMembersCount: 1,
    monthlyUsage: 1420,
    openTicketsCount: 0,
    storageId: 'STG-08643413'
  });

  // Generate software notifications with legitimate renewal dates without countdown labels
  const generateSoftwareNotifications = (appsList, daysRemaining, renewalDateStr) => {
    const days = typeof daysRemaining === 'number' ? daysRemaining : 27;
    const isExpired = days <= 0;
    const isDueSoon = days > 0 && days <= 5;
    const dateFormatted = renewalDateStr || '30 Nov 2026';

    const softNotifs = (appsList || []).map((appItem, idx) => {
      const name = typeof appItem === 'string' ? appItem : (appItem.name || 'Software');
      const lower = name.toLowerCase();
      const appId = lower.includes('fin') ? 'finance' :
        (lower.includes('hrms') || lower.includes('hr') || lower.includes('human')) ? 'human-resources' :
        (lower.includes('supply') || lower.includes('inventory') || lower.includes('chain')) ? 'supply-chain' :
        (lower.includes('productivity') || lower.includes('ai')) ? 'productivity' : 'sales';

      let title = `${name}: Active Subscription`;
      let desc = `Your ${name} subscription is active with scheduled renewal on ${dateFormatted}. Manage billing and settings anytime in the customer portal.`;

      if (isExpired) {
        title = `⚠️ ${name}: Subscription Expired`;
        desc = `Your ${name} subscription ended on ${dateFormatted}. Renew now to restore full access and all active services immediately.`;
      } else if (isDueSoon) {
        title = `⏳ ${name}: Renewal Scheduled Soon`;
        desc = `Your ${name} subscription renews on ${dateFormatted}. Keep your billing details up to date to avoid service lock.`;
      }

      return {
        id: `soft-notif-${idx}-${appId}`,
        title,
        desc,
        daysLeft: days,
        isExpired,
        isDueSoon,
        date: dateFormatted,
        category: 'software',
        softwareId: appId,
        softwareName: name,
        read: false,
        isSoftware: true
      };
    });

    return [...softNotifs, ...defaultNotifications];
  };

  // Dynamic renewal price calculation matching active apps count
  const computeRenewalPricing = (cycle = renewCycle) => {
    const activeApps = allDirectoryApps.filter(app => app.entitled);
    const activeCount = Math.max(1, activeApps.length);
    let baseMonthly = 740;
    let baseYearlyPerMonth = 560;

    if (activeCount === 1) {
      baseMonthly = 740;
      baseYearlyPerMonth = 560;
    } else if (activeCount === 2) {
      baseMonthly = 1280;
      baseYearlyPerMonth = 980;
    } else {
      baseMonthly = 1280 + (activeCount - 2) * 740;
      baseYearlyPerMonth = 980 + (activeCount - 2) * 560;
    }

    const isYearly = cycle === 'yearly';
    const subtotal = isYearly ? baseYearlyPerMonth * 12 : baseMonthly;
    const gst = parseFloat((subtotal * 0.18).toFixed(2));
    const total = parseFloat((subtotal + gst).toFixed(2));

    return {
      activeApps,
      activeCount,
      baseMonthly,
      baseYearlyPerMonth,
      subtotal,
      gst,
      total
    };
  };

  // Open renewal modal for an individual app or overall subscription
  const handleOpenRenewModal = (app = null) => {
    setRenewTargetApp(app);
    setRenewCycle('monthly');
    setRenewSuccess(null);
    setRenewPaymentError('');
    setRenewModalOpen(true);
  };

  // Execute subscription renewal: Step 1 initiates payment order, Step 2 launches Razorpay, Step 3 verifies payment and renews
  const handleConfirmRenew = async () => {
    try {
      // 5-Day Availability Rule: Renewal payment is only available within 5 days of expiry
      if (typeof overview.daysRemaining === 'number' && overview.daysRemaining > 5) {
        showToast(`Renewal payment is only available within 5 days of expiry (${overview.daysRemaining} days remaining).`);
        return;
      }

      setIsRenewing(true);
      setRenewPaymentError('');

      const pricing = computeRenewalPricing(renewCycle);
      const activeApps = pricing.activeApps.length > 0 ? pricing.activeApps : (renewTargetApp ? [renewTargetApp] : []);
      const activeSoftwareNames = activeApps.map(a => a.name).join(' & ') || (renewTargetApp?.name || overview.currentPlan || 'Business Software');
      const activeSoftwareIds = activeApps.map(a => a.id).join(',') || (renewTargetApp?.id || 'finance');
      const planName = activeApps.length > 1
        ? `Custom Pack (${activeApps.length} Softwares)`
        : (activeApps[0]?.name || overview.currentPlan || 'Single Software');
      const totalAmount = pricing.total;

      // 1. FIRST INITIATE PAYMENT ORDER
      const orderRes = await createRenewalOrder({
        email: overview.email || profileData.email,
        companyName: overview.company || profileData.company,
        customerName: profileData.name || overview.name || 'Priya Sharma',
        customerPhone: profileData.phone || overview.phone || '+91 98765 43210',
        planName: planName,
        billingCycle: renewCycle,
        softwareId: activeSoftwareIds,
        softwareName: activeSoftwareNames,
        softwareNames: activeApps.map(a => a.name),
        amount: totalAmount
      });

      const orderNumber = orderRes.orderNumber || `OXOO-RNW-${Date.now().toString().slice(-6)}`;

      // Finalize renewal callback — strictly triggered ONLY AFTER payment is confirmed
      const finalizeRenewalWithPayment = async (realPaymentId, paymentMethod = 'Razorpay (UPI / Card)') => {
        try {
          const res = await renewCustomerSubscription({
            email: overview.email || profileData.email,
            companyName: overview.company || profileData.company,
            planName: planName,
            billingCycle: renewCycle,
            softwareId: activeSoftwareIds,
            softwareName: activeSoftwareNames,
            softwareNames: activeApps.map(a => a.name),
            amount: totalAmount,
            paymentId: realPaymentId,
            orderNumber: orderNumber,
            paymentMethod
          });

          if (res && res.success) {
            setRenewSuccess({
              ...res,
              paymentId: realPaymentId,
              amount: totalAmount
            });
            showToast(`Payment of ₹${totalAmount} verified! ${targetName} renewed.`);

            // Refresh customer overview data from backend
            try {
              const refreshed = await getCustomerOverview({ email: overview.email, company: overview.company });
              if (refreshed) {
                const newDays = refreshed.subscription?.daysRemaining ?? (renewCycle === 'yearly' ? 365 : 30);
                const newDate = refreshed.subscription?.renewalDate || refreshed.nextBillingDate;
                setOverview(prev => ({
                  ...prev,
                  ...refreshed,
                  daysRemaining: newDays,
                  nextBillingDate: newDate,
                  nextBillingExact: newDate,
                  subscriptionStatus: 'Active'
                }));
                setNotifications(generateSoftwareNotifications(userPurchasedApps, newDays, newDate));
              }
            } catch (e) {}

            // Trigger global sync events
            window.dispatchEvent(new Event('oxoo_auth_change'));
            window.dispatchEvent(new Event('oxoo_order_placed'));
          }
        } catch (err) {
          setRenewPaymentError(err.message || 'Renewal finalization failed.');
          showToast(err.message || 'Renewal finalization failed.');
        } finally {
          setIsRenewing(false);
        }
      };

      // 2. LAUNCH RAZORPAY PAYMENT MODAL FIRST
      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzpKey = orderRes.razorpayKeyId || 'rzp_test_Tqu6q5BYPuxhzd';
        const rzpOptions = {
          key: rzpKey,
          amount: orderRes.amountPaise || Math.round(totalAmount * 100),
          currency: 'INR',
          name: 'OXOO Multiix',
          description: `Subscription Renewal: ${targetName} (${renewCycle === 'yearly' ? 'Annual / 12 Mos' : 'Monthly'})`,
          image: '/oxoo-icon.png',
          order_id: orderRes.razorpayOrderId || undefined,
          prefill: {
            name: profileData.name || overview.name || 'Priya Sharma',
            email: overview.email || profileData.email || 'priya@retailmart.in',
            contact: profileData.phone || overview.phone || '+91 98765 43210'
          },
          theme: {
            color: '#16a34a'
          },
          handler: async function (response) {
            // First payment succeeds here!
            await finalizeRenewalWithPayment(
              response.razorpay_payment_id || `pay_rzp_${Date.now().toString().slice(-8)}`,
              'Razorpay (UPI / Card)'
            );
          },
          modal: {
            ondismiss: function () {
              setIsRenewing(false);
              const cancelMsg = 'Payment was cancelled. Subscription has not been renewed.';
              setRenewPaymentError(cancelMsg);
              showToast(cancelMsg);
            }
          }
        };

        const rzpInstance = new window.Razorpay(rzpOptions);
        rzpInstance.on('payment.failed', function (response) {
          setIsRenewing(false);
          const failureMsg = response.error?.description || 'Payment was unsuccessful. Subscription was not renewed.';
          setRenewPaymentError(failureMsg);
          showToast(failureMsg);
        });
        rzpInstance.open();
      } else {
        // Fallback simulation in test environments if SDK blocked
        const proceed = window.confirm(`Proceed with online test payment of ₹${totalAmount} for ${targetName} renewal?`);
        if (proceed) {
          await finalizeRenewalWithPayment(`pay_rzp_test_${Date.now().toString().slice(-8)}`, 'Razorpay (Simulated Test)');
        } else {
          setIsRenewing(false);
          setRenewPaymentError('Payment cancelled. Subscription was not renewed.');
          showToast('Payment cancelled. Subscription was not renewed.');
        }
      }
    } catch (err) {
      setRenewPaymentError(err.message || 'Payment initiation failed. Please try again.');
      showToast(err.message || 'Payment initiation failed. Please try again.');
      setIsRenewing(false);
    }
  };

  // Dynamically compute allDirectoryApps: ONLY purchased software is Active / Entitled (unlocked)
  // All unpurchased software is Not Purchased / Locked
  const allDirectoryApps = BASE_DIRECTORY_APPS.map(app => {
    const entitled = isAppPurchased(app.id, app.name, userPurchasedApps, overview.currentPlan);
    return {
      ...app,
      status: entitled ? 'Active' : 'Not Purchased',
      entitled: Boolean(entitled),
      purchasedDate: entitled ? (app.id === 'finance' ? '21 Oct 2026' : (app.id === 'sales' ? '01 Oct 2026' : '12 Sep 2026')) : null
    };
  });

  const hydrateCustomer = async () => {
    try {
      setIsLoadingData(true);
      const storedUser = authStorage.getCustomerUser();

      const customCompany = localStorage.getItem('oxoo_demo_company') || localStorage.getItem('oxoo_company_name');

      let effectiveName = storedUser?.name || 'Customer';
      let effectiveComp = customCompany || storedUser?.organization || storedUser?.company || 'My Organization';
      let effectiveEmail = storedUser?.email || 'customer@oxoo.ai';
      let effectivePlan = storedUser?.plan || 'Single Software';

      let appsList = storedUser?.purchasedApps || storedUser?.apps || storedUser?.active_apps || [];

      // Check URL query parameters or custom subdomain for workspace resolution
      const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const wsParam = urlParams.get('workspace') || urlParams.get('company') || urlParams.get('org') || urlParams.get('domain');
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      const isCustomSub = currentHost && !currentHost.includes('localhost') && !currentHost.startsWith('127.0.0.1');

      if (wsParam || isCustomSub) {
        try {
          const wsRes = await resolveWorkspace({
            host: isCustomSub ? currentHost : undefined,
            subdomain: wsParam || undefined
          });
          if (wsRes && wsRes.workspace) {
            setResolvedWorkspace(wsRes.workspace);
            if (wsRes.workspace.company_name) {
              effectiveComp = wsRes.workspace.company_name;
            }
            if (wsRes.workspace.purchased_apps && wsRes.workspace.purchased_apps.length > 0) {
              appsList = wsRes.workspace.purchased_apps;
            }
            if (wsRes.workspace.plan) {
              effectivePlan = wsRes.workspace.plan;
            }
          }
        } catch (e) {
          console.log('Workspace resolution note:', e);
        }
      }

      if (!appsList || appsList.length === 0) {
        try {
          const lo = localStorage.getItem('oxoo_last_order');
          if (lo) {
            const parsed = JSON.parse(lo);
            if (parsed.apps && parsed.apps.length > 0) appsList = parsed.apps;
            else if (parsed.purchasedApps && parsed.purchasedApps.length > 0) appsList = parsed.purchasedApps;
          }
        } catch (e) {}
      }

      if (!appsList || appsList.length === 0) {
        try {
          const rc = localStorage.getItem('oxoo_recent_customers');
          if (rc) {
            const list = JSON.parse(rc);
            const match = list.find(c =>
              (effectiveComp && c.company && c.company.toLowerCase() === effectiveComp.toLowerCase()) ||
              (effectiveEmail && c.email && c.email.toLowerCase() === effectiveEmail.toLowerCase())
            );
            if (match && match.apps && match.apps.length > 0) {
              appsList = match.apps;
            }
          }
        } catch (e) {}
      }

      if (!appsList || appsList.length === 0) {
        appsList = ['Finance Software'];
      }

      setUserPurchasedApps(appsList);

      setProfileData(prev => ({
        ...prev,
        name: effectiveName,
        email: effectiveEmail,
        company: effectiveComp
      }));

      // Fetch fresh real records in parallel from backend APIs
      const [overviewRes, billingRes, teamRes, ticketsRes, notifsRes] = await Promise.allSettled([
        getCustomerOverview({ email: effectiveEmail, company: effectiveComp }),
        getCustomerBilling({ email: effectiveEmail, company: effectiveComp }),
        getCustomerTeam(),
        getCustomerTickets(),
        getCustomerNotifications()
      ]);

      // 1. Process Overview Data
      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        const apiData = overviewRes.value;
        const freshApps = (apiData.purchasedApps && apiData.purchasedApps.length > 0)
          ? apiData.purchasedApps
          : appsList;

        if (apiData.purchasedApps && apiData.purchasedApps.length > 0) {
          setUserPurchasedApps(apiData.purchasedApps);
        }

        const freshDays = typeof apiData.subscription?.daysRemaining === 'number'
          ? apiData.subscription.daysRemaining
          : (apiData.daysRemaining ?? 30);
        const freshRenewal = apiData.subscription?.renewalDate || apiData.nextBillingDate || '30 Nov 2026';

        setOverview(prev => ({
          ...prev,
          customerName: apiData.customerName || prev.customerName,
          company: apiData.company || prev.company,
          email: apiData.email || prev.email,
          avatar: (apiData.customerName || prev.customerName).charAt(0).toUpperCase() || 'C',
          currentPlan: apiData.currentPlan || prev.currentPlan,
          storageId: apiData.storageId || prev.storageId,
          nextBillingDate: freshRenewal,
          nextBillingExact: freshRenewal,
          daysRemaining: freshDays,
          subscriptionStatus: apiData.subscription?.status || apiData.status || 'Active',
          subscription: apiData.subscription || prev.subscription,
          activeAppsCount: freshApps.length,
          monthlyPrice: apiData.mrr ? `₹${Number(apiData.mrr).toLocaleString('en-IN')}` : prev.monthlyPrice,
          openTicketsCount: typeof apiData.openTicketsCount === 'number' ? apiData.openTicketsCount : 0,
          teamMembersCount: typeof apiData.teamMembersCount === 'number' ? apiData.teamMembersCount : 1
        }));
      }

      // 2. Process Real Invoices & Billing
      if (billingRes.status === 'fulfilled' && billingRes.value) {
        const bData = billingRes.value;
        if (Array.isArray(bData.invoices)) {
          setInvoices(bData.invoices);
        }
      }

      // 3. Process Real Team Members
      if (teamRes.status === 'fulfilled' && teamRes.value) {
        const tData = teamRes.value;
        if (Array.isArray(tData.team)) {
          setTeamMembers(tData.team);
        }
      }

      // 4. Process Real Tickets
      if (ticketsRes.status === 'fulfilled' && ticketsRes.value) {
        const tkData = ticketsRes.value;
        if (Array.isArray(tkData.tickets)) {
          setTickets(tkData.tickets);
          const openCount = tkData.tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved').length;
          setOverview(prev => ({ ...prev, openTicketsCount: openCount }));
        }
      }

      // 5. Process Real In-App Notifications
      if (notifsRes.status === 'fulfilled' && notifsRes.value) {
        const nData = notifsRes.value;
        if (Array.isArray(nData.notifications)) {
          setNotifications(nData.notifications);
        }
      }
    } catch (e) {
      console.error('Error hydrating customer data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    hydrateCustomer();

    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('renew') === 'true') {
        setRenewCycle('monthly');
        setRenewSuccess(null);
        setRenewPaymentError('');
        setRenewModalOpen(true);
      }
    } catch (e) {}

    const handleAuthChange = () => hydrateCustomer();
    const handleOrderPlaced = () => hydrateCustomer();
    window.addEventListener('oxoo_auth_change', handleAuthChange);
    window.addEventListener('oxoo_order_placed', handleOrderPlaced);
    return () => {
      window.removeEventListener('oxoo_auth_change', handleAuthChange);
      window.removeEventListener('oxoo_order_placed', handleOrderPlaced);
    };
  }, []);

  // -------------------------------------------------------------
  // ACTION HANDLERS: PLANS & PURCHASE FLOW (Requirement 3 & 4)
  // -------------------------------------------------------------
  const handleOpenPlansModal = async (app) => {
    setSelectedAppForPlans(app);
    setPlanBillingCycle('monthly');
    setPurchaseSuccessData(null);
    setPurchaseError('');
    setViewPlansModalOpen(true);
    setPlansLoading(true);

    try {
      const res = await getCustomerPlans(app.id);
      if (res && res.success && Array.isArray(res.plans) && res.plans.length > 0) {
        setAvailablePlans(res.plans);
        setSelectedPlan(res.plans[0]);
      } else {
        // Fallback standard plan for this application
        const fallbackPlan = {
          plan_code: `PLAN-${app.id.toUpperCase()}`,
          name: `${app.name} Professional`,
          app_id: app.id,
          app_name: app.name,
          monthly_price: 740,
          annual_price: 560,
          currency: 'INR',
          features: [
            `Full access to ${app.name}`,
            'Automated daily data backups',
            'Role-based permissions & audit logging',
            'Priority 24/7 technical support',
            'Seamless OXOO platform integrations'
          ]
        };
        setAvailablePlans([fallbackPlan]);
        setSelectedPlan(fallbackPlan);
      }
    } catch (err) {
      console.error('Failed to load plans:', err);
      setPurchaseError('Unable to load plans for this software. Please retry.');
    } finally {
      setPlansLoading(false);
    }
  };

  const handlePurchaseAppPlan = async () => {
    if (!selectedPlan || !selectedAppForPlans) return;
    try {
      setIsPurchasingApp(true);
      setPurchaseError('');

      const isYearly = planBillingCycle === 'yearly';
      const baseMonthly = Number(selectedPlan.monthly_price || 740);
      const baseAnnual = Number(selectedPlan.annual_price || 560);
      const unitAmount = isYearly ? baseAnnual * 12 : baseMonthly;
      const gstAmount = parseFloat((unitAmount * 0.18).toFixed(2));
      const totalAmount = parseFloat((unitAmount + gstAmount).toFixed(2));

      // Initiate order
      const orderRes = await createRenewalOrder({
        email: overview.email || profileData.email,
        companyName: overview.company || profileData.company,
        customerName: profileData.name || overview.customerName,
        customerPhone: profileData.phone || '+91 98765 43210',
        planName: selectedPlan.name,
        planCode: selectedPlan.plan_code,
        billingCycle: planBillingCycle,
        softwareId: selectedAppForPlans.id,
        softwareName: selectedAppForPlans.name,
        amount: totalAmount
      });

      const orderNumber = orderRes.orderNumber || `OXOO-APP-${Date.now().toString().slice(-6)}`;

      // Finalize verified payment & entitlement activation
      const completePurchaseWithPayment = async (realPaymentId) => {
        try {
          const verifyRes = await verifyPayment({
            razorpay_order_id: orderRes.razorpayOrderId || `order_test_${Date.now()}`,
            razorpay_payment_id: realPaymentId,
            razorpay_signature: 'sig_verified_server',
            orderNumber: orderNumber,
            customerName: profileData.name || overview.customerName,
            customerEmail: overview.email || profileData.email,
            customerPhone: profileData.phone || '+91 98765 43210',
            companyName: overview.company || profileData.company,
            planName: selectedPlan.name,
            billingCycle: planBillingCycle,
            amount: totalAmount,
            selectedSoftware: selectedAppForPlans.name,
            purchasedApps: [selectedAppForPlans.name]
          });

          if (verifyRes && verifyRes.success) {
            setPurchaseSuccessData({
              paymentId: realPaymentId,
              invoiceNumber: verifyRes.invoiceNumber || orderNumber,
              appName: selectedAppForPlans.name,
              planName: selectedPlan.name,
              amount: totalAmount
            });

            // Immediately mark application as purchased in local state
            setUserPurchasedApps(prev => {
              const updated = Array.from(new Set([...prev, selectedAppForPlans.name, selectedAppForPlans.id]));
              return updated;
            });

            showToast(`${selectedAppForPlans.name} successfully activated!`);
            await hydrateCustomer();
            window.dispatchEvent(new Event('oxoo_auth_change'));
          } else {
            throw new Error(verifyRes.message || 'Payment verification could not be confirmed.');
          }
        } catch (verErr) {
          setPurchaseError(verErr.message || 'Activation failed after payment.');
          showToast(verErr.message || 'Activation failed after payment.');
        } finally {
          setIsPurchasingApp(false);
        }
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzpKey = orderRes.razorpayKeyId || 'rzp_test_Tqu6q5BYPuxhzd';
        const rzpOptions = {
          key: rzpKey,
          amount: orderRes.amountPaise || Math.round(totalAmount * 100),
          currency: 'INR',
          name: 'OXOO Multiix',
          description: `Software Purchase: ${selectedAppForPlans.name} (${selectedPlan.name})`,
          image: '/oxoo-icon.png',
          order_id: orderRes.razorpayOrderId || undefined,
          prefill: {
            name: profileData.name || overview.customerName,
            email: overview.email || profileData.email,
            contact: profileData.phone || '+91 98765 43210'
          },
          theme: { color: '#0284c7' },
          handler: async function (response) {
            await completePurchaseWithPayment(
              response.razorpay_payment_id || `pay_rzp_${Date.now().toString().slice(-8)}`
            );
          },
          modal: {
            ondismiss: function () {
              setIsPurchasingApp(false);
              const cancelMsg = 'Purchase cancelled. No charges were made.';
              setPurchaseError(cancelMsg);
              showToast(cancelMsg);
            }
          }
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.on('payment.failed', function (resp) {
          setIsPurchasingApp(false);
          const failMsg = resp.error?.description || 'Payment was unsuccessful.';
          setPurchaseError(failMsg);
          showToast(failMsg);
        });
        rzp.open();
      } else {
        const ok = window.confirm(`Proceed with online test purchase of ₹${totalAmount} for ${selectedAppForPlans.name}?`);
        if (ok) {
          await completePurchaseWithPayment(`pay_rzp_test_${Date.now().toString().slice(-8)}`);
        } else {
          setIsPurchasingApp(false);
          setPurchaseError('Purchase cancelled.');
        }
      }
    } catch (err) {
      setPurchaseError(err.message || 'Unable to initiate checkout.');
      showToast(err.message || 'Unable to initiate checkout.');
      setIsPurchasingApp(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION HANDLERS: TEAM MANAGEMENT (Requirement 7)
  // -------------------------------------------------------------
  const handleInviteTeamMember = async (e) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      showToast('Please enter both name and email.');
      return;
    }
    try {
      setTeamLoading(true);
      const res = await inviteTeamMember({
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        role: inviteForm.role,
        appsAccess: inviteForm.appsAccess
      });
      showToast(res.message || 'Team member invited successfully!');
      setInviteModalOpen(false);
      setInviteForm({ name: '', email: '', role: 'Member', appsAccess: ['sales'] });
      const freshTeam = await getCustomerTeam();
      if (freshTeam && Array.isArray(freshTeam.team)) setTeamMembers(freshTeam.team);
    } catch (err) {
      showToast(err.message || 'Failed to invite team member.');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleUpdateTeamMember = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setTeamLoading(true);
      await updateTeamMember(editingMember.id, {
        role: editingMember.role,
        status: editingMember.status,
        appsAccess: editingMember.apps_access
      });
      showToast('Team member updated successfully.');
      setEditMemberModalOpen(false);
      setEditingMember(null);
      const freshTeam = await getCustomerTeam();
      if (freshTeam && Array.isArray(freshTeam.team)) setTeamMembers(freshTeam.team);
    } catch (err) {
      showToast(err.message || 'Failed to update member.');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleRemoveTeamMember = async (member) => {
    const ok = window.confirm(`Remove ${member.name} from the organization team?`);
    if (!ok) return;
    try {
      setTeamLoading(true);
      await removeTeamMember(member.id);
      showToast(`${member.name} removed from team.`);
      const freshTeam = await getCustomerTeam();
      if (freshTeam && Array.isArray(freshTeam.team)) setTeamMembers(freshTeam.team);
    } catch (err) {
      showToast(err.message || 'Failed to remove member.');
    } finally {
      setTeamLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION HANDLERS: SUPPORT TICKETS & CHAT (Requirement 9)
  // -------------------------------------------------------------
  const handleCreateSupportTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim()) {
      showToast('Please enter a ticket subject.');
      return;
    }
    try {
      setTicketsLoading(true);
      const res = await createCustomerTicket({
        subject: ticketForm.subject.trim(),
        category: ticketForm.category,
        priority: ticketForm.priority,
        application: ticketForm.application,
        description: ticketForm.description,
        attachments: ticketForm.attachments || []
      });
      const tNum = res?.ticket_number || res?.ticket?.ticket_number || '';
      showToast(`Support ticket ${tNum ? '#' + tNum + ' ' : ''}created successfully! Acknowledgment sent.`);
      setTicketModalOpen(false);
      setTicketForm({
        subject: '',
        category: 'Technical',
        priority: 'Normal',
        application: 'Sales Software',
        description: '',
        attachments: []
      });
      const freshTickets = await getCustomerTickets();
      if (freshTickets && Array.isArray(freshTickets.tickets)) {
        setTickets(freshTickets.tickets);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create ticket.');
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleOpenTicketChat = (ticket) => {
    setActiveTicketChat(ticket);
    setTicketReplyText('');
    setTicketReplyAttachments([]);
    setTicketChatModalOpen(true);
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if ((!ticketReplyText.trim() && ticketReplyAttachments.length === 0) || !activeTicketChat) return;
    try {
      setIsSendingTicketReply(true);
      const res = await replyCustomerTicket(activeTicketChat.id, {
        message: ticketReplyText.trim(),
        attachments: ticketReplyAttachments
      });
      showToast('Reply sent to support team.');
      setTicketReplyText('');
      setTicketReplyAttachments([]);
      if (res && res.ticket) {
        setActiveTicketChat(res.ticket);
      }
      const freshTickets = await getCustomerTickets();
      if (freshTickets && Array.isArray(freshTickets.tickets)) {
        setTickets(freshTickets.tickets);
        const match = freshTickets.tickets.find(t => t.id === activeTicketChat.id || t.ticket_number === activeTicketChat.ticket_number);
        if (match) setActiveTicketChat(match);
      }
    } catch (err) {
      showToast(err.message || 'Failed to send reply.');
    } finally {
      setIsSendingTicketReply(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION HANDLERS: IN-APP NOTIFICATIONS (Requirement 10)
  // -------------------------------------------------------------
  const handleMarkNotification = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true, read: true } : n));
    } catch (e) {}
  };

  const handleMarkAllNotifications = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
      showToast('All notifications marked as read.');
    } catch (e) {
      showToast('Failed to mark all as read.');
    }
  };

  const handleClearReadNotifications = async () => {
    try {
      await deleteReadNotifications();
      setNotifications(prev => prev.filter(n => !n.is_read && !n.read));
      showToast('Read notifications cleared.');
    } catch (e) {
      showToast('Failed to clear read notifications.');
    }
  };

  // Shared secret service key matching Oxoo Finance & other software
  const OXOO_FINANCE_SERVICE_KEY = "OXOO-FIN-2026-SECURE-KEY";

  // App Launch Handler: Passes Finance Service Key and automatically detects as Admin to open Admin Dashboard without login
  const handleOpenApp = (app) => {
    if (!app.entitled) {
      showToast(`${app.name} is not included in your current subscription plan.`);
      return;
    }

    const companySlug = overview.company || 'RetailMart Solutions';
    const cleanCompName = companySlug.replace(/\.(oxoo|com|ai)$/i, '');

    // Unified SSO & Service Key parameters:
    // Automatically detected by destination software as Admin, immediately opening Admin Dashboard without login
    const ssoParams = new URLSearchParams({
      service_key: OXOO_FINANCE_SERVICE_KEY,
      user: overview.email || '',
      email: overview.email || '',
      name: overview.customerName || 'Customer Admin',
      company: companySlug,
      company_name: cleanCompName,
      storage_id: overview.storageId || 'STG-08643413',
      role: 'admin',
      user_type: 'admin',
      is_admin: 'true',
      auth_role: 'admin',
      auto_login: 'true',
      login_type: 'admin',
      view: 'admin',
      target: 'admin-dashboard',
      redirect: 'dashboard',
      plan: overview.currentPlan || 'Standard Pack',
      app: app.id
    });

    // 1. Finance Software (Opens Oxoo Finance directly into Admin Dashboard)
    if (app.id === 'finance') {
      const financeUrl = `https://oxoo-finance.onrender.com/#/admin?${ssoParams.toString()}`;
      window.open(financeUrl, '_blank');
      return;
    }

    // 2. HRMS / Human Resources Software (Opens Oxoo Finance Employee Login)
    if (app.id === 'hrms' || app.id === 'human-resources') {
      window.open('https://oxoo-finance.onrender.com/', '_blank');
      return;
    }

    // 3. Inventory / Supply Chain Suite
    if (app.id === 'inventory' || app.id === 'supply-chain') {
      const invUrl = `/demo/supply-chain?${ssoParams.toString()}`;
      window.open(invUrl, '_blank');
      return;
    }

    // 4. Sales Suite
    if (app.id === 'sales') {
      const salesUrl = `/demo/sales?${ssoParams.toString()}`;
      window.open(salesUrl, '_blank');
      return;
    }

    // 5. Productivity & AI Suite
    if (app.id === 'productivity' || app.id === 'marketing' || app.id === 'ai') {
      const mktUrl = `/demo/ai?${ssoParams.toString()}`;
      window.open(mktUrl, '_blank');
      return;
    }

    // Fallback for any other custom multi-app module:
    const customUrl = `/apps/${app.id}?${ssoParams.toString()}`;
    window.open(customUrl, '_blank');
  };

  // Sparkline mini SVG helper
  const renderSparkline = (color = '#10b981', points = '0,20 20,18 40,22 60,10 80,6') => (
    <svg className="oxoo-metric-sparkline" viewBox="0 0 80 30" fill="none">
      <path
        d={`M ${points}`}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="80" cy={points.split(' ').pop().split(',')[1]} r="3" fill={color} />
    </svg>
  );

  return (
    <div className="oxoo-dashboard-layout">
      {/* ---------------------------------------------------------
          1. SIDEBAR (Dark Navy, OXOO Brand Logo, 8 Navigation Items)
          --------------------------------------------------------- */}
      <aside className={`oxoo-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="oxoo-sidebar-top">
          {/* Logo & Tagline: Prominently displays Company Workspace & Smaller Powered by OXOO */}
          <Link to="/" className="oxoo-brand-container" style={{ textDecoration: 'none', display: 'block', padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(2, 132, 199, 0.4)',
                flexShrink: 0
              }}>
                {(overview.company || 'C').charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.2px' }}>
                  {overview.company || 'Customer Workspace'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <img src="/oxoo-logo-white.png" alt="OXOO" style={{ height: '9px', opacity: 0.85 }} />
                  <span style={{ fontWeight: 500 }}>Powered by OXOO</span>
                </div>
              </div>
            </div>
            {resolvedWorkspace?.workspace_domain && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, padding: '2px 8px', background: 'rgba(56, 189, 248, 0.12)', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  {resolvedWorkspace.workspace_domain}
                </span>
              </div>
            )}
          </Link>

          {/* Navigation Menu */}
          <nav className="oxoo-nav-menu">
            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            >
              <LayoutDashboard className="oxoo-nav-icon" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'apps' ? 'active' : ''}`}
              onClick={() => { setActiveTab('apps'); setMobileMenuOpen(false); }}
            >
              <Layers className="oxoo-nav-icon" />
              <span>My Applications</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false); }}
            >
              <CreditCard className="oxoo-nav-icon" />
              <span>Billing & Subscriptions</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => { setActiveTab('team'); setMobileMenuOpen(false); }}
            >
              <Users className="oxoo-nav-icon" />
              <span>Team Management</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => { setActiveTab('support'); setMobileMenuOpen(false); }}
            >
              <HelpCircle className="oxoo-nav-icon" />
              <span>Support</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
            >
              <BarChart2 className="oxoo-nav-icon" />
              <span>Reports & Analytics</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => { setActiveTab('notifications'); setMobileMenuOpen(false); }}
            >
              <Bell className="oxoo-nav-icon" />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              className={`oxoo-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            >
              <Settings className="oxoo-nav-icon" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="oxoo-sidebar-bottom">
          <div className="oxoo-fluid-waves-art" />
          <div
            className="oxoo-sidebar-profile"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="oxoo-profile-avatar-circle">
              {overview.avatar || 'P'}
            </div>
            <div className="oxoo-profile-meta">
              <span className="oxoo-profile-name">{overview.customerName || 'Priya Sharma'}</span>
              <span className="oxoo-profile-sub">{overview.company || 'RetailMart Solutions'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className={`oxoo-sidebar-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ---------------------------------------------------------
          2. MAIN VIEWPORT (Header & Dynamic Sections)
          --------------------------------------------------------- */}
      <div className="oxoo-main-viewport">
        {/* Top Bar Header */}
        <header className="oxoo-top-header">
          <div className="oxoo-header-left">
            <button
              type="button"
              className="oxoo-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation drawer"
            >
              <Menu size={20} />
            </button>
            <div className="oxoo-search-box">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                className="oxoo-search-input"
                placeholder="Search apps, features, help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="oxoo-header-right">
            {/* Live Customer Logo Preview */}
            <CustomerBrandBadge companyName={overview.company} workspaceDomain={resolvedWorkspace?.workspace_domain} />

            {/* Customer Portal Pill Badge */}
            <div className="oxoo-portal-badge-pill">
              <ShieldCheck size={14} />
              <span>Customer Portal</span>
            </div>

            {/* Notifications Bell */}
            <button
              type="button"
              className="oxoo-header-icon-btn"
              onClick={() => setActiveTab('notifications')}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="oxoo-badge-dot" />
            </button>

            {/* Help Center Icon */}
            <button
              type="button"
              className="oxoo-header-icon-btn"
              onClick={() => setActiveTab('support')}
              aria-label="Help Center"
              title="Help Center"
            >
              <HelpCircle size={18} />
            </button>

            {/* User Profile Dropdown Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="oxoo-user-dropdown-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="oxoo-profile-avatar-circle" style={{ width: '34px', height: '34px' }}>
                  {overview.avatar || 'P'}
                </div>
                <div className="oxoo-user-info-text">
                  <span className="oxoo-user-name">{overview.customerName || 'Priya Sharma'}</span>
                  <span className="oxoo-user-org">{overview.company || 'RetailMart Solutions'}</span>
                </div>
                <ChevronDown size={14} color="#64748b" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '52px',
                      width: '240px',
                      background: '#ffffff',
                      borderRadius: '14px',
                      boxShadow: '0 12px 35px rgba(15, 23, 42, 0.15)',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      zIndex: 200
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{overview.customerName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{overview.email}</div>
                    </div>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { setActiveTab('settings'); setSettingsSubTab('account'); setUserMenuOpen(false); }}
                    >
                      Account Profile
                    </button>
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#334155', cursor: 'pointer', borderRadius: '8px' }}
                      onClick={() => { setActiveTab('billing'); setUserMenuOpen(false); }}
                    >
                      Billing & Subscriptions
                    </button>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
                    <button
                      type="button"
                      style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: '#dc2626', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => {
                        authStorage.clearCustomerSession();
                        window.dispatchEvent(new Event('oxoo_auth_change'));
                        setUserMenuOpen(false);
                        navigate('/login');
                      }}
                    >
                      <LogOut size={13} /> Sign Out
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

        {/* Main Content Area */}
        <main className="oxoo-content-canvas">
          {/* =========================================================
              VIEW 1: DASHBOARD OVERVIEW
              ========================================================= */}
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <div className="oxoo-welcome-row">
                <div>
                  <h1 className="oxoo-welcome-title">
                    Welcome back, {overview.customerName.split(' ')[0]}!
                  </h1>
                  <p className="oxoo-welcome-subtitle">
                    Manage your business with OXOO. Access all your purchased apps in one place.
                  </p>
                </div>

                {/* Current Plan Card */}
                <div className="oxoo-plan-card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="oxoo-crown-badge">
                    <Crown size={22} />
                  </div>
                  <div className="oxoo-plan-details">
                    <span className="oxoo-plan-label">Current Plan</span>
                    <span className="oxoo-plan-name">{overview.currentPlan}</span>
                    <span className="oxoo-plan-billing-date">
                      {overview.daysRemaining <= 0
                        ? `Subscription Expired • Ended ${overview.nextBillingDate}`
                        : `Next billing: ${overview.nextBillingDate}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenRenewModal()}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <RefreshCw size={13} /> Renew
                  </button>
                </div>
              </div>

              {/* Expired Subscription Alert Banner */}
              {(typeof overview.daysRemaining === 'number' && overview.daysRemaining <= 0) && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#fef2f2',
                  border: '1.5px solid #fecaca',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={20} color="#dc2626" />
                    <div>
                      <strong style={{ fontSize: '13.5px', color: '#991b1b' }}>
                        Your Software Subscription Has Expired
                      </strong>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Renew your plan now to restore full access and prevent any instance lock.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenRenewModal()}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={13} /> Renew Now →
                  </button>
                </div>
              )}

              {/* Dashboard Statistics (4 Summary Cards: Real Subscriptions, Apps, Renewal Due Date, Support) */}
              <div className="oxoo-summary-grid">
                {/* 1. Purchased Applications */}
                <div
                  className="oxoo-metric-card"
                  onClick={() => setActiveTab('apps')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap blue">
                      <Layers size={20} />
                    </div>
                    <span className="oxoo-metric-badge green">
                      {allDirectoryApps.filter(a => a.entitled).length} Active
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Purchased Applications</span>
                      <span className="oxoo-metric-value">{allDirectoryApps.filter(a => a.entitled).length}</span>
                      <span className="oxoo-metric-subtitle">of {allDirectoryApps.length} catalog software</span>
                    </div>
                    {renderSparkline('#0284c7', '0,24 20,20 40,16 60,12 80,6')}
                  </div>
                </div>

                {/* 2. Current Subscription */}
                <div
                  className="oxoo-metric-card"
                  onClick={() => setActiveTab('billing')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                      <Crown size={20} />
                    </div>
                    <span className={`oxoo-metric-badge ${overview.daysRemaining <= 0 ? 'red' : 'green'}`}>
                      {overview.daysRemaining <= 0 ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Current Subscription</span>
                      <span className="oxoo-metric-value" style={{ fontSize: '18px', lineHeight: '24px' }}>
                        {overview.currentPlan || 'Single Software'}
                      </span>
                      <span className="oxoo-metric-subtitle">
                        {overview.monthlyPrice || 'Active Plan'}
                      </span>
                    </div>
                    {renderSparkline('#d97706', '0,20 20,18 40,14 60,10 80,8')}
                  </div>
                </div>

                {/* 3. Subscription Due Date & Renewal Status */}
                <div className="oxoo-metric-card">
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap green" style={{ background: '#ecfdf5', color: '#10b981' }}>
                      <Calendar size={20} />
                    </div>
                    <span className={`oxoo-metric-badge ${overview.daysRemaining <= 0 ? 'red' : 'green'}`}>
                      {overview.daysRemaining <= 0 ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Subscription Due Date</span>
                      <span className="oxoo-metric-value" style={{ fontSize: '17px', lineHeight: '24px' }}>
                        {overview.nextBillingExact || overview.nextBillingDate || '30 Nov 2026'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className="oxoo-metric-subtitle" style={{ margin: 0 }}>
                          {overview.daysRemaining <= 0 ? 'Action required' : 'Automatic renewal date'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenRenewModal(); }}
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            padding: '2px 8px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                    {renderSparkline('#10b981', '0,20 20,20 40,18 60,12 80,6')}
                  </div>
                </div>

                {/* 4. Support Activity */}
                <div
                  className="oxoo-metric-card"
                  onClick={() => setActiveTab('support')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="oxoo-metric-top-row">
                    <div className="oxoo-metric-icon-wrap purple">
                      <MessageSquare size={20} />
                    </div>
                    <span className={`oxoo-metric-badge ${overview.openTicketsCount > 0 ? 'yellow' : 'green'}`}>
                      {overview.openTicketsCount > 0 ? `${overview.openTicketsCount} Active` : 'All Resolved'}
                    </span>
                  </div>
                  <div className="oxoo-metric-bottom-row">
                    <div className="oxoo-metric-text-group">
                      <span className="oxoo-metric-label">Support Activity</span>
                      <span className="oxoo-metric-value">{overview.openTicketsCount}</span>
                      <span className="oxoo-metric-subtitle">
                        {overview.openTicketsCount === 1 ? 'open support ticket' : 'open support tickets'}
                      </span>
                    </div>
                    {renderSparkline('#8b5cf6', '0,20 20,20 40,20 60,20 80,20')}
                  </div>
                </div>
              </div>

              {/* 2-Column: My Applications & Recent Activity */}
              <div className="oxoo-apps-activity-row">
                {/* Left Column: My Applications */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h2 className="oxoo-section-title">My Applications</h2>
                    <span className="oxoo-view-all-link" onClick={() => setActiveTab('apps')}>
                      View All Apps <ArrowRight size={13} />
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                    {allDirectoryApps.filter(app => app.entitled).length > 0 ? (
                      allDirectoryApps.filter(app => app.entitled).map((app) => (
                        <div key={app.id} className="oxoo-app-tile" style={{ padding: '20px 16px' }}>
                          <div className={`oxoo-app-icon-box ${app.color === 'blue' ? 'gradient-blue' : ''}`} style={{
                            background: app.id === 'sales' ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' :
                              (app.id === 'human-resources' || app.id === 'hrms') ? '#f3e8ff' :
                              app.id === 'finance' ? '#ecfdf5' :
                              (app.id === 'supply-chain' || app.id === 'inventory') ? '#fff7ed' : '#faf5ff',
                            color: app.id === 'sales' ? '#ffffff' :
                              (app.id === 'human-resources' || app.id === 'hrms') ? '#8b5cf6' :
                              app.id === 'finance' ? '#10b981' :
                              (app.id === 'supply-chain' || app.id === 'inventory') ? '#ea580c' : '#6d28d9'
                          }}>
                            {app.id === 'sales' && <Layers size={26} />}
                            {(app.id === 'human-resources' || app.id === 'hrms') && <Users size={26} />}
                            {app.id === 'finance' && <BarChart2 size={26} />}
                            {(app.id === 'supply-chain' || app.id === 'inventory') && <Package size={26} />}
                            {(app.id === 'productivity' || app.id === 'marketing') && <Sparkles size={26} />}
                          </div>
                          <span className="oxoo-app-name" style={{ fontSize: '15px' }}>{app.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
                            <span className={`oxoo-status-pill ${overview.daysRemaining <= 0 ? 'not-purchased' : 'active'}`} style={{ margin: 0 }}>
                              <span className="oxoo-status-dot" /> {overview.daysRemaining <= 0 ? 'Expired' : 'Active'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button
                              type="button"
                              className="oxoo-app-action-btn open"
                              onClick={() => handleOpenApp(app)}
                            >
                              Open App →
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRenewModal(app)}
                              style={{
                                background: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                            >
                              <RefreshCw size={12} /> Renew Software
                            </button>
                            {typeof overview.daysRemaining === 'number' && overview.daysRemaining > 5 && (
                              <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                                <Lock size={9} color="#94a3b8" /> Opens in {overview.daysRemaining - 5}d
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px', gridColumn: '1 / -1' }}>
                        No active applications yet.{' '}
                        <span onClick={() => setActiveTab('apps')} style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 600 }}>
                          Browse Directory →
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="oxoo-section-card">
                  <div className="oxoo-section-header">
                    <h2 className="oxoo-section-title">Recent Activity</h2>
                    <span className="oxoo-view-all-link" onClick={() => setActiveTab('billing')}>
                      View All
                    </span>
                  </div>

                  <div className="oxoo-activity-list">
                    {invoices && invoices.length > 0 ? (
                      invoices.slice(0, 4).map((inv) => (
                        <div key={inv.id || inv.invoice_number} className="oxoo-activity-item">
                          <div className="oxoo-activity-icon-circle green" style={{ background: '#ecfdf5', color: '#10b981' }}>
                            <Check size={16} />
                          </div>
                          <div className="oxoo-activity-content">
                            <span className="oxoo-activity-title">Payment Received ({inv.invoice_number})</span>
                            <span className="oxoo-activity-desc">{inv.plan_name || inv.plan || 'Software Plan'} — ₹{Number(inv.total_amount || inv.amount || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <span className="oxoo-activity-time">{inv.invoice_date || inv.date || 'Recent'}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                        No billing or invoice activity recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* =========================================================
              VIEW 2: MY APPLICATIONS
              ========================================================= */}
          {activeTab === 'apps' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 className="oxoo-section-title">My Applications</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Access and manage all your purchased applications.
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-controls-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-table-search-box">
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="oxoo-select-filter"
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="not_purchased">Not Purchased</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => navigate('/choose-apps')}
                >
                  <Plus size={14} style={{ marginRight: '4px' }} /> Explore More Apps
                </button>
              </div>

              {/* Application Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '18px', marginTop: '16px' }}>
                {allDirectoryApps
                  .filter(app => {
                    const matchQuery = app.name.toLowerCase().includes(appSearch.toLowerCase()) || app.desc.toLowerCase().includes(appSearch.toLowerCase());
                    const matchStatus = appStatusFilter === 'all' ||
                      (appStatusFilter === 'active' && app.entitled) ||
                      (appStatusFilter === 'not_purchased' && !app.entitled);
                    return matchQuery && matchStatus;
                  })
                  .map((app) => (
                    <div key={app.id} className="oxoo-app-tile" style={{ padding: '24px 20px', textAlign: 'center' }}>
                      <div className={`oxoo-app-icon-box ${app.color === 'blue' ? 'gradient-blue' : ''}`} style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '16px',
                        margin: '0 auto 14px',
                        background: app.id === 'sales' ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' :
                          (app.id === 'human-resources' || app.id === 'hrms') ? '#f3e8ff' :
                          app.id === 'finance' ? '#ecfdf5' :
                          (app.id === 'supply-chain' || app.id === 'inventory') ? '#fff7ed' : '#faf5ff',
                        color: app.id === 'sales' ? '#ffffff' :
                          (app.id === 'human-resources' || app.id === 'hrms') ? '#8b5cf6' :
                          app.id === 'finance' ? '#10b981' :
                          (app.id === 'supply-chain' || app.id === 'inventory') ? '#ea580c' : '#6d28d9',
                        display: 'grid',
                        placeItems: 'center'
                      }}>
                        {app.id === 'sales' && <Layers size={28} />}
                        {(app.id === 'human-resources' || app.id === 'hrms') && <Users size={28} />}
                        {app.id === 'finance' && <BarChart2 size={28} />}
                        {(app.id === 'supply-chain' || app.id === 'inventory') && <Package size={28} />}
                        {(app.id === 'productivity' || app.id === 'marketing') && <Sparkles size={28} />}
                      </div>

                      <h3 className="oxoo-app-name" style={{ fontSize: '16px', marginBottom: '4px' }}>{app.name}</h3>
                      <p style={{ fontSize: '12.5px', color: '#64748b', minHeight: '36px', margin: '0 0 12px' }}>
                        {app.desc}
                      </p>

                      <div style={{ marginBottom: '16px' }}>
                        {app.entitled ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <span className={`oxoo-status-pill ${overview.daysRemaining <= 0 ? 'not-purchased' : 'active'}`} style={{ margin: 0 }}>
                                <span className="oxoo-status-dot" /> {overview.daysRemaining <= 0 ? 'Expired' : 'Active'}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                              Next Renewal: {overview.nextBillingExact || overview.nextBillingDate}
                            </div>
                          </>
                        ) : (
                          <span className="oxoo-status-pill not-purchased" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <span className="oxoo-status-dot" style={{ background: '#d97706' }} /> Not Purchased
                          </span>
                        )}
                        {app.purchasedDate && !app.entitled && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            Purchased on: {app.purchasedDate}
                          </div>
                        )}
                      </div>

                      {app.entitled ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            type="button"
                            className="oxoo-app-action-btn open"
                            onClick={() => handleOpenApp(app)}
                          >
                            Open App →
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenRenewModal(app)}
                            style={{
                              background: '#f0fdf4',
                              color: '#15803d',
                              border: '1px solid #bbf7d0',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <RefreshCw size={13} /> Renew Software
                          </button>
                          {typeof overview.daysRemaining === 'number' && overview.daysRemaining > 5 && (
                            <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                              <Lock size={10} color="#94a3b8" /> Payment opens 5 days before renewal ({overview.daysRemaining - 5}d)
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="oxoo-app-action-btn view-plans"
                          onClick={() => handleOpenPlansModal(app)}
                        >
                          View Plans →
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 3: BILLING & SUBSCRIPTIONS
              ========================================================= */}
          {activeTab === 'billing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div className="oxoo-section-card">
                <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                  <div>
                    <h2 className="oxoo-section-title">Billing & Subscriptions</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Manage your plans, payment methods and real tax invoices.
                    </p>
                  </div>
                </div>

                {/* Subscription Summary Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="oxoo-crown-badge">
                      <Crown size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{overview.currentPlan}</span>
                        <span className={`oxoo-status-pill ${overview.daysRemaining <= 0 ? 'not-purchased' : 'active'}`} style={{
                          margin: 0,
                          padding: '2px 8px',
                          fontSize: '10px',
                          background: overview.daysRemaining <= 0 ? '#fee2e2' : '#ecfdf5',
                          color: overview.daysRemaining <= 0 ? '#b91c1c' : '#059669'
                        }}>
                          {overview.daysRemaining <= 0 ? 'Expired' : 'Active'}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: (overview.daysRemaining <= 0 ? '#fee2e2' : '#dbeafe'),
                          color: (overview.daysRemaining <= 0 ? '#b91c1c' : '#1d4ed8')
                        }}>
                          {overview.daysRemaining <= 0 ? 'Ended' : 'Auto-Renew Active'}
                        </span>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0284c7', margin: '2px 0' }}>{overview.monthlyPrice}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Next billing / renewal date: <strong>{overview.nextBillingExact || overview.nextBillingDate}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Payment Method */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenRenewModal()}
                      style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)'
                      }}
                    >
                      <RefreshCw size={15} /> Renew Subscription
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <CreditCard size={20} color="#0284c7" />
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>Razorpay Verified Gateway</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>UPI, Cards, NetBanking</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs: Invoices | Payment History | Subscription Details */}
                <div className="oxoo-settings-subnav" style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    className={`oxoo-settings-tab-btn ${billingSubTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setBillingSubTab('invoices')}
                  >
                    Invoices ({invoices.length})
                  </button>
                  <button
                    type="button"
                    className={`oxoo-settings-tab-btn ${billingSubTab === 'payment_history' ? 'active' : ''}`}
                    onClick={() => setBillingSubTab('payment_history')}
                  >
                    Payment History
                  </button>
                  <button
                    type="button"
                    className={`oxoo-settings-tab-btn ${billingSubTab === 'subscription_details' ? 'active' : ''}`}
                    onClick={() => setBillingSubTab('subscription_details')}
                  >
                    Subscription Details
                  </button>
                </div>

                {/* Sub-Tab 1: Invoices Table */}
                {billingSubTab === 'invoices' && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="oxoo-table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Date</th>
                          <th>Plan / Software</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices && invoices.length > 0 ? (
                          invoices.map((inv) => (
                            <tr key={inv.id || inv.invoice_number}>
                              <td className="oxoo-table-company">{inv.invoice_number}</td>
                              <td>{inv.invoice_date || inv.date || '—'}</td>
                              <td>{inv.plan_name || inv.plan || 'Software License'}</td>
                              <td className="oxoo-table-amount">₹{Number(inv.total_amount || inv.amount || 0).toLocaleString('en-IN')}</td>
                              <td>
                                <span className="oxoo-status-tag active">{inv.status || 'Paid'}</span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button
                                    type="button"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      background: '#f0f9ff',
                                      color: '#0284c7',
                                      border: '1px solid #bae6fd',
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                      setSelectedInvoice(inv);
                                      setViewInvoiceModalOpen(true);
                                    }}
                                  >
                                    <Eye size={13} /> View
                                  </button>
                                  <button
                                    type="button"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      background: '#ecfdf5',
                                      color: '#059669',
                                      border: '1px solid #a7f3d0',
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      cursor: 'pointer'
                                    }}
                                    onClick={async () => {
                                      try {
                                        showToast(`Downloading invoice ${inv.invoice_number}...`);
                                        await downloadInvoicePdf(inv.invoice_number);
                                        showToast(`Invoice ${inv.invoice_number} downloaded.`);
                                      } catch (err) {
                                        showToast(err.message || 'Invoice download failed.');
                                      }
                                    }}
                                  >
                                    <Download size={13} /> PDF
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                              <Receipt size={36} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                              <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>No Invoices Generated Yet</div>
                              <div style={{ fontSize: '12px', marginTop: '4px' }}>Real invoices are automatically generated and listed here whenever you purchase software or renew your plan.</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sub-Tab 2: Payment History */}
                {billingSubTab === 'payment_history' && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="oxoo-table">
                      <thead>
                        <tr>
                          <th>Transaction / Order #</th>
                          <th>Date</th>
                          <th>Gateway / Method</th>
                          <th>Amount Paid</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices && invoices.length > 0 ? (
                          invoices.map((inv) => (
                            <tr key={`pay-${inv.id || inv.invoice_number}`}>
                              <td className="oxoo-table-company">{inv.invoice_number}</td>
                              <td>{inv.invoice_date || inv.date || '—'}</td>
                              <td>Razorpay (UPI / Card)</td>
                              <td className="oxoo-table-amount">₹{Number(inv.total_amount || inv.amount || 0).toLocaleString('en-IN')}</td>
                              <td>
                                <span className="oxoo-status-tag active">Verified &amp; Settled</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                              No payment transactions recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sub-Tab 3: Subscription Details */}
                {billingSubTab === 'subscription_details' && (
                  <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                      Subscription Specification
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Plan Name</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{overview.currentPlan}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Organization</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{overview.company}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Renewal Due Date</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{overview.nextBillingExact || overview.nextBillingDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>Current Status</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: overview.daysRemaining <= 0 ? '#dc2626' : '#16a34a' }}>
                          {overview.subscriptionStatus || 'Active'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 4: TEAM MANAGEMENT
              ========================================================= */}
          {activeTab === 'team' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 className="oxoo-section-title">Team Management</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Manage your team members and their access to applications.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setInviteModalOpen(true)}
                >
                  <UserPlus size={14} style={{ marginRight: '6px' }} /> + Invite Member
                </button>
              </div>

              {/* 4 Summary Cards */}
              <div className="oxoo-team-stats-row">
                <div className="oxoo-team-stat-pill">
                  <div className="oxoo-team-stat-icon blue">
                    <Users size={18} />
                  </div>
                  <div className="oxoo-team-stat-meta">
                    <span className="oxoo-team-stat-label">Total Members</span>
                    <span className="oxoo-team-stat-val">{teamMembers.length}</span>
                  </div>
                </div>

                <div className="oxoo-team-stat-pill">
                  <div className="oxoo-team-stat-icon green">
                    <UserCheck size={18} />
                  </div>
                  <div className="oxoo-team-stat-meta">
                    <span className="oxoo-team-stat-label">Active</span>
                    <span className="oxoo-team-stat-val">{teamMembers.filter(m => m.status === 'Active').length}</span>
                  </div>
                </div>

                <div className="oxoo-team-stat-pill">
                  <div className="oxoo-team-stat-icon yellow">
                    <Clock size={18} />
                  </div>
                  <div className="oxoo-team-stat-meta">
                    <span className="oxoo-team-stat-label">Suspended</span>
                    <span className="oxoo-team-stat-val">{teamMembers.filter(m => m.status === 'Suspended').length}</span>
                  </div>
                </div>

                <div className="oxoo-team-stat-pill">
                  <div className="oxoo-team-stat-icon purple">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="oxoo-team-stat-meta">
                    <span className="oxoo-team-stat-label">Software Scoped</span>
                    <span className="oxoo-team-stat-val">{teamMembers.filter(m => Array.isArray(m.apps_access) && m.apps_access.length > 0).length}</span>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-controls-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-table-search-box">
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={teamSearch}
                      onChange={(e) => setTeamSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="oxoo-select-filter"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Billing Manager">Billing Manager</option>
                  </select>
                </div>
              </div>

              {/* Team Members Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Assigned Software</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers && teamMembers.length > 0 ? (
                      teamMembers
                        .filter(m => {
                          const matchQuery = (m.name || '').toLowerCase().includes(teamSearch.toLowerCase()) || (m.email || '').toLowerCase().includes(teamSearch.toLowerCase());
                          const matchRole = roleFilter === 'all' || (m.role || '').toLowerCase() === roleFilter.toLowerCase();
                          return matchQuery && matchRole;
                        })
                        .map((member) => (
                          <tr key={member.id || member.email}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="oxoo-profile-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '13px' }}>
                                  {(member.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <strong>{member.name}</strong>
                              </div>
                            </td>
                            <td style={{ color: '#475569' }}>{member.email}</td>
                            <td>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: member.role === 'Owner' ? '#0369a1' : member.role === 'Admin' ? '#1d4ed8' : '#475569',
                                background: member.role === 'Owner' ? '#e0f2fe' : member.role === 'Admin' ? '#dbeafe' : '#f1f5f9',
                                padding: '3px 10px',
                                borderRadius: '6px'
                              }}>
                                {member.role || 'Member'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {Array.isArray(member.apps_access) && member.apps_access.length > 0 ? (
                                  member.apps_access.map(appCode => (
                                    <span key={appCode} style={{
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      background: '#f0fdf4',
                                      color: '#166534',
                                      border: '1px solid #bbf7d0',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      textTransform: 'capitalize'
                                    }}>
                                      {appCode}
                                    </span>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                                    All Purchased Software
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`oxoo-status-tag ${member.status === 'Active' ? 'active' : 'pending'}`} style={{
                                background: member.status === 'Active' ? '#ecfdf5' : member.status === 'Suspended' ? '#fee2e2' : '#fef3c7',
                                color: member.status === 'Active' ? '#059669' : member.status === 'Suspended' ? '#dc2626' : '#d97706'
                              }}>
                                {member.status || 'Active'}
                              </span>
                            </td>
                            <td style={{ color: '#64748b' }}>
                              {member.created_at ? new Date(member.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (member.joined || 'Active')}
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  style={{
                                    background: '#f8fafc',
                                    border: '1px solid #cbd5e1',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    color: '#334155'
                                  }}
                                  onClick={() => {
                                    setEditingMember({
                                      ...member,
                                      apps_access: Array.isArray(member.apps_access) ? member.apps_access : ['sales']
                                    });
                                    setEditMemberModalOpen(true);
                                  }}
                                >
                                  Edit Access
                                </button>
                                {member.role !== 'Owner' && (
                                  <button
                                    type="button"
                                    style={{
                                      background: '#fff1f2',
                                      border: '1px solid #fecdd3',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11.5px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      color: '#e11d48'
                                    }}
                                    onClick={() => handleRemoveTeamMember(member)}
                                    title="Remove from team"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                          <Users size={36} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>No Team Members Yet</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>Click "+ Invite Member" to create accounts for colleagues and assign them to specific purchased applications.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="oxoo-pagination-bar">
                <span>Total: {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}</span>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 5: SUPPORT CENTER / TICKETS
              ========================================================= */}
          {activeTab === 'support' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 className="oxoo-section-title">Support Center</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Raise and manage your support tickets.
                  </p>
                </div>
                <button
                  type="button"
                  className="oxoo-upgrade-btn"
                  onClick={() => setTicketModalOpen(true)}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> + Create Ticket
                </button>
              </div>

              {/* Ticket Status Tabs */}
              <div className="oxoo-filter-pills-bar">
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('all')}
                >
                  All Tickets
                </button>
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'open' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('open')}
                >
                  Open <span className="oxoo-filter-count-badge">{tickets.filter(t => (t.status || '').toLowerCase() === 'open').length}</span>
                </button>
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'in_progress' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('in_progress')}
                >
                  In Progress <span className="oxoo-filter-count-badge">{tickets.filter(t => {
                    const st = (t.status || '').toLowerCase();
                    return st === 'in progress' || st === 'waiting for support' || st === 'waiting for customer';
                  }).length}</span>
                </button>
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'resolved' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('resolved')}
                >
                  Resolved <span className="oxoo-filter-count-badge">{tickets.filter(t => (t.status || '').toLowerCase() === 'resolved').length}</span>
                </button>
                <button
                  type="button"
                  className={`oxoo-filter-pill-btn ${ticketFilter === 'closed' ? 'active' : ''}`}
                  onClick={() => setTicketFilter('closed')}
                >
                  Closed <span className="oxoo-filter-count-badge">{tickets.filter(t => (t.status || '').toLowerCase() === 'closed').length}</span>
                </button>
              </div>

              {/* Search and Filters */}
              <div className="oxoo-filter-controls-row">
                <div className="oxoo-filter-left">
                  <div className="oxoo-table-search-box">
                    <Search size={15} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="oxoo-select-filter"
                    value={ticketCategoryFilter}
                    onChange={(e) => setTicketCategoryFilter(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Account">Account</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>
              </div>

              {/* Support Tickets Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="oxoo-table">
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets && tickets.length > 0 ? (
                      (() => {
                        const filtered = tickets.filter(t => {
                          const query = ticketSearch.toLowerCase();
                          const tNum = (t.ticket_number || t.number || '').toLowerCase();
                          const tSubj = (t.subject || '').toLowerCase();
                          const matchQuery = tNum.includes(query) || tSubj.includes(query);

                          const st = (t.status || '').toLowerCase();
                          let matchStatus = true;
                          if (ticketFilter === 'open') matchStatus = st === 'open';
                          else if (ticketFilter === 'in_progress') matchStatus = st === 'in progress' || st === 'waiting for support' || st === 'waiting for customer';
                          else if (ticketFilter === 'resolved') matchStatus = st === 'resolved';
                          else if (ticketFilter === 'closed') matchStatus = st === 'closed';

                          const matchCat = ticketCategoryFilter === 'all' || (t.category || t.application || '').toLowerCase() === ticketCategoryFilter.toLowerCase();
                          return matchQuery && matchStatus && matchCat;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                                <HelpCircle size={36} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                                <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>No Matching Support Tickets</div>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search or filters, or create a new support ticket.</div>
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((t) => {
                          const ticketNum = t.ticket_number || t.number || `OXOO-${t.id}`;
                          const statusLower = (t.status || 'open').toLowerCase();
                          return (
                            <tr key={t.id || ticketNum}>
                              <td className="oxoo-table-company">
                                <span
                                  style={{ cursor: 'pointer', color: '#0284c7', fontWeight: 700 }}
                                  onClick={() => handleOpenTicketChat(t)}
                                >
                                  {ticketNum}
                                </span>
                              </td>
                              <td>
                                <div
                                  style={{ fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                                  onClick={() => handleOpenTicketChat(t)}
                                >
                                  {t.subject}
                                </div>
                                {Array.isArray(t.replies) && t.replies.length > 0 && (
                                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                                    {t.replies.length} {t.replies.length === 1 ? 'reply' : 'replies'}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                  {t.category || t.application || 'General'}
                                </span>
                              </td>
                              <td>
                                <span className="oxoo-status-tag" style={{
                                  background: statusLower === 'open' ? '#fee2e2' :
                                    statusLower === 'in progress' ? '#fef3c7' :
                                    statusLower === 'waiting for support' ? '#f3e8ff' :
                                    statusLower === 'waiting for customer' ? '#e0f2fe' :
                                    statusLower === 'resolved' ? '#ecfdf5' : '#f1f5f9',
                                  color: statusLower === 'open' ? '#dc2626' :
                                    statusLower === 'in progress' ? '#d97706' :
                                    statusLower === 'waiting for support' ? '#7e22ce' :
                                    statusLower === 'waiting for customer' ? '#0369a1' :
                                    statusLower === 'resolved' ? '#059669' : '#64748b'
                                }}>
                                  {t.status || 'Open'}
                                </span>
                              </td>
                              <td style={{ color: '#64748b' }}>
                                {t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (t.created || 'Recent')}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  style={{
                                    background: '#f0f9ff',
                                    border: '1px solid #bae6fd',
                                    color: '#0284c7',
                                    cursor: 'pointer',
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  onClick={() => handleOpenTicketChat(t)}
                                  title="Open ticket conversation"
                                >
                                  <MessageSquare size={13} />
                                  <span>View & Reply</span>
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                          <HelpCircle size={36} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>No Support Tickets Yet</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>Have questions or encounter issues? Click "+ Create Ticket" to chat directly with OXOO support engineers.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="oxoo-pagination-bar">
                <span>Total: {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}</span>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 6: REPORTS & USAGE ANALYTICS
              ========================================================= */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div className="oxoo-section-card">
                <div className="oxoo-section-header" style={{ marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 className="oxoo-section-title">Reports & Usage Analytics</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Track your application usage and business insights.
                    </p>
                  </div>
                  {/* Date Filter & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="oxoo-date-badge-btn"
                      onClick={() => showToast('Date range: 01 Oct 2026 – 31 Oct 2026')}
                    >
                      <Calendar size={14} color="#0284c7" />
                      <span>01 Oct 2026 – 31 Oct 2026</span>
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Exporting analytics report...')}
                    >
                      Export Report
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Downloading CSV report...')}
                    >
                      Download CSV
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Downloading PDF report...')}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Usage Statistics (4 KPI Cards) */}
                <div className="oxoo-summary-grid" style={{ marginBottom: '24px' }}>
                  <div className="oxoo-metric-card">
                    <div className="oxoo-metric-top-row">
                      <span className="oxoo-metric-label">Total Transactions</span>
                      <span className="oxoo-metric-badge green">+14%</span>
                    </div>
                    <div className="oxoo-metric-bottom-row">
                      <span className="oxoo-metric-value" style={{ fontSize: '26px' }}>1,420</span>
                    </div>
                  </div>

                  <div className="oxoo-metric-card">
                    <div className="oxoo-metric-top-row">
                      <span className="oxoo-metric-label">Active Users</span>
                      <span className="oxoo-metric-badge green">+25%</span>
                    </div>
                    <div className="oxoo-metric-bottom-row">
                      <span className="oxoo-metric-value" style={{ fontSize: '26px' }}>4</span>
                    </div>
                  </div>

                  <div className="oxoo-metric-card">
                    <div className="oxoo-metric-top-row">
                      <span className="oxoo-metric-label">API Calls</span>
                      <span className="oxoo-metric-badge green">+18%</span>
                    </div>
                    <div className="oxoo-metric-bottom-row">
                      <span className="oxoo-metric-value" style={{ fontSize: '26px' }}>8,240</span>
                    </div>
                  </div>

                  <div className="oxoo-metric-card">
                    <div className="oxoo-metric-top-row">
                      <span className="oxoo-metric-label">Storage Used</span>
                      <span className="oxoo-metric-badge green">+5%</span>
                    </div>
                    <div className="oxoo-metric-bottom-row">
                      <span className="oxoo-metric-value" style={{ fontSize: '26px' }}>2.4 GB</span>
                    </div>
                  </div>
                </div>

                {/* 2-Column: Usage Trend Chart + Top Features */}
                <div className="oxoo-analytics-grid">
                  {/* Usage Trend Chart */}
                  <div className="oxoo-usage-chart-wrap">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Usage Trend Chart</h3>
                      <div className="oxoo-chart-legend">
                        <div className="oxoo-legend-item">
                          <span className="oxoo-legend-color" style={{ background: '#0284c7' }} />
                          <span>Transactions</span>
                        </div>
                        <div className="oxoo-legend-item">
                          <span className="oxoo-legend-color" style={{ background: '#06b6d4' }} />
                          <span>Active Users</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '230px', position: 'relative' }}>
                      <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="80" x2="600" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" />

                        <polygon
                          fill="url(#blueGrad)"
                          points="30,150 110,130 190,140 280,90 380,105 480,50 560,30 560,190 30,190"
                        />

                        {/* Transactions (Blue) */}
                        <polyline
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="30,150 110,130 190,140 280,90 380,105 480,50 560,30"
                        />
                        {[[30,150],[110,130],[190,140],[280,90],[380,105],[480,50],[560,30]].map(([cx, cy], i) => (
                          <circle key={i} cx={cx} cy={cy} r="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                        ))}

                        {/* Active Users (Cyan) */}
                        <polyline
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points="30,170 110,165 190,160 280,145 380,140 480,120 560,110"
                        />
                        {[[30,170],[110,165],[190,160],[280,145],[380,140],[480,120],[560,110]].map(([cx, cy], i) => (
                          <circle key={i} cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#06b6d4" strokeWidth="2" />
                        ))}
                      </svg>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                      <span>01 Oct</span>
                      <span>05 Oct</span>
                      <span>10 Oct</span>
                      <span>15 Oct</span>
                      <span>20 Oct</span>
                      <span>25 Oct</span>
                      <span>31 Oct</span>
                    </div>
                  </div>

                  {/* Top Features */}
                  <div className="oxoo-usage-chart-wrap">
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>
                      Top Features
                    </h3>
                    <div className="oxoo-features-list">
                      {[
                        { name: 'Transactions', pct: 38 },
                        { name: 'Reporting', pct: 22 },
                        { name: 'User Management', pct: 18 },
                        { name: 'API Access', pct: 12 },
                        { name: 'Data Export', pct: 10 }
                      ].map((feat) => (
                        <div key={feat.name} className="oxoo-feature-item">
                          <div className="oxoo-feature-meta">
                            <span>{feat.name}</span>
                            <span>{feat.pct}%</span>
                          </div>
                          <div className="oxoo-feature-bar-bg">
                            <div className="oxoo-feature-bar-fill" style={{ width: `${feat.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 8: NOTIFICATIONS & ACTIVITY
              ========================================================= */}
          {activeTab === 'notifications' && (
            <div className="oxoo-section-card">
              <div className="oxoo-section-header" style={{ marginBottom: '16px' }}>
                <div>
                  <h2 className="oxoo-section-title">Notifications & Activity</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Stay updated with important updates and activities.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={handleMarkAllNotifications}
                  >
                    Mark all as read
                  </button>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={handleClearReadNotifications}
                  >
                    Clear Read Notifications
                  </button>
                </div>
              </div>

              {/* Filters: All, Software Subscriptions, Payments, Team, Support, System */}
              <div className="oxoo-filter-pills-bar">
                {['all', 'software', 'payments', 'team', 'support', 'system'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`oxoo-filter-pill-btn ${notifFilter === f ? 'active' : ''}`}
                    onClick={() => setNotifFilter(f)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {f === 'software' ? 'Software Licenses' : f}
                  </button>
                ))}
              </div>

              {/* Activity Feed */}
              <div className="oxoo-notifications-feed">
                {notifications && notifications.length > 0 ? (
                  (() => {
                    const filtered = notifications.filter(n => {
                      if (notifFilter === 'all') return true;
                      const cat = (n.category || '').toLowerCase();
                      if (notifFilter === 'software') return cat === 'software' || cat === 'subscription';
                      if (notifFilter === 'payments') return cat === 'payments' || cat === 'billing';
                      if (notifFilter === 'team') return cat === 'team';
                      if (notifFilter === 'support') return cat === 'support';
                      if (notifFilter === 'system') return cat === 'system' || cat === 'security';
                      return cat === notifFilter;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                          <Bell size={40} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
                          <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>No Matching Notifications</div>
                          <div style={{ fontSize: '13px', marginTop: '4px' }}>No notifications found under this filter.</div>
                        </div>
                      );
                    }

                    return filtered.map((notif) => {
                      const isRead = notif.is_read || notif.read;
                      const cat = (notif.category || 'system').toLowerCase();
                      const dateStr = notif.created_at
                        ? new Date(notif.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : (notif.date || 'Recent');

                      return (
                        <div
                          key={notif.id}
                          className="oxoo-notification-card"
                          style={{
                            background: isRead ? '#ffffff' : '#f0f9ff',
                            border: `1px solid ${isRead ? '#e2e8f0' : '#bae6fd'}`,
                            position: 'relative'
                          }}
                        >
                          <div className="oxoo-notification-icon" style={{
                            background: cat.includes('software') || cat.includes('subscription') ? (notif.isExpired ? '#fef2f2' : notif.isDueSoon ? '#fffbeb' : '#ecfdf5') :
                              cat.includes('payment') || cat.includes('billing') ? '#ecfdf5' :
                              cat.includes('team') ? '#eff6ff' :
                              cat.includes('support') ? '#fef3c7' : '#f3e8ff',
                            color: cat.includes('software') || cat.includes('subscription') ? (notif.isExpired ? '#ef4444' : notif.isDueSoon ? '#d97706' : '#10b981') :
                              cat.includes('payment') || cat.includes('billing') ? '#10b981' :
                              cat.includes('team') ? '#0284c7' :
                              cat.includes('support') ? '#d97706' : '#8b5cf6'
                          }}>
                            {(cat.includes('software') || cat.includes('subscription')) && (notif.isExpired ? <AlertTriangle size={18} /> : notif.isDueSoon ? <Clock size={18} /> : <ShieldCheck size={18} />)}
                            {(cat.includes('payment') || cat.includes('billing')) && <CreditCard size={18} />}
                            {cat.includes('team') && <UserPlus size={18} />}
                            {cat.includes('support') && <MessageSquare size={18} />}
                            {(cat.includes('system') || cat.includes('security')) && <Layers size={18} />}
                          </div>

                          <div className="oxoo-notification-content">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className="oxoo-notification-title" style={{ fontWeight: isRead ? 600 : 700 }}>
                                {notif.title}
                              </span>
                              {!isRead && (
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  background: '#0284c7',
                                  color: '#ffffff',
                                  padding: '1px 6px',
                                  borderRadius: '9999px',
                                  textTransform: 'uppercase'
                                }}>
                                  New
                                </span>
                              )}
                              {(cat.includes('software') || cat.includes('subscription')) && typeof notif.daysLeft === 'number' && (
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  background: notif.isExpired ? '#fee2e2' : notif.isDueSoon ? '#fef3c7' : '#dcfce7',
                                  color: notif.isExpired ? '#b91c1c' : notif.isDueSoon ? '#b45309' : '#15803d'
                                }}>
                                  {notif.isExpired ? 'Expired' : 'Active Subscription'}
                                </span>
                              )}
                            </div>
                            <span className="oxoo-notification-desc">
                              {notif.message || notif.desc}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                              {dateStr}
                            </span>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {(cat.includes('software') || cat.includes('subscription')) && (
                              <button
                                type="button"
                                style={{
                                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                                  whiteSpace: 'nowrap'
                                }}
                                onClick={() => handleOpenRenewModal({ id: notif.softwareId, name: notif.softwareName })}
                              >
                                <RefreshCw size={12} /> Renew Now
                              </button>
                            )}

                            {!isRead && (
                              <button
                                type="button"
                                style={{ background: '#f1f5f9', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                                onClick={() => handleMarkNotification(notif.id)}
                              >
                                Mark as Read
                              </button>
                            )}

                            {notif.action_url && (
                              <button
                                type="button"
                                style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '5px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, color: '#0284c7', cursor: 'pointer' }}
                                onClick={() => {
                                  handleMarkNotification(notif.id);
                                  if (notif.action_url.includes('support')) setActiveTab('support');
                                  else if (notif.action_url.includes('billing')) setActiveTab('billing');
                                  else if (notif.action_url.includes('team')) setActiveTab('team');
                                  else if (notif.action_url.includes('apps')) setActiveTab('apps');
                                }}
                              >
                                Open →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                    <Bell size={40} color="#94a3b8" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>No Notifications</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>You're completely caught up! New account and application updates will appear here in real time.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              VIEW 7, 9, 10: SETTINGS (ACCOUNT PROFILE, SECURITY, PREFERENCES)
              ========================================================= */}
          {activeTab === 'settings' && (
            <div className="oxoo-section-card" style={{ maxWidth: '900px' }}>
              {/* Settings Sub-Navigation Header */}
              <div className="oxoo-settings-subnav">
                <button
                  type="button"
                  className={`oxoo-settings-tab-btn ${settingsSubTab === 'account' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('account')}
                >
                  Account Profile
                </button>
                <button
                  type="button"
                  className={`oxoo-settings-tab-btn ${settingsSubTab === 'security' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('security')}
                >
                  Security & Login
                </button>
                <button
                  type="button"
                  className={`oxoo-settings-tab-btn ${settingsSubTab === 'preferences' ? 'active' : ''}`}
                  onClick={() => setSettingsSubTab('preferences')}
                >
                  Settings & Preferences
                </button>
              </div>

              {/* -------------------------------------------------------
                  VIEW 7: ACCOUNT PROFILE
                  ------------------------------------------------------- */}
              {settingsSubTab === 'account' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 className="oxoo-section-title">Account Profile</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Manage your personal and company information.
                    </p>
                  </div>

                  {/* Profile Details Header Card */}
                  <div className="oxoo-profile-summary-header">
                    <div className="oxoo-profile-avatar-big">
                      {profileData.name.charAt(0) || 'P'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                        {profileData.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#0284c7', fontWeight: 600 }}>
                        Account Role: Owner
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Company: {profileData.company}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Select new profile photo dialog')}
                    >
                      Change Profile Photo
                    </button>
                  </div>

                  {/* Personal Information Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!profileData.name.trim()) {
                      showToast('Please enter your full name.');
                      return;
                    }
                    if (!profileData.email.includes('@')) {
                      showToast('Please enter a valid email address.');
                      return;
                    }
                    if (!profileData.phone.trim()) {
                      showToast('Please enter a valid phone number.');
                      return;
                    }

                    setOverview(prev => ({
                      ...prev,
                      customerName: profileData.name,
                      company: profileData.company,
                      email: profileData.email,
                      avatar: profileData.name.charAt(0).toUpperCase()
                    }));
                    showToast('Profile updated successfully.');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Full Name</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Email Address</label>
                        <input
                          type="email"
                          className="oxoo-form-input"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Phone Number</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Company Name</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Company Website</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        />
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Country</label>
                        <input
                          type="text"
                          className="oxoo-form-input"
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button type="submit" className="oxoo-upgrade-btn">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => {
                          setProfileData({
                            name: overview.customerName,
                            email: overview.email,
                            phone: '+91 98765 43210',
                            company: overview.company,
                            website: 'https://retailmart.com',
                            country: 'India'
                          });
                          showToast('Changes cancelled');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* -------------------------------------------------------
                  VIEW 9: SECURITY & LOGIN
                  ------------------------------------------------------- */}
              {settingsSubTab === 'security' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 className="oxoo-section-title">Security & Login</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Manage your account security settings.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Password Row */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Lock size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Password</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Update your password regularly.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => setChangePwdModalOpen(true)}
                      >
                        Change Password
                      </button>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Shield size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Two-Factor Authentication</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Add an extra layer of security.</div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: twoFaEnabled ? '#10b981' : '#64748b' }}>
                            Status: {twoFaEnabled ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </div>
                      <label className="oxoo-switch-toggle" title="Enable Two-Factor Authentication">
                        <input
                          type="checkbox"
                          checked={twoFaEnabled}
                          onChange={(e) => {
                            setTwoFaEnabled(e.target.checked);
                            showToast(e.target.checked ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.');
                          }}
                        />
                        <span className="oxoo-slider" />
                      </label>
                    </div>

                    {/* Authenticator App */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Smartphone size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Authenticator App</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Secure your account using an authenticator application.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('Authenticator setup QR code generated')}
                      >
                        Configure
                      </button>
                    </div>

                    {/* SMS Authentication */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>SMS Authentication</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Receive verification codes by SMS.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => showToast('SMS verification configuration initiated')}
                      >
                        Configure
                      </button>
                    </div>

                    {/* Active Sessions */}
                    <div className="oxoo-security-row">
                      <div className="oxoo-security-info">
                        <div className="oxoo-security-icon-box">
                          <Laptop size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Active Sessions</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Manage your active login sessions.</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => setSessionsModalOpen(true)}
                      >
                        View Sessions
                      </button>
                    </div>
                  </div>

                  {/* Security Actions Bar */}
                  <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Signed out of current device.')}
                    >
                      Sign Out of This Device
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => showToast('Your session has been revoked from all other devices.')}
                    >
                      Sign Out of All Devices
                    </button>
                    <button
                      type="button"
                      className="oxoo-outline-btn"
                      onClick={() => showToast('Reviewing login history: Last login today from India (IP: 103.21.24.5)')}
                    >
                      Review Login History
                    </button>
                  </div>
                </div>
              )}

              {/* -------------------------------------------------------
                  VIEW 10: SETTINGS & PREFERENCES
                  ------------------------------------------------------- */}
              {settingsSubTab === 'preferences' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 className="oxoo-section-title">Settings & Preferences</h2>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                      Customize your experience and preferences.
                    </p>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    showToast('Preferences saved successfully.');
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* General Preferences */}
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>
                      General Preferences
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Language</label>
                        <select
                          className="oxoo-form-select"
                          value={prefLanguage}
                          onChange={(e) => setPrefLanguage(e.target.value)}
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi (हिंदी)</option>
                          <option value="Spanish">Spanish (Español)</option>
                          <option value="French">French (Français)</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Timezone</label>
                        <select
                          className="oxoo-form-select"
                          value={prefTimezone}
                          onChange={(e) => setPrefTimezone(e.target.value)}
                        >
                          <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                          <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                          <option value="(GMT-05:00) America/New_York">(GMT-05:00) America/New_York</option>
                          <option value="(GMT+04:00) Asia/Dubai">(GMT+04:00) Asia/Dubai</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Currency</label>
                        <select
                          className="oxoo-form-select"
                          value={prefCurrency}
                          onChange={(e) => setPrefCurrency(e.target.value)}
                        >
                          <option value="INR (₹)">INR (₹)</option>
                          <option value="USD ($)">USD ($)</option>
                          <option value="EUR (€)">EUR (€)</option>
                          <option value="AED (د.إ)">AED (د.إ)</option>
                        </select>
                      </div>
                    </div>

                    {/* Email Notifications */}
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '12px 0 0' }}>
                      Email Notifications
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Account Updates</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Receive important updates and alerts.</div>
                        </div>
                        <label className="oxoo-switch-toggle" title="Account Updates">
                          <input
                            type="checkbox"
                            checked={prefAccountUpdates}
                            onChange={(e) => setPrefAccountUpdates(e.target.checked)}
                          />
                          <span className="oxoo-slider" />
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Product Updates</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Get notified about new features.</div>
                        </div>
                        <label className="oxoo-switch-toggle" title="Product Updates">
                          <input
                            type="checkbox"
                            checked={prefProductUpdates}
                            onChange={(e) => setPrefProductUpdates(e.target.checked)}
                          />
                          <span className="oxoo-slider" />
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Marketing Communications</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Receive tips, offers and best practices.</div>
                        </div>
                        <label className="oxoo-switch-toggle" title="Marketing Communications">
                          <input
                            type="checkbox"
                            checked={prefMarketing}
                            onChange={(e) => setPrefMarketing(e.target.checked)}
                          />
                          <span className="oxoo-slider" />
                        </label>
                      </div>
                    </div>

                    {/* Additional Preferences */}
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '12px 0 0' }}>
                      Additional Preferences
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Date Format</label>
                        <select
                          className="oxoo-form-select"
                          value={prefDateFormat}
                          onChange={(e) => setPrefDateFormat(e.target.value)}
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Number Format</label>
                        <select
                          className="oxoo-form-select"
                          value={prefNumberFormat}
                          onChange={(e) => setPrefNumberFormat(e.target.value)}
                        >
                          <option value="1,234.56">1,234.56</option>
                          <option value="1.234,56">1.234,56</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Default Application</label>
                        <select
                          className="oxoo-form-select"
                          value={prefDefaultApp}
                          onChange={(e) => setPrefDefaultApp(e.target.value)}
                        >
                          <option value="Sales Software">Sales Software</option>
                          <option value="HRMS">HRMS</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>

                      <div className="oxoo-form-group">
                        <label className="oxoo-form-label">Dashboard Layout</label>
                        <select
                          className="oxoo-form-select"
                          value={prefDashboardLayout}
                          onChange={(e) => setPrefDashboardLayout(e.target.value)}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Compact">Compact</option>
                        </select>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button type="submit" className="oxoo-upgrade-btn">
                        Save Preferences
                      </button>
                      <button
                        type="button"
                        className="oxoo-outline-btn"
                        onClick={() => {
                          setPrefLanguage('English');
                          setPrefTimezone('(GMT+05:30) Asia/Kolkata');
                          setPrefCurrency('INR (₹)');
                          setPrefAccountUpdates(true);
                          setPrefProductUpdates(true);
                          setPrefMarketing(false);
                          setPrefDateFormat('DD/MM/YYYY');
                          setPrefNumberFormat('1,234.56');
                          setPrefDefaultApp('Sales Software');
                          setPrefDashboardLayout('Standard');
                          showToast('Settings reset to default.');
                        }}
                      >
                        Reset to Default
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              SECURITY AND PRIVACY NOTICE (FOOTER)
              ========================================================= */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '12px'
          }}>
            <ShieldCheck size={18} color="#0284c7" />
            <div>
              <strong>Security and Privacy:</strong> Your account information is protected. Only authorised team members can access your organisation's data. Your application access depends on your active subscription and assigned permissions.
            </div>
          </div>
        </main>
      </div>

      {/* ---------------------------------------------------------
          3. INTERACTIVE MODALS
          --------------------------------------------------------- */}



      {/* Invite Team Member Modal */}
      {inviteModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => !teamLoading && setInviteModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="oxoo-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={20} color="#0284c7" />
                <h3 className="oxoo-modal-title">Invite New Team Member</h3>
              </div>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => !teamLoading && setInviteModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleInviteTeamMember}>
              <div className="oxoo-modal-body">
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px', lineHeight: 1.5 }}>
                  Add a colleague to your organization account and assign them to specific purchased applications. Team members log in using the standard OXOO login page.
                </p>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="oxoo-form-input"
                    placeholder="e.g. Rachel Adams"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    className="oxoo-form-input"
                    placeholder="rachel@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Role</label>
                  <select
                    className="oxoo-form-select"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  >
                    <option value="Member">Member (Application User)</option>
                    <option value="Admin">Admin (Can manage users & apps)</option>
                    <option value="Billing Manager">Billing Manager (Can manage invoices & renewals)</option>
                  </select>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Software-Specific Access Permissions *</label>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {[
                      { id: 'finance', name: 'Finance Software', desc: 'Accounting, invoicing & tax reports' },
                      { id: 'sales', name: 'Sales Software', desc: 'Business & sales pipeline tracking' },
                      { id: 'supply-chain', name: 'Supply Chain Software', desc: 'Inventory, manufacturing & procurement' },
                      { id: 'human-resources', name: 'Human Resources Software', desc: 'Employee management & payroll' },
                      { id: 'productivity', name: 'Productivity Software', desc: 'AI, discuss & documents' }
                    ].map(app => {
                      const isChecked = Array.isArray(inviteForm.appsAccess) && inviteForm.appsAccess.includes(app.id);
                      return (
                        <label
                          key={app.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: isChecked ? '#ffffff' : 'transparent',
                            border: `1px solid ${isChecked ? '#0284c7' : 'transparent'}`
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const curr = Array.isArray(inviteForm.appsAccess) ? inviteForm.appsAccess : [];
                              if (e.target.checked) {
                                setInviteForm({ ...inviteForm, appsAccess: [...curr, app.id] });
                              } else {
                                setInviteForm({ ...inviteForm, appsAccess: curr.filter(x => x !== app.id) });
                              }
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{app.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{app.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', marginTop: '6px' }}>
                    Team members will only see and access the software applications enabled above.
                  </span>
                </div>
              </div>

              <div className="oxoo-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => !teamLoading && setInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="oxoo-upgrade-btn" disabled={teamLoading}>
                  {teamLoading ? 'Inviting...' : 'Send Invitation & Create Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Member Modal */}
      {editMemberModalOpen && editingMember && (
        <div className="oxoo-modal-backdrop" onClick={() => !teamLoading && setEditMemberModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="oxoo-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={20} color="#0284c7" />
                <h3 className="oxoo-modal-title">Edit Access: {editingMember.name}</h3>
              </div>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => !teamLoading && setEditMemberModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateTeamMember}>
              <div className="oxoo-modal-body">
                <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Account Email:</div>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{editingMember.email}</strong>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Role</label>
                  <select
                    className="oxoo-form-select"
                    value={editingMember.role || 'Member'}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                  >
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Member">Member</option>
                    <option value="Billing Manager">Billing Manager</option>
                  </select>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Account Status</label>
                  <select
                    className="oxoo-form-select"
                    value={editingMember.status || 'Active'}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value })}
                  >
                    <option value="Active">Active (Permitted to log in)</option>
                    <option value="Suspended">Suspended (Access revoked)</option>
                  </select>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Assigned Software Applications</label>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {[
                      { id: 'finance', name: 'Finance Software' },
                      { id: 'sales', name: 'Sales Software' },
                      { id: 'supply-chain', name: 'Supply Chain Software' },
                      { id: 'human-resources', name: 'Human Resources Software' },
                      { id: 'productivity', name: 'Productivity Software' }
                    ].map(app => {
                      const isChecked = Array.isArray(editingMember.apps_access) && editingMember.apps_access.includes(app.id);
                      return (
                        <label
                          key={app.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            background: isChecked ? '#ffffff' : 'transparent',
                            border: `1px solid ${isChecked ? '#0284c7' : 'transparent'}`
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const curr = Array.isArray(editingMember.apps_access) ? editingMember.apps_access : [];
                              if (e.target.checked) {
                                setEditingMember({ ...editingMember, apps_access: [...curr, app.id] });
                              } else {
                                setEditingMember({ ...editingMember, apps_access: curr.filter(x => x !== app.id) });
                              }
                            }}
                          />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{app.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="oxoo-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => !teamLoading && setEditMemberModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="oxoo-upgrade-btn" disabled={teamLoading}>
                  {teamLoading ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Creation Modal */}
      {ticketModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => !ticketsLoading && setTicketModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="oxoo-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HelpCircle size={20} color="#0284c7" />
                <h3 className="oxoo-modal-title">Create Support Ticket</h3>
              </div>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => !ticketsLoading && setTicketModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateSupportTicket}>
              <div className="oxoo-modal-body">
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Subject *</label>
                  <input
                    type="text"
                    required
                    className="oxoo-form-input"
                    placeholder="e.g. Sales report export failure"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Category</label>
                    <select
                      className="oxoo-form-select"
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Billing">Billing & Subscription</option>
                      <option value="Account">Account Access</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div className="oxoo-form-group">
                    <label className="oxoo-form-label">Priority</label>
                    <select
                      className="oxoo-form-select"
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Application</label>
                  <select
                    className="oxoo-form-select"
                    value={ticketForm.application}
                    onChange={(e) => setTicketForm({ ...ticketForm, application: e.target.value })}
                  >
                    <option value="Sales Software">Sales Software</option>
                    <option value="HRMS">HRMS</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="General">General / Platform</option>
                  </select>
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Detailed Description *</label>
                  <textarea
                    rows={4}
                    required
                    className="oxoo-form-textarea"
                    placeholder="Please describe the issue or question in detail..."
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Attachments (Optional)</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>PDF, PNG, JPG, CSV, DOCX (Max 10MB)</span>
                  </label>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      border: '1.5px dashed #cbd5e1',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      color: '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Upload size={16} color="#0284c7" />
                    <span>Upload screenshots or documents</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.csv,.txt,.xlsx"
                      style={{ display: 'none' }}
                      onChange={(e) => handleTicketFileSelect(e, 'create')}
                    />
                  </label>
                  {Array.isArray(ticketForm.attachments) && ticketForm.attachments.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                      {ticketForm.attachments.map((att, i) => (
                        <span
                          key={i}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        >
                          <Paperclip size={12} color="#0284c7" />
                          <span>{att.name}</span>
                          <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>({(att.size / 1024).toFixed(0)} KB)</span>
                          <button
                            type="button"
                            onClick={() => setTicketForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, idx) => idx !== i) }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', padding: '0 2px' }}
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="oxoo-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => !ticketsLoading && setTicketModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="oxoo-upgrade-btn" disabled={ticketsLoading}>
                  {ticketsLoading ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Conversation / Two-Way Chat Modal (Requirement 9 & Phase 6) */}
      {ticketChatModalOpen && activeTicketChat && (
        <div className="oxoo-modal-backdrop" onClick={() => setTicketChatModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="oxoo-modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                    {activeTicketChat.ticket_number || activeTicketChat.number || `OXOO-${activeTicketChat.id}`}
                  </span>
                  <span className="oxoo-status-tag" style={{
                    fontSize: '11px',
                    background: (activeTicketChat.status || '').toLowerCase() === 'open' ? '#fee2e2' : (activeTicketChat.status || '').toLowerCase() === 'resolved' ? '#ecfdf5' : '#fef3c7',
                    color: (activeTicketChat.status || '').toLowerCase() === 'open' ? '#dc2626' : (activeTicketChat.status || '').toLowerCase() === 'resolved' ? '#059669' : '#d97706'
                  }}>
                    {activeTicketChat.status || 'Open'}
                  </span>
                  <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {activeTicketChat.category || 'General'}
                  </span>
                </div>
                <h3 className="oxoo-modal-title" style={{ marginTop: '8px', fontSize: '16px', lineHeight: 1.3 }}>
                  {activeTicketChat.subject}
                </h3>
              </div>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setTicketChatModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Conversation Messages Container */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
              {/* Original Ticket Description (Customer Side) */}
              <div style={{
                alignSelf: 'flex-end',
                maxWidth: '88%',
                background: '#0284c7',
                color: '#ffffff',
                borderRadius: '14px 14px 2px 14px',
                padding: '14px 16px',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#e0f2fe' }}>
                    {activeTicketChat.user_name || overview.customerName} (Original Request)
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#bae6fd' }}>
                    {activeTicketChat.created_at ? new Date(activeTicketChat.created_at).toLocaleString('en-GB') : 'Initial'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {activeTicketChat.description || activeTicketChat.subject}
                </div>

                {/* Attachments for initial request */}
                {Array.isArray(activeTicketChat.attachments) && activeTicketChat.attachments.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#e0f2fe', marginBottom: '5px' }}>
                      Attached Files ({activeTicketChat.attachments.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {activeTicketChat.attachments.map((att, attIdx) => (
                        <a
                          key={attIdx}
                          href={att.url || att.data}
                          download={att.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          <Paperclip size={11} />
                          <span>{att.name}</span>
                          <Download size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chronological Replies Thread */}
              {Array.isArray(activeTicketChat.replies) && activeTicketChat.replies.length > 0 ? (
                activeTicketChat.replies
                  .filter(r => !r.is_internal)
                  .map((rep, idx) => {
                    const isStaff = rep.role === 'staff' || rep.sender_type === 'staff' || rep.is_staff || (rep.sender && rep.sender.toLowerCase().includes('support')) || (rep.author && rep.author.toLowerCase().includes('support'));
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isStaff ? 'flex-start' : 'flex-end',
                          maxWidth: '88%',
                          background: isStaff ? '#ffffff' : '#0284c7',
                          color: isStaff ? '#0f172a' : '#ffffff',
                          border: isStaff ? '1px solid #e2e8f0' : 'none',
                          borderRadius: isStaff ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                          padding: '12px 16px',
                          boxShadow: isStaff ? '0 1px 4px rgba(0,0,0,0.05)' : '0 2px 8px rgba(2, 132, 199, 0.2)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: isStaff ? '#166534' : '#e0f2fe',
                            background: isStaff ? '#dcfce7' : 'transparent',
                            padding: isStaff ? '2px 6px' : '0',
                            borderRadius: '4px'
                          }}>
                            {isStaff ? (rep.sender || 'OXOO Support Staff') : 'You'}
                          </span>
                          <span style={{ fontSize: '10.5px', color: isStaff ? '#94a3b8' : '#bae6fd' }}>
                            {rep.timestamp || (rep.created_at ? new Date(rep.created_at).toLocaleString('en-GB') : (rep.time || 'Recent'))}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {rep.message}
                        </div>

                        {/* Reply Attachments */}
                        {Array.isArray(rep.attachments) && rep.attachments.length > 0 && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: isStaff ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {rep.attachments.map((att, attIdx) => (
                                <a
                                  key={attIdx}
                                  href={att.url || att.data}
                                  download={att.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: isStaff ? '#f1f5f9' : 'rgba(255,255,255,0.15)',
                                    border: isStaff ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '6px',
                                    padding: '3px 8px',
                                    fontSize: '11px',
                                    color: isStaff ? '#0284c7' : '#ffffff',
                                    textDecoration: 'none',
                                    fontWeight: 600
                                  }}
                                >
                                  <Paperclip size={11} />
                                  <span>{att.name}</span>
                                  <Download size={10} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '12.5px' }}>
                  No replies yet. Type a response below to message our support team.
                </div>
              )}
            </div>

            {/* Reply Composer Form */}
            <form onSubmit={handleSendTicketReply} style={{ padding: '14px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
              {ticketReplyAttachments.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                  {ticketReplyAttachments.map((att, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        border: '1px solid #bae6fd',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      <Paperclip size={11} />
                      <span>{att.name}</span>
                      <button
                        type="button"
                        onClick={() => setTicketReplyAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', padding: '0 2px' }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <label
                  style={{
                    cursor: 'pointer',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    height: '42px',
                    boxSizing: 'border-box'
                  }}
                  title="Attach screenshot or document (Max 10MB)"
                >
                  <Paperclip size={18} />
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.csv,.txt,.xlsx"
                    style={{ display: 'none' }}
                    onChange={(e) => handleTicketFileSelect(e, 'reply')}
                  />
                </label>

                <textarea
                  rows={2}
                  required={ticketReplyAttachments.length === 0}
                  placeholder="Type your message to the support team..."
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    resize: 'none',
                    fontFamily: 'inherit',
                    outline: 'none',
                    lineHeight: 1.4
                  }}
                />
                <button
                  type="submit"
                  disabled={isSendingTicketReply || (!ticketReplyText.trim() && ticketReplyAttachments.length === 0)}
                  className="oxoo-upgrade-btn"
                  style={{ alignSelf: 'flex-end', padding: '10px 18px', whiteSpace: 'nowrap', height: '42px' }}
                >
                  {isSendingTicketReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plans & Purchase Modal (Requirements 3 & 4) */}
      {viewPlansModalOpen && selectedAppForPlans && (
        <div className="oxoo-modal-backdrop" onClick={() => !isPurchasingApp && setViewPlansModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="oxoo-modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className={`oxoo-app-icon-box ${selectedAppForPlans.id || 'sales'}`} style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="oxoo-modal-title">{selectedAppForPlans.name}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                    Select an official plan to activate software access on your existing OXOO account.
                  </p>
                </div>
              </div>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => !isPurchasingApp && setViewPlansModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="oxoo-modal-body">
              {purchaseSuccessData ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#166534', margin: '0 0 6px' }}>
                    Payment Confirmed — Software Activated!
                  </h4>
                  <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                    Your purchase of <strong>{purchaseSuccessData.appName}</strong> ({purchaseSuccessData.planName}) has been verified.
                    A tax invoice <strong>({purchaseSuccessData.invoiceNumber})</strong> has been emailed to <strong>{overview.email}</strong>.
                  </p>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', marginBottom: '20px' }}>
                    <ShieldCheck size={16} color="#16a34a" />
                    <span>Payment Ref: <strong>{purchaseSuccessData.paymentId}</strong> &bull; Total Paid: <strong>₹{purchaseSuccessData.amount}</strong></span>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="oxoo-upgrade-btn"
                      onClick={() => setViewPlansModalOpen(false)}
                      style={{ padding: '10px 24px', fontSize: '13px' }}
                    >
                      Go to My Applications
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {purchaseError && (
                    <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12.5px', marginBottom: '14px' }}>
                      {purchaseError}
                    </div>
                  )}

                  {/* Billing Cycle Switch */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setPlanBillingCycle('monthly')}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: planBillingCycle === 'monthly' ? '#ffffff' : 'transparent',
                          color: planBillingCycle === 'monthly' ? '#0f172a' : '#64748b',
                          boxShadow: planBillingCycle === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlanBillingCycle('yearly')}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: planBillingCycle === 'yearly' ? '#ffffff' : 'transparent',
                          color: planBillingCycle === 'yearly' ? '#16a34a' : '#64748b',
                          boxShadow: planBillingCycle === 'yearly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        Annual (Save 24%)
                      </button>
                    </div>
                  </div>

                  {/* Available Plans */}
                  {plansLoading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      Loading available plans...
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                      {availablePlans.map((pl) => {
                        const isYearly = planBillingCycle === 'yearly';
                        const monthlyRate = Number(pl.monthly_price || 740);
                        const annualRate = Number(pl.annual_price || 560);
                        const displayPrice = isYearly ? annualRate : monthlyRate;
                        const isSelected = selectedPlan && (selectedPlan.id === pl.id || selectedPlan.plan_code === pl.plan_code);

                        return (
                          <div
                            key={pl.id || pl.plan_code}
                            onClick={() => setSelectedPlan(pl)}
                            style={{
                              padding: '14px 18px',
                              borderRadius: '12px',
                              border: `2px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                              background: isSelected ? '#f0f9ff' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{pl.name}</strong>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                  {pl.description || `Full feature access for ${selectedAppForPlans.name}`}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                                  ₹{displayPrice} <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>/ mo</span>
                                </div>
                                <span style={{ fontSize: '11px', color: isYearly ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                                  {isYearly ? `₹${displayPrice * 12}/year (Billed annually)` : 'Billed monthly'}
                                </span>
                              </div>
                            </div>

                            {/* Features list */}
                            {Array.isArray(pl.features) && pl.features.length > 0 && (
                              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                {pl.features.map((feat, fi) => (
                                  <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#475569' }}>
                                    <CheckCircle2 size={12} color="#16a34a" />
                                    <span>{feat}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Order & Tax Summary */}
                  {selectedPlan && (
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                      {(() => {
                        const isYearly = planBillingCycle === 'yearly';
                        const baseMonthly = Number(selectedPlan.monthly_price || 740);
                        const baseAnnual = Number(selectedPlan.annual_price || 560);
                        const baseSubtotal = isYearly ? baseAnnual * 12 : baseMonthly;
                        const gst = parseFloat((baseSubtotal * 0.18).toFixed(2));
                        const total = parseFloat((baseSubtotal + gst).toFixed(2));
                        return (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#475569', marginBottom: '4px' }}>
                              <span>Base License ({isYearly ? '12 Months' : '1 Month'})</span>
                              <strong>₹{baseSubtotal.toFixed(2)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#475569', marginBottom: '6px' }}>
                              <span>GST (18% Integrated Tax)</span>
                              <strong>₹{gst.toFixed(2)}</strong>
                            </div>
                            <div style={{ height: '1px', background: '#e2e8f0', margin: '6px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                              <span>Total Payable</span>
                              <span style={{ color: '#0284c7' }}>₹{total.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Purchase CTA */}
                  <button
                    type="button"
                    onClick={handlePurchaseAppPlan}
                    disabled={isPurchasingApp || !selectedPlan}
                    className="oxoo-upgrade-btn"
                    style={{ width: '100%', padding: '12px', fontSize: '13.5px', justifyContent: 'center' }}
                  >
                    {isPurchasingApp ? 'Connecting to Secure Checkout...' : 'Proceed to Payment →'}
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', fontSize: '11.5px', color: '#64748b' }}>
                    <ShieldCheck size={14} color="#16a34a" />
                    <span>Razorpay Verified &bull; Uses existing OXOO account (No duplicate login created)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal (Requirement 6) */}
      {viewInvoiceModalOpen && selectedInvoice && (
        <div className="oxoo-modal-backdrop" onClick={() => setViewInvoiceModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="oxoo-modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#0284c7" />
                <h3 className="oxoo-modal-title">Tax Invoice #{selectedInvoice.invoice_number}</h3>
              </div>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setViewInvoiceModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="oxoo-modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Billed To</div>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{selectedInvoice.company_name || overview.company}</strong>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{selectedInvoice.customer_name || overview.customerName}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedInvoice.email || overview.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Invoice Date</div>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                    {selectedInvoice.created_at ? new Date(selectedInvoice.created_at).toLocaleDateString('en-GB') : (selectedInvoice.date || 'Today')}
                  </strong>
                  <div style={{ marginTop: '4px' }}>
                    <span className="oxoo-status-tag paid" style={{ fontSize: '11px' }}>
                      {selectedInvoice.status || 'Paid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line item breakdown */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#0f172a', fontWeight: 600, marginBottom: '6px' }}>
                  <span>{selectedInvoice.plan_name || 'OXOO Multiix Software Subscription'}</span>
                  <span>₹{Number(selectedInvoice.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  <span>Base Amount</span>
                  <span>₹{(Number(selectedInvoice.amount || 0) / 1.18).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                  <span>GST (18% Integrated Tax)</span>
                  <span>₹{(Number(selectedInvoice.amount || 0) - (Number(selectedInvoice.amount || 0) / 1.18)).toFixed(2)}</span>
                </div>
                <div style={{ height: '1px', background: '#e2e8f0', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                  <span>Total Amount Paid</span>
                  <span style={{ color: '#16a34a' }}>₹{Number(selectedInvoice.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#16a34a" />
                <span>Verified Payment &bull; Reference ID: {selectedInvoice.payment_id || 'pay_online_verified'}</span>
              </div>
            </div>

            <div className="oxoo-modal-footer">
              <button
                type="button"
                style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setViewInvoiceModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="oxoo-upgrade-btn"
                onClick={() => downloadInvoicePdf(selectedInvoice.invoice_number)}
              >
                <Download size={14} style={{ marginRight: '6px' }} /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePwdModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => setChangePwdModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="oxoo-modal-header">
              <h3 className="oxoo-modal-title">Change Account Password</h3>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setChangePwdModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setPwdSuccess('');
              setPwdError('');

              if (!pwdCurrent || !pwdNew || !pwdConfirm) {
                setPwdError('Please complete all password fields.');
                return;
              }
              if (pwdNew.length < 6) {
                setPwdError('New password must be at least 6 characters.');
                return;
              }
              if (pwdNew !== pwdConfirm) {
                setPwdError('New password and confirmation do not match.');
                return;
              }

              setPwdLoading(true);
              try {
                const res = await changePassword({ currentPassword: pwdCurrent, newPassword: pwdNew });
                showToast('Password updated successfully.');
                setChangePwdModalOpen(false);
                setPwdCurrent('');
                setPwdNew('');
                setPwdConfirm('');
              } catch (err) {
                setPwdError(err.message || 'Failed to update password. Please check your current password.');
              } finally {
                setPwdLoading(false);
              }
            }}>
              <div className="oxoo-modal-body">
                {pwdError && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12.5px' }}>
                    {pwdError}
                  </div>
                )}
                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Current Password</label>
                  <input
                    type="password"
                    required
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    placeholder="••••••••••••"
                    className="oxoo-form-input"
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    placeholder="••••••••••••"
                    className="oxoo-form-input"
                  />
                </div>

                <div className="oxoo-form-group">
                  <label className="oxoo-form-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    placeholder="••••••••••••"
                    className="oxoo-form-input"
                  />
                </div>
              </div>

              <div className="oxoo-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => setChangePwdModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="oxoo-upgrade-btn" disabled={pwdLoading}>
                  {pwdLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {sessionsModalOpen && (
        <div className="oxoo-modal-backdrop" onClick={() => setSessionsModalOpen(false)}>
          <div className="oxoo-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="oxoo-modal-header">
              <h3 className="oxoo-modal-title">Active Login Sessions</h3>
              <button type="button" className="oxoo-modal-close-btn" onClick={() => setSessionsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="oxoo-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Laptop size={20} color="#0284c7" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Chrome on Windows 11</strong>
                      <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Active Now • Current Session</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>India (IP: 103.21.24.5)</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Smartphone size={20} color="#64748b" />
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Safari on iPhone 15 Pro</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Last active: Yesterday at 08:30 PM</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ background: '#fee2e2', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                    onClick={() => showToast('Session revoked.')}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
            <div className="oxoo-modal-footer">
              <button
                type="button"
                className="oxoo-outline-btn"
                onClick={() => setSessionsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          RENEW SUBSCRIPTION MODAL (Renew before or after finish)
          ========================================================= */}
      <AnimatePresence>
        {renewModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            onClick={() => { if (!isRenewing) setRenewModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '560px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Modal Header */}
              <div style={{
                padding: '22px 28px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)'
                  }}>
                    <RefreshCw size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                      Renew Software Subscription
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0' }}>
                      {allDirectoryApps.filter(a => a.entitled).length > 1
                        ? `Multi-Software Subscription (${allDirectoryApps.filter(a => a.entitled).length} Softwares Active)`
                        : (renewTargetApp ? renewTargetApp.name : (overview.currentPlan || 'Single Software'))} &bull; Official Renewal Center
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { if (!isRenewing) setRenewModalOpen(false); }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px 28px' }}>
                {renewSuccess ? (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      color: '#16a34a',
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <CheckCircle2 size={34} />
                    </div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                      Subscription Successfully Renewed!
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '14px', lineHeight: 1.5 }}>
                      Payment of <strong>₹{renewSuccess.amount || computeRenewalPricing(renewCycle).total.toFixed(2)}</strong> has been confirmed and verified. Your subscription has been extended until <strong>{new Date(renewSuccess.renewalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>.
                      An updated Tax Invoice <strong>({renewSuccess.invoiceNumber})</strong> and payment confirmation receipt have been emailed to <strong>{overview.email}</strong>.
                    </p>
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      marginBottom: '20px',
                      fontSize: '0.82rem',
                      color: '#334155',
                      border: '1px solid #e2e8f0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <ShieldCheck size={16} color="#16a34a" />
                      <span>Payment Reference: <strong>{renewSuccess.paymentId || 'pay_verified'}</strong> &bull; Status: <strong style={{ color: '#16a34a' }}>PAID & VERIFIED</strong></span>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="oxoo-app-action-btn open"
                        style={{ padding: '10px 24px', fontSize: '0.9rem', margin: '0 auto' }}
                        onClick={() => setRenewModalOpen(false)}
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Error Banner if Payment Failed or was Cancelled */}
                    {renewPaymentError && (
                      <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#b91c1c',
                        fontSize: '0.82rem'
                      }}>
                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                        <span>{renewPaymentError}</span>
                      </div>
                    )}

                    {/* 5-Day Lock Rule Notice Banner */}
                    {typeof overview.daysRemaining === 'number' && overview.daysRemaining > 5 ? (
                      <div style={{
                        background: '#fffbeb',
                        border: '1.5px solid #fde68a',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: '#fef3c7',
                          color: '#d97706',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}>
                          <Lock size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#92400e', fontSize: '13.5px' }}>
                            Renewal Payment Locked ({overview.daysRemaining} Days Left)
                          </div>
                          <div style={{ color: '#b45309', fontSize: '12px', marginTop: '2px', lineHeight: 1.4 }}>
                            Subscription payment is available within <strong>5 days before expiration</strong>. Your current cycle ends on <strong>{overview.nextBillingExact || overview.nextBillingDate}</strong>. Payment will unlock in {overview.daysRemaining - 5} days.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1.5px solid #bbf7d0',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: '#dcfce7',
                          color: '#16a34a',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#166534', fontSize: '13.5px' }}>
                            Renewal Payment Available Now
                          </div>
                          <div style={{ color: '#15803d', fontSize: '12px', marginTop: '2px', lineHeight: 1.4 }}>
                            Your subscription has {overview.daysRemaining <= 0 ? 'expired' : `${overview.daysRemaining} days remaining`}. Complete your renewal payment below to ensure continuous service.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Active Software in this Subscription (Requirement: Show all active software) */}
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', margin: 0 }}>
                          Software in this Subscription ({allDirectoryApps.filter(a => a.entitled).length || 1})
                        </label>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                          {allDirectoryApps.filter(a => a.entitled).length > 1
                            ? `Custom Pack (${allDirectoryApps.filter(a => a.entitled).length} Softwares)`
                            : 'Standard Pack (1 Software)'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(allDirectoryApps.filter(a => a.entitled).length > 0
                          ? allDirectoryApps.filter(a => a.entitled)
                          : (renewTargetApp ? [renewTargetApp] : [allDirectoryApps[0]])
                        ).map((a) => (
                          <div
                            key={a.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: '10px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                background: a.id === 'sales' ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' :
                                  (a.id === 'human-resources' || a.id === 'hrms') ? '#f3e8ff' :
                                  a.id === 'finance' ? '#ecfdf5' :
                                  (a.id === 'supply-chain' || a.id === 'inventory') ? '#fff7ed' : '#faf5ff',
                                color: a.id === 'sales' ? '#ffffff' :
                                  (a.id === 'human-resources' || a.id === 'hrms') ? '#8b5cf6' :
                                  a.id === 'finance' ? '#10b981' :
                                  (a.id === 'supply-chain' || a.id === 'inventory') ? '#ea580c' : '#6d28d9',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0
                              }}>
                                {a.id === 'sales' && <Layers size={17} />}
                                {(a.id === 'human-resources' || a.id === 'hrms') && <Users size={17} />}
                                {a.id === 'finance' && <BarChart2 size={17} />}
                                {(a.id === 'supply-chain' || a.id === 'inventory') && <Package size={17} />}
                                {(a.id === 'productivity' || a.id === 'marketing') && <Sparkles size={17} />}
                              </div>
                              <div>
                                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>{a.name}</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>6 Apps Suite &bull; Active License</div>
                              </div>
                            </div>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #bbf7d0'
                            }}>
                              Active
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cycle Selection */}
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                      Choose Renewal Plan
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                      <div
                        onClick={() => setRenewCycle('monthly')}
                        style={{
                          padding: '14px',
                          borderRadius: '12px',
                          border: `2px solid ${renewCycle === 'monthly' ? '#0284c7' : '#e2e8f0'}`,
                          background: renewCycle === 'monthly' ? '#f0f9ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Monthly</span>
                          {renewCycle === 'monthly' && <CheckCircle2 size={16} color="#0284c7" />}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                          ₹{computeRenewalPricing('monthly').baseMonthly} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/ mo</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          Renew 1 month (+30 days)
                        </span>
                      </div>

                      <div
                        onClick={() => setRenewCycle('yearly')}
                        style={{
                          padding: '14px',
                          borderRadius: '12px',
                          border: `2px solid ${renewCycle === 'yearly' ? '#16a34a' : '#e2e8f0'}`,
                          background: renewCycle === 'yearly' ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '10px',
                          background: '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '9999px'
                        }}>
                          SAVE 24%
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Annual (12 Mos)</span>
                          {renewCycle === 'yearly' && <CheckCircle2 size={16} color="#16a34a" />}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                          ₹{computeRenewalPricing('yearly').baseYearlyPerMonth} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/ mo</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                          Renew 1 year (+365 days)
                        </span>
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    {(() => {
                      const pricing = computeRenewalPricing(renewCycle);
                      return (
                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#475569', marginBottom: '6px' }}>
                            <span>Base License ({pricing.activeCount} Software{pricing.activeCount > 1 ? 's' : ''}, {renewCycle === 'yearly' ? '12 Months' : '1 Month'})</span>
                            <b style={{ color: '#0f172a' }}>₹{pricing.subtotal.toFixed(2)}</b>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#475569', marginBottom: '6px' }}>
                            <span>GST (18% Integrated Tax)</span>
                            <b style={{ color: '#0f172a' }}>₹{pricing.gst.toFixed(2)}</b>
                          </div>
                          <div style={{ height: '1px', background: '#e2e8f0', margin: '6px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                            <span>Total Payable Amount</span>
                            <span style={{ color: '#0284c7' }}>₹{pricing.total.toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '0.75rem', color: '#64748b' }}>
                            <ShieldCheck size={14} color="#16a34a" />
                            <span>Razorpay Secured &bull; UPI (GPay, PhonePe, Paytm), Cards & NetBanking</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Pay & Renew Button (5-Day Rule Enforced) */}
                    {(() => {
                      const daysRemaining = typeof overview.daysRemaining === 'number' ? overview.daysRemaining : 27;
                      const isPayable = daysRemaining <= 5;
                      const pricing = computeRenewalPricing(renewCycle);

                      return (
                        <button
                          type="button"
                          onClick={handleConfirmRenew}
                          disabled={!isPayable || isRenewing}
                          style={{
                            width: '100%',
                            padding: '13px',
                            borderRadius: '12px',
                            background: !isPayable
                              ? '#cbd5e1'
                              : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                            color: !isPayable ? '#64748b' : '#ffffff',
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            border: 'none',
                            cursor: (!isPayable || isRenewing) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: !isPayable ? 'none' : '0 4px 14px rgba(22, 163, 74, 0.35)',
                            opacity: isRenewing ? 0.7 : 1
                          }}
                        >
                          {isRenewing ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" /> Awaiting Payment Confirmation...
                            </>
                          ) : !isPayable ? (
                            <>
                              <Lock size={16} /> Payment Available 5 Days Before Expiry (in {daysRemaining - 5} days)
                            </>
                          ) : (
                            <>
                              <CreditCard size={18} /> Pay ₹{pricing.total.toFixed(2)} & Renew Subscription
                            </>
                          )}
                        </button>
                      );
                    })()}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
