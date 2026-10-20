/**
 * Demo API layer.
 *
 * The original product talks to ~85 server routes backed by PostgreSQL and
 * third-party services (Twilio, Exotel, OpenAI, SendGrid, ...). The demo has NO
 * server and NO database: every /api/* call made by the UI is answered here from
 * fictional sample data that lives in the visitor's own browser (localStorage).
 *
 * - Real mutations (book / confirm / cancel / create patient / ...) update the
 *   sample data so tables and dashboard stats change as they do in the product.
 * - Operations that would contact real people (calls, WhatsApp, SMS, e-mail) are
 *   SIMULATED and clearly labelled as such. Nothing leaves the browser.
 */
import { buildSeed, buildEmptySeed, type DemoState } from './seed';

const KEY = 'hospital-cart-demo:v1';
let state: DemoState | null = null;

function load(): DemoState {
  if (state) return state;
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 1) return (state = parsed);
    }
  } catch {
    /* ignore corrupt/blocked storage */
  }
  return (state = buildSeed());
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode) – demo keeps working in memory */
  }
}

export function resetDemo(empty = true) {
  state = empty ? buildEmptySeed() : buildSeed();
  save();
}

// ───────────────────────── helpers ─────────────────────────
type Res = { status: number; body: any };
const ok = (body: any, status = 200): Res => ({ status, body });
const err = (message: string, status = 400): Res => ({ status, body: { error: message } });

const nameOf = (p: any) => p?.fullName || `${p?.firstName ?? ''} ${p?.lastName ?? ''}`.trim() || 'Unknown';
const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const sameDay = (iso: string, d = new Date()) => { const t = new Date(iso).getTime(); return t >= startOfDay(d).getTime() && t <= endOfDay(d).getTime(); };
const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const bucketLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`;
const timeOnly = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
function relative(iso?: string | null) {
  if (!iso) return '—';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function apptView(s: DemoState, a: any) {
  const p = s.patients.find((x) => x.id === a.patientId);
  const doc = s.doctors.find((x) => x.id === a.doctorId);
  const dep = s.departments.find((x) => x.id === a.departmentId);
  return {
    id: a.id,
    patientId: a.patientId,
    patient: p ? { id: p.id, name: nameOf(p), phone: p.phone, email: p.email } : null,
    doctorId: a.doctorId,
    doctor: doc ? { id: doc.id, name: doc.name } : null,
    departmentId: a.departmentId,
    department: dep ? { id: dep.id, name: dep.name } : null,
    scheduledAt: a.scheduledAt,
    duration: a.duration,
    status: a.status,
    type: a.appointmentType,
    notes: a.notes,
    bookedVia: a.bookedVia,
    bookedAt: a.bookedAt,
  };
}

function paginate<T>(rows: T[], q: URLSearchParams, defLimit = 50) {
  const page = Math.max(1, Number(q.get('page') || 1));
  const limit = Math.min(500, Math.max(1, Number(q.get('limit') || defLimit)));
  const total = rows.length;
  const pages = Math.ceil(total / limit);
  return { rows: rows.slice((page - 1) * limit, page * limit), pagination: { page, limit, total, pages, hasMore: page < pages } };
}

// ───────────────────── dashboard sections ─────────────────────
function sectionOverview(s: DemoState) {
  const today = new Date();
  const todaysAppts = s.appointments.filter((a) => sameDay(a.scheduledAt));
  const confirmedToday = todaysAppts.filter((a) => a.status === 'CONFIRMED').length;
  const month0 = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const todayCalls = s.callLog;
  const inbound = todayCalls.filter((c) => c.direction === 'INBOUND').length;
  const outbound = todayCalls.filter((c) => c.direction === 'OUTBOUND').length;
  const missed = todayCalls.filter((c) => c.status !== 'COMPLETED').length;
  const answered = todayCalls.filter((c) => c.status === 'COMPLETED').length;
  const callbacks = todayCalls.filter((c) => c.isMissedCallback).length;
  const reminders = (ch: string) => s.reminders.filter((r) => r.channel === ch);
  const patientsToday = s.patients.filter((p) => sameDay(p.createdAt)).length;
  const revenueToday = todaysAppts.reduce((n, a) => n + (a.billingAmount ?? 0), 0);
  const leadsToday = patientsToday + s.leads.filter((l) => sameDay(l.createdAt)).length;
  const upcoming = s.appointments.filter((a) => new Date(a.scheduledAt).getTime() >= startOfDay().getTime()).length;

  const hasData = s.patients.length > 0 || s.appointments.length > 0 || s.leads.length > 0 || s.callLog.length > 0;

  const stats = {
    totalPatients: s.patients.length,
    patientsGrowth: s.patients.length ? 12.4 : 0,
    todayLeads: leadsToday,
    leadGrowth: leadsToday ? 8.1 : 0,
    appointmentsToday: todaysAppts.length,
    appointmentsBooked: confirmedToday,
    newPatientsThisMonth: s.patients.filter((p) => new Date(p.createdAt).getTime() >= month0).length,
    returningPatients: s.patients.filter((p) => p.totalVisits > 1).length,
    totalAppointmentsAllTime: s.appointments.length,
    upcomingAppointmentsAllTime: upcoming,
    pastAppointmentsAllTime: s.appointments.length - upcoming,
    appointmentsPendingAllTime: s.appointments.filter((a) => ['SCHEDULED', 'RESCHEDULED'].includes(a.status)).length,
    appointmentsConfirmedAllTime: s.appointments.filter((a) => a.status === 'CONFIRMED').length,
    callsToday: inbound + outbound,
    callsAnswered: answered,
    missedCalls: missed,
    callbacksDone: callbacks,
    whatsappSent: reminders('WHATSAPP').length,
    whatsappDelivered: reminders('WHATSAPP').filter((r) => r.status === 'DELIVERED').length,
    conversionRate: leadsToday > 0 ? Math.min(100, Number(((confirmedToday / leadsToday) * 100).toFixed(1))) : 0,
    avgResponseTime: hasData ? 4 : 0,
    satisfaction: hasData ? 4.6 : 0,
    aiAccuracy: hasData ? 94.2 : 0,
    revenueToday,
    monthlyRevenue: revenueToday * 22,
    chatbotLeads: 0,
    voiceLeads: inbound,
    whatsappLeads: 0,
  };

  const cnt = { chat: 0, whatsapp: 0, voice: 0, outbound: 0, direct: 0 };
  for (const p of s.patients) {
    const src = p.source.toLowerCase();
    if (src.includes('whatsapp')) cnt.whatsapp++;
    else if (src.includes('voice')) cnt.voice++;
    else if (src.includes('outbound')) cnt.outbound++;
    else if (src.includes('chat')) cnt.chat++;
    else cnt.direct++;
  }
  const hasPatients = s.patients.length > 0;
  const tot = Math.max(1, s.patients.length);
  const pct = (n: number) => hasPatients ? Math.round((n / tot) * 100) : 0;
  const sourceData = [
    { name: 'Website Chat', value: pct(cnt.chat), color: '#00c4ff', count: cnt.chat },
    { name: 'WhatsApp AI', value: pct(cnt.whatsapp), color: '#00e5a0', count: cnt.whatsapp },
    { name: 'Voice Inbound', value: pct(cnt.voice), color: '#a78bfa', count: cnt.voice },
    { name: 'Outbound Call', value: pct(cnt.outbound), color: '#ffb347', count: cnt.outbound },
    { name: 'Direct', value: hasPatients ? Math.max(0, 100 - pct(cnt.chat) - pct(cnt.whatsapp) - pct(cnt.voice) - pct(cnt.outbound)) : 0, color: '#5a7a9a', count: cnt.direct },
  ];

  const base = [
    { leads: 21, appointments: 14, conversions: 62, revenue: 118 },
    { leads: 26, appointments: 17, conversions: 65, revenue: 142 },
    { leads: 19, appointments: 12, conversions: 63, revenue: 101 },
    { leads: 31, appointments: 22, conversions: 71, revenue: 176 },
    { leads: 28, appointments: 19, conversions: 68, revenue: 155 },
    { leads: 17, appointments: 11, conversions: 64, revenue: 92 },
  ];
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString('en-IN', { weekday: 'short' });
    if (!hasData) {
      return { day, leads: 0, appointments: 0, conversions: 0, revenue: 0 };
    }
    if (i < 6) return { day, ...base[i] };
    return { day, leads: leadsToday, appointments: confirmedToday, conversions: Math.round(stats.conversionRate), revenue: Math.round(revenueToday / 100) };
  });

  const deptData = [...s.departments].sort((a, b) => b.totalLeads - a.totalLeads).slice(0, 6)
    .map((d) => ({ dept: d.name, leads: d.totalLeads, bookings: d.totalBookings, revenue: d.totalRevenue }));

  const recentLeads = [...s.patients].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 12).map((p) => ({
    id: p.id, name: nameOf(p), phone: p.phone, source: p.source.toLowerCase(), intent: p.intent.toLowerCase(),
    dept: p.department?.name ?? 'General', priority: p.tier === 'HOT' ? 'hot' : 'warm',
    status: p.patientStatus.toLowerCase(), time: timeOnly(p.createdAt),
  }));
  return { stats, sourceData, weeklyData, deptData, recentLeads };
}

function agentsForTabs(s: DemoState) {
  return s.agents.filter((a) => a.isActive).map((a, idx) => ({
    id: idx + 1, name: a.name,
    type: a.agentType === 'RECEPTION' ? 'inbound' : a.agentType === 'FOLLOW_UP' ? 'outbound' : 'chat',
    status: 'active', callsToday: a.callsToday, booked: a.bookedToday, conv: Math.round(a.conversionRate), last: relative(a.updatedAt),
  }));
}

function sectionVoice(s: DemoState) {
  const hours = [9, 10, 11, 12, 13, 14, 15, 16];
  const callData = hours.map((h) => {
    const rows = s.callLog.filter((c) => c.hour === h);
    return {
      time: bucketLabel(h),
      inbound: rows.filter((c) => c.direction === 'INBOUND').length,
      outbound: rows.filter((c) => c.direction === 'OUTBOUND').length,
      missed: rows.filter((c) => c.status !== 'COMPLETED').length,
      booked: rows.filter((c) => c.outcome === 'APPOINTMENT_BOOKED').length,
    };
  });
  const inbound = s.callLog.filter((c) => c.direction === 'INBOUND');
  const outbound = s.callLog.filter((c) => c.direction === 'OUTBOUND');
  const missed = s.callLog.filter((c) => c.status !== 'COMPLETED').length;
  const completed = s.callLog.filter((c) => c.status === 'COMPLETED');
  const liveQueue = s.callQueue.map((q, idx) => {
    const p = s.patients.find((x) => x.id === q.patientId);
    const st = q.status === 'IN_PROGRESS' ? 'in-progress' : q.status === 'RINGING' ? 'ringing' : 'queued';
    return { id: q.id, name: p ? nameOf(p) : 'Unknown', phone: p?.phone ?? '—', status: st, dept: p?.department?.name ?? 'General', agent: q.agent, pos: st === 'queued' ? idx - 1 : undefined };
  });
  const inScenarios = [
    ['CONSULTATION', 'Consultation Enquiry', '#6366f1'], ['EMERGENCY', 'Emergency Case', '#ff4d6d'], ['LAB_TEST', 'Lab Test / Scan', '#00e5a0'],
    ['COST_ENQUIRY', 'Treatment Cost Enquiry', '#ffb347'], ['DOCTOR_AVAILABILITY', 'Doctor Availability', '#a78bfa'], ['INSURANCE', 'Insurance / Cashless', '#22d3ee'],
    ['MATERNITY', 'Maternity Package', '#f472b6'], ['SECOND_OPINION', 'Second Opinion', '#94a3b8'], ['PHARMACY', 'Pharmacy / Medicine', '#f43f5e'],
    ['LOCATION', 'Location / Directions', '#c084fc'], ['RESCHEDULE', 'Reschedule / Cancel', '#fb7185'], ['GENERAL', 'General Enquiry', '#64748b'],
  ].map(([key, label, color]) => ({ key, label, color, count: inbound.filter((c) => c.scenario === key).length }));
  const outScenarios = [
    ['appointment_reminder', 'Appointment Reminder', '#00e5a0'], ['missed_call_followup', 'Missed Call Follow-up', '#6366f1'], ['health_checkup_promo', 'Health Checkup Promo', '#3b82f6'],
    ['patient_reactivation', 'Patient Reactivation', '#ffb347'], ['test_result_followup', 'Test Result Follow-up', '#22d3ee'], ['treatment_conversion', 'Treatment Conversion', '#8b5cf6'],
    ['feedback_review', 'Feedback & Review', '#34d399'], ['maternity_followup', 'Maternity Follow-up', '#f472b6'], ['medication_reminder', 'Medication Reminder', '#94a3b8'], ['post_discharge', 'Post-Discharge Follow-up', '#64748b'],
  ].map(([key, label, color]) => ({ key, label, color, count: outbound.filter((c) => c.purpose === key).length }));
  const avg = completed.length ? Math.round(completed.reduce((n, c) => n + c.durationSec, 0) / completed.length) : 0;
  return {
    callData, aiAgents: agentsForTabs(s), liveQueue,
    voice: {
      inbound: inbound.length, outbound: outbound.length, missed, booked: s.callLog.filter((c) => c.outcome === 'APPOINTMENT_BOOKED').length,
      avgDurationSec: avg, callbacks: { missed, done: s.callLog.filter((c) => c.isMissedCallback).length, booked: s.callLog.filter((c) => c.outcome === 'APPOINTMENT_BOOKED').length },
    },
    voiceScenarioStats: { inbound: inScenarios, outbound: outScenarios },
  };
}

function sectionAiChat(s: DemoState) {
  const counts: Record<string, number> = {};
  for (const c of s.conversations) counts[c.detectedIntent] = (counts[c.detectedIntent] ?? 0) + 1;
  const faqTopics = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([topic, count]) => ({ topic, count, handled: '—', trend: '—' }));
  const by = (ch: string) => {
    const rows = s.reminders.filter((r) => r.channel === ch);
    return { sent: rows.length, delivered: rows.filter((r) => r.status === 'DELIVERED').length };
  };
  return {
    aiAgents: agentsForTabs(s), faqTopics,
    chat: { activeChats: s.conversations.filter((c) => c.status === 'ACTIVE' && c.channel !== 'VOICE').length, bookedViaChat: s.appointments.filter((a) => sameDay(a.scheduledAt) && a.status === 'CONFIRMED').length, avgResponseSec: 4 },
    remindersByChannel: { whatsapp: by('WHATSAPP'), sms: by('SMS'), voice: by('VOICE_CALL') },
  };
}

function sectionAppointments(s: DemoState) {
  // The original returns the first 20 by date; the demo returns all sample appointments so the Today/Tomorrow/Week filters have data.
  const list = [...s.appointments].sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  return {
    appointments: list.map((a) => {
      const p = s.patients.find((x) => x.id === a.patientId);
      const doc = s.doctors.find((x) => x.id === a.doctorId);
      const dep = s.departments.find((x) => x.id === a.departmentId);
      const ui = a.status === 'CONFIRMED' ? 'confirmed' : a.status === 'REMINDER_SENT' ? 'reminder_sent' : a.status === 'NO_SHOW' ? 'no_show' : 'pending';
      return {
        id: a.id, patient: { id: p?.id, fullName: nameOf(p) }, doctor: { id: doc?.id ?? null, name: doc?.name ?? 'Dr. Unassigned' },
        department: { id: dep?.id ?? null, name: dep?.name ?? 'General' }, appointmentType: a.appointmentType ?? 'OPD', scheduledAt: a.scheduledAt, status: ui, notes: null,
      };
    }),
  };
}

function sectionCrm(s: DemoState) {
  const rows = [...s.patients].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 20);
  return {
    patients: rows.map((p) => ({
      id: p.id, name: nameOf(p), phone: p.phone, email: p.email, age: p.age, dept: p.department?.name ?? 'General', tags: p.tags,
      visits: p.totalVisits, lastVisit: relative(p.lastVisitAt), status: p.patientStatus === 'NEW' ? 'new' : 'active',
    })),
  };
}

// ───────────────────── simulated assistant ─────────────────────
function assistantReply(s: DemoState, message: string) {
  const m = message.toLowerCase();
  const hosp = s.hospitalName;
  if (/emergenc|ambulance|chest pain|accident/.test(m))
    return { message: `This sounds urgent. Please call our 24x7 emergency line or come directly to the ${hosp} Emergency Department right away. (Demo assistant – no real call is placed.)`, quickActions: ['Emergency location', 'Talk to a person'] };
  if (/book|appointment|slot|schedule/.test(m))
    return { message: 'I can help you book an appointment. Which department would you like — Cardiology, Orthopedics, Neurology, Pediatrics, Gynecology, General Medicine, Dermatology or ENT?', quickActions: ['Cardiology', 'Orthopedics', 'General Medicine', 'Pediatrics'] };
  const dep = s.departments.find((d) => m.includes(d.name.split(' ')[0].toLowerCase()));
  if (dep) {
    const docs = s.doctors.filter((d) => d.departmentId === dep.id).map((d) => `${d.name} (${d.specialization})`).join(', ');
    return { message: `${dep.name} doctors available: ${docs}. OPD runs Monday–Saturday, 9:00 AM – 5:00 PM. Would you like me to book a slot?`, quickActions: ['Book appointment', 'Consultation fee'] };
  }
  if (/doctor|specialist|available/.test(m))
    return { message: `We have ${s.doctors.length} doctors across ${s.departments.length} departments. Tell me the specialty you need and I'll check availability.`, quickActions: ['Cardiology', 'Pediatrics', 'Dermatology'] };
  if (/fee|cost|price|charge|package|insurance|cashless/.test(m))
    return { message: 'Consultation fees start at ₹600 depending on the doctor. We support cashless claims with major insurers. For a treatment estimate, share the procedure name.', quickActions: ['Book appointment', 'Insurance partners'] };
  if (/time|timing|open|hours/.test(m))
    return { message: 'OPD timings: Monday–Saturday, 9:00 AM – 5:00 PM. Emergency services are available 24x7.', quickActions: ['Book appointment', 'Find a doctor'] };
  if (/where|location|address|direction/.test(m))
    return { message: `${hosp} — you can find the full address and directions on the Settings page of this demo.`, quickActions: ['Book appointment'] };
  if (/hi|hello|hey|namaste/.test(m))
    return { message: `Hello! I'm MedAssist, the AI assistant at ${hosp}. I can help with appointments, doctor availability, timings and costs.`, quickActions: ['Book appointment', 'Find a doctor', 'OPD timings'] };
  return { message: "I'm a demo assistant, so my answers are scripted. Try asking about booking an appointment, a department (e.g. Cardiology), doctor availability, OPD timings or costs.", quickActions: ['Book appointment', 'Find a doctor', 'OPD timings'] };
}

// ───────────────────── router ─────────────────────
export function handleApi(method: string, rawUrl: string, body: any): Res {
  const s = load();
  const url = new URL(rawUrl, 'http://demo.local');
  const path = url.pathname.replace(/\/+$/, '');
  const q = url.searchParams;
  const m = method.toUpperCase();
  const seg = path.split('/').filter(Boolean); // ['api', ...]
  const route = '/' + seg.slice(1).join('/');
  const mutate = (res: Res) => { save(); return res; };

  // ── auth ──
  if (route === '/auth/me') return ok({ user: { id: 'demo-user', email: 'demo@hospitalcart.demo', firstName: 'Demo', lastName: 'Admin' } });
  if (route === '/auth/signout') return ok({ success: true });
  if (route === '/auth/signin' || route === '/auth/signup') {
    // Handled in the sign-in page (demo access); kept for completeness.
    return ok({ success: true });
  }

  // ── dashboard sections (the five hospital pages load these endpoints) ──
  if (m === 'GET') {
    switch (route) {
      case '/dashboard/overview': return ok({ ...sectionOverview(s), aiAgents: agentsForTabs(s), callData: sectionVoice(s).callData });
      case '/dashboard/ai-chat': return ok(sectionAiChat(s));
      case '/dashboard/voice': return ok(sectionVoice(s));
      case '/dashboard/appointments': return ok(sectionAppointments(s));
      case '/dashboard/crm': return ok(sectionCrm(s));
    }
  }

  // ── hospital dashboard (generic ?section= variant, used as fallback by the UI) ──
  if (route === '/hospital/dashboard' && m === 'GET') {
    switch (q.get('section') || 'overview') {
      case 'overview': return ok(sectionOverview(s));
      case 'voice': return ok(sectionVoice(s));
      case 'ai_chat': return ok(sectionAiChat(s));
      case 'appointments': return ok(sectionAppointments(s));
      case 'crm': return ok(sectionCrm(s));
      default: return err(`Unknown section: ${q.get('section')}`);
    }
  }

  // ── reference data ──
  if (route === '/departments') return ok({ success: true, departments: s.departments.map(({ id, name, code }) => ({ id, name, code })) });
  if (route === '/doctors/available') {
    const dep = q.get('departmentId');
    const doctors = s.doctors.filter((d) => !dep || d.departmentId === dep).map((d) => ({
      id: d.id, name: d.name, specialization: d.specialization, consultationFee: d.consultationFee,
      departmentId: d.departmentId, department: d.department, availableDays: d.availableDays, startTime: d.startTime, endTime: d.endTime,
    }));
    return ok({ success: true, doctors });
  }
  if (route === '/languages') return ok({ languages: [{ code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' }, { code: 'kn', name: 'Kannada' }] });

  // ── patients ──
  if (route === '/patients' && m === 'GET') {
    const search = (q.get('search') || '').toLowerCase();
    let rows = s.patients.filter((p) => !search || nameOf(p).toLowerCase().includes(search) || p.phone.includes(search));
    rows = [...rows].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const { rows: page, pagination } = paginate(rows, q);
    return ok({ success: true, patients: page.map((p) => ({ ...p, name: nameOf(p) })), pagination });
  }
  if (route === '/patients/create' && m === 'POST') {
    const firstName = String(body?.firstName ?? '').trim();
    const lastName = String(body?.lastName ?? '').trim();
    const fullName = String(body?.fullName ?? `${firstName} ${lastName}`).trim();
    if (!fullName) return err('Patient name is required');
    const phone = String(body?.phone ?? '').trim();
    if (!phone) return err('Phone number is required');
    if (s.patients.some((p) => p.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''))) return err('A patient with this phone number already exists', 409);
    const dep = s.departments.find((d) => d.id === body?.departmentId);
    const now = new Date().toISOString();
    const p = {
      id: uid('pat'), firstName: firstName || fullName.split(' ')[0], lastName: lastName || fullName.split(' ').slice(1).join(' '), fullName, phone,
      email: body?.email || '', age: Number(body?.age) || 30, gender: body?.gender || 'MALE', source: body?.source || 'direct', intent: body?.intent || 'consultation',
      tier: 'WARM', patientStatus: 'NEW', tags: ['new'], totalVisits: 0, lastVisitAt: null, departmentId: dep?.id ?? s.departments[5].id,
      department: { name: dep?.name ?? s.departments[5].name }, createdAt: now, updatedAt: now,
    };
    s.patients.unshift(p as any);
    return mutate(ok({ success: true, patient: { ...p, name: nameOf(p) } }, 201));
  }
  if (route === '/patients/contact' && m === 'POST') {
    const p = s.patients.find((x) => x.id === body?.patientId);
    s.sentLog.push({ at: new Date().toISOString(), kind: body?.channel || 'call', patientId: body?.patientId });
    return mutate(ok({ success: true, simulated: true, message: `Simulated ${String(body?.channel || body?.type || 'call')} to ${p ? nameOf(p) : 'patient'} (demo – no real contact made)` }));
  }
  if (route === '/patients/import-excel') return err('Excel import is disabled in the demo environment.', 501);

  // ── appointments ──
  if (route === '/appointments' && m === 'GET') {
    const status = q.get('status');
    let rows = s.appointments.filter((a) => !status || a.status === status.toUpperCase());
    rows = [...rows].sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
    const { rows: page, pagination } = paginate(rows, q);
    return ok({ success: true, appointments: page.map((a) => apptView(s, a)), pagination });
  }
  if (route === '/appointments' && m === 'POST') {
    if (!body?.patientId) return err('patientId is required');
    if (!body?.scheduledAt) return err('scheduledAt is required');
    const when = new Date(body.scheduledAt);
    if (isNaN(+when)) return err('Invalid scheduledAt date');
    if (!s.patients.find((p) => p.id === body.patientId)) return err('Patient not found', 404);
    const clash = body.doctorId && s.appointments.some((a) => a.doctorId === body.doctorId && a.scheduledAt === when.toISOString() && !['CANCELLED', 'NO_SHOW'].includes(a.status));
    if (clash) return err('That doctor already has an appointment at this time', 409);
    const doc = s.doctors.find((d) => d.id === body.doctorId);
    const a = {
      id: uid('appt'), patientId: body.patientId, doctorId: body.doctorId || null, departmentId: body.departmentId || doc?.departmentId || null,
      scheduledAt: when.toISOString(), duration: Number(body.duration) || 30, status: 'SCHEDULED', appointmentType: body.appointmentType || 'OPD',
      notes: body.notes || null, bookedVia: 'DASHBOARD', bookedAt: new Date().toISOString(), billingAmount: doc?.consultationFee ?? null,
    };
    s.appointments.push(a as any);
    const p = s.patients.find((x) => x.id === body.patientId)!;
    p.patientStatus = 'APPOINTMENT_PENDING';
    return mutate(ok({ success: true, appointment: apptView(s, a) }, 201));
  }
  if (route === '/appointments' && m === 'PATCH') {
    const a = s.appointments.find((x) => x.id === body?.appointmentId);
    if (!body?.appointmentId) return err('appointmentId is required');
    if (!a) return err('Appointment not found', 404);
    if (body.status) a.status = String(body.status).toUpperCase();
    if (body.notes) a.notes = body.notes;
    if (body.scheduledAt) a.scheduledAt = new Date(body.scheduledAt).toISOString();
    if (body.doctorId !== undefined) a.doctorId = body.doctorId || null;
    if (body.departmentId !== undefined) a.departmentId = body.departmentId || null;
    if (body.appointmentType) a.appointmentType = body.appointmentType;
    if (body.duration) a.duration = Number(body.duration);
    const p = s.patients.find((x) => x.id === a.patientId);
    if (p) {
      if (a.status === 'CONFIRMED') p.patientStatus = 'APPOINTMENT_CONFIRMED';
      else if (a.status === 'RESCHEDULED') p.patientStatus = 'APPOINTMENT_PENDING';
      else if (a.status === 'COMPLETED') { p.patientStatus = 'VISITED'; p.totalVisits += 1; p.lastVisitAt = new Date().toISOString(); }
    }
    return mutate(ok({ success: true, appointment: apptView(s, a) }));
  }
  if (route === '/appointments' && m === 'DELETE') {
    const id = body?.appointmentId || q.get('appointmentId') || q.get('id');
    const a = s.appointments.find((x) => x.id === id);
    if (!a) return err('Appointment not found', 404);
    a.status = 'CANCELLED';
    return mutate(ok({ success: true, appointment: apptView(s, a) }));
  }
  if (route === '/appointments/confirm' && m === 'POST') {
    const a = s.appointments.find((x) => x.id === body?.appointmentId);
    if (!body?.appointmentId) return err('Appointment ID is required');
    if (!a) return err('Appointment not found', 404);
    a.status = 'CONFIRMED';
    const p = s.patients.find((x) => x.id === a.patientId);
    if (p) p.patientStatus = 'APPOINTMENT_CONFIRMED';
    return mutate(ok({ success: true, simulated: true, message: 'Appointment confirmed. Confirmation message simulated (demo – nothing was sent).', appointment: apptView(s, a) }));
  }
  if (route === '/appointments/reminder' && m === 'POST') {
    const a = s.appointments.find((x) => x.id === (body?.appointmentId));
    if (!a) return err('Appointment not found', 404);
    if (a.status === 'SCHEDULED') a.status = 'REMINDER_SENT';
    s.reminders.push({ channel: 'WHATSAPP', status: 'DELIVERED' }, { channel: 'SMS', status: 'SENT' });
    return mutate(ok({
      success: true, simulated: true, message: 'Reminder simulated (demo – no real message was sent)',
      reminders: { whatsapp: { success: true }, sms: { success: true } },
    }));
  }
  if (route === '/appointments/book' && m === 'POST') return handleApi('POST', '/api/appointments', body);

  // ── leads ──
  if (route === '/leads' && m === 'GET') {
    const status = q.get('status'); const tier = q.get('tier'); const search = (q.get('search') || '').toLowerCase();
    let rows = s.leads.filter((l) => (!status || l.status === status) && (!tier || l.tier === tier) &&
      (!search || `${l.firstName} ${l.lastName} ${l.email} ${l.phone}`.toLowerCase().includes(search)));
    rows = [...rows].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    const { rows: page, pagination } = paginate(rows, q, 100);
    return ok({ success: true, leads: page, pagination: { page: pagination.page, limit: pagination.limit, total: pagination.total, pages: pagination.pages } });
  }
  if (route === '/leads' && m === 'DELETE') {
    const ids: string[] = body?.leadIds || body?.ids || [];
    if (!ids.length) return err('No lead IDs provided');
    const before = s.leads.length;
    s.leads = s.leads.filter((l) => !ids.includes(l.id));
    return mutate(ok({ success: true, deleted: before - s.leads.length }));
  }
  if (route === '/leads/create' && m === 'POST') {
    const email = String(body?.email ?? '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return err('A valid email is required');
    if (s.leads.some((l) => l.email === email)) return err('A lead with this email already exists', 409);
    const l = {
      id: uid('lead'), email, firstName: body?.firstName || null, lastName: body?.lastName || null, company: body?.company || null, phone: body?.phone || null,
      score: 40, tier: 'WARM', status: 'NEW', source: body?.source || 'manual', notes: body?.notes || null, assignedToId: null, createdAt: new Date().toISOString(),
    };
    s.leads.unshift(l as any);
    return mutate(ok({ success: true, lead: l }, 201));
  }
  if (route === '/leads/import-excel') return err('Excel import is disabled in the demo environment.', 501);
  const leadMatch = route.match(/^\/leads\/([^/]+)(?:\/(conversations))?$/);
  if (leadMatch) {
    const lead = s.leads.find((l) => l.id === leadMatch[1]);
    if (!lead) return err('Lead not found', 404);
    if (leadMatch[2] === 'conversations') {
      return ok({ success: true, conversations: s.conversations.slice(0, 2).map((c) => ({ id: c.id, channel: c.channel, status: c.status, startedAt: c.startedAt, summary: c.summary, messages: c.messages })) });
    }
    if (m === 'GET') return ok({ success: true, lead });
    if (m === 'PATCH' || m === 'PUT') { Object.assign(lead, body || {}); return mutate(ok({ success: true, lead })); }
    if (m === 'DELETE') { s.leads = s.leads.filter((l) => l.id !== lead.id); return mutate(ok({ success: true })); }
  }

  // ── conversations ──
  if (route === '/conversations' && m === 'GET') {
    const rows = [...s.conversations].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)).map((c) => {
      const p = s.patients.find((x) => x.id === c.patientId);
      return {
        id: c.id, channel: c.channel, status: c.status, startedAt: c.startedAt, summary: c.summary,
        patient: p ? { id: p.id, firstName: p.firstName, lastName: p.lastName, fullName: p.fullName, phone: p.phone } : null,
        lead: null, _count: { messages: c.messages.length }, messages: c.messages.slice(-1),
      };
    });
    return ok({ conversations: rows });
  }
  const convMatch = route.match(/^\/conversations\/([^/]+)$/);
  if (convMatch && m === 'GET') {
    const c = s.conversations.find((x) => x.id === convMatch[1]);
    if (!c) return err('Not found', 404);
    const p = s.patients.find((x) => x.id === c.patientId);
    const lastAppt = s.appointments.filter((a) => a.patientId === c.patientId).sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt))[0];
    return ok({
      conversation: {
        id: c.id, channel: c.channel, status: c.status, startedAt: c.startedAt, summary: c.summary, lead: null, messages: c.messages, agent: { id: 'agent_1', name: 'MedAssist' },
        patient: p ? { id: p.id, firstName: p.firstName, lastName: p.lastName, fullName: p.fullName, phone: p.phone, appointments: lastAppt ? [{ ...apptView(s, lastAppt), appointmentType: lastAppt.appointmentType, department: apptView(s, lastAppt).department, doctor: apptView(s, lastAppt).doctor }] : [] } : null,
      },
    });
  }
  if (route === '/conversations/export-file' || route === '/conversations/send-export') return err('Conversation export is disabled in the demo environment.', 501);

  // ── agents ──
  if (route === '/agent/default') {
    const a = s.agents.find((x) => x.isDefault) || s.agents[0];
    return ok({ agentId: a.id, agentName: a.name, isDefault: true });
  }
  if (route === '/agent/chat' && m === 'POST') {
    const text = String(body?.message ?? '').trim();
    if (!text) return err('message is required');
    const reply = assistantReply(s, text);
    return ok({ ...reply, sessionId: body?.sessionId || uid('sess'), simulated: true });
  }
  if (route === '/agent/widget') return ok({ success: true });
  if (route === '/agent/setup') return err('Agent setup (website crawl + knowledge base) needs the production backend and is disabled in the demo.', 501);
  if (route === '/agents' && m === 'GET') {
    return ok({ success: true, agents: s.agents.map((a) => ({ ...a, conversationCount: s.conversations.length })) });
  }
  const agentMatch = route.match(/^\/agents\/([^/]+)$/);
  if (agentMatch) {
    const a = s.agents.find((x) => x.id === agentMatch[1]);
    if (!a) return err('Agent not found', 404);
    if (m === 'DELETE') { if (a.isDefault) return err('The default agent cannot be deleted'); s.agents = s.agents.filter((x) => x.id !== a.id); return mutate(ok({ success: true })); }
    if (m === 'PATCH' || m === 'PUT') { Object.assign(a, body || {}, { updatedAt: new Date().toISOString() }); return mutate(ok({ success: true, agent: a })); }
    return ok({ success: true, agent: a });
  }

  // ── team / assignment / scheduler / dialer ──
  if (route === '/team' && m === 'GET') return ok({ success: true, members: s.team });
  if (route === '/team' && m === 'POST') {
    const mem = s.team.find((t) => t.id === body?.memberId);
    if (body?.action === 'toggle_availability' && mem) { mem.isAvailable = !!body.isAvailable; return mutate(ok({ success: true, member: mem })); }
    if (body?.action === 'update' && mem) { Object.assign(mem, Object.fromEntries(Object.entries({ maxLeadsPerDay: body.maxLeadsPerDay, languages: body.languages }).filter(([, v]) => v !== undefined))); return mutate(ok({ success: true, member: mem })); }
    if (body?.action === 'add_self') {
      const existing = s.team[0];
      return ok({ success: true, member: existing, alreadyExists: true });
    }
    return err('Unknown action');
  }
  if (route === '/assignment/assign') {
    const ids: string[] = m === 'PUT' ? body?.leadIds || [] : [body?.leadId].filter(Boolean);
    if (!ids.length) return err(m === 'PUT' ? 'leadIds array required' : 'leadId required');
    const pool = s.team.filter((t) => t.isAvailable);
    if (!pool.length) return mutate(ok({ success: false, error: 'No available team members' }));
    let assigned = 0;
    ids.forEach((id, i) => {
      const lead = s.leads.find((l) => l.id === id); if (!lead) return;
      const mem = pool[i % pool.length]; lead.assignedToId = mem.id; mem.currentLeadCount += 1; mem.totalAssigned += 1; assigned++;
    });
    return mutate(ok({ success: true, assigned, total: ids.length, failed: ids.length - assigned, results: ids.map((id) => ({ leadId: id, success: true })) }));
  }
  if (route === '/scheduler' && m === 'GET') {
    return ok({ success: true, jobs: s.scheduledJobs.map((j) => { const l = s.leads.find((x) => x.id === j.targetId); return { ...j, leadName: l ? `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() : undefined, leadEmail: l?.email }; }) });
  }
  if (route === '/scheduler' && m === 'POST') {
    const action = body?.action;
    if (action === 'cancel_all' || action === 'clear') { const n = s.scheduledJobs.length; s.scheduledJobs = []; return mutate(ok({ success: true, deleted: n })); }
    const leadIds: string[] = body?.leadIds || (body?.leadId ? [body.leadId] : []);
    if (!leadIds.length) return err('leadId required');
    leadIds.forEach((id) => s.scheduledJobs.push({ id: uid('job'), jobType: body?.type || 'CALL', targetId: id, scheduledFor: body?.scheduledFor || new Date(Date.now() + 3600e3).toISOString(), status: 'PENDING', attempts: 0 }));
    return mutate(ok({ success: true, jobId: s.scheduledJobs[s.scheduledJobs.length - 1].id, scheduled: leadIds.length, simulated: true }));
  }
  if (route === '/scheduler/process' || route === '/dialer/process' || route === '/dialer/worker') return ok({ success: true, processed: 0, simulated: true });
  if (route === '/dialer/queue' && m === 'GET') return ok({ success: true, queue: s.callQueue });
  if (route === '/dialer/queue' && m === 'POST') {
    const ids: string[] = body?.leadIds || (body?.leadId ? [body.leadId] : []);
    if (!ids.length) return err('leadId or leadIds required');
    return ok({ success: true, queued: ids.length, queueIds: ids.map(() => uid('q')), simulated: true });
  }
  if (route === '/dialer/bulk-upload') return err('Bulk upload is disabled in the demo environment.', 501);

  // ── email sequences ──
  if (route === '/email/sequences' && m === 'GET') return ok({ success: true, sequences: s.sequences });
  if (route === '/email/sequences-list') return ok({ success: true, sequences: s.sequences.map(({ id, name, isActive }) => ({ id, name, isActive })) });
  if (route === '/email/sequences' && m === 'POST') {
    if (body?.action === 'toggle' || (body?.sequenceId && body?.isActive !== undefined && !body?.name)) {
      const seq = s.sequences.find((x) => x.id === body.sequenceId);
      if (!seq) return err('Sequence not found', 404);
      seq.isActive = !!body.isActive; return mutate(ok({ success: true, isActive: seq.isActive }));
    }
    if (body?.action === 'enroll') return ok({ success: true, message: 'Lead enrolled in sequence' });
    if (!body?.name) return err('name is required');
    const seq = {
      id: uid('seq'), name: body.name, description: body.description ?? null, isActive: true, agent: { id: 'agent_1', name: 'MedAssist' }, enrollments: [],
      steps: (body.steps || []).map((st: any, i: number) => ({ id: uid('step'), stepNumber: i + 1, delayDays: st.delayDays ?? 0, delayHours: st.delayHours ?? 0, useAI: !!st.useAI, totalSent: 0, name: st.name ?? `Step ${i + 1}` })),
    };
    s.sequences.unshift(seq as any);
    return mutate(ok({ success: true, sequence: seq }));
  }
  if (route === '/email/enroll') return ok({ success: true, simulated: true, message: 'Lead enrolled in sequence (demo)' });
  if (route === '/email/send') return ok({ success: true, simulated: true, message: 'Email simulated (demo – nothing was sent)' });
  if (route === '/whatsapp/send') return ok({ success: true, simulated: true, message: 'WhatsApp message simulated (demo – nothing was sent)' });
  if (route === '/twilio/call') return ok({ success: true, simulated: true, message: 'Call simulated (demo – no real call placed)' });

  // ── dashboard helpers / settings ──
  if (route === '/dashboard/notifications') return ok({ success: true, notifications: s.notifications, unread: s.notifications.filter((n) => !n.read).length });
  if (route === '/dashboard/settings' || route === '/settings') return ok({ success: true, settings: { hospitalName: s.hospitalName, plan: 'DEMO' } });

  return err(`'${m} ${path}' is not available in the demo environment.`, 501);
}
