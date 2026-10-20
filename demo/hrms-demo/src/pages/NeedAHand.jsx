import { useEffect, useState } from 'react';
import { HandHelping, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

export default function NeedAHand() {
  const [ok, setOk] = useState(false);
  useEffect(() => { api.get('/premium/need-a-hand').then(() => setOk(true)).catch(() => setOk(false)); }, []);
  return <main className="p-6 sm:p-8"><div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-600"><HandHelping /></span><div><h1 className="text-3xl font-extrabold">Need a Hand</h1><p className="text-sm text-black/50">Premium employee help and support workspace.</p></div></div><div className="mt-8 rounded-2xl bg-emerald-50 p-5 text-emerald-800">{ok ? <span className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} /> Premium access is enabled.</span> : 'Unable to verify module access.'}</div></div></main>;
}
