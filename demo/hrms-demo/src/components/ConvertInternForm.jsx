import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Field, SelectInput } from './formFields';

// HR picks the permanent role, designation, department and manager. Nothing is automatic.
export default function ConvertInternForm({ employee, departments, onSaved, onCancel }) {
  const [form, setForm] = useState({
    role: 'employee',
    designation: employee.designation || '',
    department: employee.department?._id || '',
    manager: employee.manager?._id || '',
  });
  const [managers, setManagers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Only Managers and Admins can be a reporting manager (the server checks this too)
  useEffect(() => {
    api
      .get('/employees', { params: { status: 'active', limit: 100, sort: 'name' } })
      .then(({ data }) =>
        setManagers(
          data.data.filter((m) => m._id !== employee._id && ['manager', 'admin'].includes(m.user?.role))
        )
      )
      .catch(() => {});
  }, [employee._id]);

  useEffect(() => {
    api
      .get('/designations', { params: { status: 'active' } })
      .then(({ data }) => setDesignations(data.data))
      .catch(() => {});
  }, []);

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post(`/employees/${employee._id}/convert`, form);
      onSaved(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not convert. Please try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="light-fields space-y-4">
      <p className="text-sm text-black/60">
        This makes <span className="font-bold text-ink">{employee.name}</span> a permanent employee. The change is
        written to the audit log and the internship dates are kept as a record.
      </p>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="cv-role" label="New role" required>
          <SelectInput id="cv-role" name="role" value={form.role} onChange={set}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </SelectInput>
        </Field>
        <Field id="cv-designation" label="Designation">
          <SelectInput id="cv-designation" name="designation" value={form.designation} onChange={set}>
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
        <Field id="cv-department" label="Department">
          <SelectInput id="cv-department" name="department" value={form.department} onChange={set}>
            <option value="">No department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field id="cv-manager" label="Reporting manager">
          <SelectInput id="cv-manager" name="manager" value={form.manager} onChange={set}>
            <option value="">No manager</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.employeeCode})
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
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
          {saving ? 'Converting…' : 'Convert to permanent'}
        </button>
      </div>
    </form>
  );
}