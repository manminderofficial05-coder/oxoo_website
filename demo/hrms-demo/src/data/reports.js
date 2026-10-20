export const INITIAL_REPORTS = {
  attendance: {
    data: [
      { employeeCode: 'EMP-PP2026-00-0001', name: 'Sarah Williams', department: 'Human Resources', workingDays: 20, present: 19, halfDay: 0, late: 1, absent: 1, totalHours: '168.5', lateMinutes: 10, earlyLeaveMinutes: 0, overtimeMinutes: 120 },
      { employeeCode: 'EMP-PP2026-00-0102', name: 'Alex Johnson', department: 'Engineering', workingDays: 20, present: 20, halfDay: 0, late: 0, absent: 0, totalHours: '176.0', lateMinutes: 0, earlyLeaveMinutes: 0, overtimeMinutes: 240 },
      { employeeCode: 'EMP-PP2026-00-0103', name: 'Michael Brown', department: 'Engineering', workingDays: 20, present: 18, halfDay: 1, late: 2, absent: 1, totalHours: '158.0', lateMinutes: 35, earlyLeaveMinutes: 15, overtimeMinutes: 60 },
      { employeeCode: 'EMP-PP2026-00-0104', name: 'Priya Sharma', department: 'Product & Design', workingDays: 20, present: 18, halfDay: 0, late: 1, absent: 2, totalHours: '160.0', lateMinutes: 15, earlyLeaveMinutes: 0, overtimeMinutes: 45 },
      { employeeCode: 'EMP-PP2026-00-0105', name: 'David Wilson', department: 'Engineering', workingDays: 20, present: 19, halfDay: 0, late: 1, absent: 1, totalHours: '165.5', lateMinutes: 20, earlyLeaveMinutes: 0, overtimeMinutes: 90 },
      { employeeCode: 'EMP-PP2026-00-0106', name: 'Anita Patel', department: 'Finance & Operations', workingDays: 20, present: 20, halfDay: 0, late: 0, absent: 0, totalHours: '172.0', lateMinutes: 0, earlyLeaveMinutes: 0, overtimeMinutes: 180 },
    ],
  },
  leaves: {
    types: [
      { _id: 'lt-1', name: 'Casual Leave', annualLimit: 12 },
      { _id: 'lt-2', name: 'Sick Leave', annualLimit: 10 },
      { _id: 'lt-3', name: 'Earned Leave', annualLimit: 15 },
    ],
    data: [
      { employeeCode: 'EMP-PP2026-00-0001', name: 'Sarah Williams', department: 'Human Resources', used: { 'lt-1': 2, 'lt-2': 1, 'lt-3': 3 }, approvedTotal: 6, pending: 0 },
      { employeeCode: 'EMP-PP2026-00-0102', name: 'Alex Johnson', department: 'Engineering', used: { 'lt-1': 1, 'lt-2': 0, 'lt-3': 4 }, approvedTotal: 5, pending: 0 },
      { employeeCode: 'EMP-PP2026-00-0103', name: 'Michael Brown', department: 'Engineering', used: { 'lt-1': 3, 'lt-2': 2, 'lt-3': 0 }, approvedTotal: 5, pending: 3 },
      { employeeCode: 'EMP-PP2026-00-0104', name: 'Priya Sharma', department: 'Product & Design', used: { 'lt-1': 2, 'lt-2': 2, 'lt-3': 2 }, approvedTotal: 6, pending: 0 },
      { employeeCode: 'EMP-PP2026-00-0105', name: 'David Wilson', department: 'Engineering', used: { 'lt-1': 1, 'lt-2': 1, 'lt-3': 5 }, approvedTotal: 7, pending: 0 },
    ],
  },
  headcount: {
    data: [
      { department: 'Engineering', total: 14, active: 14, inactive: 0, managers: 2, employees: 12, admins: 0 },
      { department: 'Human Resources', total: 4, active: 4, inactive: 0, managers: 1, employees: 2, admins: 1 },
      { department: 'Product & Design', total: 6, active: 6, inactive: 0, managers: 1, employees: 5, admins: 0 },
      { department: 'Sales & Marketing', total: 8, active: 8, inactive: 0, managers: 2, employees: 6, admins: 0 },
      { department: 'Finance & Operations', total: 3, active: 3, inactive: 0, managers: 0, employees: 3, admins: 0 },
      { department: 'Customer Support', total: 5, active: 5, inactive: 0, managers: 1, employees: 4, admins: 0 },
    ],
  },
};
