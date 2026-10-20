export const INITIAL_ATTENDANCE_SETTINGS = {
  workingHours: {
    workStartTime: '09:00',
    workEndTime: '18:00',
    gracePeriodMinutes: 15,
    minWorkingHours: 8,
  },
  attendanceRules: {
    lateArrivalTracking: true,
    earlyCheckoutTracking: true,
    halfDayRules: 'After 4 hours of active work',
    overtimeTracking: true,
    overtimeThresholdHours: 9,
  },
  workWeek: {
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
  },
  locationSettings: {
    officeLocation: 'Bangalore HQ (Indiranagar)',
    radiusMeters: 100,
    locationVerification: true,
    strictGeofencing: true,
  },
  faceRecognition: {
    enableFaceRecognition: true,
    faceApprovalRequired: true,
    matchThreshold: 0.55,
  },
};
