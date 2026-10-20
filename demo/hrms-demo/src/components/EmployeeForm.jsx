import { useEffect, useState } from 'react';
import { User, KeyRound, Briefcase } from 'lucide-react';
import api from '../api/axios';
import PasswordInput from './PasswordInput';
import { Section, Field, TextInput, SelectInput } from './formFields';
import { toInputDate } from '../utils/format';
import { passwordProblem } from '../utils/form';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;
const CODE_RE = /^EMP-PP\d{4}-00-\d{4}$/;
const CODE_EXAMPLE = `EMP-PP${new Date().getFullYear()}-00-0001`;

// Order used to focus the first invalid field
const FIELD_ORDER = ['name', 'employeeCode', 'email', 'password', 'joiningDate', 'internshipEndDate', 'phone'];

// Layout: a flex column that fills the Modal (which is rendered with "flush").
// The middle is the ONLY scroll area (mouse wheel, touchpad and scrollbar all work on it);
// the footer with the buttons is outside it, so Cancel / Add employee are always visible.
export default function EmployeeForm({ employee, departments, onSaved, onCancel }) {
  const editing = !!employee;
  const originalCode = employee?.employeeCode || '';
  const originalRole = employee?.user?.role || 'employee';
  const wasIntern = employee?.employmentType === 'intern';
  const converted = !!employee?.convertedOn;

  const [form, setForm] = useState({
    name: employee?.name || '',
    email: employee?.user?.email || '',
    password: '',
    role: originalRole,
    phone: employee?.phone || '',
    department: employee?.department?._id || '',
    designation: employee?.designation || '',
    joiningDate: toInputDate(employee?.joiningDate),
    manager: employee?.manager?._id || '',
    employeeCode: originalCode,
    employmentType: employee?.employmentType || 'permanent',
    internshipEndDate: toInputDate(employee?.internshipEndDate),
  });
  const [managers, setManagers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isIntern = form.employmentType === 'intern';
  // An intern can only become permanent through "Convert to permanent", and a converted
  // employee cannot go back to being an intern, so the dropdown is locked in both cases.
  const typeLocked = wasIntern || converted;

  // Possible reporting managers: active Managers/Admins (excluding the one being edited)
  useEffect(() => {
    api
      .get('/employees', { params: { status: 'active', limit: 100, sort: 'name' } })
      .then(({ data }) =>
        setManagers(
          data.data.filter((m) => m._id !== employee?._id && ['manager', 'admin'].includes(m.user?.role))
        )
      )
      .catch(() => {});
  }, [employee?._id]);

  // Active designations for the dropdown
  useEffect(() => {
    api
      .get('/designations', { params: { status: 'active' } })
      .then(({ data }) => setDesignations(data.data))
      .catch(() => {});
  }, []);

  const setValue = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };
  const set = (e) => setValue(e.target.name, e.target.value);

  // Choosing Intern forces the Employee role (roles control permissions, not employment type)
  const onEmploymentChange = (e) => {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      employmentType: value,
      role: value === 'intern' ? 'employee' : f.role,
      internshipEndDate: value === 'intern' ? f.internshipEndDate : '',
    }));
  };

  const codeChanged = form.employeeCode.trim().toUpperCase() !== originalCode.toUpperCase();
  const codeTyped = form.employeeCode.trim().length > 0;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!editing) {
      if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address';
      const pw = passwordProblem(form.password);
      if (pw) e.password = pw;
    }
    if (form.phone && !PHONE_RE.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (!form.joiningDate) e.joiningDate = 'Joining date is required';
    if (isIntern && form.internshipEndDate && form.joiningDate && form.internshipEndDate <= form.joiningDate) {
      e.internshipEndDate = 'End date must be after the joining date';
    }
    // Only validate the ID format when it's actually being set/changed;
    // an untouched old-format code on an existing employee is left alone.
    if (codeTyped && (!editing || codeChanged) && !CODE_RE.test(form.employeeCode.trim().toUpperCase())) {
      e.employeeCode = `Employee ID must look like ${CODE_EXAMPLE}`;
    }
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((k) => found[k]);
    if (firstInvalid) {
      setError('');
      document.getElementById(`emp-${firstInvalid}`)?.focus();
      return;
    }

    setSaving(true);
    setError('');
    try {
      const shared = {
        name: form.name.trim(),
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        joiningDate: form.joiningDate,
        manager: form.manager,
        role: form.role,
        employmentType: form.employmentType,
      };
      // Blank end date = the server uses joining date + the default internship length
      if (isIntern && form.internshipEndDate) shared.internshipEndDate = form.internshipEndDate;
      if (!editing && codeTyped) shared.employeeCode = form.employeeCode.trim().toUpperCase();
      if (editing && codeChanged) shared.employeeCode = form.employeeCode.trim().toUpperCase();

      const { data } = editing
        ? await api.patch(`/employees/${employee._id}`, shared)
        : await api.post('/employees', { ...shared, email: form.email.trim(), password: form.password });
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="light-fields flex min-h-0 flex-1 flex-col">
      {/* The one scrolling area */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5 sm:px-8">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <Section icon={User} title="Basic information">
          <Field id="emp-name" label="Full name" required error={errors.name}>
            <TextInput
              id="emp-name"
              name="name"
              value={form.name}
              onChange={set}
              error={errors.name}
              placeholder="e.g. Priya Sharma"
              autoComplete="off"
            />
          </Field>
          <Field
            id="emp-employeeCode"
            label="Employee ID"
            hint={editing ? undefined : '(optional)'}
            error={errors.employeeCode}
          >
            <TextInput
              id="emp-employeeCode"
              name="employeeCode"
              value={form.employeeCode}
              onChange={set}
              error={errors.employeeCode}
              placeholder={editing ? CODE_EXAMPLE : 'Auto-generated if blank'}
              autoComplete="off"
              className="uppercase placeholder:normal-case"
            />
          </Field>
        </Section>

        {!editing && (
          <Section icon={KeyRound} title="Account">
            <Field id="emp-email" label="Email" required error={errors.email}>
              <TextInput
                id="emp-email"
                type="email"
                name="email"
                value={form.email}
                onChange={set}
                error={errors.email}
                placeholder="name@company.com"
                autoComplete="off"
              />
            </Field>
            <Field id="emp-password" label="Initial password" required error={errors.password}>
              <PasswordInput
                id="emp-password"
                name="password"
                value={form.password}
                onChange={(v) => setValue('password', v)}
                error={!!errors.password}
                allowGenerate
                placeholder="Min. 10 characters"
              />
            </Field>
          </Section>
        )}

        <Section icon={Briefcase} title="Job & contact">
          <Field id="emp-role" label="Role" hint={isIntern ? '(interns are Employees)' : undefined}>
            <SelectInput id="emp-role" name="role" value={form.role} onChange={set} disabled={isIntern}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin / HR</option>
            </SelectInput>
          </Field>
          <Field
            id="emp-employmentType"
            label="Employment type"
            hint={wasIntern ? '(use Convert to permanent)' : converted ? '(already converted)' : undefined}
          >
            <SelectInput
              id="emp-employmentType"
              name="employmentType"
              value={form.employmentType}
              onChange={onEmploymentChange}
              disabled={typeLocked}
            >
              <option value="permanent">Permanent</option>
              <option value="intern" disabled={editing && originalRole !== 'employee'}>
                Intern
              </option>
            </SelectInput>
          </Field>
          <Field id="emp-department" label="Department">
            <SelectInput id="emp-department" name="department" value={form.department} onChange={set}>
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field id="emp-designation" label="Designation">
            <SelectInput id="emp-designation" name="designation" value={form.designation} onChange={set}>
              <option value="">No designation</option>
              {form.designation && !designations.some((d) => d.name === form.designation) && (
                <option value={form.designation}>{form.designation}</option>
              )}
              {designations.map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field id="emp-manager" label="Reporting manager">
            <SelectInput id="emp-manager" name="manager" value={form.manager} onChange={set}>
              <option value="">No manager</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.employeeCode})
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field id="emp-joiningDate" label="Joining date" required error={errors.joiningDate}>
            <TextInput
              id="emp-joiningDate"
              type="date"
              name="joiningDate"
              value={form.joiningDate}
              onChange={set}
              error={errors.joiningDate}
            />
          </Field>
          {isIntern && (
            <Field
              id="emp-internshipEndDate"
              label="Internship end date"
              hint="(blank = default length)"
              error={errors.internshipEndDate}
            >
              <TextInput
                id="emp-internshipEndDate"
                type="date"
                name="internshipEndDate"
                value={form.internshipEndDate}
                onChange={set}
                error={errors.internshipEndDate}
              />
            </Field>
          )}
          <Field id="emp-phone" label="Phone" error={errors.phone}>
            <TextInput
              id="emp-phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={set}
              error={errors.phone}
              placeholder="Optional"
              autoComplete="off"
            />
          </Field>
        </Section>
      </div>

      {/* Fixed footer: always visible, never part of the scroll */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/5 bg-surface/60 px-6 py-4 sm:px-8">
        <p className="hidden text-xs text-black/45 sm:block">
          <span className="text-accent">*</span> Required fields
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
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </div>
    </form>
  );
}