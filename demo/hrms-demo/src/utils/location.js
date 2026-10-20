// Resolves { lat, lng, accuracy } on success, or { error: <code> } if the browser
// refuses or times out (1 = permission denied, 2 = unavailable, 3 = timeout).
// Resolves null when geolocation is unsupported. Never rejects.
export const getPosition = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
      (e) => resolve({ error: e.code }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });

// Body to send with check-in/out: the position, or {} if none was obtained
export const locationBody = (pos) => (pos && !pos.error ? pos : {});

// Extra hint appended to a server error when the browser could not give a position
export const locationHint = (pos) => {
  if (!pos) return ' (This browser does not support location.)';
  if (pos.error === 1) return ' (Location permission is blocked for this site.)';
  if (pos.error === 2) return ' (Your device could not find its position. Check that Windows Location is on.)';
  if (pos.error === 3) return ' (Finding your location timed out. Try again.)';
  return '';
};