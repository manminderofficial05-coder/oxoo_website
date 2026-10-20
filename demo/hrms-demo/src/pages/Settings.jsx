import { useState } from 'react';
import {
  Bell,
  Building,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  Palette,
  Phone,
  Save,
  Shield,
  Sliders,
} from 'lucide-react';
import { Banner, Card } from '../components/dash';
import { INITIAL_SETTINGS } from '../data/settings';
import { getDemoData, setDemoData } from '../utils/demoStorage';

const TABS = [
  { id: 'general', label: 'General', icon: Building },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'system', label: 'System', icon: Sliders },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(() =>
    getDemoData('app_settings', INITIAL_SETTINGS)
  );
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleUpdate = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = (e) => {
    e?.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setDemoData('app_settings', settings);
      setSaving(false);
      showToast('Settings saved successfully.');
    }, 250);
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Banner
          title="Organization Settings"
          subtitle="Configure enterprise preferences, security policies, and workspace branding."
          workspace="Admin Workspace"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-sky-700 transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/5 gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave}>
        {/* 1. GENERAL TAB */}
        {activeTab === 'general' && (
          <Card title="Company Profile" subtitle="Public company identifiers used on official reports and payslips.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.general.companyName}
                  onChange={(e) => handleUpdate('general', 'companyName', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Company Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={settings.general.companyEmail}
                    onChange={(e) => handleUpdate('general', 'companyEmail', e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={settings.general.phone}
                    onChange={(e) => handleUpdate('general', 'phone', e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Website
                </label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={settings.general.website}
                    onChange={(e) => handleUpdate('general', 'website', e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Time Zone
                </label>
                <select
                  value={settings.general.timeZone}
                  onChange={(e) => handleUpdate('general', 'timeZone', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
                  <option value="America/New_York (EST)">America/New_York (EST)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                  <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Currency
                </label>
                <select
                  value={settings.general.currency}
                  onChange={(e) => handleUpdate('general', 'currency', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* 2. APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <Card title="Interface & Theme" subtitle="Personalize the visual appearance and density of the Employee360 console.">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Color Mode
                </label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {['light', 'dark', 'system'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => handleUpdate('appearance', 'theme', t)}
                      className={`rounded-2xl border p-3 text-xs font-extrabold capitalize transition ${
                        settings.appearance.theme === t
                          ? 'border-sky-500 bg-sky-50 text-sky-800'
                          : 'border-black/5 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t} Mode
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4 max-w-2xl">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    Compact Table Density
                  </span>
                  <span className="text-xs text-slate-500">
                    Display more table records per page with narrower row padding
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.appearance.compactMode}
                    onChange={(e) => handleUpdate('appearance', 'compactMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4 max-w-2xl">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    Sidebar Behavior
                  </span>
                  <span className="text-xs text-slate-500">
                    Default navigation state on desktop devices
                  </span>
                </div>
                <select
                  value={settings.appearance.sidebarMode}
                  onChange={(e) => handleUpdate('appearance', 'sidebarMode', e.target.value)}
                  className="rounded-xl border border-black/10 bg-white py-1.5 px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="expanded">Expanded by Default</option>
                  <option value="collapsed">Collapsed</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* 3. NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <Card title="Alerts & Notification Channels" subtitle="Manage communication delivery preferences for automated alerts.">
            <div className="grid gap-4 max-w-2xl">
              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    Email Notifications
                  </span>
                  <span className="text-xs text-slate-500">
                    Send general email updates for critical announcements
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleUpdate('notifications', 'emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    Leave Notifications
                  </span>
                  <span className="text-xs text-slate-500">
                    Immediate alerts on leave submission, approvals, and rejections
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.leaveNotifications}
                    onChange={(e) => handleUpdate('notifications', 'leaveNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    Attendance Notifications
                  </span>
                  <span className="text-xs text-slate-500">
                    Reminders for missing check-outs and daily biometric status
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.attendanceNotifications}
                    onChange={(e) => handleUpdate('notifications', 'attendanceNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    Payroll Notifications
                  </span>
                  <span className="text-xs text-slate-500">
                    Notify employees when salary slips are finalized and disbursed
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.notifications.payrollNotifications}
                    onChange={(e) => handleUpdate('notifications', 'payrollNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* 4. SECURITY TAB */}
        {activeTab === 'security' && (
          <Card title="Security & Authentication" subtitle="Session policies, two-factor authentication, and login access controls.">
            <div className="space-y-5 max-w-2xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Session Timeout Duration
                </label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleUpdate('security', 'sessionTimeout', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="15 minutes">15 minutes of inactivity</option>
                  <option value="30 minutes">30 minutes of inactivity</option>
                  <option value="60 minutes">60 minutes of inactivity</option>
                  <option value="12 hours">12 hours (Standard working day)</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    Two-Factor Authentication (2FA)
                  </span>
                  <span className="text-xs text-slate-500">
                    Require authenticator OTP on administrative logins
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleUpdate('security', 'twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">
                    Login Notifications
                  </span>
                  <span className="text-xs text-slate-500">
                    Email alerts when an account is accessed from a new IP/device
                  </span>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.loginNotifications}
                    onChange={(e) => handleUpdate('security', 'loginNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* 5. SYSTEM TAB */}
        {activeTab === 'system' && (
          <Card title="System & Localization" subtitle="Regional calendar formatting, language pack and fiscal cycle preferences.">
            <div className="grid gap-5 sm:grid-cols-2 max-w-2xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Date Format
                </label>
                <select
                  value={settings.system.dateFormat}
                  onChange={(e) => handleUpdate('system', 'dateFormat', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 26/01/2027)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 01/26/2027)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Time Format
                </label>
                <select
                  value={settings.system.timeFormat}
                  onChange={(e) => handleUpdate('system', 'timeFormat', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="12-hour (AM/PM)">12-hour (AM/PM)</option>
                  <option value="24-hour">24-hour (Military format)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Language
                </label>
                <select
                  value={settings.system.language}
                  onChange={(e) => handleUpdate('system', 'language', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Fiscal Year Start
                </label>
                <select
                  value={settings.system.fiscalYearStart}
                  onChange={(e) => handleUpdate('system', 'fiscalYearStart', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="April">April (India standard)</option>
                  <option value="January">January (Calendar year)</option>
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Bottom save bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-sky-700 transition disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving Changes…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
}