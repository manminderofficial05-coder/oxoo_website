import {
  INITIAL_DEPARTMENTS,
  INITIAL_DESIGNATIONS,
  INITIAL_LEAVE_TYPES,
  INITIAL_OFFICES,
  INITIAL_HOLIDAYS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVES,
  INITIAL_PAYROLL,
  INITIAL_TASKS,
  INITIAL_REPORTS,
  INITIAL_WORK_MODES,
  INITIAL_AUDIT_LOGS,
  INITIAL_DASHBOARD_DATA,
} from '../data';

// Helper to get / set from localStorage
function getStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// In-memory + persistent storage
const DB = {
  get employees() {
    return getStorage('pp_mock_employees', INITIAL_EMPLOYEES);
  },
  set employees(v) {
    setStorage('pp_mock_employees', v);
  },

  get departments() {
    return getStorage('pp_mock_departments', INITIAL_DEPARTMENTS);
  },
  set departments(v) {
    setStorage('pp_mock_departments', v);
  },

  get designations() {
    return getStorage('pp_mock_designations', INITIAL_DESIGNATIONS);
  },
  set designations(v) {
    setStorage('pp_mock_designations', v);
  },

  get leaveTypes() {
    return getStorage('pp_mock_leave_types', INITIAL_LEAVE_TYPES);
  },
  set leaveTypes(v) {
    setStorage('pp_mock_leave_types', v);
  },

  get leaves() {
    return getStorage('pp_mock_leaves', INITIAL_LEAVES);
  },
  set leaves(v) {
    setStorage('pp_mock_leaves', v);
  },

  get attendance() {
    return getStorage('pp_mock_attendance', INITIAL_ATTENDANCE);
  },
  set attendance(v) {
    setStorage('pp_mock_attendance', v);
  },

  get payroll() {
    return getStorage('pp_mock_payroll', INITIAL_PAYROLL);
  },
  set payroll(v) {
    setStorage('pp_mock_payroll', v);
  },

  get tasks() {
    return getStorage('pp_mock_tasks', INITIAL_TASKS);
  },
  set tasks(v) {
    setStorage('pp_mock_tasks', v);
  },

  get holidays() {
    return getStorage('pp_mock_holidays', INITIAL_HOLIDAYS);
  },
  set holidays(v) {
    setStorage('pp_mock_holidays', v);
  },

  get offices() {
    return getStorage('pp_mock_offices', INITIAL_OFFICES);
  },
  set offices(v) {
    setStorage('pp_mock_offices', v);
  },

  get workModes() {
    return getStorage('pp_mock_work_modes', INITIAL_WORK_MODES);
  },
  set workModes(v) {
    setStorage('pp_mock_work_modes', v);
  },

  get auditLogs() {
    return getStorage('pp_mock_audit_logs', INITIAL_AUDIT_LOGS);
  },
  set auditLogs(v) {
    setStorage('pp_mock_audit_logs', v);
  },

  get policy() {
    return getStorage('pp_mock_policy', {
      workingHours: { start: '09:00', end: '18:00', lateGraceMinutes: 15, halfDayThresholdHours: 4.5 },
      location: { requireOffice: false, radiusMeters: 200 },
      face: { requireFace: false, minConfidence: 0.7 },
    });
  },
  set policy(v) {
    setStorage('pp_mock_policy', v);
  },
};

// Simulated delay for realism
const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

function createResponse(data, status = 200) {
  return { data, status, statusText: 'OK', headers: {}, config: {} };
}

function createError(message, status = 400, code) {
  const err = new Error(message);
  err.response = { status, data: { message, code } };
  return err;
}

// URL router
export async function mockRequest(method, url, body = null, config = {}) {
  await delay();

  // Normalize path
  const fullUrl = typeof url === 'string' ? url : url?.url || '';
  const [path, queryString] = fullUrl.split('?');
  const params = {
    ...config?.params,
    ...Object.fromEntries(new URLSearchParams(queryString || '').entries()),
  };

  // ---------------- AUTH ----------------
  if (path === '/auth/login') {
    const { email } = body || {};
    const normalizedEmail = (email || 'demo@employee360.com').trim().toLowerCase();

    // Check if matching employee exists
    const emp = DB.employees.find((e) => e.email?.toLowerCase() === normalizedEmail) || DB.employees[0];
    const role = normalizedEmail.includes('manager') ? 'manager' : normalizedEmail.includes('employee') ? 'employee' : 'admin';

    const user = {
      id: emp?.user?._id || 'u-demo-admin',
      name: emp?.name || 'Demo Administrator',
      email: normalizedEmail,
      role: emp?.role || role,
      status: 'active',
      subscription: {
        plan: 'demo',
        status: 'active',
        features: { workhub: false, teamTasks: false, needAHand: false },
      },
    };

    const token = `demo-token-${Date.now()}`;
    localStorage.setItem('pp_token', token);
    localStorage.setItem('pp_current_user', JSON.stringify(user));
    localStorage.setItem('pp_current_emp', JSON.stringify(emp));

    return createResponse({
      token,
      user,
      employee: emp,
    });
  }

  if (path === '/auth/register') {
    const { name, email, companyName, phone } = body || {};
    const normalizedEmail = (email || 'demo@employee360.com').trim().toLowerCase();

    const user = {
      id: `u-${Date.now()}`,
      name: name?.trim() || 'Demo Administrator',
      email: normalizedEmail,
      companyName: companyName?.trim() || 'Acme Corp',
      phone: phone?.trim() || '+91 98765 43210',
      role: 'admin',
      status: 'active',
      subscription: {
        plan: 'demo',
        status: 'active',
        features: { workhub: false, teamTasks: false, needAHand: false },
      },
    };

    const token = `demo-token-${Date.now()}`;
    localStorage.setItem('pp_token', token);
    localStorage.setItem('pp_current_user', JSON.stringify(user));
    localStorage.setItem('pp_current_emp', JSON.stringify(DB.employees[0]));

    return createResponse({
      token,
      user,
      employee: DB.employees[0],
    }, 201);
  }

  if (path === '/auth/me') {
    const cachedUser = getStorage('pp_current_user', null);
    const cachedEmp = getStorage('pp_current_emp', DB.employees[0]);
    if (!cachedUser) {
      // Default demo session
      const defaultUser = {
        id: 'u-demo-admin',
        name: 'Sarah Williams',
        email: 'demo@employee360.com',
        role: 'admin',
        status: 'active',
        subscription: {
          plan: 'demo',
          status: 'active',
          features: { workhub: false, teamTasks: false, needAHand: false },
        },
      };
      return createResponse({ user: defaultUser, employee: DB.employees[0] });
    }
    return createResponse({ user: cachedUser, employee: cachedEmp });
  }

  if (path === '/auth/change-password' || path === '/auth/forgot-password' || path === '/auth/reset-password') {
    return createResponse({ message: 'Request processed successfully' });
  }

  // ---------------- DASHBOARD ----------------
  if (path === '/dashboard') {
    const cachedUser = getStorage('pp_current_user', { role: 'admin' });
    const role = (cachedUser.role || 'admin').toLowerCase();
    const data = INITIAL_DASHBOARD_DATA[role] || INITIAL_DASHBOARD_DATA.admin;
    return createResponse(data);
  }

  // ---------------- EMPLOYEES ----------------
  if (path === '/employees') {
    if (method === 'GET') {
      let list = [...DB.employees];
      const { search, department, status, employmentType, sort, page = 1, limit = 10 } = params;

      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (e) =>
            e.name?.toLowerCase().includes(q) ||
            e.email?.toLowerCase().includes(q) ||
            e.employeeCode?.toLowerCase().includes(q)
        );
      }
      if (department) {
        list = list.filter((e) => e.department?._id === department || e.department?.name === department);
      }
      if (status) {
        list = list.filter((e) => e.status === status);
      }
      if (employmentType) {
        list = list.filter((e) => e.employmentType === employmentType);
      }

      // Sort
      if (sort === '-name') list.sort((a, b) => b.name.localeCompare(a.name));
      else if (sort === 'employeeCode') list.sort((a, b) => a.employeeCode.localeCompare(b.employeeCode));
      else if (sort === '-joiningDate') list.sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
      else if (sort === 'joiningDate') list.sort((a, b) => new Date(a.joiningDate) - new Date(b.joiningDate));
      else list.sort((a, b) => a.name.localeCompare(b.name));

      const total = list.length;
      const start = (Number(page) - 1) * Number(limit);
      const data = list.slice(start, start + Number(limit));

      return createResponse({ data, total, pages: Math.ceil(total / Number(limit)) || 1 });
    }

    if (method === 'POST') {
      const year = new Date().getFullYear();
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const deptObj = DB.departments.find((d) => d._id === body.department) || { name: 'Engineering' };
      const newEmp = {
        _id: `emp-${Date.now()}`,
        employeeCode: `EMP-PP${year}-00-${suffix}`,
        name: body.name,
        email: body.email,
        phone: body.phone,
        department: deptObj,
        designation: body.designation,
        joiningDate: body.joiningDate || new Date().toISOString(),
        status: 'active',
        employmentType: body.employmentType || 'permanent',
        internshipDetails: body.internshipDetails,
        salary: { basic: 50000, hra: 20000, allowances: 10000, deductions: 2000, netPay: 78000 },
        hrDetails: {},
        documents: [],
      };
      const updated = [newEmp, ...DB.employees];
      DB.employees = updated;
      return createResponse({ data: newEmp }, 201);
    }
  }

  // Employee by ID
  const empIdMatch = path.match(/^\/employees\/([^/]+)$/);
  if (empIdMatch) {
    const id = empIdMatch[1];
    const emp = DB.employees.find((e) => e._id === id);

    if (method === 'GET') {
      if (!emp) return createResponse(DB.employees[0]);
      return createResponse(emp);
    }

    if (method === 'PATCH') {
      const updatedList = DB.employees.map((e) => (e._id === id ? { ...e, ...body } : e));
      DB.employees = updatedList;
      const updated = updatedList.find((e) => e._id === id);
      return createResponse(updated);
    }

    if (method === 'DELETE') {
      DB.employees = DB.employees.filter((e) => e._id !== id);
      return createResponse({ message: 'Employee deleted' });
    }
  }

  // Employee Sub-resources
  if (path.includes('/hr-details') || path.includes('/salary') || path.includes('/convert-intern')) {
    const id = path.split('/')[2];
    const updatedList = DB.employees.map((e) => {
      if (e._id === id) {
        if (path.endsWith('/hr-details')) return { ...e, hrDetails: { ...e.hrDetails, ...body } };
        if (path.endsWith('/salary')) return { ...e, salary: { ...e.salary, ...body } };
        if (path.endsWith('/convert-intern')) return { ...e, employmentType: 'permanent', designation: body.designation || e.designation };
      }
      return e;
    });
    DB.employees = updatedList;
    return createResponse(updatedList.find((e) => e._id === id));
  }

  if (path.includes('/documents')) {
    return createResponse({ message: 'Document updated successfully' });
  }

  // ---------------- DEPARTMENTS ----------------
  if (path === '/departments') {
    if (method === 'GET') return createResponse({ data: DB.departments, departments: DB.departments });
    if (method === 'POST') {
      const item = { _id: `dept-${Date.now()}`, ...body, status: 'active', headCount: 1 };
      DB.departments = [...DB.departments, item];
      return createResponse(item, 201);
    }
  }
  const deptMatch = path.match(/^\/departments\/([^/]+)$/);
  if (deptMatch) {
    const id = deptMatch[1];
    if (method === 'PATCH') {
      DB.departments = DB.departments.map((d) => (d._id === id ? { ...d, ...body } : d));
      return createResponse(DB.departments.find((d) => d._id === id));
    }
    if (method === 'DELETE') {
      DB.departments = DB.departments.filter((d) => d._id !== id);
      return createResponse({ message: 'Deleted' });
    }
  }

  // ---------------- DESIGNATIONS ----------------
  if (path === '/designations') {
    if (method === 'GET') return createResponse({ data: DB.designations, designations: DB.designations });
    if (method === 'POST') {
      const item = { _id: `desig-${Date.now()}`, ...body, status: 'active' };
      DB.designations = [...DB.designations, item];
      return createResponse(item, 201);
    }
  }
  const desigMatch = path.match(/^\/designations\/([^/]+)$/);
  if (desigMatch) {
    const id = desigMatch[1];
    if (method === 'PATCH') {
      DB.designations = DB.designations.map((d) => (d._id === id ? { ...d, ...body } : d));
      return createResponse(DB.designations.find((d) => d._id === id));
    }
    if (method === 'DELETE') {
      DB.designations = DB.designations.filter((d) => d._id !== id);
      return createResponse({ message: 'Deleted' });
    }
  }

  // ---------------- LEAVE TYPES ----------------
  if (path === '/leave-types') {
    if (method === 'GET') return createResponse({ data: DB.leaveTypes, leaveTypes: DB.leaveTypes });
    if (method === 'POST') {
      const item = { _id: `lt-${Date.now()}`, ...body, status: 'active' };
      DB.leaveTypes = [...DB.leaveTypes, item];
      return createResponse(item, 201);
    }
  }
  const ltMatch = path.match(/^\/leave-types\/([^/]+)$/);
  if (ltMatch) {
    const id = ltMatch[1];
    if (method === 'PATCH') {
      DB.leaveTypes = DB.leaveTypes.map((t) => (t._id === id ? { ...t, ...body } : t));
      return createResponse(DB.leaveTypes.find((t) => t._id === id));
    }
    if (method === 'DELETE') {
      DB.leaveTypes = DB.leaveTypes.filter((t) => t._id !== id);
      return createResponse({ message: 'Deleted' });
    }
  }

  // ---------------- LEAVES ----------------
  if (path === '/leaves/balance') {
    return createResponse({
      balances: [
        { leaveType: { _id: 'lt-1', name: 'Annual Leave' }, remaining: 14, limit: 18 },
        { leaveType: { _id: 'lt-2', name: 'Sick Leave' }, remaining: 10, limit: 12 },
        { leaveType: { _id: 'lt-3', name: 'Casual Leave' }, remaining: 7, limit: 10 },
        { leaveType: { _id: 'lt-8', name: 'Work From Home' }, remaining: 20, limit: 24 },
      ],
    });
  }

  if (path === '/leaves') {
    if (method === 'GET') {
      let list = [...DB.leaves];
      if (params.status) list = list.filter((l) => l.status === params.status);
      const page = Number(params.page || 1);
      const limit = Number(params.limit || 10);
      const total = list.length;
      const data = list.slice((page - 1) * limit, page * limit);
      return createResponse({ data, total, pages: Math.ceil(total / limit) || 1 });
    }

    if (method === 'POST') {
      const lt = DB.leaveTypes.find((t) => t._id === body.leaveType) || { name: 'Casual Leave' };
      const newLeave = {
        _id: `leave-${Date.now()}`,
        employee: { _id: 'emp-1', name: 'Sarah Williams', employeeCode: 'EMP-PP2026-00-0001' },
        leaveType: lt,
        startDate: body.startDate,
        endDate: body.endDate,
        days: body.days || 1,
        status: 'pending',
        reason: body.reason,
        createdAt: new Date().toISOString(),
      };
      DB.leaves = [newLeave, ...DB.leaves];
      return createResponse({ data: newLeave }, 201);
    }
  }

  const leaveMatch = path.match(/^\/leaves\/([^/]+)$/);
  if (leaveMatch) {
    const id = leaveMatch[1];
    if (method === 'PATCH') {
      DB.leaves = DB.leaves.map((l) => (l._id === id ? { ...l, ...body } : l));
      return createResponse(DB.leaves.find((l) => l._id === id));
    }
    if (method === 'DELETE') {
      DB.leaves = DB.leaves.filter((l) => l._id !== id);
      return createResponse({ message: 'Deleted' });
    }
  }

  // ---------------- ATTENDANCE ----------------
  if (path.startsWith('/attendance')) {
    if (path === '/attendance/today') {
      return createResponse(DB.attendance.today);
    }
    if (path === '/attendance/check-in') {
      const today = {
        status: 'present',
        checkIn: new Date().toISOString(),
        checkOut: null,
        workingMinutes: 0,
      };
      DB.attendance = { ...DB.attendance, today };
      return createResponse({ message: 'Checked in successfully', today });
    }
    if (path === '/attendance/check-out') {
      const today = {
        ...DB.attendance.today,
        status: 'present',
        checkOut: new Date().toISOString(),
        workingMinutes: 480,
      };
      DB.attendance = { ...DB.attendance, today };
      return createResponse({ message: 'Checked out successfully', today });
    }
    if (path === '/attendance/month' || path === '/attendance/records' || path === '/attendance') {
      return createResponse({
        records: DB.attendance.records,
        stats: DB.attendance.monthStats,
        summary: DB.attendance.monthStats,
        data: DB.attendance.records,
      });
    }
  }

  // ---------------- PAYROLL ----------------
  if (path.startsWith('/payroll')) {
    if (path === '/payroll') {
      return createResponse({
        rows: DB.payroll,
        data: DB.payroll,
        stats: { totalNet: 545000, count: DB.payroll.length, finalized: true },
      });
    }
    const payMatch = path.match(/^\/payroll\/([^/]+)$/);
    if (payMatch) {
      const id = payMatch[1];
      const found = DB.payroll.find((p) => p._id === id) || DB.payroll[0];
      return createResponse(found);
    }
    if (path.includes('/run') || path.includes('/finalize') || path.includes('/reopen')) {
      return createResponse({ message: 'Payroll updated successfully', data: DB.payroll });
    }
  }

  // ---------------- REPORTS ----------------
  if (path.startsWith('/reports/')) {
    const reportType = path.split('/')[2];
    if (reportType === 'attendance') return createResponse(INITIAL_REPORTS.attendance);
    if (reportType === 'leaves') return createResponse(INITIAL_REPORTS.leaves);
    if (reportType === 'headcount') return createResponse(INITIAL_REPORTS.headcount);
    if (reportType === 'employees') {
      const data = DB.employees.map((e) => ({
        employeeCode: e.employeeCode,
        name: e.name,
        email: e.email,
        role: e.role || 'employee',
        phone: e.phone,
        department: e.department?.name || '—',
        designation: e.designation || '—',
        joiningDate: e.joiningDate?.slice(0, 10),
        manager: e.manager?.name || '—',
        status: e.status,
      }));
      return createResponse({ data });
    }
    return createResponse({ data: [] });
  }

  // ---------------- HOLIDAYS ----------------
  if (path === '/holidays') {
    if (method === 'GET') return createResponse({ data: DB.holidays, weekendDays: [0, 6], holidays: DB.holidays });
    if (method === 'POST') {
      const h = { _id: `h-${Date.now()}`, ...body };
      DB.holidays = [...DB.holidays, h];
      return createResponse(h, 201);
    }
  }
  const hMatch = path.match(/^\/holidays\/([^/]+)$/);
  if (hMatch && method === 'DELETE') {
    DB.holidays = DB.holidays.filter((h) => h._id !== hMatch[1]);
    return createResponse({ message: 'Deleted' });
  }

  // ---------------- OFFICES ----------------
  if (path === '/offices') {
    if (method === 'GET') return createResponse({ data: DB.offices, offices: DB.offices });
    if (method === 'POST') {
      const o = { _id: `office-${Date.now()}`, ...body, status: 'active' };
      DB.offices = [...DB.offices, o];
      return createResponse(o, 201);
    }
  }
  const offMatch = path.match(/^\/offices\/([^/]+)$/);
  if (offMatch) {
    const id = offMatch[1];
    if (method === 'PATCH') {
      DB.offices = DB.offices.map((o) => (o._id === id ? { ...o, ...body } : o));
      return createResponse(DB.offices.find((o) => o._id === id));
    }
    if (method === 'DELETE') {
      DB.offices = DB.offices.filter((o) => o._id !== id);
      return createResponse({ message: 'Deleted' });
    }
  }

  // ---------------- WORK MODE ----------------
  if (path === '/work-mode') {
    if (method === 'GET') {
      let list = [...DB.workModes];
      if (params.status) list = list.filter((w) => w.status === params.status);
      return createResponse({ data: list, total: list.length, pages: 1 });
    }
    if (method === 'POST') {
      const item = {
        _id: `wm-${Date.now()}`,
        employee: { _id: 'emp-1', name: 'Sarah Williams', employeeCode: 'EMP-PP2026-00-0001' },
        ...body,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      DB.workModes = [item, ...DB.workModes];
      return createResponse({ data: item }, 201);
    }
  }
  const wmMatch = path.match(/^\/work-mode\/([^/]+)$/);
  if (wmMatch) {
    const id = wmMatch[1];
    if (method === 'PATCH') {
      DB.workModes = DB.workModes.map((w) => (w._id === id ? { ...w, ...body } : w));
      return createResponse(DB.workModes.find((w) => w._id === id));
    }
    if (method === 'DELETE') {
      DB.workModes = DB.workModes.filter((w) => w._id !== id);
      return createResponse({ message: 'Deleted' });
    }
  }

  // ---------------- TASKS ----------------
  if (path === '/tasks') {
    if (method === 'GET') return createResponse({ data: DB.tasks });
    if (method === 'POST') {
      const t = { _id: `task-${Date.now()}`, ...body, status: 'todo' };
      DB.tasks = [t, ...DB.tasks];
      return createResponse({ data: t }, 201);
    }
  }
  if (path === '/tasks/summary') {
    return createResponse({
      open: 2,
      overdue: 1,
      done: 1,
      upcoming: DB.tasks.slice(0, 3),
    });
  }
  if (path === '/tasks/assignees') {
    return createResponse({
      data: DB.employees.map((e) => ({ _id: e._id, name: e.name })),
    });
  }
  const taskMatch = path.match(/^\/tasks\/([^/]+)$/);
  if (taskMatch) {
    const id = taskMatch[1];
    if (method === 'PATCH') {
      DB.tasks = DB.tasks.map((t) => (t._id === id ? { ...t, ...body } : t));
      return createResponse({ data: DB.tasks.find((t) => t._id === id) });
    }
  }

  // ---------------- POLICY & SETTINGS ----------------
  const fullPolicy = {
    attendance: {
      officeStart: '09:00',
      officeEnd: '18:00',
      graceMinutes: 15,
      halfDayHours: 4,
      minWorkingHours: 8,
      overtimeAfterHours: 9,
    },
    calendar: { weekendDays: [0, 6] },
    location: { requireGeofence: false, maxAccuracyMeters: 100 },
    face: { requireFace: false, faceThreshold: 0.55 },
  };

  if (path === '/policy' || path.startsWith('/policy/')) {
    if (method === 'GET') return createResponse({ policy: fullPolicy, ...fullPolicy });
    if (method === 'PATCH') {
      return createResponse({ policy: { ...fullPolicy, ...body }, ...fullPolicy, ...body });
    }
  }

  if (path === '/settings') {
    return createResponse({
      account: { email: 'demo@employee360.com', role: 'admin' },
      profile: { name: 'Sarah Williams', phone: '+91 (080) 4123-4567' },
    });
  }

  if (path === '/settings/profile') {
    const cachedUser = getStorage('pp_current_user', { name: 'Demo Administrator' });
    const updated = { ...cachedUser, name: body.name || cachedUser.name, phone: body.phone };
    setStorage('pp_current_user', updated);
    return createResponse({ data: updated, profile: updated });
  }

  // ---------------- FACE ----------------
  if (path.startsWith('/face')) {
    if (path === '/face/requirements') return createResponse({ requireFace: false });
    if (path === '/face/me') return createResponse({ status: 'approved', enrolledAt: new Date().toISOString() });
    if (path === '/face') return createResponse({ data: [] });
    return createResponse({ message: 'Success' });
  }

  // ---------------- AUDIT LOGS ----------------
  if (path === '/audit-logs') {
    return createResponse({
      data: DB.auditLogs,
      total: DB.auditLogs.length,
      pages: 1,
      filters: {
        actions: ['create', 'update', 'delete', 'approve', 'check-in', 'check-out'],
        entities: ['Employee', 'Leave', 'Attendance', 'Payroll', 'Holidays', 'Settings'],
      },
    });
  }

  // ---------------- LOCKED PREMIUM MODULES ----------------
  if (path.startsWith('/premium/')) {
    throw createError('This premium module is not included in your current demo plan.', 403, 'PREMIUM_MODULE_REQUIRED');
  }

  // Fallback
  return createResponse({ message: 'OK', data: [] });
}
