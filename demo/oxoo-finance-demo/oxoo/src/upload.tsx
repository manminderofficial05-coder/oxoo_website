import {useState,useRef,useEffect} from 'react';
import {X,RotateCw,Upload as UpI} from 'lucide-react';
import {putBlob,getBlob,delBlob} from './files';
import {useDB,save,toast,d,calc,R} from './data';
const OK=['application/pdf','image/png','image/jpeg','image/webp'],MAX=10*1048576;
const chk=(f:File)=>!OK.includes(f.type)?'Unsupported type. Use PDF, PNG, JPG, JPEG or WebP.':f.size>MAX?'File is larger than 10 MB.':f.size===0?'File is empty.':'';
const sz=(n:number)=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.ceil(n/1024)+' KB';
const sampleFile=()=>new Promise<File>(res=>{const c=document.createElement('canvas');c.width=360;c.height=520;const g=c.getContext('2d')!;g.fillStyle='#fff';g.fillRect(0,0,360,520);g.fillStyle='#111';g.font='bold 24px sans-serif';g.fillText('Food Gardens (sample)',20,50);g.font='15px monospace';['Fictional demo receipt','Steam Rice     Rs. 120.00','Red Curry      Rs. 340.00','Thai Iced Tea  Rs. 140.00','GST 5%         Rs.  30.00','TOTAL          Rs. 630.00'].forEach((t,i)=>g.fillText(t,20,100+i*34));c.toBlob(b=>res(new File([b!],'sample-receipt.png',{type:'image/png'})))});
export function UploadBox({title,btn,onDone,sample}:any){
 const [its,setIts]=useState<R[]>([]),[drag,setDrag]=useState(false),ref=useRef<HTMLInputElement>(null);
 const add=(fs:FileList|File[])=>setIts(p=>[...p,...[...fs].map(f=>{const e=chk(f);return{id:crypto.randomUUID(),file:f,st:e?'error':'ready',err:e,url:f.type.startsWith('image/')?URL.createObjectURL(f):undefined}})]);
 const retry=(i:R)=>setIts(p=>p.map(x=>x.id===i.id?{...x,st:chk(x.file)?'error':'ready',err:chk(x.file)}:x));
 const run=async()=>{const good=its.filter(x=>x.st==='ready');if(!good.length)return toast('Add at least one valid file first',true);const done:R[]=[];
  for(const x of good){try{await putBlob(x.id,x.file);done.push({id:x.id,name:x.file.name,size:x.file.size,type:x.file.type});setIts(p=>p.map(y=>y.id===x.id?{...y,st:'uploaded'}:y))}catch{setIts(p=>p.map(y=>y.id===x.id?{...y,st:'error',err:'Could not store the file in this browser. Retry.'}:y))}}
  if(done.length)onDone(done)};
 return <div><div className={'dz'+(drag?' on':'')} tabIndex={0} role="button" aria-label={title} onClick={()=>ref.current?.click()} onKeyDown={e=>e.key==='Enter'&&ref.current?.click()} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);add(e.dataTransfer.files)}}>
  <UpI size={26}/><h3 style={{margin:'6px 0'}}>{title}</h3><span className="muted">Drag files here or </span><span className="lnk">Browse Files</span><div className="muted">PDF, PNG, JPG, JPEG, WebP · max 10 MB each · multiple files allowed</div></div>
  <input ref={ref} hidden type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={e=>{if(e.target.files)add(e.target.files);e.target.value=''}}/>
  {sample&&<div style={{textAlign:'center'}}><button className="lnk" onClick={async()=>add([await sampleFile()])}>Or try a sample receipt</button></div>}
  {its.map(i=><div className="fl" key={i.id}>{i.url?<img src={i.url} alt=""/>:<span className="bd info">PDF</span>}<span className="nm">{i.file.name}<small className="muted"> · {sz(i.file.size)}</small></span>
   <span className={'bd '+(i.st==='error'?'bad':i.st==='uploaded'?'ok':'info')} title={i.err}>{i.st==='error'?i.err:i.st==='uploaded'?'Uploaded':'Ready'}</span>
   {i.st==='error'&&<button className="ib" aria-label="Retry" onClick={()=>retry(i)}><RotateCw size={15}/></button>}<button className="ib" aria-label="Remove file" onClick={()=>setIts(its.filter(x=>x.id!==i.id))}><X size={15}/></button></div>)}
  {its.length>0&&<div className="mf"><button className="btn p" onClick={run}>{btn}</button></div>}</div>
}
export function UploadFlow({mode,pg,onClose}:any){
 const db=useDB(),exp=mode==='exp',es=db.esettings[0]||{};
 const [fl,setFl]=useState<R[]|null>(null),[tgt,setTgt]=useState('');
 const [f,setF]=useState<R>({description:'',vendor:'',date:d(0),total:0,etax:0,employee:'',product:db.eproducts[0]?.name||'',account:es.account||'',method:es.method||'',notes:'',party:'',due:d(30),ref:''});
 const s=(k:string)=>({value:f[k],onChange:(e:any)=>setF({...f,[k]:e.target.value})});
 if(!fl)return <UploadBox title={exp?'Upload or drop an expense receipt':'Upload or drop documents'} btn={exp?'Process Receipts':'Process Documents'} sample={exp} onDone={(x:R[])=>{setFl(x);setF({...f,description:x[0].name.replace(/\.\w+$/,'')})}}/>;
 const done=(m:string)=>{toast(m);onClose?.()};
 const create=()=>{
  if(exp){if(!f.description.trim())return toast('Description is required',true);if(!f.employee.trim())return toast('Employee is required',true);if(!(+f.total>0))return toast('Amount must be greater than 0',true);
   save('expenses',{id:crypto.randomUUID(),number:'EXP-'+String(db.expenses.length+1).padStart(4,'0'),description:f.description,product:f.product,date:f.date,total:+f.total,etax:+f.etax,employee:f.employee,manager:'',vendor:f.vendor,existing:'No (Direct Expense)',bill:'',reimb:'Employee (Through a Purchase Receipt)',account:f.account,method:f.method,notes:f.notes,status:'Draft',att:fl});location.hash='/expenses/all';return done('Expense created with the receipt attached')}
  if(tgt){const r=db[pg.coll].find((x:R)=>x.id===tgt);save(pg.coll,{...r,att:[...(r.att||[]),...fl]});return done('Attached to '+r.number)}
  if(!f.party)return toast('Select a partner',true);if(!(+f.total>0))return toast('Amount must be greater than 0',true);
  const lines=[{desc:'Uploaded document – '+(f.ref||fl[0].name),qty:1,price:+f.total,disc:0,tax:18}],c=calc(lines);
  save(pg.coll,{id:crypto.randomUUID(),number:`${pg.pre}/2026/${String(db[pg.coll].length+1).padStart(4,'0')}`,party:f.party,date:f.date,due:f.due,ref:f.ref,notes:'',lines,...c,paid:0,amountDue:c.total,status:'Draft',att:fl});done('Draft created with the attachment')};
 return <div><p className="note">Demo processing: no OCR was run, so nothing was extracted. Enter the details from the document yourself. Stored: {fl.map(x=>x.name).join(', ')}</p>
  <div className="fg">{exp?<>
   <label>Description *<input {...s('description')}/></label><label>Vendor<select {...s('vendor')}><option value="">None</option>{db.vendors.map((v:R)=><option key={v.id}>{v.name}</option>)}</select></label>
   <label>Date<input type="date" {...s('date')}/></label><label>Amount *<input type="number" {...s('total')}/></label><label>Tax included<input type="number" {...s('etax')}/></label><label>Employee *<input {...s('employee')}/></label>
   <label>Expense product<select {...s('product')}>{db.eproducts.map((p:R)=><option key={p.id}>{p.name}</option>)}</select></label><label>Account<input {...s('account')}/></label><label>Payment method<input {...s('method')}/></label><label className="full">Notes<textarea rows={2} {...s('notes')}/></label></>
  :<><label className="full">Attach to<select value={tgt} onChange={e=>setTgt(e.target.value)}><option value="">Create a new draft record</option>{db[pg.coll].map((r:R)=><option key={r.id} value={r.id}>{r.number} – {r.party}</option>)}</select></label>
   {!tgt&&<><label>Partner *<select {...s('party')}><option value="">Select…</option>{db[pg.party].map((c:R)=><option key={c.id}>{c.name}</option>)}</select></label><label>Amount excl. tax *<input type="number" {...s('total')}/></label><label>Date<input type="date" {...s('date')}/></label><label>Due date<input type="date" {...s('due')}/></label><label className="full">Reference<input {...s('ref')}/></label></>}</>}</div>
  <div className="mf"><button className="btn" onClick={()=>setFl(null)}>Back</button><button className="btn p" onClick={create}>{exp?'Create expense':tgt?'Attach to record':'Create draft'}</button></div></div>
}
export function Logo(){
 const [u,setU]=useState(''),ref=useRef<HTMLInputElement>(null);
 const load=async()=>{const b=await getBlob('logo').catch(()=>undefined);setU(b?URL.createObjectURL(b):'')};
 useEffect(()=>{load()},[]);
 const pick=async(f?:File)=>{if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type))return toast('Logo must be PNG, JPG, JPEG or WebP',true);if(f.size>2*1048576)return toast('Logo must be under 2 MB',true);try{await putBlob('logo',f);await load();toast('Logo saved')}catch{toast('Could not save the logo in this browser',true)}};
 return <div className="pn" style={{marginBottom:14,display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>{u?<img src={u} alt="Company logo" style={{maxHeight:56,maxWidth:180}}/>:<span className="muted">No logo yet. PDFs will show the company name instead.</span>}
  <input ref={ref} hidden type="file" accept=".png,.jpg,.jpeg,.webp" onChange={e=>{pick(e.target.files?.[0]);e.target.value=''}}/><button className="btn" onClick={()=>ref.current?.click()}>{u?'Replace logo':'Upload logo'}</button>
  {u&&<button className="btn red" onClick={async()=>{try{await delBlob('logo');setU('');toast('Logo removed')}catch{toast('Could not remove the logo',true)}}}>Remove</button>}<span className="muted">PNG, JPG or WebP, up to 2 MB</span></div>
}
