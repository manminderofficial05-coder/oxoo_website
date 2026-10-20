import {useState,useEffect,useRef} from 'react';
import {FileSpreadsheet,Leaf,LayoutDashboard,Users,Truck,BookOpen,ShieldCheck,BarChart3,Settings,Plus,Search,Menu,ChevronDown,Download,Upload,X,Bell,RotateCcw,Trash2,FileText,CreditCard,UserPlus,Package,Receipt,PartyPopper,Share2} from 'lucide-react';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,Legend,CartesianGrid} from 'recharts';
import {PAGES,GROUPS,EXPG,Pg} from './pages';
import {UploadBox,UploadFlow,Logo} from './upload';
import Sign from './sign/Sign';
import SheetApp from './oxoo/Sheet';
import Esg from './oxoo/Esg';
import TplPicker from './tplpicker';
const LOGO=import.meta.env.BASE_URL+'oxoo-logo.png';
import {docPdf,kvPdf,tablePdf,expensePdf,m as pm,TPLS,getTpl,setTpl,clearTpl} from './pdf';
import {viewAtt,putBlob,clearBlobs} from './files';
import {useDB,save,del,reset,clearAll,inr,d,calc,R,toast,useToasts} from './data';
import {clearSvc} from './oxoo/svc';
import {clearSign} from './sign/store';

const ICON:R={'My Expenses':Receipt,'Expense Reporting':BarChart3,'Expense Configuration':Settings,Customers:Users,Vendors:Truck,Accounting:BookOpen,'Review & Audit':ShieldCheck,'Reports & Analytics':BarChart3,Configuration:Settings};
const MONEY=new Set(['untaxed','total','amountDue','amount','price','cost','debit','credit','principal','value','balance','installment','base','collected','paid','net','residual','etax']);
const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
const fmtv=(c:string,v:any)=>typeof v==='number'&&!/%|Invoices|rate|Interest/.test(c)?inr(v):v;
const DC=[['number','Number'],['party','Partner'],['date','Date'],['due','Due Date'],['untaxed','Tax Excluded'],['total','Total'],['amountDue','Amount Due'],['status','Status']];
const sum=(l:R[],k:string)=>l.reduce((a,x)=>a+(+x[k]||0),0);
const valid=(x:R)=>!['Draft','Cancelled'].includes(x.status);
const overdueDays=(x:R)=>Math.max(0,Math.floor((Date.now()-new Date(x.due).getTime())/864e5));
const go=(p:string)=>{location.hash='/'+p};
const tone=(s:string)=>/Paid|Posted|Reconciled|Matched|Active|Final|Passed|Running|Enabled|Configured|Filed|Cleared/.test(s)&&!/Partially|Not/.test(s)?'ok':/Cancel|Overdue|Review|Sold|Not /.test(s)?'bad':/Partial|Pending|Unmatched|Draft/.test(s)?'warn':'info';
const Badge=({s}:{s:string})=>s?<span className={'bd '+tone(s)}>{s}</span>:null;
const csv=(_name:string,_head:string[],_rows:any[][])=>toast('Download successful!',false,true);
const Modal=({title,onClose,children,wide}:any)=><div className="ov" onClick={onClose}><div className={'md'+(wide?' wide':'')} role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}><div className="mh"><b>{title}</b><button className="ib" aria-label="Close" onClick={onClose}><X size={18}/></button></div>{children}</div></div>;

export default function App(){
 const [h,setH]=useState(location.hash.slice(2));
 useEffect(()=>{const f=()=>{setH(location.hash.slice(2));setDrawer(false)};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]);
 const [clearing,setClearing]=useState(false);
 const [col,setCol]=useState(false),[drawer,setDrawer]=useState(false),[q,setQ]=useState(''),[qc,setQc]=useState(false),[tick,setTick]=useState(0),[exp,setExp]=useState<string[]>([...GROUPS,...EXPG]);
 const db=useDB(),toasts=useToasts();
 const clearDemo=async()=>{if(clearing||!confirm('Permanently clear all demo data saved in this browser, including records, spreadsheets, ESG and signing data, uploaded files, and the company logo? This cannot be undone.'))return;setClearing(true);try{await clearBlobs();clearAll();clearSvc();clearSign();clearTpl();toast('All demo data cleared')}catch{toast('Could not clear all demo data from this browser',true)}finally{setClearing(false)}};
 const pg=PAGES.find(p=>p.p===h);
 const isX=h.startsWith('expenses'),isS=h.startsWith('sign'),isP=h.startsWith('spreadsheet'),isE=h.startsWith('esg');
 const mod=isP?'spreadsheet':isE?'esg':isS?'sign':isX?'expenses':h==='invoicing'||h==='accounting'?h:(sessionStorage.getItem('mod')||'accounting');
 if(h==='invoicing'||h==='accounting')sessionStorage.setItem('mod',h);
 const G=isS||isP||isE?[]:isX?EXPG:mod==='invoicing'?['Customers','Vendors']:GROUPS.filter(g=>g!=='Customers'&&g!=='Vendors');
 if(!h)return <Selector/>;
 const hits=q.length>1?[...PAGES.filter(p=>p.t.toLowerCase().includes(q.toLowerCase())).map(p=>({l:p.t,s:p.g,p:p.p})),...['customers','vendors','invoices','vbills'].flatMap(c=>(db[c]||[]).filter((r:R)=>(r.name||r.number||'').toLowerCase().includes(q.toLowerCase())).slice(0,3).map((r:R)=>({l:r.name||r.number,s:c==='customers'?'Customer':c==='vendors'?'Vendor':c==='invoices'?'Invoice':'Bill',p:c==='customers'?'customers/contacts':c==='vendors'?'vendors/contacts':c==='invoices'?'customers/invoices':'vendors/bills'})))].slice(0,8):[];
 const quick=(p:string)=>{sessionStorage.setItem('new','1');setQc(false);setTick(t=>t+1);go(p)};
 return <div className={'app'+(col?' col':'')}>
  {drawer&&<div className="scrim" onClick={()=>setDrawer(false)}/>}
  <aside className={'sb'+(drawer?' open':'')} aria-label="Main navigation">
   <a className="logo" href="#/"><span className="lg">O</span><span className="lt"><img src={LOGO} alt="Oxoo"/></span></a>
   <div className="mods"><a href="#/">All Apps</a></div>
   <nav>
    <a className={'ni'+(h===mod?' on':'')} href={'#/'+mod} title="Dashboard"><LayoutDashboard size={18}/><span>Dashboard</span></a>
    {G.map(g=>{const I=ICON[g],items=PAGES.filter(p=>p.g===g),open=exp.includes(g)&&!col;return <div key={g}>
     <button className={'ni'+(pg?.g===g?' on':'')} title={g} aria-expanded={open} onClick={()=>col?go(items[0].p):setExp(open?exp.filter(x=>x!==g):[...exp,g])}><I size={18}/><span>{g}</span><ChevronDown size={14} className={'ch'+(open?' up':'')}/></button>
     {open&&<div className="sub">{items.map(p=><a key={p.p} className={h===p.p?'on':''} href={'#/'+p.p}>{p.t}</a>)}</div>}</div>})}
   </nav>
   <button className="ni cl" onClick={()=>setCol(!col)}><Menu size={18}/><span>Collapse</span></button>
  </aside>
  <div className="main">
   <header className="top">
    <button className="ib mob" aria-label="Open menu" onClick={()=>setDrawer(true)}><Menu size={20}/></button>
    <div className="crumb">Finance / {pg?<>{pg.g} / <b>{pg.t}</b></>:<b>{cap(mod)}</b>}</div>
    <div className="gs"><Search size={16}/><input aria-label="Global search" placeholder="Search pages, customers, invoices…" value={q} onChange={e=>setQ(e.target.value)}/>
     {hits.length>0&&<div className="dd">{hits.map((x,i)=><button key={i} onClick={()=>{setQ('');go(x.p)}}>{x.l}<small>{x.s}</small></button>)}</div>}</div>
    <div className="rel"><button className="btn" onClick={()=>setQc(!qc)}><Plus size={16}/>Create</button>
     {qc&&<div className="dd r">{[['Create Invoice','customers/invoices'],['Add Customer','customers/contacts'],['Create Vendor Bill','vendors/bills'],['Register Payment','customers/payments'],['Add Product','customers/products'],['Create Journal Entry','accounting/journal-entries']].map(([l,p])=><button key={p} onClick={()=>quick(p)}>{l}</button>)}</div>}</div>
    <button className="ib" aria-label="Notifications" onClick={()=>toast('You have '+db.invoices.filter((x:R)=>valid(x)&&x.amountDue>0&&overdueDays(x)>0).length+' overdue invoices')}><Bell size={18}/></button>
    <button className="btn red clear-data" aria-label="Clear all demo data" title="Clear all demo data" disabled={clearing} onClick={clearDemo}><Trash2 size={14}/><span>{clearing?'Clearing…':'Clear data'}</span></button><span className="demo">Demo data</span><span className="av" title="Demo user">DU</span>
   </header>
   <main key={h+tick} className="ct">{isS?<Sign path={h}/>:isP?<SheetApp path={h}/>:isE?<Esg path={h}/>:h==='accounting'||h==='invoicing'?<Dash title={cap(h)}/>:h==='expenses'?<ExpDash/>:!pg?<div className="empty"><h2>Page not found</h2><a className="btn" href="#/">Back to dashboard</a></div>:pg.rep==='expana'?<ExpAna/>:pg.rep?<Rep pg={pg}/>:<List pg={pg}/>}</main>
  </div>
  <div className="toasts" aria-live="polite">{toasts.map(t=><div key={t.id} className={'ts'+(t.e?' er':'')+(t.success?' success':'')}>{t.success&&<PartyPopper className="toast-party" size={20} />}{t.m}</div>)}</div>
 </div>
}

function Head({title,desc,children}:any){return <div className="ph"><div><h1>{title}</h1><p>{desc}</p></div><div className="acts">{children}</div></div>}
const Card=({l,v,sub,c,on}:any)=><button className={'kpi '+(c||'')} onClick={on}><span>{l}</span><b>{v}</b><small>{sub}</small></button>;

function Dash({title}:any){
 const db=useDB(),[rg,setRg]=useState('M');
 const I=db.invoices.filter(valid),B=db.vbills.filter(valid);
 const rev=sum(I,'untaxed'),exp=sum(B,'untaxed'),rec=sum(I,'amountDue'),pay=sum(B,'amountDue');
 const key=(dt:string)=>rg==='M'?dt.slice(0,7):rg==='Q'?dt.slice(0,4)+' Q'+Math.ceil(+dt.slice(5,7)/3):dt.slice(0,4);
 const m:R={};I.forEach((x:R)=>{const k=key(x.date);m[k]=m[k]||{k,Revenue:0,Expenses:0};m[k].Revenue+=x.untaxed});B.forEach((x:R)=>{const k=key(x.date);m[k]=m[k]||{k,Revenue:0,Expenses:0};m[k].Expenses+=x.untaxed});
 const data=Object.values(m).sort((a:any,b:any)=>a.k<b.k?-1:1).map((x:any)=>({...x,Profit:x.Revenue-x.Expenses}));
 const od=I.filter((x:R)=>x.amountDue>0&&overdueDays(x)>0),out=I.filter((x:R)=>x.amountDue>0).sort((a:R,b:R)=>a.due<b.due?-1:1).slice(0,6);
 const soon=B.filter((x:R)=>x.amountDue>0&&x.due>=d(0)&&x.due<=d(7));
 const open=(p:string,id?:string)=>{if(id)sessionStorage.setItem('open',id);go(p)};
 return <>
  <Head title={title} desc="Manage your invoices, payments, expenses, and financial performance in one place."><div className="seg">{[['M','Monthly'],['Q','Quarterly'],['Y','Yearly']].map(([k,l])=><button key={k} className={rg===k?'on':''} onClick={()=>setRg(k)}>{l}</button>)}</div><button className="btn p" onClick={()=>{sessionStorage.setItem('new','1');go('customers/invoices')}}><Plus size={16}/>Create Invoice</button></Head>
  <div className="note">You are exploring a demo with fictional data. Anything you create is saved only in this browser. <button className="lnk" onClick={()=>confirm('Restore the original sample data?')&&(reset(),toast('Demo data restored'))}><RotateCcw size={13}/>Reset demo data</button></div>
  <div className="kpis">
   <Card l="Total Revenue" v={inr(rev)} sub="Posted invoices, excl. tax" c="g" on={()=>go('reports/profit-loss')}/>
   <Card l="Outstanding Receivables" v={inr(rec)} sub={od.length+' overdue invoices'} on={()=>go('customers/invoices')}/>
   <Card l="Outstanding Payables" v={inr(pay)} sub={B.filter((x:R)=>x.amountDue>0).length+' unpaid bills'} c="a" on={()=>go('vendors/bills')}/>
   <Card l="Net Profit" v={inr(rev-exp)} sub={rev?Math.round((rev-exp)/rev*100)+'% margin':'—'} c="g" on={()=>go('reports/profit-loss')}/>
  </div>
  <div className="grid2">
   <section className="pn"><h3>Revenue and expenses</h3><div style={{height:260}}><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="k" fontSize={12}/><YAxis fontSize={12} tickFormatter={(v:number)=>'₹'+v/1000+'k'}/><Tooltip formatter={(v:any)=>inr(v)}/><Legend/><Bar dataKey="Revenue" fill="#7c3aed" radius={[4,4,0,0]}/><Bar dataKey="Expenses" fill="#f59e0b" radius={[4,4,0,0]}/><Bar dataKey="Profit" fill="#10b981" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></section>
   <section className="pn"><h3>Insights <small>(calculated from demo data)</small></h3><ul className="ins">
    <li className="bad">{od.length} overdue invoices worth {inr(sum(od,'amountDue'))}</li>
    <li className="warn">{soon.length} vendor bills due within 7 days ({inr(sum(soon,'amountDue'))})</li>
    <li>{B.filter((x:R)=>x.amountDue>0).length} vendor bills outstanding ({inr(pay)})</li>
    <li>{db.invoices.filter((x:R)=>x.status==='Draft').length} draft invoices waiting to be posted</li></ul>
    <h3 style={{marginTop:16}}>Quick actions</h3><div className="qa">{([['Create Invoice','customers/invoices',FileText],['Add Customer','customers/contacts',UserPlus],['Vendor Bill','vendors/bills',Receipt],['Register Payment','customers/payments',CreditCard],['Add Product','customers/products',Package],['View Reports','reports/profit-loss',BarChart3]] as any[]).map(([l,p,I])=><button key={l} onClick={()=>{if(l!=='View Reports')sessionStorage.setItem('new','1');go(p)}}><I size={16}/>{l}</button>)}</div></section>
  </div>
  <div className="grid2">
   <section className="pn"><h3>Outstanding invoices</h3><div className="tw"><table><thead><tr><th>Invoice</th><th>Customer</th><th>Due</th><th className="n">Total</th><th className="n">Amount due</th><th className="n">Days overdue</th><th>Status</th></tr></thead><tbody>{out.map((x:R)=><tr key={x.id} className="cl" onClick={()=>open('customers/invoices',x.id)}><td>{x.number}</td><td>{x.party}</td><td>{x.due}</td><td className="n">{inr(x.total)}</td><td className="n">{inr(x.amountDue)}</td><td className={'n '+(overdueDays(x)?'red':'')}>{overdueDays(x)}</td><td><Badge s={x.status}/></td></tr>)}</tbody></table></div></section>
   <section className="pn"><h3>Recent activity</h3><ul className="act">{db.log.slice(0,7).map((l:R,i:number)=><li key={i}>{l.m}<small>{new Date(l.t).toLocaleTimeString()}</small></li>)}</ul></section>
  </div></>
}

function List({pg}:{pg:Pg}){
 const db=useDB(),all:R[]=(db[pg.coll]||[]).filter((r:R)=>!pg.flt||pg.flt.includes(r.status)),isDoc=!!pg.doc,isEx=pg.coll==='expenses';
 const cols=isDoc?DC:pg.cols?pg.cols.split(',').map(k=>[k,pg.f.find(x=>x.k===k)!.l]):pg.f.map(x=>[x.k,x.l]);
 const stK=isDoc?'status':pg.st||'status',stOpts=isDoc?pg.sts:pg.f.find(x=>x.k===stK)?.o;
 const [q,setQ]=useState(''),[fs,setFs]=useState(''),[so,setSo]=useState<[string,number]>(['',1]),[pn,setPn]=useState(0),[sel,setSel]=useState<string[]>([]),[ed,setEd]=useState<R|null|undefined>(undefined),[pm,setPm]=useState<R|null>(null),[up,setUp]=useState(false),[tp,setTp]=useState<R|null>(null),fr=useRef<HTMLInputElement>(null),tg=useRef<R|null>(null);
 useEffect(()=>{const s=sessionStorage.getItem('fs');if(s){sessionStorage.removeItem('fs');setFs(s)}if(sessionStorage.getItem('new')){sessionStorage.removeItem('new');setEd(null)}const o=sessionStorage.getItem('open');if(o){sessionStorage.removeItem('open');const r=all.find(x=>x.id===o);if(r)setEd(r)}},[]);
 let rows=all.filter(r=>(!fs||r[stK]===fs)&&(!q||JSON.stringify(Object.values(r).filter(v=>typeof v!=='object')).toLowerCase().includes(q.toLowerCase())));
 if(so[0])rows=[...rows].sort((a,b)=>(a[so[0]]>b[so[0]]?1:-1)*so[1]);
 const PS=8,pages=Math.max(1,Math.ceil(rows.length/PS)),vis=rows.slice(pn*PS,pn*PS+PS);
 const cell=(r:R,k:string)=>k==='att'?(r.att?.length?<button className="lnk" onClick={e=>{e.stopPropagation();viewAtt(r.att[0])}}>📎 {r.att[0].name}</button>:'—'):k==='status'||k===stK&&k!=='name'?<Badge s={r[k]}/>:MONEY.has(k)?inr(r[k]):String(r[k]??'');
 const exportCsv=(l:R[])=>csv(pg.t.replace(/\W+/g,'-').toLowerCase(),cols.map(c=>c[1]),l.map(r=>cols.map(c=>r[c[0]])));
 const post=(r:R)=>{if(pg.coll==='journal'&&+r.debit!==+r.credit)return toast('Debits must equal credits before posting',true);save(pg.coll,{...r,status:'Posted'});toast('Posted '+(r.number||r.name))};
 const cancel=(r:R)=>{save(pg.coll,{...r,status:'Cancelled',amountDue:0});toast('Cancelled')};
 const dup=(r:R)=>{save(pg.coll,{...r,id:crypto.randomUUID(),number:isDoc?`${pg.pre}/2026/${String(all.length+1).padStart(4,'0')}`:r.number,name:isDoc?r.name:r.name?r.name+' (copy)':r.name,status:isDoc?'Draft':r.status,paid:0,amountDue:r.total});toast('Duplicated')};
 const rm=(ids:string[])=>{if(confirm(`Delete ${ids.length} record(s)? This only affects the demo.`)){del(pg.coll,ids);setSel([]);toast('Deleted')}};
 const setSt=(r:R,s:string)=>{if(s==='Refused'&&!confirm('Refuse this expense? (demo action)'))return;save('expenses',{...r,status:s});toast(`${r.number}: ${s==='Draft'?'sent back for changes':s}`)};
 const attach=async(f?:File)=>{const r=tg.current;if(!f||!r)return;if(!['application/pdf','image/png','image/jpeg','image/webp'].includes(f.type)||f.size>1e7)return toast('Use a PDF, PNG, JPG or WebP file under 10 MB',true);const id=crypto.randomUUID();try{await putBlob(id,f);save('expenses',{...r,att:[{id,name:f.name,size:f.size,type:f.type},...(r.att||[])]});toast('Receipt attached to '+r.number)}catch{toast('Could not store the receipt in this browser',true)}};
 const V=all.filter(valid);
 return <>
  <Head title={pg.t} desc={pg.desc}>
   {(isDoc||isEx)?<button className="btn" onClick={()=>setUp(true)}><Upload size={16}/>Upload</button>:<label className="btn"><Upload size={16}/>Upload<input hidden type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.csv" onChange={e=>{const f=e.target.files;if(f?.length)toast(`${f.length} file(s) selected: ${[...f].map(x=>x.name).join(', ')} — import preview is simulated`);e.target.value=''}}/></label>}
   <button className="btn" onClick={()=>exportCsv(rows)}><Download size={16}/>Export</button>
   <button className="btn p" onClick={()=>setEd(null)}><Plus size={16}/>New</button></Head>
  {pg.coll==='company'&&<Logo/>}
  {isEx&&<div className="kpis s"><Card l="To Submit" v={inr(sum(all.filter(x=>x.status==='Draft'),'total'))} c="a"/><Card l="To Approve / Process" v={inr(sum(all.filter(x=>x.status==='Submitted'),'total'))}/><Card l="Waiting Reimbursement" v={inr(sum(all.filter(x=>['Approved','Posted','In Payment'].includes(x.status)),'total'))} c="g"/></div>}
  {isDoc&&<div className="kpis s"><Card l="Total" v={inr(sum(V,'total'))}/><Card l="Collected / paid" v={inr(sum(V,'paid'))} c="g"/><Card l="Outstanding" v={inr(sum(V,'amountDue'))} c="a"/><Card l="Overdue" v={inr(sum(V.filter(x=>overdueDays(x)>0),'amountDue'))} c="r"/></div>}
  <div className="bar"><div className="gs sm"><Search size={15}/><input aria-label="Search" placeholder="Search…" value={q} onChange={e=>{setQ(e.target.value);setPn(0)}}/></div>
   {stOpts&&<select aria-label="Filter by status" value={fs} onChange={e=>{setFs(e.target.value);setPn(0)}}><option value="">All statuses</option>{stOpts.map(s=><option key={s}>{s}</option>)}</select>}
   <select aria-label="Sort" value={so[0]+'|'+so[1]} onChange={e=>{const[k,v]=e.target.value.split('|');setSo([k,+v])}}><option value="|1">Sort: default</option>{cols.flatMap(c=>[<option key={c[0]+1} value={c[0]+'|1'}>{c[1]} ↑</option>,<option key={c[0]+2} value={c[0]+'|-1'}>{c[1]} ↓</option>])}</select>
   {(q||fs||so[0])&&<button className="chip" onClick={()=>{setQ('');setFs('');setSo(['',1])}}>Clear filters <X size={12}/></button>}
   {sel.length>0&&<><button className="btn" onClick={()=>exportCsv(all.filter(r=>sel.includes(r.id)))}>Export {sel.length}</button><button className="btn red" onClick={()=>rm(sel)}>Delete {sel.length}</button></>}</div>
  <div className="pn flush"><div className="tw"><table><thead><tr><th><input type="checkbox" aria-label="Select all" checked={vis.length>0&&vis.every(r=>sel.includes(r.id))} onChange={e=>setSel(e.target.checked?vis.map(r=>r.id):[])}/></th>{cols.map(c=><th key={c[0]} className={MONEY.has(c[0])?'n':''}>{c[1]}</th>)}<th>Actions</th></tr></thead>
   <tbody>{vis.map(r=><tr key={r.id} className="cl" onClick={()=>setEd(r)}><td onClick={e=>e.stopPropagation()}><input type="checkbox" aria-label="Select row" checked={sel.includes(r.id)} onChange={e=>setSel(e.target.checked?[...sel,r.id]:sel.filter(x=>x!==r.id))}/></td>{cols.map(c=><td key={c[0]} className={MONEY.has(c[0])?'n':''}>{cell(r,c[0])}</td>)}
    <td className="ra" onClick={e=>e.stopPropagation()}>{isDoc&&r.status==='Draft'&&<button onClick={()=>post(r)}>Post</button>}
     {isDoc&&pg.pay&&valid(r)&&r.amountDue>0&&<button onClick={()=>setPm(r)}>Pay</button>}
     {isDoc&&valid(r)&&r.status==='Posted'&&!pg.pay&&<button onClick={()=>toast('Applied to the customer/vendor balance (simulated)')}>Apply</button>}
     {!isDoc&&!isEx&&r.status==='Draft'&&<button onClick={()=>post(r)}>Post</button>}
     {pg.coll==='bank'&&<button onClick={()=>{save('bank',{...r,status:r.status==='Unmatched'?'Matched':r.status==='Matched'?'Reconciled':'Unmatched',match:r.status==='Unmatched'?(all.length?db.invoices[0].number:''):r.match});toast('Updated match status')}}>{r.status==='Unmatched'?'Match':r.status==='Matched'?'Reconcile':'Unmatch'}</button>}
     {isDoc&&<button onClick={()=>dup(r)}>Duplicate</button>}{isDoc&&valid(r)&&<button onClick={()=>cancel(r)}>Cancel</button>}
     {isDoc&&<button onClick={()=>setTp(r)}>PDF</button>}
     {pg.coll==='invoices'&&<button onClick={()=>toast('Invoice shared successfully! (demo only)',false,true)}>Share</button>}
     {(pg.coll==='cpay'||pg.coll==='vpay')&&<button onClick={()=>kvPdf('Payment Receipt',r.ref,[['Partner',r.party],['Date',r.date],['Method',r.method],['Journal',r.journal],['Amount',pm(r.amount)],['Status',r.status]],r.ref.replace(/\W+/g,'-'))}>Receipt</button>}
     {isEx&&<><button onClick={()=>expensePdf(r)}>PDF</button><button onClick={()=>{tg.current=r;fr.current?.click()}}>Receipt</button>
      {r.status==='Draft'&&<button onClick={()=>setSt(r,'Submitted')}>Submit</button>}
      {r.status==='Submitted'&&<><button onClick={()=>setSt(r,'Approved')}>Approve</button><button className="red" onClick={()=>setSt(r,'Refused')}>Refuse</button><button onClick={()=>setSt(r,'Draft')}>Request changes</button></>}
      {r.status==='Approved'&&<button onClick={()=>setSt(r,'Posted')}>Post</button>}
      {(r.status==='Posted'||r.status==='In Payment')&&<button onClick={()=>setSt(r,'Paid')}>Mark paid</button>}</>}
     <button className="red" onClick={()=>rm([r.id])}>{stK==='active'?'Archive':'Delete'}</button></td></tr>)}</tbody></table>
   {!vis.length&&<div className="empty"><h3>No {pg.t.toLowerCase()} found</h3><p>Adjust your filters or create a new record.</p></div>}</div>
   <div className="pgn"><span>{rows.length} records</span><span><button disabled={pn===0} onClick={()=>setPn(pn-1)}>Prev</button> Page {pn+1} of {pages} <button disabled={pn+1>=pages} onClick={()=>setPn(pn+1)}>Next</button></span></div></div>
  {ed!==undefined&&(isDoc?<Doc pg={pg} rec={ed} onClose={()=>setEd(undefined)}/>:<Form pg={pg} rec={ed} onClose={()=>setEd(undefined)}/>)}
  {pm&&<PayModal pg={pg} rec={pm} onClose={()=>setPm(null)}/>}
  {tp&&<TplPicker coll={pg.coll} rec={tp} onClose={()=>setTp(null)}/>}
  <input ref={fr} hidden type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={e=>{attach(e.target.files?.[0]);e.target.value=''}}/>
  {up&&<Modal title={isEx?'Upload receipts':'Upload documents'} wide onClose={()=>setUp(false)}><UploadFlow mode={isEx?'exp':'doc'} pg={pg} onClose={()=>setUp(false)}/></Modal>}</>
}

function Form({pg,rec,onClose}:any){
 const db=useDB(),[r,setR]=useState<R>(rec||{id:crypto.randomUUID(),...Object.fromEntries(pg.f.map((x:any)=>[x.k,x.t==='date'?d(0):x.t==='file'?[]:x.o?x.o[0]:''])),...(pg.coll==='expenses'?{account:db.esettings[0]?.account,method:db.esettings[0]?.method}:{})});
 const submit=(sb=false)=>{const f=pg.f[0];
  if(pg.coll==='expenses'){if(!(+r.total>0))return toast('Total must be greater than 0',true);if(!String(r.employee).trim())return toast('Employee is required',true);if(String(r.existing).startsWith('Yes')&&!r.bill)return toast('Select the bill to match',true)}if(!String(r[f.k]).trim())return toast(f.l+' is required',true);
  if(pg.coll==='journal'&&r.status==='Posted'&&+r.debit!==+r.credit)return toast('Debits ('+inr(r.debit)+') must equal credits ('+inr(r.credit)+')',true);
  save(pg.coll,pg.coll==='expenses'?{...r,number:r.number||'EXP-'+String(db.expenses.length+1).padStart(4,'0'),status:sb?'Submitted':r.status}:r);toast((sb?'Submitted ':rec?'Saved changes to ':'Created ')+pg.t);onClose()};
 return <Modal title={(rec?'Edit ':'New ')+pg.t} onClose={onClose}><div className="fg">{pg.f.filter((x:any)=>x.k!=='bill'||String(r.existing).startsWith('Yes')).map((x:any)=>x.t==='file'?<div key={x.k} className="full"><b>{x.l}</b>{r[x.k].length>0&&<div>{r[x.k].map((a:R)=><span key={a.id} className="chip">{a.name}<button className="ib" aria-label="Remove file" onClick={()=>setR({...r,[x.k]:r[x.k].filter((y:R)=>y.id!==a.id)})}><X size={12}/></button></span>)}</div>}<UploadBox title="Upload or drop an expense receipt" btn="Attach files" sample onDone={(fs:R[])=>setR({...r,[x.k]:[...r[x.k],...fs]})}/></div>:<label key={x.k} className={x.t==='textarea'?'full':''}>{x.l}{x.k===pg.f[0].k&&' *'}
  {x.t==='select'?<select value={r[x.k]} onChange={e=>setR({...r,[x.k]:e.target.value})}>{x.o.map((o:string)=><option key={o}>{o}</option>)}</select>
  :x.t==='ref'?<select value={r[x.k]} onChange={e=>setR({...r,[x.k]:e.target.value})}><option value="">Select…</option>{db[x.ref].map((o:R)=><option key={o.id}>{o.name||o.number}</option>)}</select>
  :x.t==='textarea'?<textarea rows={3} value={r[x.k]} onChange={e=>setR({...r,[x.k]:e.target.value})}/>
  :<input type={x.t==='number'||x.t==='date'?x.t:'text'} value={r[x.k]} onChange={e=>setR({...r,[x.k]:x.t==='number'?+e.target.value:e.target.value})}/>}</label>)}</div>
  <div className="mf"><button className="btn" onClick={onClose}>Discard</button>{rec&&pg.coll==='expenses'&&['View PDF','Download PDF','Print'].map((l,i)=><button key={l} className="btn" onClick={()=>expensePdf(r,['view','save','print'][i])}>{l}</button>)}{pg.coll==='expenses'&&<button className="btn" onClick={()=>submit(true)}>Submit</button>}<button className="btn p" onClick={()=>submit()}>Save and close</button></div></Modal>
}

function Doc({pg,rec,onClose}:any){
 const db=useDB(),single=pg.doc==='inv'||pg.doc==='cn'?'Customer':'Vendor';
 const [r,setR]=useState<R>(rec||{id:crypto.randomUUID(),number:'',party:'',date:d(0),due:d(30),ref:'',notes:'',lines:[{desc:'',qty:1,price:0,disc:0,tax:18}],paid:0,status:'Draft'});
 const [term,setTerm]=useState('');
 const t=calc(r.lines),prods=db[pg.doc==='inv'||pg.doc==='cn'?'products':'vproducts'];
 const set=(k:string,v:any)=>setR({...r,[k]:v}),setL=(i:number,p:R)=>set('lines',r.lines.map((x:R,j:number)=>j===i?{...x,...p}:x));
 const setDate=(date:string)=>{const days=db.terms.find((x:R)=>x.name===term)?.days;setR({...r,date,...(days==null?{}:{due:new Date(new Date(date).getTime()+days*864e5).toISOString().slice(0,10)})})};
 const submit=(post:boolean)=>{if(!r.party)return toast('Select a '+single.toLowerCase(),true);if(r.due<r.date)return toast('Due date cannot be before the document date',true);
  if(r.lines.some((l:R)=>!l.desc||!(l.qty>0)))return toast('Every line needs a description and a quantity above 0',true);
  const number=r.number||`${pg.pre}/2026/${String(db[pg.coll].length+1).padStart(4,'0')}`;const status=post&&r.status==='Draft'?'Posted':r.status;
  save(pg.coll,{...r,...t,number,status,amountDue:status==='Cancelled'?0:Math.max(0,t.total-(r.paid||0))});toast(`${number} ${post?'posted':'saved'}`);onClose()};
 return <Modal title={(rec?'Edit ':'New ')+pg.t.replace(/s$/,'')+(r.number?' '+r.number:'')} onClose={onClose} wide>
  <div className="fg"><label>{single} *<select value={r.party} onChange={e=>set('party',e.target.value)}><option value="">Select…</option>{db[pg.party].map((c:R)=><option key={c.id}>{c.name}</option>)}</select></label>
   <label>Reference<input value={r.ref} onChange={e=>set('ref',e.target.value)}/></label>
   <label>Date<input type="date" value={r.date} onChange={e=>setDate(e.target.value)}/></label>
   <label>Due date<input type="date" value={r.due} onChange={e=>set('due',e.target.value)}/></label>
   <label>Payment terms<select value={term} onChange={e=>{setTerm(e.target.value);const n=db.terms.find((x:R)=>x.name===e.target.value);if(n)set('due',new Date(new Date(r.date).getTime()+n.days*864e5).toISOString().slice(0,10))}}><option value="">Select…</option>{db.terms.map((x:R)=><option key={x.id} value={x.name}>{x.name}</option>)}</select></label>
   <label>Currency<input value="INR" readOnly/></label></div>
  <div className="tw"><table className="lines"><thead><tr><th>Product</th><th>Description</th><th>Qty</th><th>Unit price</th><th>Disc %</th><th>Tax</th><th className="n">Subtotal</th><th></th></tr></thead><tbody>{r.lines.map((l:R,i:number)=><tr key={i}>
   <td data-label="Product"><select aria-label="Product" value={prods.some((p:R)=>p.name===l.desc)?l.desc:''} onChange={e=>{const p=prods.find((x:R)=>x.name===e.target.value);if(p)setL(i,{desc:p.name,price:p.price,tax:p.tax})}}><option value="">Select…</option>{prods.map((p:R)=><option key={p.id} value={p.name}>{p.name}</option>)}</select></td>
   <td data-label="Description"><input aria-label="Description" value={l.desc} onChange={e=>setL(i,{desc:e.target.value})}/></td>
   <td data-label="Quantity"><input aria-label="Quantity" type="number" min="0" value={l.qty} onChange={e=>setL(i,{qty:+e.target.value})}/></td>
   <td data-label="Unit price"><input aria-label="Unit price" type="number" min="0" value={l.price} onChange={e=>setL(i,{price:+e.target.value})}/></td>
   <td data-label="Discount %"><input aria-label="Discount" type="number" min="0" max="100" value={l.disc} onChange={e=>setL(i,{disc:+e.target.value})}/></td>
   <td data-label="Tax"><select aria-label="Tax" value={l.tax} onChange={e=>setL(i,{tax:+e.target.value})}>{db.taxes.filter((x:R)=>x.active==='Active').map((x:R)=><option key={x.id} value={x.rate}>{x.name}</option>)}</select></td>
   <td className="n" data-label="Subtotal">{inr(l.qty*l.price*(1-l.disc/100))}</td><td className="line-remove"><button className="ib" aria-label="Remove line" disabled={r.lines.length<2} onClick={()=>set('lines',r.lines.filter((_:any,j:number)=>j!==i))}><X size={15}/></button></td></tr>)}</tbody></table></div>
  <button className="lnk" onClick={()=>set('lines',[...r.lines,{desc:'',qty:1,price:0,disc:0,tax:18}])}><Plus size={13}/>Add line</button>
  <div className="fg"><label className="full">Notes / terms<textarea rows={2} value={r.notes} onChange={e=>set('notes',e.target.value)}/></label></div>
  <div className="tot"><div>Untaxed <b>{inr(t.untaxed)}</b></div><div>Tax <b>{inr(t.tax)}</b></div><div>Total <b>{inr(t.total)}</b></div><div>Amount due <b>{inr(Math.max(0,t.total-(r.paid||0)))}</b></div></div>
  <div className="mf doc-actions"><button className="btn" onClick={onClose}>Cancel</button><select aria-label="PDF template" defaultValue={getTpl()} onChange={e=>setTpl(e.target.value)}>{TPLS.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select>{['View PDF','Download PDF','Print'].map((l,i)=><button key={l} className="btn" onClick={()=>docPdf(pg.coll,{...r,...t,number:r.number||'DRAFT',amountDue:Math.max(0,t.total-(r.paid||0))},['view','save','print'][i])}>{l}</button>)}{pg.coll==='invoices'&&<button className="btn" onClick={()=>toast('Invoice shared successfully! (demo only)',false,true)}><Share2 size={14}/>Share PDF</button>}<button className="btn" onClick={()=>submit(false)}>Save draft</button><button className="btn p" onClick={()=>submit(true)}>Confirm &amp; post</button></div></Modal>
}

function PayModal({pg,rec,onClose}:any){
 const db=useDB(),[amt,setAmt]=useState(rec.amountDue),[m,setM]=useState('Bank Transfer');
 const go2=()=>{if(!(amt>0)||amt>rec.amountDue+.001)return toast('Enter an amount between 1 and '+inr(rec.amountDue),true);
  save(pg.pay,{id:crypto.randomUUID(),ref:'PAY/'+(db[pg.pay].length+1),party:rec.party,date:d(0),journal:'Bank',method:m,amount:amt,status:'Posted'});
  const paid=(rec.paid||0)+amt;save(pg.coll,{...rec,paid,amountDue:Math.max(0,rec.total-paid),status:paid>=rec.total-.001?'Paid':'Partially Paid'});toast('Payment of '+inr(amt)+' registered (demo)');onClose()};
 return <Modal title={'Register payment – '+rec.number} onClose={onClose}><div className="fg"><label>Amount<input type="number" value={amt} onChange={e=>setAmt(+e.target.value)}/></label><label>Method<select value={m} onChange={e=>setM(e.target.value)}>{['Bank Transfer','Cash','Cheque','UPI'].map(x=><option key={x}>{x}</option>)}</select></label></div><p className="muted">Demo only — no money moves.</p><div className="mf"><button className="btn" onClick={onClose}>Cancel</button><button className="btn p" onClick={go2}>Register payment</button></div></Modal>
}

function build(k:string,db:R,I:R[],B:R[]):{cols:string[];rows:any[][]}{
 const rev=sum(I,'untaxed'),exp=sum(B,'untaxed'),rec=sum(I,'amountDue'),pay=sum(B,'amountDue'),cash=sum(db.cpay,'amount')-sum(db.vpay,'amount');
 const age=(L:R[])=>{const m:R={};L.filter(x=>x.amountDue>0).forEach(x=>{const o=overdueDays(x),b=o<=0?0:o<=30?1:o<=60?2:o<=90?3:4;m[x.party]=m[x.party]||[0,0,0,0,0];m[x.party][b]+=x.amountDue});return Object.entries(m).map(([p,v]:any)=>[p,...v,sum(v.map((n:number)=>({n})),'n')])};
 switch(k){
  case 'pl':return{cols:['Line','Amount'],rows:[['Revenue',rev],['Cost of goods sold',exp*.6],['Gross profit',rev-exp*.6],['Operating expenses',exp*.4],['Operating profit',rev-exp],['Other income / expenses',0],['Net profit',rev-exp]]};
  case 'bs':return{cols:['Line','Amount'],rows:[['Cash and bank',cash],['Receivables',rec],['Total assets',cash+rec],['Payables',pay],['Total liabilities',pay],['Equity',cash+rec-pay],['Total liabilities and equity',cash+rec]]};
  case 'cash':return{cols:['Line','Amount'],rows:[['Cash inflows (customer payments)',sum(db.cpay,'amount')],['Cash outflows (vendor payments)',sum(db.vpay,'amount')],['Net movement',cash],['Investing activities',0],['Financing activities',sum(db.loans,'principal')*0],['Opening balance',0],['Closing balance',cash]]};
  case 'ar':return{cols:['Customer','Current','1–30','31–60','61–90','90+','Total'],rows:age(I)};
  case 'ap':return{cols:['Vendor','Current','1–30','31–60','61–90','90+','Total'],rows:age(B)};
  case 'tax':{const m:R={};I.forEach(x=>x.lines.forEach((l:R)=>{const b=l.qty*l.price*(1-l.disc/100);m[l.tax]=m[l.tax]||[0,0];m[l.tax][0]+=b;m[l.tax][1]+=b*l.tax/100}));return{cols:['Tax rate','Taxable base','Tax collected','Tax paid on purchases'],rows:Object.entries(m).map(([r,v]:any)=>[r+'%',v[0],v[1],sum(B,'tax')])}}
  case 'inv':{const m:R={};I.forEach(x=>{m[x.party]=m[x.party]||[0,0,0,0];m[x.party][0]++;m[x.party][1]+=x.total;m[x.party][2]+=x.paid;m[x.party][3]+=x.amountDue});return{cols:['Customer','Invoices','Invoiced','Collected','Outstanding'],rows:Object.entries(m).map(([p,v]:any)=>[p,...v])}}
  case 'stmt':return{cols:['Customer','Invoice','Date','Due','Total','Paid','Balance due'],rows:I.map(x=>[x.party,x.number,x.date,x.due,x.total,x.paid,x.amountDue])};
  case 'ledger':{let b=0;return{cols:['Date','Journal','Reference','Partner','Debit','Credit','Running balance'],rows:[...I.map(x=>['Sales',x,x.total,0]),...B.map(x=>['Purchase',x,0,x.total])].sort((a:any,c:any)=>a[1].date<c[1].date?-1:1).map(([j,x,dr,cr]:any)=>[x.date,j,x.number,x.party,dr,cr,(b+=dr-cr)])}}
  case 'tb':{const A=[['1100 Receivables',rec,0],['1200 Bank',Math.max(cash,0),0],['2100 Payables',0,pay],['4000 Sales',0,rev],['5000 Purchases',exp,0]];return{cols:['Account','Period debit','Period credit','Closing debit','Closing credit'],rows:A.map(([a,dr,cr]:any)=>[a,dr,cr,dr,cr])}}
  case 'dep':return{cols:['Asset','Method','Period','Opening value','Depreciation','Closing value'],rows:db.assets.map((a:R)=>{const dp=(a.value-a.residual)/Math.max(1,a.life);return[a.name,a.method,'FY 2026',a.value,dp,a.value-dp]})};
  case 'loans':return{cols:['Loan','Lender','Principal','Interest %','Outstanding','Repaid','Maturity'],rows:db.loans.map((l:R)=>[l.name,l.lender,l.principal,l.rate,l.balance,l.principal-l.balance,l.end])};
  default:return{cols:['Indicator','Value'],rows:[['Revenue',rev],['Expenses',exp],['Net profit',rev-exp],['Receivables',rec],['Payables',pay],['Cash flow',cash],['Profit margin %',rev?Math.round((rev-exp)/rev*100):0]]};
 }
}
function Rep({pg}:{pg:Pg}){
 const db=useDB(),[from,setFrom]=useState(d(-120)),[to,setTo]=useState(d(30));
 const inR=(x:R)=>valid(x)&&x.date>=from&&x.date<=to,I=db.invoices.filter(inR),B=db.vbills.filter(inR);
 const {cols,rows}=build(pg.rep!,db,I,B);
 const fmt=(c:string,v:any)=>typeof v==='number'&&!/%|Invoices|rate|Interest/.test(c)?inr(v):v;
 return <><Head title={pg.t} desc={pg.desc}><button className="btn" onClick={()=>csv(pg.p.replace('/','-'),cols,rows)}><Download size={16}/>Export CSV</button>{['View PDF','Download PDF','Print'].map((l,i)=><button key={l} className="btn" onClick={()=>tablePdf(pg.t,from+' to '+to,[],[{h:pg.t,cols,rows:rows.map(r=>r.map((v:any,j:number)=>fmtv(cols[j],v)))}],pg.p.replace('/','-'),['view','save','print'][i])}>{l}</button>)}</Head>
  <div className="bar"><label className="inl">From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label className="inl">To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><span className="muted">Based on {I.length} invoices and {B.length} bills · fictional demo data</span></div>
  <div className="pn flush"><div className="tw"><table><thead><tr>{cols.map((c,i)=><th key={c} className={i?'n':''}>{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j} className={j&&typeof v==='number'?'n':''}>{fmt(cols[j],v)}</td>)}</tr>)}</tbody></table>
  {!rows.length&&<div className="empty"><h3>No data for this period</h3><p>Widen the date range or create records.</p></div>}</div></div></>
}

function Selector(){return <div className="sel"><h1>Welcome to Oxoo</h1><p className="muted">Choose a workspace to explore our business finance software.</p><div className="cards">{([['Accounting','Manage accounting records, financial transactions, journals, and reports.','accounting',BookOpen],['Invoicing','Manage customer invoices, credit notes, payments, and billing documents.','invoicing',FileText],['Expenses','Create expenses, upload receipts, track approvals, and manage reimbursements.','expenses',Receipt],['Sign','Request signatures, sign documents and track their status.','sign',FileText],['Spreadsheet','Build live spreadsheets from customers, invoices and expenses, with formulas and receipts.','spreadsheet',FileSpreadsheet],['ESG','Track emissions, social and governance metrics against targets and report on them.','esg',Leaf]] as any[]).map(([t,dsc,k,I])=>k?<a key={t} className="mc" href={'#/'+k}><I size={28}/><h3>{t}</h3><p>{dsc}</p><span className="btn p">Open {t}</span></a>:<div key={t} className="mc soon" aria-disabled="true"><I size={28}/><h3>{t}</h3><span className="bd warn">Coming Soon</span></div>)}</div></div>}
const BC=({data}:any)=><div style={{height:220}}><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="k" fontSize={12}/><YAxis fontSize={12}/><Tooltip formatter={(v:any)=>inr(v)}/><Bar dataKey="Total" fill="#7c3aed" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>;
const grp=(E:R[],f:(x:R)=>string)=>Object.entries(E.reduce((a:R,x)=>{const k=f(x);a[k]=(a[k]||0)+x.total;return a},{})).sort().map(([k,Total]:any)=>({k,Total}));
function ExpDash(){
 const db=useDB(),[k,setK]=useState(0),E:R[]=db.expenses,S=(f:string[])=>sum(E.filter(x=>f.includes(x.status)),'total');
 const jump=(s:string)=>{if(s)sessionStorage.setItem('fs',s);go('expenses/all')};
 return <><Head title="Expenses" desc="Create expenses, upload receipts, track approvals, and manage reimbursements."><button className="btn p" onClick={()=>{sessionStorage.setItem('new','1');go('expenses/all')}}><Plus size={16}/>New Expense</button></Head>
  <div className="note">Demo workspace with fictional data. Receipt processing is simulated: no OCR runs.</div>
  <div className="kpis"><Card l="Total Expenses" v={inr(sum(E,'total'))} sub={E.length+' records'} on={()=>jump('')}/><Card l="To Submit" v={inr(S(['Draft']))} sub="Draft" c="a" on={()=>jump('Draft')}/><Card l="To Approve" v={inr(S(['Submitted']))} sub="Submitted" on={()=>go('expenses/to-process')}/><Card l="Waiting Reimbursement" v={inr(S(['Approved','Posted','In Payment']))} sub="Approved, posted or in payment" c="g" on={()=>jump('Approved')}/></div>
  <div className="grid2"><section className="pn"><h3>Upload or drop an expense receipt</h3><UploadFlow key={k} mode="exp" onClose={()=>setK(k+1)}/></section>
   <section className="pn"><h3>Quick actions</h3><div className="qa">{[['New Expense','expenses/all',1],['Upload Receipt','expenses/all',2],['Expenses to Process','expenses/to-process',0],['Expenses Analysis','expenses/analysis',0]].map(([l,p,n]:any)=><button key={l} onClick={()=>{if(n===1)sessionStorage.setItem('new','1');go(p)}}>{l}</button>)}</div>
    <h3 style={{margin:'16px 0 8px'}}>Status summary</h3><ul className="act">{['Draft','Submitted','Approved','Posted','Paid','Refused','In Payment'].map(s=><li key={s}><Badge s={s}/>{E.filter(x=>x.status===s).length} · {inr(S([s]))}</li>)}</ul></section></div>
  <div className="grid2"><section className="pn"><h3>Monthly totals</h3><BC data={grp(E,x=>x.date.slice(0,7))}/></section><section className="pn"><h3>By category</h3><BC data={grp(E,x=>x.product)}/></section></div>
  <div className="grid2"><section className="pn"><h3>Recent expenses</h3><div className="tw"><table><thead><tr><th>Employee</th><th>Description</th><th className="n">Total</th><th>Status</th></tr></thead><tbody>{E.slice(0,6).map(x=><tr key={x.id} className="cl" onClick={()=>{sessionStorage.setItem('open',x.id);go('expenses/all')}}><td>{x.employee}</td><td>{x.description}</td><td className="n">{inr(x.total)}</td><td><Badge s={x.status}/></td></tr>)}</tbody></table></div></section>
   <section className="pn"><h3>Recently uploaded receipts</h3>{E.filter(x=>x.att?.length).slice(0,5).map(x=><div className="fl" key={x.id}><span className="nm">{x.att[0].name}<small className="muted"> · {x.number}</small></span><button className="lnk" onClick={()=>viewAtt(x.att[0])}>View</button></div>)}{!E.some(x=>x.att?.length)&&<div className="empty">No receipts yet. Drop one above.</div>}</section></div></>
}
function ExpAna(){
 const db=useDB(),[from,setFrom]=useState(d(-120)),[to,setTo]=useState(d(30)),[emp,setEmp]=useState(''),[st,setSt]=useState(''),[pr,setPr]=useState('');
 const all:R[]=db.expenses,E=all.filter(x=>x.date>=from&&x.date<=to&&(!emp||x.employee===emp)&&(!st||x.status===st)&&(!pr||x.product===pr));
 const bc=grp(E,x=>x.product),be=grp(E,x=>x.employee),bm=grp(E,x=>x.date.slice(0,7));
 const dc=['Reference','Employee','Description','Date','Category','Total','Status'],dr=E.map(x=>[x.number,x.employee,x.description,x.date,x.product,x.total,x.status]);
 const fm=(rows:any[][])=>rows.map(r=>r.map(v=>typeof v==='number'?pm(v):v));
 const pdf=(mode:string,reimb=false)=>{const X=reimb?E.filter(x=>x.reimb.startsWith('Employee')&&['Approved','Posted','In Payment','Paid'].includes(x.status)):E;tablePdf(reimb?'Reimbursement Statement':'Expenses Analysis',from+' to '+to,[['Total expenses',pm(sum(X,'total'))],['Records',String(X.length)]],reimb?[{h:'Reimbursable expenses',cols:dc,rows:fm(X.map(x=>[x.number,x.employee,x.description,x.date,x.product,x.total,x.status]))}]:[{h:'By category',cols:['Category','Total'],rows:bc.map(x=>[x.k,pm(x.Total)])},{h:'By employee',cols:['Employee','Total'],rows:be.map(x=>[x.k,pm(x.Total)])},{h:'Detail',cols:dc,rows:fm(dr)}],reimb?'reimbursement-statement':'expenses-analysis',mode)};
 return <><Head title="Expenses Analysis" desc="Trends, categories and employees from your saved expenses."><button className="btn" onClick={()=>csv('expenses-analysis',dc,dr)}><Download size={16}/>Export CSV</button>{['View PDF','Download PDF','Print'].map((l,i)=><button key={l} className="btn" onClick={()=>pdf(['view','save','print'][i])}>{l}</button>)}<button className="btn" onClick={()=>pdf('save',true)}>Reimbursement statement</button></Head>
  <div className="bar"><label className="inl">From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label className="inl">To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
   <select aria-label="Employee" value={emp} onChange={e=>setEmp(e.target.value)}><option value="">All employees</option>{[...new Set(all.map(x=>x.employee))].map(x=><option key={x}>{x}</option>)}</select>
   <select aria-label="Category" value={pr} onChange={e=>setPr(e.target.value)}><option value="">All categories</option>{db.eproducts.map((p:R)=><option key={p.id}>{p.name}</option>)}</select>
   <select aria-label="Status" value={st} onChange={e=>setSt(e.target.value)}><option value="">All statuses</option>{['Draft','Submitted','Approved','Posted','Paid','Refused','In Payment'].map(x=><option key={x}>{x}</option>)}</select></div>
  <div className="kpis s"><Card l="Total expenses" v={inr(sum(E,'total'))}/><Card l="Records" v={E.length}/><Card l="Average" v={inr(E.length?sum(E,'total')/E.length:0)}/><Card l="Tax included" v={inr(sum(E,'etax'))}/></div>
  <div className="grid2"><section className="pn"><h3>Trend by month</h3><BC data={bm}/></section><section className="pn"><h3>By category</h3><BC data={bc}/></section></div>
  <div className="grid2"><section className="pn"><h3>By employee</h3><BC data={be}/></section><section className="pn flush"><div className="tw"><table><thead>{<tr>{dc.map(c=><th key={c}>{c}</th>)}</tr>}</thead><tbody>{dr.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{j===5?inr(v):v}</td>)}</tr>)}</tbody></table>{!dr.length&&<div className="empty">No expenses match these filters.</div>}</div></section></div></>
}
