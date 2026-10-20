const todayDate = new Date().toISOString().slice(0, 10);
const [year, month] = todayDate.split('-');

function generateMonthRecords(empId = 'emp-1') {
  const records = [];
  const daysInMonth = 28;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const date = `${year}-${month}-${dayStr}`;
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    const isToday = dayStr === todayDate.slice(8, 10);
    const isPast = parseInt(dayStr, 10) < parseInt(todayDate.slice(8, 10), 10);

    if (isToday) {
      records.push({
        _id: `att-${d}`,
        employee: empId,
        date,
        checkIn: `${date}T09:05:00.000Z`,
        checkOut: null,
        status: 'present',
        workingMinutes: 340,
        lateMinutes: 5,
        workMode: 'office',
      });
    } else if (isPast) {
      const isLate = d % 7 === 0;
      const isLeave = d === 12;
      records.push({
        _id: `att-${d}`,
        employee: empId,
        date,
        checkIn: isLeave ? null : `${date}T09:${isLate ? '25' : '02'}:00.000Z`,
        checkOut: isLeave ? null : `${date}T18:${isLate ? '30' : '10'}:00.000Z`,
        status: isLeave ? 'absent' : isLate ? 'late' : 'present',
        workingMinutes: isLeave ? 0 : isLate ? 485 : 548,
        lateMinutes: isLate ? 25 : 0,
        workMode: d % 3 === 0 ? 'wfh' : 'office',
      });
    }
  }
  return records;
}

export const INITIAL_ATTENDANCE = {
  today: {
    status: 'present',
    checkIn: `${todayDate}T09:05:00.000Z`,
    checkOut: null,
    workingMinutes: 360,
  },
  monthStats: {
    presentDays: 14,
    workingDays: 16,
    absentDays: 1,
    leaveDays: 1,
    rate: 93,
  },
  records: generateMonthRecords('emp-1'),
};
