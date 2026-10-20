import { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Save,
  ScanFace,
  Shield,
  Sliders,
} from 'lucide-react';
import { Banner, Card } from '../components/dash';
import { INITIAL_ATTENDANCE_SETTINGS } from '../data/attendanceSettings';
import { getDemoData, setDemoData } from '../utils/demoStorage';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AttendanceSettings() {
  const [settings, setSettings] = useState(() =>
    getDemoData('attendance_settings', INITIAL_ATTENDANCE_SETTINGS)
  );
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleWorkingHoursChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value,
      },
    }));
  };

  const handleRulesChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      attendanceRules: {
        ...prev.attendanceRules,
        [field]: value,
      },
    }));
  };

  const toggleWorkDay = (day) => {
    setSettings((prev) => ({
      ...prev,
      workWeek: {
        ...prev.workWeek,
        [day]: !prev.workWeek[day],
      },
    }));
  };

  const handleLocationChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      locationSettings: {
        ...prev.locationSettings,
        [field]: value,
      },
    }));
  };

  const handleFaceChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      faceRecognition: {
        ...prev.faceRecognition,
        [field]: value,
      },
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setDemoData('attendance_settings', settings);
      setSaving(false);
      showToast('Attendance settings saved successfully.');
    }, 300);
  };

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Banner
          title="Attendance Settings"
          subtitle="Configure core shift times, grace periods, biometric verification and weekly schedules."
          workspace="Admin Workspace"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-sky-700 transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Working Hours */}
        <Card
          title="Working Hours"
          subtitle="Default daily attendance shifts and timing boundaries."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Work Start Time
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  value={settings.workingHours.workStartTime}
                  onChange={(e) => handleWorkingHoursChange('workStartTime', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Work End Time
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  value={settings.workingHours.workEndTime}
                  onChange={(e) => handleWorkingHoursChange('workEndTime', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Grace Period (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={settings.workingHours.gracePeriodMinutes}
                onChange={(e) => handleWorkingHoursChange('gracePeriodMinutes', Number(e.target.value))}
                className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Minimum Working Hours
              </label>
              <input
                type="number"
                min="4"
                max="12"
                value={settings.workingHours.minWorkingHours}
                onChange={(e) => handleWorkingHoursChange('minWorkingHours', Number(e.target.value))}
                className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Attendance Rules */}
        <Card
          title="Attendance Rules"
          subtitle="Tolerances for late check-ins, early leaves, and overtime calculations."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">
                  Late Arrival Tracking
                </span>
                <span className="text-xs text-slate-500">
                  Flag punch-ins after grace period as late
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.attendanceRules.lateArrivalTracking}
                  onChange={(e) => handleRulesChange('lateArrivalTracking', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">
                  Early Checkout Tracking
                </span>
                <span className="text-xs text-slate-500">
                  Notify managers when staff leave before scheduled shift end
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.attendanceRules.earlyCheckoutTracking}
                  onChange={(e) => handleRulesChange('earlyCheckoutTracking', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">
                  Overtime Tracking
                </span>
                <span className="text-xs text-slate-500">
                  Calculate extra compensation beyond standard hours
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.attendanceRules.overtimeTracking}
                  onChange={(e) => handleRulesChange('overtimeTracking', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
              </label>
            </div>

            <div className="rounded-2xl border border-black/5 bg-slate-50/50 p-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Half Day Deduction Threshold
              </label>
              <input
                type="text"
                value={settings.attendanceRules.halfDayRules}
                onChange={(e) => handleRulesChange('halfDayRules', e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white py-2 px-3 text-xs font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Work Week */}
        <Card
          title="Work Week Configuration"
          subtitle="Select company working days and official weekly off schedule."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const isWorking = settings.workWeek[day];
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleWorkDay(day)}
                  className={`flex flex-col items-center justify-center rounded-2xl p-4 border transition ${
                    isWorking
                      ? 'border-sky-300 bg-sky-50/80 text-sky-950 font-bold shadow-sm'
                      : 'border-black/5 bg-slate-50 text-slate-400 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="text-sm font-extrabold">{day.slice(0, 3)}</span>
                  <span
                    className={`mt-1 text-[11px] uppercase tracking-wider font-bold ${
                      isWorking ? 'text-sky-700' : 'text-slate-400'
                    }`}
                  >
                    {isWorking ? 'Work Day' : 'Weekly Off'}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Section 4: Location Settings */}
        <Card
          title="Location Settings"
          subtitle="GPS coordinates and geofencing radius validation."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Default Primary Office Location
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={settings.locationSettings.officeLocation}
                  onChange={(e) => handleLocationChange('officeLocation', e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Geofence Radius (Meters)
              </label>
              <input
                type="number"
                min="20"
                max="2000"
                value={settings.locationSettings.radiusMeters}
                onChange={(e) => handleLocationChange('radiusMeters', Number(e.target.value))}
                className="w-full rounded-xl border border-black/10 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4 sm:col-span-2">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">
                  Strict Location Verification
                </span>
                <span className="text-xs text-slate-500">
                  Block check-in attempts outside the designated office boundary
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.locationSettings.locationVerification}
                  onChange={(e) => handleLocationChange('locationVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Section 5: Face Recognition */}
        <Card
          title="Face Recognition & Biometrics"
          subtitle="AI-assisted facial verification settings."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">
                  Enable Face Recognition
                </span>
                <span className="text-xs text-slate-500">
                  Allow employees to punch in via camera scanning
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.faceRecognition.enableFaceRecognition}
                  onChange={(e) => handleFaceChange('enableFaceRecognition', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-slate-50/50 p-4">
              <div>
                <span className="font-extrabold text-slate-900 text-sm block">
                  Face Approval Required
                </span>
                <span className="text-xs text-slate-500">
                  Manager/Admin must review new photo enrollments
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.faceRecognition.faceApprovalRequired}
                  onChange={(e) => handleFaceChange('faceApprovalRequired', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-sky-600 peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Footer save button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-sky-700 transition disabled:opacity-50"
          >
            <Save size={16} /> {saving ? 'Saving Changes…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
}