/**
 * Demo seed data (100% fictional). Dates are generated relative to "now" so the
 * dashboards always look current. No real patient, customer or credential data.
 */

export type DemoState = ReturnType<typeof buildSeed>;

const HOSPITAL_NAME = process.env.NEXT_PUBLIC_HOSPITAL_NAME || 'City Hospital';

// Small deterministic PRNG so every reset yields the same dataset.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (d: Date) => d.toISOString();
const addMin = (d: Date, m: number) => new Date(d.getTime() + m * 60000);
const atHour = (dayOffset: number, hour: number, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, min, 0, 0);
  return d;
};

const DEPARTMENTS = [
  ['Cardiology', 'CARD'],
  ['Orthopedics', 'ORTH'],
  ['Neurology', 'NEUR'],
  ['Pediatrics', 'PEDS'],
  ['Gynecology & Maternity', 'GYN'],
  ['General Medicine', 'GEN'],
  ['Dermatology', 'DERM'],
  ['ENT', 'ENT'],
] as const;

const DOCTORS: Array<[string, number, string]> = [
  ['Dr. Anitha Rao', 0, 'Interventional Cardiologist'],
  ['Dr. Vikram Shetty', 0, 'Cardiologist'],
  ['Dr. Rohan Mehta', 1, 'Orthopedic Surgeon'],
  ['Dr. Kavya Nair', 1, 'Sports Medicine'],
  ['Dr. Suresh Iyer', 2, 'Neurologist'],
  ['Dr. Meera Krishnan', 3, 'Pediatrician'],
  ['Dr. Arjun Desai', 3, 'Neonatologist'],
  ['Dr. Priya Venkatesh', 4, 'Obstetrician'],
  ['Dr. Lakshmi Reddy', 4, 'Gynecologist'],
  ['Dr. Imran Qureshi', 5, 'General Physician'],
  ['Dr. Neha Kulkarni', 5, 'Internal Medicine'],
  ['Dr. Sanjay Pillai', 6, 'Dermatologist'],
  ['Dr. Farah Siddiqui', 7, 'ENT Specialist'],
  ['Dr. Karthik Subramanian', 2, 'Neuro Surgeon'],
];

const FIRST = ['Aarav', 'Diya', 'Rahul', 'Sneha', 'Ishaan', 'Ananya', 'Mohammed', 'Fatima', 'Karan', 'Pooja', 'Siddharth', 'Nandini', 'Rajesh', 'Lakshmi', 'Varun', 'Meghana', 'Arvind', 'Shruti', 'Harish', 'Divya', 'Pranav', 'Tanvi', 'Gautam', 'Revathi', 'Naveen', 'Bhavana', 'Deepak', 'Swati', 'Manoj', 'Kritika', 'Abdul', 'Sunita', 'Prakash', 'Asha', 'Vinay', 'Rekha', 'Chetan', 'Geetha', 'Yash', 'Madhuri'];
const LAST = ['Sharma', 'Gowda', 'Patel', 'Nair', 'Reddy', 'Iyer', 'Khan', 'Bhat', 'Menon', 'Singh', 'Rao', 'Kumar', 'Hegde', 'Joshi', 'Shetty', 'Naidu', 'Verma', 'Pillai', 'Das', 'Kulkarni'];
const SOURCES = ['website chat', 'whatsapp', 'voice inbound', 'outbound call', 'direct'];
const INTENTS = ['consultation', 'follow-up', 'lab test', 'cost enquiry', 'second opinion', 'maternity package', 'health checkup'];
const TAGS = ['diabetic', 'hypertension', 'insurance', 'vip', 'follow-up due', 'new', 'cashless', 'senior'];
const STATUSES = ['NEW', 'CONTACTED', 'APPOINTMENT_PENDING', 'APPOINTMENT_CONFIRMED', 'VISITED'];

export function buildSeed() {
  const r = rng(20260101);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)];
  const now = new Date();

  const departments = DEPARTMENTS.map(([name, code], i) => ({
    id: `dept_${i + 1}`,
    name,
    code,
    isActive: true,
    totalLeads: 40 + Math.floor(r() * 90),
    totalBookings: 15 + Math.floor(r() * 45),
    totalRevenue: (80 + Math.floor(r() * 220)) * 1000,
  }));

  const doctors = DOCTORS.map(([name, deptIdx, specialization], i) => ({
    id: `doc_${i + 1}`,
    name,
    specialization,
    departmentId: departments[deptIdx].id,
    department: { name: departments[deptIdx].name },
    consultationFee: 600 + Math.floor(r() * 10) * 100,
    availableDays: [1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  }));

  const patients = Array.from({ length: 44 }).map((_, i) => {
    const firstName = FIRST[i % FIRST.length];
    const lastName = pick(LAST);
    const dept = pick(departments);
    // First 16 patients are "today's" new patients (created between midnight and now) so today's KPIs are populated.
    const minsSinceMidnight = Math.max(1, Math.floor((now.getTime() - new Date(now).setHours(0, 0, 0, 0)) / 60000));
    const created = i < 16 ? addMin(now, -Math.floor(r() * minsSinceMidnight)) : addMin(now, -Math.floor(r() * 60 * 24 * 28) - minsSinceMidnight);
    const visits = Math.floor(r() * 6);
    const tagCount = Math.floor(r() * 3);
    const tags = Array.from(new Set(Array.from({ length: tagCount }).map(() => pick(TAGS))));
    return {
      id: `pat_${i + 1}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      phone: `+91 90000 ${String(10000 + i * 37).slice(-5)}`,
      email: `${firstName}.${lastName}${i}@example.com`.toLowerCase(),
      age: 6 + Math.floor(r() * 75),
      gender: r() > 0.5 ? 'FEMALE' : 'MALE',
      source: pick(SOURCES),
      intent: pick(INTENTS),
      tier: r() > 0.7 ? 'HOT' : r() > 0.4 ? 'WARM' : 'COLD',
      patientStatus: pick(STATUSES),
      tags,
      totalVisits: visits,
      lastVisitAt: visits > 0 ? iso(addMin(now, -Math.floor(r() * 60 * 24 * 90))) : null,
      departmentId: dept.id,
      department: { name: dept.name },
      createdAt: iso(created),
      updatedAt: iso(created),
    };
  });

  const TYPES = ['OPD', 'FOLLOW_UP', 'TELECONSULT', 'DIAGNOSTIC'];
  const APPT_STATUS = ['SCHEDULED', 'CONFIRMED', 'REMINDER_SENT', 'CONFIRMED', 'COMPLETED', 'NO_SHOW', 'CONFIRMED'];
  const appointments = Array.from({ length: 34 }).map((_, i) => {
    const p = patients[i % patients.length];
    const doc = doctors.find((d) => d.departmentId === p.departmentId) || doctors[0];
    const dayOffset = i < 12 ? 0 : i < 26 ? Math.floor(r() * 6) + 1 : -Math.floor(r() * 3) - 1;
    const when = atHour(dayOffset, 9 + (i % 8), (i % 2) * 30);
    const status = dayOffset < 0 ? pick(['COMPLETED', 'COMPLETED', 'NO_SHOW', 'CANCELLED']) : pick(APPT_STATUS.slice(0, 4));
    return {
      id: `appt_${i + 1}`,
      patientId: p.id,
      doctorId: doc.id,
      departmentId: p.departmentId,
      scheduledAt: iso(when),
      duration: 30,
      status,
      appointmentType: pick(TYPES),
      notes: null as string | null,
      bookedVia: pick(['CHAT', 'WHATSAPP', 'VOICE', 'DASHBOARD']),
      bookedAt: iso(addMin(when, -60 * 24 * 2)),
      billingAmount: status === 'COMPLETED' || status === 'CONFIRMED' ? doc.consultationFee : null,
    };
  });

  const leads = Array.from({ length: 26 }).map((_, i) => {
    const firstName = FIRST[(i * 3 + 5) % FIRST.length];
    const lastName = pick(LAST);
    const status = pick(['NEW', 'CONTACTED', 'QUALIFIED', 'MEETING_BOOKED', 'WON', 'LOST']);
    const score = 20 + Math.floor(r() * 80);
    return {
      id: `lead_${i + 1}`,
      email: `${firstName}.${lastName}${i}@example.com`.toLowerCase(),
      firstName,
      lastName,
      company: pick(['Self', 'Corporate Health Plan', 'Insurance Referral', 'Walk-in Camp', null]),
      phone: `+91 90001 ${String(20000 + i * 41).slice(-5)}`,
      score,
      tier: score > 75 ? 'HOT' : score > 45 ? 'WARM' : 'COLD',
      status,
      source: pick(SOURCES),
      notes: null as string | null,
      assignedToId: null as string | null,
      createdAt: iso(addMin(now, -Math.floor(r() * 60 * 24 * 14))),
    };
  });

  const agents = [
    { id: 'agent_1', name: 'MedAssist', role: 'Hospital AI Assistant', agentType: 'RECEPTION', isActive: true, isDefault: true, companyName: HOSPITAL_NAME, welcomeMessage: `Hello! I'm MedAssist, your AI healthcare assistant at ${HOSPITAL_NAME}. How can I help you today?`, callsToday: 42, bookedToday: 17, conversionRate: 40 },
    { id: 'agent_2', name: 'CareCall', role: 'Follow-up Voice Agent', agentType: 'FOLLOW_UP', isActive: true, isDefault: false, companyName: HOSPITAL_NAME, welcomeMessage: 'Namaste! This is CareCall following up on your recent visit.', callsToday: 28, bookedToday: 9, conversionRate: 32 },
    { id: 'agent_3', name: 'ChatBuddy', role: 'Website & WhatsApp Chat Agent', agentType: 'CHAT', isActive: true, isDefault: false, companyName: HOSPITAL_NAME, welcomeMessage: 'Hi! Ask me about doctors, timings or booking an appointment.', callsToday: 63, bookedToday: 21, conversionRate: 33 },
  ].map((a) => ({ ...a, createdAt: iso(addMin(now, -60 * 24 * 40)), updatedAt: iso(addMin(now, -37)) }));

  const conversations = Array.from({ length: 14 }).map((_, i) => {
    const p = patients[i * 2];
    const channel = pick(['CHAT', 'WHATSAPP', 'VOICE']);
    const started = addMin(now, -Math.floor(r() * 60 * 24 * 5));
    const topic = pick(INTENTS);
    return {
      id: `conv_${i + 1}`,
      channel,
      status: i < 3 ? 'ACTIVE' : 'COMPLETED',
      startedAt: iso(started),
      summary: `Patient enquired about ${topic}. Assistant shared timings and offered to book an appointment.`,
      detectedIntent: topic,
      patientId: p.id,
      messages: [
        { id: `m_${i}_1`, role: 'user', content: `Hi, I would like to know about ${topic}.`, createdAt: iso(started) },
        { id: `m_${i}_2`, role: 'assistant', content: `Sure! I can help with ${topic}. Which department or doctor are you looking for?`, createdAt: iso(addMin(started, 1)) },
        { id: `m_${i}_3`, role: 'user', content: 'Whoever is available tomorrow morning.', createdAt: iso(addMin(started, 2)) },
        { id: `m_${i}_4`, role: 'assistant', content: 'Dr. Anitha Rao has a slot at 10:30 AM tomorrow. Shall I book it for you?', createdAt: iso(addMin(started, 3)) },
      ],
    };
  });

  const team = [
    { id: 'tm_1', userId: 'demo-user', isAvailable: true, currentLeadCount: 4, maxLeadsPerDay: 25, totalAssigned: 112, languages: ['en', 'hi', 'kn'], role: 'Front Desk Lead', user: { firstName: 'Demo', lastName: 'Admin', email: 'demo@hospitalcart.demo', imageUrl: null } },
    { id: 'tm_2', userId: 'u2', isAvailable: true, currentLeadCount: 7, maxLeadsPerDay: 20, totalAssigned: 98, languages: ['en', 'hi'], role: 'Patient Coordinator', user: { firstName: 'Nisha', lastName: 'Rao', email: 'nisha@example.com', imageUrl: null } },
    { id: 'tm_3', userId: 'u3', isAvailable: false, currentLeadCount: 0, maxLeadsPerDay: 20, totalAssigned: 76, languages: ['en', 'kn'], role: 'Patient Coordinator', user: { firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@example.com', imageUrl: null } },
  ];

  const sequences = [
    { id: 'seq_1', name: 'New Patient Welcome', description: 'Welcomes new enquiries and shares doctor availability.', isActive: true, agent: { id: 'agent_1', name: 'MedAssist' }, enrollments: [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }], steps: [
      { id: 's1', stepNumber: 1, delayDays: 0, delayHours: 0, useAI: true, totalSent: 38, name: 'Welcome message' },
      { id: 's2', stepNumber: 2, delayDays: 2, delayHours: 0, useAI: true, totalSent: 29, name: 'Doctor availability' },
      { id: 's3', stepNumber: 3, delayDays: 5, delayHours: 0, useAI: false, totalSent: 17, name: 'Booking reminder' },
    ] },
    { id: 'seq_2', name: 'Post-Visit Follow-up', description: 'Feedback request and follow-up reminders after a visit.', isActive: true, agent: { id: 'agent_2', name: 'CareCall' }, enrollments: [{ id: 'e4' }], steps: [
      { id: 's4', stepNumber: 1, delayDays: 1, delayHours: 0, useAI: true, totalSent: 24, name: 'How are you feeling?' },
      { id: 's5', stepNumber: 2, delayDays: 7, delayHours: 0, useAI: false, totalSent: 12, name: 'Follow-up visit reminder' },
    ] },
    { id: 'seq_3', name: 'Health Checkup Promo', description: 'Annual preventive health checkup campaign.', isActive: false, agent: { id: 'agent_3', name: 'ChatBuddy' }, enrollments: [], steps: [
      { id: 's6', stepNumber: 1, delayDays: 0, delayHours: 0, useAI: false, totalSent: 0, name: 'Checkup offer' },
    ] },
  ];

  // Today's call-centre data (used by the Voice AI tab)
  const callLog = Array.from({ length: 58 }).map((_, i) => {
    const hour = 9 + Math.floor(r() * 8);
    const outbound = r() > 0.6;
    const missed = r() > 0.85;
    return {
      id: `call_${i + 1}`,
      hour,
      direction: outbound ? 'OUTBOUND' : 'INBOUND',
      status: missed ? 'NO_ANSWER' : 'COMPLETED',
      outcome: !missed && r() > 0.6 ? 'APPOINTMENT_BOOKED' : 'INFORMATION',
      isMissedCallback: missed && r() > 0.5,
      durationSec: 40 + Math.floor(r() * 260),
      scenario: pick(['CONSULTATION', 'LAB_TEST', 'COST_ENQUIRY', 'DOCTOR_AVAILABILITY', 'INSURANCE', 'MATERNITY', 'GENERAL', 'EMERGENCY', 'RESCHEDULE']),
      purpose: pick(['appointment_reminder', 'missed_call_followup', 'health_checkup_promo', 'patient_reactivation', 'test_result_followup', 'feedback_review']),
    };
  });

  const callQueue = [
    { id: 'q1', status: 'IN_PROGRESS', patientId: 'pat_3', agent: 'CareCall' },
    { id: 'q2', status: 'RINGING', patientId: 'pat_8', agent: 'CareCall' },
    { id: 'q3', status: 'QUEUED', patientId: 'pat_12', agent: 'MedAssist' },
    { id: 'q4', status: 'QUEUED', patientId: 'pat_15', agent: 'MedAssist' },
    { id: 'q5', status: 'QUEUED', patientId: 'pat_21', agent: 'CareCall' },
  ];

  const reminders = [
    { channel: 'WHATSAPP', status: 'DELIVERED' }, { channel: 'WHATSAPP', status: 'DELIVERED' },
    { channel: 'WHATSAPP', status: 'DELIVERED' }, { channel: 'WHATSAPP', status: 'SENT' },
    { channel: 'SMS', status: 'DELIVERED' }, { channel: 'SMS', status: 'SENT' },
    { channel: 'VOICE_CALL', status: 'DELIVERED' },
  ];

  const notifications = [
    { id: 'n1', title: 'New appointment booked by AI', body: 'MedAssist booked a Cardiology consultation for tomorrow 10:30 AM.', createdAt: iso(addMin(now, -12)), read: false, type: 'appointment' },
    { id: 'n2', title: 'Missed call needs callback', body: 'A missed inbound call from a returning patient is waiting for a callback.', createdAt: iso(addMin(now, -55)), read: false, type: 'call' },
    { id: 'n3', title: 'Reminder campaign finished', body: '24 WhatsApp reminders delivered for tomorrow\'s OPD appointments.', createdAt: iso(addMin(now, -190)), read: true, type: 'reminder' },
  ];

  return {
    version: 1,
    hospitalName: HOSPITAL_NAME,
    departments,
    doctors,
    patients,
    appointments,
    leads,
    agents,
    conversations,
    team,
    sequences,
    callLog,
    callQueue,
    reminders,
    notifications,
    scheduledJobs: [] as any[],
    sentLog: [] as any[],
    counters: { patient: patients.length, appointment: appointments.length, lead: leads.length, job: 0, sequence: sequences.length, conv: conversations.length },
  };
}

export function buildEmptySeed(): DemoState {
  const departments = DEPARTMENTS.map(([name, code], i) => ({
    id: `dept_${i + 1}`,
    name,
    code,
    isActive: true,
    totalLeads: 0,
    totalBookings: 0,
    totalRevenue: 0,
  }));

  const doctors = DOCTORS.map(([name, deptIdx, specialization], i) => ({
    id: `doc_${i + 1}`,
    name,
    specialization,
    departmentId: departments[deptIdx].id,
    department: { name: departments[deptIdx].name },
    consultationFee: 600,
    availableDays: [1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  }));

  const agents = [
    { id: 'agent_1', name: 'MedAssist', role: 'Hospital AI Assistant', agentType: 'RECEPTION', isActive: true, isDefault: true, companyName: HOSPITAL_NAME, welcomeMessage: `Hello! I'm MedAssist, your AI healthcare assistant at ${HOSPITAL_NAME}. How can I help you today?`, callsToday: 0, bookedToday: 0, conversionRate: 0 },
    { id: 'agent_2', name: 'CareCall', role: 'Follow-up Voice Agent', agentType: 'FOLLOW_UP', isActive: true, isDefault: false, companyName: HOSPITAL_NAME, welcomeMessage: 'Namaste! This is CareCall following up on your recent visit.', callsToday: 0, bookedToday: 0, conversionRate: 0 },
    { id: 'agent_3', name: 'ChatBuddy', role: 'Website & WhatsApp Chat Agent', agentType: 'CHAT', isActive: true, isDefault: false, companyName: HOSPITAL_NAME, welcomeMessage: 'Hi! Ask me about doctors, timings or booking an appointment.', callsToday: 0, bookedToday: 0, conversionRate: 0 },
  ].map((a) => ({ ...a, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));

  const team = [
    { id: 'tm_1', userId: 'demo-user', isAvailable: true, currentLeadCount: 0, maxLeadsPerDay: 25, totalAssigned: 0, languages: ['en', 'hi', 'kn'], role: 'Front Desk Lead', user: { firstName: 'Demo', lastName: 'Admin', email: 'demo@hospitalcart.demo', imageUrl: null } },
    { id: 'tm_2', userId: 'u2', isAvailable: true, currentLeadCount: 0, maxLeadsPerDay: 20, totalAssigned: 0, languages: ['en', 'hi'], role: 'Patient Coordinator', user: { firstName: 'Nisha', lastName: 'Rao', email: 'nisha@example.com', imageUrl: null } },
    { id: 'tm_3', userId: 'u3', isAvailable: false, currentLeadCount: 0, maxLeadsPerDay: 20, totalAssigned: 0, languages: ['en', 'kn'], role: 'Patient Coordinator', user: { firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@example.com', imageUrl: null } },
  ];

  return {
    version: 1,
    hospitalName: HOSPITAL_NAME,
    departments,
    doctors,
    patients: [],
    appointments: [],
    leads: [],
    agents,
    conversations: [],
    team,
    sequences: [],
    callLog: [],
    callQueue: [],
    reminders: [],
    notifications: [],
    scheduledJobs: [] as any[],
    sentLog: [] as any[],
    counters: { patient: 0, appointment: 0, lead: 0, job: 0, sequence: 0, conv: 0 },
  };
}
