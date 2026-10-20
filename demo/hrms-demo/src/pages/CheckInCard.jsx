{checkedOut && (
  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
    {[
      ['Late', record.lateMinutes, 'text-blue-600'],
      ['Early out', record.earlyLeaveMinutes, 'text-orange-600'],
      ['Overtime', record.overtimeMinutes, 'text-emerald-700'],
    ].map(([name, m, cls]) => (
      <div key={name} className="rounded-xl bg-page py-2">
        <p className="font-bold text-black/40">{name}</p>
        <p className={`mt-0.5 font-extrabold ${cls}`}>{m > 0 ? fmtDuration(m) : '—'}</p>
      </div>
    ))}
  </div>
)}