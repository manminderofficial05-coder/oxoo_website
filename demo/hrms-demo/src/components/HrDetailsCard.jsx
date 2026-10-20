import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Landmark,
  Lock,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Unlock,
  UserRound,
  Users,
} from 'lucide-react';
import api from '../api/axios';
import { Card } from './dash';
import { Modal } from './ui';
import { Section, Field, TextInput } from './formFields';
import { fmtDate, toInputDate } from '../utils/format';

const AADHAAR_RE = /^\d{12}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;

const areaClass =
  'block w-full rounded-xl bg-white px-3.5 py-2.5 text-sm font-medium text-ink outline-none ring-1 ring-black/10 placeholder:text-black/35 focus:ring-2 focus:ring-role';

// Keeps the last 4 characters, masks the rest (display only)
const maskValue = (v) => (v ? `${'•'.repeat(Math.max(String(v).length - 4, 0))}${String(v).slice(-4)}` : v);

/* ------------------------------ Display pieces ------------------------------ */

function Row({ label, value, mono = false, wide = false }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-black/40">{label}</p>
      {value ? (
        <p className={`mt-0.5 break-words text-sm font-bold ${mono ? 'font-mono tracking-wide' : ''}`}>{value}</p>
      ) : (
        <p className="mt-0.5 text-sm font-medium italic text-black/30">Not provided</p>
      )}
    </div>
  );
}

function Panel({ icon: Icon, title, action, children }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-page/50 p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-role/10 text-role">
          <Icon size={16} />
        </div>
        <h3 className="flex-1 text-sm font-extrabold">{title}</h3>
        {action}
      </div>
      <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/* --------------------------------- Edit form -------------------------------- */

function HrForm({ employee, onSaved, onCancel }) {
  const hr = employee.hrDetails || {};
  const nom = employee.nominee || {};
  const initialContacts = employee.emergencyContacts?.length ? employee.emergencyContacts : [{}];

  const [form, setForm] = useState({
    aadhaarNumber: hr.aadhaarNumber || '',
    panNumber: hr.panNumber || '',
    bankAccountNumber: hr.bankAccountNumber || '',
    ifscCode: hr.ifscCode || '',
    bankName: hr.bankName || '',
    dateOfBirth: toInputDate(hr.dateOfBirth),
    guardianName: hr.guardianName || '',
    currentAddress: hr.currentAddress || '',
    permanentAddress: hr.permanentAddress || '',
    previousUan: hr.previousUan || '',
    previousPfMemberId: hr.previousPfMemberId || '',
  });
  const [nominee, setNominee] = useState({
    name: nom.name || '',
    relationship: nom.relationship || '',
    dateOfBirth: toInputDate(nom.dateOfBirth),
    address: nom.address || '',
    aadhaarNumber: nom.aadhaarNumber || '',
  });
  const [contacts, setContacts] = useState(
    initialContacts.map((c) => ({ name: c.name || '', phone: c.phone || '', relation: c.relation || '' }))
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const clearError = (k) => setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  const set = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    clearError(e.target.name);
  };
  const setNom = (e) => {
    setNominee((n) => ({ ...n, [e.target.name]: e.target.value }));
    clearError(`nominee_${e.target.name}`);
  };
  const setContact = (i, key, value) => {
    setContacts((list) => list.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
    clearError(`contact_${i}`);
  };
  const addContact = () => contacts.length < 2 && setContacts([...contacts, { name: '', phone: '', relation: '' }]);
  const removeContact = (i) => setContacts(contacts.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (form.aadhaarNumber && !AADHAAR_RE.test(form.aadhaarNumber.trim())) e.aadhaarNumber = 'Aadhaar must be 12 digits';
    if (form.panNumber && !PAN_RE.test(form.panNumber.trim().toUpperCase())) e.panNumber = 'Format: ABCDE1234F';
    if (form.ifscCode && !IFSC_RE.test(form.ifscCode.trim().toUpperCase())) e.ifscCode = 'Format: SBIN0001234';
    if (nominee.aadhaarNumber && !AADHAAR_RE.test(nominee.aadhaarNumber.trim())) {
      e.nominee_aadhaarNumber = 'Aadhaar must be 12 digits';
    }
    contacts.forEach((c, i) => {
      if (c.phone && !PHONE_RE.test(c.phone.trim())) e[`contact_${i}`] = 'Enter a valid phone number';
    });
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      setError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const cleanContacts = contacts.filter((c) => c.name || c.phone || c.relation);
      await api.patch(`/employees/${employee._id}`, {
        hrDetails: form,
        nominee,
        emergencyContacts: cleanContacts,
      });
      const { data } = await api.get(`/employees/${employee._id}`);
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save HR details');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="light-fields flex min-h-0 flex-1 flex-col">
      {/* The one scrolling area */}
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-5 sm:px-8">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <Section icon={FileText} title="Identity">
          <Field id="hr-aadhaar" label="Aadhaar number" required error={errors.aadhaarNumber}>
            <TextInput id="hr-aadhaar" name="aadhaarNumber" value={form.aadhaarNumber} onChange={set} error={errors.aadhaarNumber} maxLength={12} placeholder="12 digits" inputMode="numeric" />
          </Field>
          <Field id="hr-pan" label="PAN number" error={errors.panNumber}>
            <TextInput id="hr-pan" name="panNumber" value={form.panNumber} onChange={set} error={errors.panNumber} maxLength={10} placeholder="ABCDE1234F" className="uppercase placeholder:normal-case" />
          </Field>
          <Field id="hr-dob" label="Date of birth">
            <TextInput id="hr-dob" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={set} />
          </Field>
          <Field id="hr-guardian" label="Father's / Mother's / Spouse's name">
            <TextInput id="hr-guardian" name="guardianName" value={form.guardianName} onChange={set} />
          </Field>
          {/* <div className="sm:col-span-2">
            <Field id="hr-photo" label="Passport photo" hint="(link)">
              <TextInput id="hr-photo" name="photoUrl" value={form.photoUrl} onChange={set} placeholder="https://…" />
            </Field>
          </div> */}
        </Section>

        <Section icon={Landmark} title="Bank account">
          <Field id="hr-bank" label="Bank name">
            <TextInput id="hr-bank" name="bankName" value={form.bankName} onChange={set} />
          </Field>
          <Field id="hr-account" label="Account number">
            <TextInput id="hr-account" name="bankAccountNumber" value={form.bankAccountNumber} onChange={set} inputMode="numeric" />
          </Field>
          <Field id="hr-ifsc" label="IFSC code" error={errors.ifscCode}>
            <TextInput id="hr-ifsc" name="ifscCode" value={form.ifscCode} onChange={set} error={errors.ifscCode} maxLength={11} placeholder="SBIN0001234" className="uppercase placeholder:normal-case" />
          </Field>
        </Section>

        <Section icon={MapPin} title="Address & previous PF">
          <div className="sm:col-span-2">
            <Field id="hr-current" label="Current residential address">
              <textarea id="hr-current" name="currentAddress" value={form.currentAddress} onChange={set} rows={2} className={areaClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field id="hr-permanent" label="Permanent address">
              <textarea id="hr-permanent" name="permanentAddress" value={form.permanentAddress} onChange={set} rows={2} className={areaClass} />
            </Field>
          </div>
          <Field id="hr-uan" label="Previous UAN">
            <TextInput id="hr-uan" name="previousUan" value={form.previousUan} onChange={set} />
          </Field>
          <Field id="hr-pfid" label="Previous PF member ID">
            <TextInput id="hr-pfid" name="previousPfMemberId" value={form.previousPfMemberId} onChange={set} />
          </Field>
        </Section>

        <Section icon={Users} title="Nominee">
          <Field id="nm-name" label="Nominee name">
            <TextInput id="nm-name" name="name" value={nominee.name} onChange={setNom} />
          </Field>
          <Field id="nm-rel" label="Relationship">
            <TextInput id="nm-rel" name="relationship" value={nominee.relationship} onChange={setNom} />
          </Field>
          <Field id="nm-dob" label="Date of birth">
            <TextInput id="nm-dob" type="date" name="dateOfBirth" value={nominee.dateOfBirth} onChange={setNom} />
          </Field>
          <Field id="nm-aadhaar" label="Aadhaar" hint="(where applicable)" error={errors.nominee_aadhaarNumber}>
            <TextInput id="nm-aadhaar" name="aadhaarNumber" value={nominee.aadhaarNumber} onChange={setNom} error={errors.nominee_aadhaarNumber} maxLength={12} inputMode="numeric" />
          </Field>
          <div className="sm:col-span-2">
            <Field id="nm-address" label="Address">
              <textarea id="nm-address" name="address" value={nominee.address} onChange={setNom} rows={2} className={areaClass} />
            </Field>
          </div>
        </Section>

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-black/55">
            <Phone size={15} className="text-role" />
            Emergency contacts
            <span className="h-px flex-1 bg-black/5" />
            {contacts.length < 2 && (
              <button type="button" onClick={addContact} className="flex items-center gap-1 text-xs font-bold normal-case tracking-normal text-role hover:underline">
                <Plus size={14} /> Add contact
              </button>
            )}
          </h3>
          <div className="space-y-3">
            {contacts.map((c, i) => (
              <div key={i} className="rounded-xl border border-black/5 bg-page/50 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field id={`ec-name-${i}`} label="Name">
                    <TextInput id={`ec-name-${i}`} value={c.name} onChange={(e) => setContact(i, 'name', e.target.value)} />
                  </Field>
                  <Field id={`ec-phone-${i}`} label="Phone" error={errors[`contact_${i}`]}>
                    <TextInput id={`ec-phone-${i}`} type="tel" value={c.phone} onChange={(e) => setContact(i, 'phone', e.target.value)} error={errors[`contact_${i}`]} />
                  </Field>
                  <Field id={`ec-rel-${i}`} label="Relation">
                    <div className="flex gap-2">
                      <TextInput id={`ec-rel-${i}`} value={c.relation} onChange={(e) => setContact(i, 'relation', e.target.value)} />
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(i)}
                          aria-label="Remove contact"
                          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-accent ring-1 ring-black/10 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Fixed footer: always visible, never part of the scroll */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/5 bg-surface/60 px-6 py-4 sm:px-8">
        <p className="hidden text-xs text-black/45 sm:block">
          <span className="text-accent">*</span> Required for PF records
        </p>
        <div className="ml-auto flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-full bg-white px-6 text-sm font-semibold ring-1 ring-black/10 hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-full bg-accent px-7 text-sm font-bold text-white shadow-sm shadow-accent/30 hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save details'}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ----------------------------------- Card ----------------------------------- */

// Admin or the employee themselves only — a manager viewing a report's
// profile gets none of this data from the server.
export default function HrDetailsCard({ employee, isAdmin, isSelf, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [lockBusy, setLockBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isAdmin && !isSelf) return null;

  const hr = employee.hrDetails || {};
  const nom = employee.nominee || {};
  const contacts = employee.emergencyContacts || [];
  const locked = !!hr.locked;
  const canEdit = isAdmin || (isSelf && !locked);

  // What a complete HR/PF record needs
  const checklist = [
    ['Aadhaar', hr.aadhaarNumber],
    ['PAN', hr.panNumber],
    ['Bank account', hr.bankAccountNumber],
    ['IFSC', hr.ifscCode],
    ['Bank name', hr.bankName],
    ['Date of birth', hr.dateOfBirth],
    ['Family member name', hr.guardianName],
    ['Current address', hr.currentAddress],
    ['Permanent address', hr.permanentAddress],
    ['Nominee', nom.name],
    ['Emergency contact', contacts.length > 0],
  ];
  const missing = checklist.filter(([, ok]) => !ok).map(([name]) => name);
  const done = checklist.length - missing.length;
  const pct = Math.round((done / checklist.length) * 100);
  const complete = missing.length === 0;

  const secret = (v) => (reveal ? v : maskValue(v));

  const toggleLock = async () => {
    setLockBusy(true);
    setError('');
    try {
      const { data } = await api.patch(`/employees/${employee._id}/hr-lock`, { locked: !locked });
      onUpdated(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change the lock');
    } finally {
      setLockBusy(false);
    }
  };

  return (
    <Card
      title="HR & PF details"
      subtitle="Used for PF registration and payroll records"
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => setReveal((r) => !r)}
            className="flex items-center gap-1.5 rounded-full bg-page px-4 py-2 text-xs font-bold hover:bg-black/10"
          >
            {reveal ? <EyeOff size={13} /> : <Eye size={13} />} {reveal ? 'Hide numbers' : 'Show numbers'}
          </button>
          {isAdmin && (
            <button
              onClick={toggleLock}
              disabled={lockBusy}
              className="flex items-center gap-1.5 rounded-full bg-page px-4 py-2 text-xs font-bold hover:bg-black/10 disabled:opacity-60"
            >
              {locked ? <Unlock size={13} /> : <Lock size={13} />} {locked ? 'Unlock' : 'Lock'}
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-role px-4 py-2 text-xs font-bold text-white hover:opacity-90"
            >
              <Pencil size={13} /> {complete || done > 0 ? 'Edit details' : 'Add details'}
            </button>
          )}
        </div>
      }
    >
      {error && <div className="mb-4 rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">{error}</div>}

      {/* Status strip: completeness + lock state */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-page/50 p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-extrabold">
              {complete ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={18} className="text-amber-500" />
              )}
              {complete ? 'Record complete' : `${missing.length} item${missing.length === 1 ? '' : 's'} still missing`}
            </p>
            <span className="text-sm font-extrabold">{pct}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className={`h-full rounded-full transition-all ${complete ? 'bg-emerald-500' : 'bg-role'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {!complete && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {missing.map((m) => (
                <span key={m} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-black/55 ring-1 ring-black/10">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className={`flex items-start gap-3 rounded-2xl p-5 ${
            locked ? 'bg-amber-50 text-amber-900' : 'border border-black/5 bg-page/50'
          }`}
        >
          <div
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
              locked ? 'bg-amber-100 text-amber-700' : 'bg-role/10 text-role'
            }`}
          >
            {locked ? <Lock size={17} /> : <ShieldCheck size={17} />}
          </div>
          <div>
            <p className="text-sm font-extrabold">{locked ? 'Locked by HR' : 'Not locked'}</p>
            <p className="mt-0.5 text-xs leading-relaxed opacity-70">
              {locked
                ? isAdmin
                  ? hr.lockedAt
                    ? `Locked on ${fmtDate(hr.lockedAt)}. Only HR can edit.`
                    : 'Only HR can edit.'
                  : 'Contact HR to make changes.'
                : isAdmin
                  ? 'Lock once verified so the employee cannot change it.'
                  : 'You can edit these details until HR locks them.'}
            </p>
          </div>
        </div>
      </div>

      {/* The details */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={FileText} title="Identity">
          <Row label="Aadhaar number" value={secret(hr.aadhaarNumber)} mono />
          <Row label="PAN number" value={secret(hr.panNumber)} mono />
          <Row label="Date of birth" value={hr.dateOfBirth ? fmtDate(hr.dateOfBirth) : null} />
          <Row label="Father's / Mother's / Spouse's name" value={hr.guardianName} />
        </Panel>

        <Panel icon={Landmark} title="Bank account">
          <Row label="Bank name" value={hr.bankName} />
          <Row label="Account number" value={secret(hr.bankAccountNumber)} mono />
          <Row label="IFSC code" value={hr.ifscCode} mono />
        </Panel>

        <Panel icon={MapPin} title="Address & previous PF">
          <Row label="Current address" value={hr.currentAddress} wide />
          <Row label="Permanent address" value={hr.permanentAddress} wide />
          <Row label="Previous UAN" value={hr.previousUan} mono />
          <Row label="Previous PF member ID" value={hr.previousPfMemberId} mono />
        </Panel>

        <Panel icon={Users} title="Nominee">
          <Row label="Name" value={nom.name} />
          <Row label="Relationship" value={nom.relationship} />
          <Row label="Date of birth" value={nom.dateOfBirth ? fmtDate(nom.dateOfBirth) : null} />
          <Row label="Aadhaar" value={secret(nom.aadhaarNumber)} mono />
          <Row label="Address" value={nom.address} wide />
        </Panel>
      </div>

      <div className="mt-5 rounded-2xl border border-black/5 bg-page/50 p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-role/10 text-role">
            <Phone size={16} />
          </div>
          <h3 className="text-sm font-extrabold">Emergency contacts</h3>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm font-medium italic text-black/30">Not provided</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-3.5 ring-1 ring-black/5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-role/10 text-role">
                  <UserRound size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{c.name || '—'}</p>
                  <p className="truncate text-xs text-black/55">
                    {c.phone || '—'}
                    {c.relation ? ` · ${c.relation}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <Modal
          title="Edit HR & PF details"
          subtitle={`${employee.name} · ${employee.employeeCode}`}
          icon={FileText}
          size="xl"
          flush
          onClose={() => setOpen(false)}
        >
          <HrForm
            employee={employee}
            onCancel={() => setOpen(false)}
            onSaved={(data) => {
              setOpen(false);
              onUpdated(data);
            }}
          />
        </Modal>
      )}
    </Card>
  );
}