export const INITIAL_SETTINGS = {
  general: {
    companyName: 'Employee360 Technologies Pvt Ltd',
    companyEmail: 'contact@employee360.com',
    phone: '+91 (080) 4123-4567',
    website: 'https://employee360.com',
    timeZone: 'Asia/Kolkata (IST +5:30)',
    currency: 'INR (₹)',
  },
  appearance: {
    theme: 'system', // 'light' | 'dark' | 'system'
    compactMode: false,
    sidebarMode: 'expanded', // 'expanded' | 'collapsed'
  },
  notifications: {
    emailNotifications: true,
    leaveNotifications: true,
    attendanceNotifications: true,
    payrollNotifications: true,
    dailyDigest: true,
  },
  security: {
    sessionTimeout: '60 minutes',
    twoFactorAuth: false,
    loginNotifications: true,
    enforceStrongPasswords: true,
  },
  system: {
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour (AM/PM)',
    language: 'English (US)',
    fiscalYearStart: 'April',
  },
};
