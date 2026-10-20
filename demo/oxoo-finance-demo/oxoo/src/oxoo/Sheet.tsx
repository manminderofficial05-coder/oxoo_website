import {useState} from 'react';
import {Trash2} from 'lucide-react';
import {useDB,toast,d,R} from '../data';
import {UploadBox} from '../upload';
import {useSvc,upsertS,removeS,uid} from './svc';
import {csvDl} from './ui';
const nav=(p:string)=>{location.hash='/'+p};
const sum=(l:R[],k:string)=>l.reduce((a,x)=>a+(+x[k]||0),0);
const colL=(n:number)=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s};
const colN=(s:string)=>s.split('').reduce((a,c)=>a*26+c.charCodeAt(0)-64,0);
const key=(c:number,r:number)=>colL(c)+r;
function ev(cells:R,k:string,seen:string[]=[]):any{const v=cells[k];if(typeof v!=='string'||v[0]!=='=')return v==null||v===''?'':(isNaN(+v)?v:+v);if(seen.includes(k))return '#CIRC';
 try{const sn=[...seen,k];let e=v.slice(1).toUpperCase();
  e=e.replace(/(SUM|AVERAGE|MIN|MAX|COUNT)\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)/g,(_,f,ca,ra,cb,rb)=>{const o:number[]=[];for(let c=Math.min(colN(ca),colN(cb));c<=Math.max(colN(ca),colN(cb));c++)for(let r=Math.min(+ra,+rb);r<=Math.max(+ra,+rb);r++){const x=ev(cells,key(c,r),sn);if(typeof x==='number')o.push(x)}
   return String(f==='COUNT'?o.length:!o.length?0:f==='SUM'?o.reduce((a,b)=>a+b,0):f==='AVERAGE'?o.reduce((a,b)=>a+b,0)/o.length:f==='MIN'?Math.min(...o):Math.max(...o))});
  e=e.replace(/[A-Z]+\d+/g,r=>{const x=ev(cells,r,sn);return String(typeof x==='number'?x:0)});
  if(!/^[\d+\-*/().\s]*$/.test(e))return '#ERR';const n=Function('"use strict";return ('+e+')')();return typeof n==='number'&&isFinite(n)?Math.round(n*100)/100:'#ERR'}catch{return '#ERR'}}
const toCells=(rows:any[][])=>{const c:R={};rows.forEach((r,i)=>r.forEach((v,j)=>{if(v!==''&&v!=null)c[key(j+1,i+1)]=String(v)}));return c};
const inv=(db:R,p:string)=>db.invoices.filter((x:R)=>x.party===p&&!['Draft','Cancelled'].includes(x.status));
const bil=(db:R,p:string)=>db.vbills.filter((x:R)=>x.party===p&&!['Draft','Cancelled'].includes(x.status));
const SRC:Record<string,(db:R)=>any[][]>={
 'Customers & clients (one master sheet)':db=>{const rows:any[][]=[['Name','Type','Email','City','Total billed','Amount due'],...db.customers.map((c:R)=>[c.name,'Customer',c.email,c.city,sum(inv(db,c.name),'total'),sum(inv(db,c.name),'amountDue')]),...db.vendors.map((v:R)=>[v.name,'Vendor',v.email,v.city,sum(bil(db,v.name),'total'),sum(bil(db,v.name),'amountDue')])];const n=rows.length;rows.push(['Total','','','','=SUM(E2:E'+n+')','=SUM(F2:F'+n+')']);return rows},
 'Customer invoices':db=>[['Number','Customer','Date','Due','Total','Amount due','Status'],...db.invoices.map((x:R)=>[x.number,x.party,x.date,x.due,Math.round(x.total),Math.round(x.amountDue),x.status])],
 'Vendor bills':db=>[['Number','Vendor','Date','Due','Total','Amount due','Status'],...db.vbills.map((x:R)=>[x.number,x.party,x.date,x.due,Math.round(x.total),Math.round(x.amountDue),x.status])],
 'Expenses':db=>[['Reference','Employee','Description','Date','Category','Total','Status'],...db.expenses.map((x:R)=>[x.number,x.employee,x.description,x.date,x.product,x.total,x.status])]};
const BLANK='Blank spreadsheet',BUD='Monthly budget (formulas)';
const budget=()=>[['Item','Planned','Actual','Difference'],['Rent',50000,48000,'=B2-C2'],['Salaries',300000,310000,'=B3-C3'],['Software',20000,18500,'=B4-C4'],['Total','=SUM(B2:B4)','=SUM(C2:C4)','=SUM(D2:D4)']];
export default function SheetApp({path}:{path:string}){const p=path.split('/');return <div><div className="stabs"><b>Spreadsheet</b><button onClick={()=>nav('spreadsheet')}>Dashboard</button><button onClick={()=>nav('spreadsheet/list')}>Spreadsheets</button></div>{p[1]==='sheet'?<Editor id={p[2]}/>:p[1]==='list'?<List/>:<Dash/>}</div>}
function Dash(){const sv=useSvc(),db=useDB();
 const mk=(name:string,rows:any[][])=>{const id=uid();upsertS('sheets',{id,name,cells:toCells(rows),rows:Math.max(30,rows.length+5),created:Date.now()});nav('spreadsheet/sheet/'+id)};
 return <div><div className="ph"><div><h1>Spreadsheet</h1><p>Build live spreadsheets from your customers, invoices and expenses, with formulas and receipts.</p></div><div className="acts"><button className="btn p" onClick={()=>mk(BLANK,[[]])}>New spreadsheet</button></div></div>
  <div className="kpis"><div className="kpi"><span>Spreadsheets</span><b>{sv.sheets.length}</b></div><div className="kpi g"><span>Customers & clients available</span><b>{db.customers.length+db.vendors.length}</b></div><div className="kpi"><span>Invoices available</span><b>{db.invoices.length}</b></div><div className="kpi a"><span>Expenses available</span><b>{db.expenses.length}</b></div></div>
  <section className="pn"><h3>Create from your data</h3><div className="qa">{Object.keys(SRC).map(k=><button key={k} onClick={()=>mk(k,SRC[k](db))}>{k}</button>)}<button onClick={()=>mk(BUD,budget())}>{BUD}</button></div></section>
  <section className="pn" style={{marginTop:14}}><h3>Recent spreadsheets</h3>{sv.sheets.slice(0,6).map((s:R)=><div className="fl" key={s.id}><button className="lnk nm" onClick={()=>nav('spreadsheet/sheet/'+s.id)}>{s.name}</button><small className="muted">{new Date(s.created).toLocaleDateString()}</small></div>)}{!sv.sheets.length&&<div className="empty">No spreadsheets yet. Create one above.</div>}</section></div>}
function List(){const sv=useSvc();return <div><div className="ph"><div><h1>Spreadsheets</h1><p>All saved spreadsheets in this browser.</p></div></div><div className="pn flush"><div className="tw"><table><thead><tr><th>Name</th><th>Created</th><th>Actions</th></tr></thead><tbody>{sv.sheets.map((s:R)=><tr key={s.id}><td><button className="lnk" onClick={()=>nav('spreadsheet/sheet/'+s.id)}>{s.name}</button></td><td>{new Date(s.created).toLocaleDateString()}</td><td className="ra"><button onClick={()=>nav('spreadsheet/sheet/'+s.id)}>Open</button><button className="red" onClick={()=>{if(confirm('Delete this spreadsheet?')){removeS('sheets',s.id);toast('Deleted')}}}><Trash2 size={13}/></button></td></tr>)}</tbody></table>{!sv.sheets.length&&<div className="empty">No spreadsheets yet.</div>}</div></div></div>}
function Editor({id}:{id:string}){
 const sv=useSvc(),sh=sv.sheets.find((x:R)=>x.id===id),db=useDB(),[sel,setSel]=useState('A1'),[foc,setFoc]=useState(''),[rp,setRp]=useState(false),[f,setF]=useState<R>({date:d(0),vendor:'',amount:'',files:[]}),[kx,setKx]=useState(0);
 if(!sh)return <div className="empty">Spreadsheet not found</div>;
 const cells:R=sh.cells,keys=Object.keys(cells),maxC=Math.max(12,...keys.map(k=>colN(k.match(/[A-Z]+/)![0]))),RW=sh.rows||30,last=Math.max(0,...keys.map(k=>+k.match(/\d+/)![0]));
 const upd=(p:R)=>upsertS('sheets',{...sh,...p});
 const setCell=(k:string,v:string)=>{const c={...cells};if(v==='')delete c[k];else c[k]=v;upd({cells:c})};
 const append=(rows:any[][],gap=1)=>{const s=last?last+1+gap:1,c={...cells};rows.forEach((r,i)=>r.forEach((v,j)=>{if(v!==''&&v!=null)c[key(j+1,s+i)]=String(v)}));upd({cells:c,rows:Math.max(RW,s+rows.length+5)})};
 const addRec=()=>{if(!f.vendor.trim())return toast('Vendor is required',true);if(!(+f.amount>0))return toast('Amount must be greater than 0',true);if(!f.date)return toast('Date is required',true);
  append([...(last?[]:[['Date','Vendor','Amount','Receipt']]),[f.date,f.vendor,f.amount,f.files.map((x:R)=>x.name).join(', ')]],0);setF({date:d(0),vendor:'',amount:'',files:[]});setKx(kx+1);toast('Row added to the spreadsheet')};
 const cols=Array.from({length:maxC},(_,i)=>i+1);
 const exp=()=>csvDl(sh.name.replace(/\W+/g,'-'),cols.map(colL),Array.from({length:last},(_,r)=>cols.map(c=>ev(cells,key(c,r+1)))));
 return <div><div className="ph"><div><input className="tt" aria-label="Spreadsheet name" defaultValue={sh.name} onBlur={e=>e.target.value.trim()&&upd({name:e.target.value.trim()})}/><p>Type values or formulas such as =SUM(B2:B5), =A1*B1, AVERAGE, MIN, MAX, COUNT.</p></div>
  <div className="acts"><select aria-label="Add data from" value="" onChange={e=>{const k=e.target.value;if(k){append(SRC[k](db));toast('Added '+k)}}}><option value="">Add data from…</option>{Object.keys(SRC).map(k=><option key={k}>{k}</option>)}</select><button className="btn" onClick={()=>upd({rows:RW+10})}>Add 10 rows</button><button className="btn" onClick={()=>setRp(!rp)}>Receipts</button><button className="btn p" onClick={exp}>Export CSV</button></div></div>
  {rp&&<section className="pn" style={{marginBottom:14}}><h3>Add receipts and rows</h3><div className="grid2"><UploadBox key={kx} title="Drag and drop receipts here" btn="Attach receipts" sample onDone={(fs:R[])=>{setF({...f,files:fs});toast(fs.length+' receipt(s) attached to the next row')}}/>
   <div><div className="fg"><label>Date<input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></label><label>Vendor *<input value={f.vendor} onChange={e=>setF({...f,vendor:e.target.value})}/></label><label>Amount *<input type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></label><label>Receipt<input readOnly value={f.files.map((x:R)=>x.name).join(', ')||'None attached'}/></label></div><div className="mf"><button className="btn p" onClick={addRec}>Add row manually</button></div><p className="muted">Receipts are stored in this browser. No OCR runs, so enter the values yourself.</p></div></div></section>}
  <div className="fx"><b>{sel}</b><span>{cells[sel]||''}</span></div>
  <div className="pn flush gw"><table className="grid"><thead><tr><th></th>{cols.map(c=><th key={c}>{colL(c)}</th>)}</tr></thead><tbody>{Array.from({length:RW},(_,i)=>i+1).map(r=><tr key={r}><th>{r}</th>{cols.map(c=>{const k=key(c,r),raw=cells[k]||'',val=ev(cells,k);return <td key={k}><input className={'sc'+(sel===k?' on':'')+(typeof val==='number'?' num':'')} aria-label={k} value={foc===k?raw:(val===''?'':String(val))} onFocus={()=>{setSel(k);setFoc(k)}} onBlur={()=>setFoc('')} onChange={e=>setCell(k,e.target.value)}/></td>})}</tr>)}</tbody></table></div></div>}
