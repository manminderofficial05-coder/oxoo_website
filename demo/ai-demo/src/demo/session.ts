// Demo session = a simple browser flag. There is no real authentication in the demo.
export const DEMO_EMAIL = 'demo@hospitalcart.demo';
export const DEMO_PASSWORD = 'demo1234';
const FLAG = 'hospital-cart-demo:session';

export const hasDemoSession = () => {
  try { return typeof window !== 'undefined' && window.localStorage.getItem(FLAG) === '1'; } catch { return false; }
};
export const startDemoSession = () => { try { window.localStorage.setItem(FLAG, '1'); } catch {} };
export const endDemoSession = () => { try { window.localStorage.removeItem(FLAG); } catch {} };
