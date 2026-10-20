import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { UserPlus, Pencil, BadgeCheck } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Avatar, Modal, StatusBadge } from '../components/ui';
import EmployeeForm from '../components/EmployeeForm';
import ConvertInternForm from '../components/ConvertInternForm';
import InternBadge from '../components/InternBadge';
import { fmtDate, internEndText } from '../utils/format';

const SORTS = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: '-name', label: 'Name (Z–A)' },
  { value: 'employeeCode', label: 'Employee ID' },
  { value: '-joiningDate', label: 'Newest joined' },
  { value: 'joiningDate', label: 'Oldest joined' },
];

const control =
  'rounded-xl bg-white px-4 py-2.5 text-sm font-medium outline-none ring-brand focus:ring-2';

export default function Employees() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [filters, setFilters] = useState({
    search: initialSearch,
    department: '',
    status: '',
    employmentType: '',
    sort: 'name',
    page: 1,
  });
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(isAdmin && searchParams.get('new') ? { mode: 'create' } : null);

  // Debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // The API may return a bare array or an object wrapping it; always store an array
  useEffect(() => {
    api
      .get('/departments')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data || data?.departments || [];
        setDepartments(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/employees', { params: { ...filters, limit: 10 } });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load employees');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value, page: 1 });

  const closeModal = () => {
    setModal(null);
    if (searchParams.get('new')) setSearchParams({});
  };

  const toggleStatus = async (emp) => {
    const next = emp.status === 'active' ? 'inactive' : 'active';
    const verb = next === 'inactive' ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${verb} ${emp.name}?`)) return;
    try {
      await api.patch(`/employees/${emp._id}`, { status: next });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  // Departments offered in the dialogs: active ones, plus the one the employee is already in
  const deptOptions = departments.filter(
    (d) => d.status === 'active' || d._id === modal?.employee?.department?._id
  );

  const employeeList = Array.isArray(result?.data) ? result.data : [];

  return (
    <main className="w-full px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{isAdmin ? 'Employees' : 'My team'}</h1>
          <p className="mt-1 text-sm text-black/50">
            {result.total || employeeList.length} {result.total === 1 ? 'person' : 'people'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
          >
            + Add employee
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, ID or designation"
          className={control}
        />
        <select value={filters.department} onChange={setFilter('department')} className={control}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={setFilter('status')} className={control}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filters.employmentType} onChange={setFilter('employmentType')} className={control}>
          <option value="">All types</option>
          <option value="intern">Interns</option>
          <option value="permanent">Permanent</option>
        </select>
        <select value={filters.sort} onChange={setFilter('sort')} className={control}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-3xl bg-white">
        {error ? (
          <div className="p-8 text-center text-sm font-medium text-accent">{error}</div>
        ) : loading ? (
          <div className="p-8 text-center text-sm text-black/40">Loading employees…</div>
        ) : employeeList.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-bold">No employees found</p>
            <p className="mt-1 text-sm text-black/45">Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-black/40">
                  <th className="px-5 py-4 font-bold">Employee</th>
                  <th className="px-5 py-4 font-bold">ID</th>
                  <th className="px-5 py-4 font-bold">Department</th>
                  <th className="hidden px-5 py-4 font-bold lg:table-cell">Manager</th>
                  <th className="hidden px-5 py-4 font-bold md:table-cell">Joined</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeeList.map((e) => {
                  const isIntern = e.employmentType === 'intern';
                  return (
                    <tr key={e._id} className="border-b border-black/5 last:border-0 hover:bg-surface/60">
                      <td className="px-5 py-3.5">
                        <Link to={`/employees/${e._id}`} className="flex items-center gap-3">
                          <Avatar name={e.name} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-bold">{e.name}</p>
                              <InternBadge employee={e} />
                            </div>
                            <p className="truncate text-xs text-black/45">
                              {e.designation || '—'} · {e.user?.email}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-black/60">{e.employeeCode}</td>
                      <td className="px-5 py-3.5">{e.department?.name || '—'}</td>
                      <td className="hidden px-5 py-3.5 lg:table-cell">{e.manager?.name || '—'}</td>
                      <td className="hidden px-5 py-3.5 md:table-cell">
                        {fmtDate(e.joiningDate)}
                        {isIntern && (
                          <p className="text-xs font-semibold text-black/45">{internEndText(e.internshipEndDate)}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/employees/${e._id}`}
                            className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold hover:bg-black/10"
                          >
                            View
                          </Link>
                          {isAdmin && (
                            <>
                              {isIntern && e.status === 'active' && (
                                <button
                                  onClick={() => setModal({ mode: 'convert', employee: e })}
                                  className="rounded-full bg-role/10 px-3 py-1.5 text-xs font-bold text-role hover:bg-role/20"
                                >
                                  Convert
                                </button>
                              )}
                              <button
                                onClick={() => setModal({ mode: 'edit', employee: e })}
                                className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold hover:bg-black/10"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleStatus(e)}
                                className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent hover:bg-accent/20"
                              >
                                {e.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && result.pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-black/50">
            Page {filters.page} of {result.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              className="rounded-full bg-white px-4 py-2 font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={filters.page >= result.pages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              className="rounded-full bg-white px-4 py-2 font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modal && modal.mode === 'convert' && (
        <Modal
          title="Convert to permanent"
          subtitle={`${modal.employee.name} · ${modal.employee.employeeCode}`}
          icon={BadgeCheck}
          size="lg"
          onClose={closeModal}
        >
          <ConvertInternForm
            employee={modal.employee}
            departments={deptOptions}
            onCancel={closeModal}
            onSaved={() => {
              closeModal();
              load();
            }}
          />
        </Modal>
      )}

      {modal && modal.mode !== 'convert' && (
        <Modal
          title={modal.mode === 'edit' ? 'Edit employee' : 'Add employee'}
          subtitle={
            modal.mode === 'edit'
              ? `Update ${modal.employee?.name}'s details`
              : 'Create a login account and employee profile'
          }
          icon={modal.mode === 'edit' ? Pencil : UserPlus}
          size="lg"
          flush
          onClose={closeModal}
        >
          <EmployeeForm
            employee={modal.employee}
            departments={deptOptions}
            onCancel={closeModal}
            onSaved={() => {
              closeModal();
              load();
            }}
          />
        </Modal>
      )}
    </main>
  );
}