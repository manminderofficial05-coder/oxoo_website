// Run with: npm run test:demo  — exercises the in-browser demo API (no server/DB needed).
import { handleApi, resetDemo } from '../src/demo/api';

let passed = 0, failed = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}`, extra ?? ''); }
}
const get = (u: string) => handleApi('GET', u, undefined);
const send = (m: string, u: string, b?: any) => handleApi(m, u, b);

resetDemo(false);

console.log('Dashboard sections');
const ov = get('/api/hospital/dashboard?section=overview').body;
check('overview has stats/sourceData/weeklyData/deptData/recentLeads', ['stats', 'sourceData', 'weeklyData', 'deptData', 'recentLeads'].every((k) => k in ov));
check('conversion rate is within 0-100%', ov.stats.conversionRate >= 0 && ov.stats.conversionRate <= 100, ov.stats.conversionRate);
check('today leads >= 10 (populated KPIs)', ov.stats.todayLeads >= 10, ov.stats.todayLeads);
check('weeklyData has 7 days', ov.weeklyData.length === 7);
check('source percentages sum to ~100', Math.abs(ov.sourceData.reduce((n: number, x: any) => n + x.value, 0) - 100) <= 2);
const voice = get('/api/hospital/dashboard?section=voice').body;
check('voice has callData(8)/liveQueue/voiceScenarioStats', voice.callData.length === 8 && voice.liveQueue.length > 0 && voice.voiceScenarioStats.inbound.length === 12);
const chat = get('/api/hospital/dashboard?section=ai_chat').body;
check('ai_chat has remindersByChannel + faqTopics', !!chat.remindersByChannel && Array.isArray(chat.faqTopics));
check('appointments section lists items with ui status', get('/api/hospital/dashboard?section=appointments').body.appointments.length > 0);
check('crm section lists patients', get('/api/hospital/dashboard?section=crm').body.patients.length > 0);
check('unknown section -> 400', get('/api/hospital/dashboard?section=nope').status === 400);

console.log('Dashboard endpoints used by the five hospital pages (same validation as the UI)');
const o2 = get('/api/dashboard/overview').body;
check('/api/dashboard/overview passes UI validator (stats+sourceData+weeklyData)', !!(o2.stats && o2.sourceData && o2.weeklyData));
const a2 = get('/api/dashboard/ai-chat').body;
check('/api/dashboard/ai-chat passes UI validator (chat+aiAgents+faqTopics)', !!(a2.chat && a2.aiAgents && a2.faqTopics));
const v2 = get('/api/dashboard/voice').body;
check('/api/dashboard/voice passes UI validator (voice+callData+liveQueue)', !!(v2.voice && v2.callData && v2.liveQueue));
check('/api/dashboard/appointments passes UI validator', Array.isArray(get('/api/dashboard/appointments').body.appointments));
check('/api/dashboard/crm passes UI validator', Array.isArray(get('/api/dashboard/crm').body.patients));

console.log('Patients');
const before = get('/api/patients?limit=500').body.pagination.total;
check('create patient validates name/phone', send('POST', '/api/patients/create', { firstName: 'A' }).status === 400);
const created = send('POST', '/api/patients/create', { firstName: 'Test', lastName: 'Visitor', phone: '+91 90000 99999' });
check('create patient -> 201', created.status === 201, created.body);
check('duplicate phone -> 409', send('POST', '/api/patients/create', { firstName: 'Dup', phone: '+91 90000 99999' }).status === 409);
check('patient count +1', get('/api/patients?limit=500').body.pagination.total === before + 1);
check('search finds new patient', get('/api/patients?search=visitor').body.patients.some((p: any) => p.name === 'Test Visitor'));
const totalPatientsStat = get('/api/hospital/dashboard?section=overview').body.stats.totalPatients;
check('dashboard totalPatients reflects new record', totalPatientsStat === before + 1);

console.log('Appointments');
const pid = created.body.patient.id;
const when = new Date(Date.now() + 2 * 86400e3).toISOString();
check('book requires patientId', send('POST', '/api/appointments', { scheduledAt: when }).status === 400);
check('book rejects bad date', send('POST', '/api/appointments', { patientId: pid, scheduledAt: 'nope' }).status === 400);
const booked = send('POST', '/api/appointments', { patientId: pid, doctorId: 'doc_1', scheduledAt: when });
check('book -> 201 SCHEDULED', booked.status === 201 && booked.body.appointment.status === 'SCHEDULED', booked.body);
check('double-booking same doctor/time -> 409', send('POST', '/api/appointments', { patientId: pid, doctorId: 'doc_1', scheduledAt: when }).status === 409);
const aid = booked.body.appointment.id;
const pendingBefore = get('/api/hospital/dashboard?section=overview').body.stats.appointmentsPendingAllTime;
check('confirm -> CONFIRMED', send('POST', '/api/appointments/confirm', { appointmentId: aid }).body.appointment.status === 'CONFIRMED');
check('pending stat dropped after confirm', get('/api/hospital/dashboard?section=overview').body.stats.appointmentsPendingAllTime === pendingBefore - 1);
const rem = send('POST', '/api/appointments/reminder', { appointmentId: aid });
check('reminder is explicitly simulated', rem.body.simulated === true && /demo/i.test(rem.body.message));
check('PATCH reschedule/complete updates patient visits', (send('PATCH', '/api/appointments', { appointmentId: aid, status: 'COMPLETED' }), get('/api/patients?search=visitor').body.patients[0].totalVisits === 1));
check('DELETE cancels', send('DELETE', '/api/appointments', { appointmentId: aid }).body.appointment.status === 'CANCELLED');
check('unknown appointment -> 404', send('PATCH', '/api/appointments', { appointmentId: 'x', status: 'CONFIRMED' }).status === 404);

console.log('Leads / assignment / sequences');
check('lead create validates email', send('POST', '/api/leads/create', { email: 'bad' }).status === 400);
const lead = send('POST', '/api/leads/create', { email: 'new.lead@example.com', firstName: 'New' });
check('lead create -> 201', lead.status === 201);
check('duplicate lead email -> 409', send('POST', '/api/leads/create', { email: 'new.lead@example.com' }).status === 409);
const assign = send('PUT', '/api/assignment/assign', { leadIds: [lead.body.lead.id] });
check('bulk assign assigns to available member', assign.body.assigned === 1);
check('lead delete removes it', send('DELETE', '/api/leads', { leadIds: [lead.body.lead.id] }).body.deleted === 1);
const seq = send('POST', '/api/email/sequences', { name: 'My Sequence', steps: [{ name: 'One', delayDays: 0 }] });
check('sequence create + list', seq.body.success && get('/api/email/sequences').body.sequences[0].name === 'My Sequence');

console.log('Assistant, integrations, safety');
check('chat replies to booking intent', /department/i.test(send('POST', '/api/agent/chat', { message: 'I want to book an appointment' }).body.message));
check('chat rejects empty message', send('POST', '/api/agent/chat', { message: '' }).status === 400);
check('outbound call is simulated, not real', send('POST', '/api/twilio/call', {}).body.simulated === true);
check('excel import clearly disabled (501)', send('POST', '/api/patients/import-excel', {}).status === 501);
check('unknown route -> 501 not fake success', get('/api/does/not/exist').status === 501);

console.log('Reset');
resetDemo(true);
check('reset cleans patient count to 0', get('/api/patients?limit=500').body.pagination.total === 0);
check('reset cleans appointments to 0', get('/api/dashboard/appointments').body.appointments.length === 0);
check('adding patient after reset works', send('POST', '/api/patients/create', { firstName: 'Fresh', lastName: 'Patient', phone: '+91 99999 11111' }).status === 201);
check('patient count is now 1', get('/api/patients?limit=500').body.pagination.total === 1);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
