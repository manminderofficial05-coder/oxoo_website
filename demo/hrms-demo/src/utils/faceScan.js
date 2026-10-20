const MODEL_URL = '/models';

// Blink detection is relative to the person's own open-eye reading, so it works with glasses
const BASELINE_FRAMES = 4; // open-eye frames averaged to get the baseline
const CLOSE_RATIO = 0.8; // eye counts as closed below baseline * this
const REOPEN_RATIO = 0.9; // eye counts as open again above baseline * this
const MIN_OPEN_EAR = 0.18; // registration only: eyes must be at least this open
const MIN_FACE_RATIO = 0.2; // face width / video width; below this = too far away
const SHOTS = 3; // frames averaged into one check-in fingerprint
const SAMPLE_TIMEOUT = 20000;
const DEBUG = false; // true = log the eye reading to the browser console while tuning

const PROMPTS = [
  'Look straight at the camera',
  'Turn your head slightly left',
  'Turn your head slightly right',
  'Look straight again',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Mean of several 128-number descriptors (reduces noise from any single frame)
const average = (vectors) => vectors[0].map((_, i) => vectors.reduce((s, v) => s + v[i], 0) / vectors.length);

// Loads face-api and the models once. Lazy, so it stays out of the main bundle.
let loading;
export const loadFaceApi = () => {
  loading ||= (async () => {
    const faceapi = await import('@vladmandic/face-api');
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    return faceapi;
  })().catch(() => {
    loading = null;
    throw new Error('Could not load the face models. Check that /models is served.');
  });
  return loading;
};

export const stopCamera = (stream) => stream?.getTracks().forEach((t) => t.stop());

// Starts the front camera in <video>. Returns the stream, or null if cancelled meanwhile.
export async function startCamera(video, isCancelled = () => false) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('This browser does not support camera access (HTTPS is required when deployed).');
  }
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 },
      audio: false,
    });
  } catch (err) {
    throw new Error(
      err.name === 'NotAllowedError'
        ? 'Camera permission is blocked for this site. Allow it and try again.'
        : 'Could not open the camera. Is another app using it?'
    );
  }
  if (isCancelled()) {
    stopCamera(stream);
    return null;
  }
  video.srcObject = stream;
  await video.play();
  return stream;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const earOf = (eye) => (dist(eye[1], eye[5]) + dist(eye[2], eye[4])) / (2 * dist(eye[0], eye[3]));
const avgEar = (landmarks) => (earOf(landmarks.getLeftEye()) + earOf(landmarks.getRightEye())) / 2;

/**
 * One look at the camera: { face, ear } or { problem }.
 * withDescriptor = false: fast detector, for tracking the blink.
 * withDescriptor = true: accurate detector plus the face fingerprint.
 */
async function readFace(faceapi, video, withDescriptor = false) {
  const options = withDescriptor
    ? new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
    : new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 });
  let task = faceapi.detectAllFaces(video, options).withFaceLandmarks();
  if (withDescriptor) task = task.withFaceDescriptors();
  const faces = await task;

  if (faces.length === 0) return { problem: 'No face found. Move into the frame.' };
  if (faces.length > 1) return { problem: 'Only one person should be in view.' };
  const face = faces[0];
  if (face.detection.box.width / video.videoWidth < MIN_FACE_RATIO) return { problem: 'Move a little closer.' };
  return { face, ear: avgEar(face.landmarks) };
}

/**
 * Check-in/out scan: learns the person's open-eye level, waits for one blink
 * (open -> closed -> open), then averages SHOTS eyes-open frames into one fingerprint.
 * Resolves { descriptor: number[128], liveness: true }. Throws a readable Error.
 * (No longer used by FaceVerifyModal — kept here in case it's wanted again later.)
 */
export async function scanWithBlink(video, { timeoutMs = 30000, onStatus, shouldStop } = {}) {
  const faceapi = await loadFaceApi();
  const started = Date.now();
  const openFrames = [];
  let baseline = 0;
  let closed = false;

  onStatus?.('Look at the camera');
  while (Date.now() - started < timeoutMs) {
    if (shouldStop?.()) throw new Error('Cancelled');
    const r = await readFace(faceapi, video);
    if (DEBUG && !r.problem) console.log('EAR', r.ear.toFixed(3), 'baseline', baseline.toFixed(3));

    if (r.problem) {
      onStatus?.(r.problem);
    } else if (!baseline) {
      // Learn this person's normal eye opening from the first few frames
      openFrames.push(r.ear);
      if (openFrames.length >= BASELINE_FRAMES) {
        baseline = openFrames.reduce((s, v) => s + v, 0) / openFrames.length;
        onStatus?.('Now blink once');
      }
    } else if (!closed) {
      if (r.ear < baseline * CLOSE_RATIO) closed = true;
    } else if (r.ear > baseline * REOPEN_RATIO) {
      // Blink done: hold still and look at the camera while we take a few clear frames
      onStatus?.('Hold still…');
      const shots = [];
      for (let tries = 0; tries < 8 && shots.length < SHOTS; tries++) {
        const shot = await readFace(faceapi, video, true);
        if (!shot.problem && shot.ear > baseline * REOPEN_RATIO) shots.push(Array.from(shot.face.descriptor));
      }
      if (shots.length) return { descriptor: average(shots), liveness: true };
    }
    await sleep(15);
  }
  throw new Error('We did not see a blink in time. Please try again in good light.');
}

/**
 * Registration: captures `count` descriptors (eyes open, one face, close enough),
 * prompting small head turns between them.
 */
export async function captureSamples(video, count = 4, { onStatus, onProgress, shouldStop } = {}) {
  const faceapi = await loadFaceApi();
  const samples = [];

  for (let i = 0; i < count; i++) {
    onStatus?.(PROMPTS[i % PROMPTS.length]);
    await sleep(1800); // time to read the prompt and move
    const started = Date.now();
    let face = null;

    while (!face) {
      if (shouldStop?.()) throw new Error('Cancelled');
      if (Date.now() - started > SAMPLE_TIMEOUT) throw new Error('We could not get a clear view of your face. Try better light.');
      const r = await readFace(faceapi, video, true);
      if (r.problem) onStatus?.(r.problem);
      else if (r.ear < MIN_OPEN_EAR) onStatus?.('Keep your eyes open.');
      else face = r.face;
      if (!face) await sleep(100);
    }

    samples.push(Array.from(face.descriptor));
    onProgress?.(i + 1);
  }
  return samples;
}

// Snapshots the current video frame as a JPEG data URI. Uses the camera's
// natural (unmirrored) frame regardless of any CSS mirroring on the <video>.
export function capturePhoto(video, { maxWidth = 480, quality = 0.82 } = {}) {
  const scale = Math.min(1, maxWidth / video.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(Math.round(video.videoWidth * scale), 1);
  canvas.height = Math.max(Math.round(video.videoHeight * scale), 1);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Single-shot capture for check-in/out: no blink/liveness check — just finds
 * one clear face and returns its descriptor. Resolves { descriptor: number[128] }. Throws Error.
 */
export async function captureOnce(video) {
  const faceapi = await loadFaceApi();
  const r = await readFace(faceapi, video, true);
  if (r.problem) throw new Error(r.problem);
  return { descriptor: Array.from(r.face.descriptor) };
}