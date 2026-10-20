import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Banner, Card, Empty } from "../components/dash";

const pad = (n) => String(n).padStart(2, "0");

const monthOf = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

const shiftMonth = (m, delta) => {
  const [y, mo] = m.split("-").map(Number);
  return monthOf(new Date(y, mo - 1 + delta, 1));
};

const monthLabel = (m) => {
  const [y, mo] = m.split("-").map(Number);

  return new Date(y, mo - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

const mins = (m) =>
  m > 0 ? `${Math.floor(m / 60)}h ${m % 60}m` : "—";

function downloadCsv(filename, header, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s)
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csv = [header, ...rows]
    .map((r) => r.map(esc).join(","))
    .join("\r\n");

  const blob = new Blob(["\ufeff" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

const th = "py-3 pr-4 font-bold";

const thead =
  "border-b border-black/5 text-xs uppercase tracking-wide text-black/40";

export default function Reports() {
  const { user } = useAuth();

  const isAdmin = user.role === "admin";

  const tabs = [
    ["employees", "Employees"],
    ["attendance", "Attendance"],
    ["leaves", "Leaves"],
    ...(isAdmin ? [["headcount", "Headcount"]] : []),
  ];

  const now = new Date();

  const [tab, setTab] = useState("attendance");
  const [month, setMonth] = useState(monthOf(now));
  const [year, setYear] = useState(now.getFullYear());
  const [result, setResult] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    setResult({ data: [] });

    const params =
      tab === "attendance"
        ? { month }
        : tab === "leaves"
          ? { year }
          : {};

    api
      .get(`/reports/${tab}`, { params })
      .then(({ data }) => {
        if (!cancelled) {
          setResult(Array.isArray(data) ? { data } : (data?.data ? data : { data: [] }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Could not load report"
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tab, month, year]);

  const rows = result.data || [];

  const exportCsv = () => {
    if (tab === "attendance") {
      downloadCsv(
        `attendance-${month}.csv`,
        [
          "Code",
          "Employee",
          "Department",
          "Working days",
          "Present",
          "Half-day",
          "Late",
          "Absent",
          "Hours",
          "Late (min)",
          "Early leave (min)",
          "Overtime (min)",
        ],
        rows.map((r) => [
          r.employeeCode,
          r.name,
          r.department,
          r.workingDays,
          r.present,
          r.halfDay,
          r.late,
          r.absent,
          r.totalHours,
          r.lateMinutes,
          r.earlyLeaveMinutes,
          r.overtimeMinutes,
        ]),
      );
    } else if (tab === "leaves") {
      downloadCsv(
        `leaves-${year}.csv`,
        [
          "Code",
          "Employee",
          "Department",
          ...(result.types || []).map(
            (t) => `${t.name} (limit ${t.annualLimit})`,
          ),
          "Approved total",
          "Pending days",
        ],
        rows.map((r) => [
          r.employeeCode,
          r.name,
          r.department,
          ...(result.types || []).map(
            (t) => r.used[t._id] ?? 0,
          ),
          r.approvedTotal,
          r.pending,
        ]),
      );
    } else if (tab === "employees") {
      downloadCsv(
        `employees-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`,
        [
          "Code",
          "Name",
          "Email",
          "Role",
          "Phone",
          "Department",
          "Designation",
          "Joining date",
          "Reporting manager",
          "Status",
        ],
        rows.map((r) => [
          r.employeeCode,
          r.name,
          r.email,
          r.role,
          r.phone,
          r.department,
          r.designation,
          r.joiningDate,
          r.manager,
          r.status,
        ]),
      );
    } else {
      downloadCsv(
        "headcount.csv",
        [
          "Department",
          "Total",
          "Active",
          "Inactive",
          "Managers",
          "Employees",
          "Admins",
        ],
        rows.map((r) => [
          r.department,
          r.total,
          r.active,
          r.inactive,
          r.managers,
          r.employees,
          r.admins,
        ]),
      );
    }
  };

  const picker = (
    label,
    onPrev,
    onNext,
    nextDisabled,
  ) => (
    <div className="flex items-center gap-1 rounded-xl bg-white p-1">
      <button
        onClick={onPrev}
        aria-label="Previous"
        className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="min-w-36 text-center text-sm font-bold">
        {label}
      </span>

      <button
        onClick={onNext}
        disabled={nextDisabled}
        aria-label="Next"
        className="grid h-9 w-9 place-items-center rounded-lg hover:bg-page disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      <Banner
        title="Reports"
        subtitle={
          isAdmin
            ? "Organization-wide summaries you can export."
            : "Summaries for your direct reports."
        }
        workspace={
          isAdmin ? "Admin Workspace" : "Manager Workspace"
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl bg-white p-1">
          {tabs.map(([key, text]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${
                tab === key
                  ? "bg-accent text-white"
                  : "text-black/60 hover:bg-page"
              }`}
            >
              {text}
            </button>
          ))}
        </div>

        {tab === "attendance" &&
          picker(
            monthLabel(month),
            () => setMonth(shiftMonth(month, -1)),
            () => setMonth(shiftMonth(month, 1)),
            month >= monthOf(now),
          )}

        {tab === "leaves" &&
          picker(
            String(year),
            () => setYear(year - 1),
            () => setYear(year + 1),
            year >= now.getFullYear(),
          )}

        <button
          onClick={exportCsv}
          disabled={loading || rows.length === 0}
          className="ml-auto flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
          {error}
        </div>
      )}

      <Card
        title={
          {
            employees: "Employee directory",
            attendance: "Attendance summary",
            leaves: "Leave summary",
            headcount: "Department headcount",
          }[tab]
        }
        subtitle={
          {
            employees: `${rows.length} ${
              rows.length === 1 ? "employee" : "employees"
            }`,
            attendance: monthLabel(month),
            leaves: `Approved days in ${year}`,
            headcount: "All employees by department",
          }[tab]
        }
      >
        {loading ? (
          <Empty>Loading report…</Empty>
        ) : rows.length === 0 ? (
          <Empty>No data for this report.</Empty>
        ) : (
          <div className="overflow-x-auto">
            {/* Employees */}
            {tab === "employees" && (
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className={thead}>
                    <th className={th}>Employee</th>
                    <th className={th}>Role</th>
                    <th className={th}>Department</th>
                    <th className={th}>Designation</th>
                    <th className={th}>Joined</th>
                    <th className={th}>Manager</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-bold">{r.name}</p>
                        <p className="text-xs text-black/45">
                          {r.employeeCode} · {r.email}
                        </p>
                      </td>

                      <td className="py-3 pr-4 capitalize">
                        {r.role}
                      </td>

                      <td className="py-3 pr-4 text-black/60">
                        {r.department || "—"}
                      </td>

                      <td className="py-3 pr-4 text-black/60">
                        {r.designation || "—"}
                      </td>

                      <td className="py-3 pr-4">
                        {r.joiningDate || "—"}
                      </td>

                      <td className="py-3 pr-4 text-black/60">
                        {r.manager || "—"}
                      </td>

                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                            r.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-black/10 text-black/60"
                          }`}
                        >
                          {r.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Attendance */}
            {tab === "attendance" && (
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className={thead}>
                    <th className={th}>Employee</th>
                    <th className={th}>Department</th>
                    <th className={`${th} text-center`}>
                      Working days
                    </th>
                    <th className={`${th} text-center`}>
                      Present
                    </th>
                    <th className={`${th} text-center`}>
                      Half-day
                    </th>
                    <th className={`${th} text-center`}>
                      Late
                    </th>
                    <th className={`${th} text-center`}>
                      Absent
                    </th>
                    <th className={`${th} text-center`}>
                      Hours
                    </th>
                    <th className={`${th} text-center`}>
                      Late by
                    </th>
                    <th className={`${th} text-center`}>
                      Early out
                    </th>
                    <th className={`${th} text-center`}>
                      Overtime
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-bold">{r.name}</p>
                        <p className="text-xs text-black/45">
                          {r.employeeCode}
                        </p>
                      </td>

                      <td className="py-3 pr-4 text-black/60">
                        {r.department || "—"}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.workingDays}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.present}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.halfDay}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.late}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.absent}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.totalHours}
                      </td>

                      <td className="py-3 pr-4 text-center text-blue-600">
                        {mins(r.lateMinutes)}
                      </td>

                      <td className="py-3 pr-4 text-center text-orange-600">
                        {mins(r.earlyLeaveMinutes)}
                      </td>

                      <td className="py-3 pr-4 text-center text-emerald-700">
                        {mins(r.overtimeMinutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Leaves */}
            {tab === "leaves" && (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className={thead}>
                    <th className={th}>Employee</th>
                    <th className={th}>Department</th>

                    {(result.types || []).map((t) => (
                      <th
                        key={t._id}
                        className={`${th} text-center`}
                      >
                        {t.name}
                        <span className="block font-semibold normal-case text-black/30">
                          of {t.annualLimit}
                        </span>
                      </th>
                    ))}

                    <th className={`${th} text-center`}>
                      Total
                    </th>

                    <th className={`${th} text-center`}>
                      Pending
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-bold">{r.name}</p>
                        <p className="text-xs text-black/45">
                          {r.employeeCode}
                        </p>
                      </td>

                      <td className="py-3 pr-4 text-black/60">
                        {r.department}
                      </td>

                      {(result.types || []).map((t) => (
                        <td
                          key={t._id}
                          className="py-3 pr-4 text-center"
                        >
                          {r.used[t._id] ?? 0}
                        </td>
                      ))}

                      <td className="py-3 pr-4 text-center font-bold">
                        {r.approvedTotal}
                      </td>

                      <td className="py-3 pr-4 text-center font-semibold text-orange-600">
                        {r.pending}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Headcount */}
            {tab === "headcount" && (
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className={thead}>
                    <th className={th}>Department</th>
                    <th className={`${th} text-center`}>
                      Total
                    </th>
                    <th className={`${th} text-center`}>
                      Active
                    </th>
                    <th className={`${th} text-center`}>
                      Inactive
                    </th>
                    <th className={`${th} text-center`}>
                      Managers
                    </th>
                    <th className={`${th} text-center`}>
                      Employees
                    </th>
                    <th className={`${th} text-center`}>
                      Admins
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.department}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="py-3 pr-4 font-bold">
                        {r.department}
                      </td>

                      <td className="py-3 pr-4 text-center font-bold">
                        {r.total}
                      </td>

                      <td className="py-3 pr-4 text-center text-emerald-700">
                        {r.active}
                      </td>

                      <td className="py-3 pr-4 text-center text-black/50">
                        {r.inactive}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.managers}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.employees}
                      </td>

                      <td className="py-3 pr-4 text-center">
                        {r.admins}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>
    </main>
  );
}