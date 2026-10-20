import {useState,useEffect,useRef} from 'react';
import {Star,Trash2,Plus,Upload,X,ChevronLeft,ChevronRight,ZoomIn,ZoomOut} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import worker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {jsPDF} from 'jspdf';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
import {toast} from '../data';
import {putBlob,getBlob,delBlob} from '../files';
import {useSign,upsert,remove,sset,uid,R} from './store';
(pdfjs as any).GlobalWorkerOptions.workerSrc=worker;
const nav=(p:string)=>{location.hash='/'+p};   // <- only place that depends on hash routing
const TYPES:[string,number,number][]=[['Signature',.25,.06],['Initials',.1,.05],['Name',.22,.03],['Email',.25,.03],['Phone',.2,.03],['Company',.22,.03],['Text',.22,.03],['Multiline',.3,.08],['Checkbox',.03,.022],['Radio',.03,.022],['Selection',.2,.03],['Date',.18,.03],['Strikethrough',.3,.02],['Stamp',.2,.06]];
const COL=['#7c3aed','#059669','#d97706','#dc2626','#2563eb'];
const SZ=(t:string)=>{const x=TYPES.find(y=>y[0]===t);return x?[x[1],x[2]]:[.22,.03]};
const NOREQ=['Checkbox','Radio','Strikethrough'];
const today=()=>new Date().toISOString().slice(0,10);
const fdate=(t:number)=>new Date(t).toLocaleDateString();

function usePdf(fileId?:string){const [pdf,setPdf]=useState<any>(null);useEffect(()=>{if(!fileId)return;let c=false;getBlob(fileId).then(async b=>{if(!b)return;const p=await (pdfjs as any).getDocument({data:await b.arrayBuffer()}).promise;if(!c)setPdf(p)}).catch(()=>toast('Could not open the PDF',true));return()=>{c=true}},[fileId]);return pdf}
function Page({pdf,n,zoom,children}:any){const ref=useRef<HTMLCanvasElement>(null);const [sz,setSz]=useState({w:0,h:0});
 useEffect(()=>{if(!pdf)return;let t:any;pdf.getPage(n).then((p:any)=>{const vp=p.getViewport({scale:zoom*1.4});const c=ref.current!;c.width=vp.width;c.height=vp.height;setSz({w:vp.width,h:vp.height});t=p.render({canvasContext:c.getContext('2d')!,viewport:vp});t.promise.catch(()=>{})});return()=>t?.cancel?.()},[pdf,n,zoom]);
 return <div className="pgv" style={{width:sz.w,height:sz.h}}><canvas ref={ref} style={{width:'100%',height:'100%'}}/>{sz.w>0&&children(sz.w,sz.h)}</div>}
const Empty=()=><div className="empty"><h3>Not found</h3><button className="btn" onClick={()=>nav('sign')}>Back to templates</button></div>;
const Mod=({title,onClose,children}:any)=><div className="ov" onClick={onClose}><div className="md" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()}><div className="mh"><b>{title}</b><button className="ib" aria-label="Close" onClick={onClose}><X size={18}/></button></div>{children}</div></div>;

async function addTemplate(f:Blob,name:string,fields:R[]=[]){const id=uid();let pages=1,buf:ArrayBuffer;try{buf=await f.arrayBuffer();pages=(await (pdfjs as any).getDocument({data:buf.slice(0)}).promise).numPages}catch{toast(name+' could not be read as a PDF',true);return}
 try{await putBlob(id,new Blob([buf],{type:'application/pdf'}))}catch{toast('Could not store the PDF in this browser',true);return}
 upsert('templates',{id,name,fileId:id,pages,fav:false,tags:[],signers:[{id:uid(),name:'Signer 1'}],fields,created:Date.now()});toast('Template created');return id}
async function sampleTpl(){const d=new jsPDF({unit:'pt',format:'a4'});d.setFont('times','bold').setFontSize(16).text('Sample Contract',297,70,{align:'center'});d.setFontSize(10).text('Customer Name: ______________________________',50,110);d.text('Date: ______________',400,110);d.setFont('times','normal').setFontSize(10);
 d.text(d.splitTextToSize('WHEREAS the customer desires to retain the services of the Employee, and the Employee desires to render such services, these terms and conditions are set forth. 1. Employment: the Employee agrees to faithfully carry out the duties communicated by the Employer. 2. Position: the Employee shall perform all essential job functions. 3. Compensation: the Employee shall be paid per hour as agreed, subject to an annual performance review. This is a fictional demo document.',500),50,160);
 d.setFont('times','bold').text('Customer Signature',60,700).text('Company Signature',360,700);d.line(60,695,230,695);d.line(360,695,530,695);
 return addTemplate(d.output('blob'),'Sample Contract.pdf',[{id:uid(),type:'Name',signer:0,page:1,x:.2,y:.115,w:.3,h:.03},{id:uid(),type:'Date',signer:0,page:1,x:.68,y:.115,w:.2,h:.03},{id:uid(),type:'Signature',signer:0,page:1,x:.1,y:.78,w:.3,h:.06}])}
async function makeDoc(t:R,sg:R[]){const id=uid();const b=await getBlob(t.fileId);if(!b)throw new Error('missing');await putBlob(id,b);
 const d={id,tid:t.id,name:t.name,fileId:id,pages:t.pages,fields:t.fields,signers:t.signers.map((s:R,i:number)=>({name:sg[i]?.name||s.name,email:sg[i]?.email||'',status:'Waiting',values:{}})),status:'Sent',created:Date.now()};upsert('docs',d);return d}
async function burn(doc:R){const src=await getBlob(doc.fileId);const pd=await PDFDocument.load(await src!.arrayBuffer());const font=await pd.embedFont(StandardFonts.Helvetica);const pages=pd.getPages();
 for(const f of doc.fields){const v=doc.signers[f.signer]?.values?.[f.id];if(v==null||v===''||v===false)continue;const p=pages[f.page-1];const {width:W,height:H}=p.getSize();const x=f.x*W,w=f.w*W,h=f.h*H,y=H-f.y*H-h;
  if(typeof v==='string'&&v.startsWith('data:image')){const im=await pd.embedPng(v);const k=Math.min(w/im.width,h/im.height);p.drawImage(im,{x,y,width:im.width*k,height:im.height*k})}
  else if(f.type==='Checkbox'||f.type==='Radio')p.drawText('X',{x:x+2,y:y+2,size:Math.max(8,h*.8),font});
  else if(f.type==='Strikethrough')p.drawLine({start:{x,y:y+h/2},end:{x:x+w,y:y+h/2},thickness:1.5,color:rgb(.8,0,0)});
  else p.drawText(String(v).replace(/[^\x20-\x7E]/g,'?'),{x:x+2,y:y+h*.3,size:Math.min(12,Math.max(7,h*.6)),font,maxWidth:w})}
 return new Blob([await pd.save()],{type:'application/pdf'})}
function dl(_d:R){toast('Download successful!',false,true)}

export default function Sign({path}:{path:string}){
 const p=path.split('/'),[dd,setDd]=useState('');useEffect(()=>setDd(''),[path]);
 const menus:[string,[string,string][]][]=[['Dashboard',[]],['Documents',[['My Documents','sign/documents/my'],['All Documents','sign/documents/all']]],['Templates',[]],['Reports',[['Green Savings','sign/reports']]],['Configuration',[['Settings','sign/config/settings'],['Fields','sign/config/fields'],['Tags','sign/config/tags']]]];
 const body=p[1]==='template'?<Editor id={p[2]}/>:p[1]==='sign'?<Signing key={p[2]+p[3]} did={p[2]} idx={+p[3]||0}/>:p[1]==='use'?<Use tid={p[2]}/>:p[1]==='documents'?<Docs scope={p[2]||'all'}/>:p[1]==='reports'?<Green/>:p[1]==='config'?<Config tab={p[2]||'settings'}/>:p[1]==='templates'?<Templates/>:<SignDash/>;
 return <div><div className="stabs"><b>Sign</b>{menus.map(([l,it])=><div className="rel" key={l}>{it.length?<button className={dd===l?'on':''} onClick={()=>setDd(dd===l?'':l)}>{l}</button>:<button onClick={()=>nav(l==='Dashboard'?'sign':'sign/templates')}>{l}</button>}{dd===l&&<div className="dd">{it.map(([a,b])=><button key={b} onClick={()=>nav(b)}>{a}</button>)}</div>}</div>)}</div>{body}</div>}

function SignDash(){const s=useSign(),c=(x:string)=>s.docs.filter((d:R)=>d.status===x).length;
 return <div><div className="ph"><div><h1>Sign</h1><p>Request signatures, sign documents and track their status.</p></div><div className="acts"><button className="btn p" onClick={()=>nav('sign/templates')}>Upload PDF</button></div></div>
  <div className="kpis">{([['Templates',s.templates.length,'sign/templates',''],['Awaiting signature',c('Sent'),'sign/documents/all','a'],['Signed',c('Signed'),'sign/documents/all','g'],['Refused / cancelled',c('Refused')+c('Cancelled'),'sign/documents/all','r']] as any[]).map(([l,v,p,k])=><button key={l} className={'kpi '+k} onClick={()=>nav(p)}><span>{l}</span><b>{v}</b></button>)}</div>
  <section className="pn"><h3>Recent documents</h3>{s.docs.slice(0,6).map((d:R)=><div className="fl" key={d.id}><span className="nm">{d.name}</span><span className="bd info">{d.status}</span></div>)}{!s.docs.length&&<div className="empty">No documents yet. Open Templates, try the sample template, then send it or sign it.</div>}</section></div>}
function Use({tid}:any){const s=useSign(),ran=useRef(false);useEffect(()=>{if(ran.current)return;const t=s.templates.find((x:R)=>x.id===tid);if(!t)return;ran.current=true;if(!t.fields.length){toast('Add at least one field to the template first',true);return nav('sign/template/'+tid)}makeDoc(t,[]).then(d=>nav(`sign/sign/${d.id}/0`)).catch(()=>toast('Could not create the document',true))},[]);return <div className="empty">Preparing document…</div>}

function SendMod({t,onClose}:any){const [sg,setSg]=useState<R[]>(t.signers.map((s:R)=>({name:s.name,email:''}))),[msg,setMsg]=useState(useSign().settings.message);
 const go=async()=>{if(!t.fields.length)return toast('Add at least one field to the template first',true);if(sg.some(s=>!s.name.trim()||!/^\S+@\S+\.\S+$/.test(s.email)))return toast('Enter a name and a valid email for every signer',true);
  try{await makeDoc(t,sg);toast('Signature request created. Email sending is simulated; use "Sign as…" in Documents.');onClose();nav('sign/documents/all')}catch{toast('Could not create the request',true)}};
 return <Mod title={'Send – '+t.name} onClose={onClose}><div className="fg">{sg.map((s,i)=><div key={i} style={{display:'contents'}}><label>Signer {i+1} name<input value={s.name} onChange={e=>setSg(sg.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/></label><label>Email<input type="email" value={s.email} onChange={e=>setSg(sg.map((x,j)=>j===i?{...x,email:e.target.value}:x))}/></label></div>)}<label className="full">Message<textarea rows={3} value={msg} onChange={e=>setMsg(e.target.value)}/></label></div><div className="mf"><button className="btn" onClick={onClose}>Cancel</button><button className="btn p" onClick={go}>Send (simulated)</button></div></Mod>}

function Templates(){
 const s=useSign(),[q,setQ]=useState(''),[tag,setTag]=useState(''),[send,setSend]=useState<R|null>(null),[drag,setDrag]=useState(false),fr=useRef<HTMLInputElement>(null);
 const up=async(fs?:FileList|null)=>{if(!fs)return;for(const f of [...fs]){if(f.type!=='application/pdf'){toast(f.name+': only PDF files can be templates',true);continue}if(f.size>15e6){toast(f.name+' is larger than 15 MB',true);continue}const id=await addTemplate(f,f.name);if(fs.length===1&&id)nav('sign/template/'+id)}};
 const sample=async()=>{const id=await sampleTpl();if(id)nav('sign/template/'+id)};
 const list=s.templates.filter((t:R)=>(!tag||t.tags.includes(tag))&&t.name.toLowerCase().includes(q.toLowerCase()));
 const share=async(t:R)=>{const u=location.origin+location.pathname+'#/sign/use/'+t.id;try{await navigator.clipboard.writeText(u);toast('Link copied (works in this browser only)')}catch{prompt('Copy this link',u)}};
 return <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);up(e.dataTransfer.files)}}>
  <div className="ph"><div><h1>Templates</h1><p>Upload a PDF, place signature fields, then send it or sign it now.</p></div><div className="acts"><input ref={fr} hidden type="file" accept=".pdf" multiple onChange={e=>{up(e.target.files);e.target.value=''}}/><button className="btn p" onClick={()=>fr.current?.click()}><Upload size={16}/>Upload PDF</button></div></div>
  <div className="bar"><div className="gs sm"><input aria-label="Search templates" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/></div><select aria-label="Tag" value={tag} onChange={e=>setTag(e.target.value)}><option value="">All tags</option>{s.tags.map((t:R)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
  {!s.templates.length?<div className={'pn empty dz'+(drag?' on':'')}><h3>Create a template</h3><p>Drag &amp; drop or <button className="lnk" onClick={()=>fr.current?.click()}>Upload</button> a PDF file</p><button className="btn p" onClick={sample}>Try a sample template</button></div>
  :<div className={'pn flush'+(drag?' dz on':'')}><div className="tw"><table><thead><tr><th></th><th>Template</th><th>Tags</th><th>Pages</th><th className="n">In progress</th><th className="n">Signed</th><th>Actions</th></tr></thead><tbody>{list.map((t:R)=><tr key={t.id}>
   <td><button className="ib" aria-label="Favorite" onClick={()=>upsert('templates',{...t,fav:!t.fav})}><Star size={16} fill={t.fav?'#f59e0b':'none'} color={t.fav?'#f59e0b':'currentColor'}/></button></td>
   <td><button className="lnk" onClick={()=>nav('sign/template/'+t.id)}>{t.name}</button></td><td>{t.tags.map((x:string)=><span key={x} className="bd info" style={{marginRight:4}}>{s.tags.find((g:R)=>g.id===x)?.name}</span>)}</td><td>{t.pages}</td>
   <td className="n">{s.docs.filter((d:R)=>d.tid===t.id&&d.status==='Sent').length}</td><td className="n">{s.docs.filter((d:R)=>d.tid===t.id&&d.status==='Signed').length}</td>
   <td className="ra"><button onClick={()=>setSend(t)}>Send</button><button onClick={()=>nav('sign/use/'+t.id)}>Sign Now</button><button onClick={()=>share(t)}>Share</button><button className="red" onClick={async()=>{if(confirm('Delete this template? Existing documents are kept.')){remove('templates',t.id);await delBlob(t.fileId).catch(()=>{});toast('Template deleted')}}}><Trash2 size={13}/></button></td></tr>)}</tbody></table>{!list.length&&<div className="empty">No templates match.</div>}</div></div>}
  <input hidden/>{send&&<SendMod t={send} onClose={()=>setSend(null)}/>}</div>}

function Editor({id}:{id:string}){
 const s=useSign(),t=s.templates.find((x:R)=>x.id===id),pdf=usePdf(t?.fileId),[pg,setPg]=useState(1),[zoom,setZoom]=useState(()=>window.matchMedia('(max-width: 600px)').matches?Math.min(.4,(window.innerWidth-60)/(595*1.4)):.8),[sg,setSg]=useState(0),[tool,setTool]=useState<R|null>(null),[send,setSend]=useState(false),[tmp,setTmp]=useState<R|null>(null);
 if(!t)return <Empty/>;
 const upd=(p:R)=>upsert('templates',{...t,...p});
 const place=(e:any,w:number,h:number)=>{if(!tool)return;const r=e.currentTarget.getBoundingClientRect(),[fw,fh]=SZ(tool.type);const x=Math.min(Math.max((e.clientX-r.left)/w-fw/2,0),1-fw),y=Math.min(Math.max((e.clientY-r.top)/h-fh/2,0),1-fh);upd({fields:[...t.fields,{id:uid(),type:tool.type,label:tool.label,signer:sg,page:pg,x,y,w:fw,h:fh}]});setTool(null)};
 const drag=(e:any,f:R,w:number,h:number)=>{e.stopPropagation();const sx=e.clientX,sy=e.clientY;let last={x:f.x,y:f.y};const mv=(m:any)=>{last={x:Math.min(Math.max(f.x+(m.clientX-sx)/w,0),1-f.w),y:Math.min(Math.max(f.y+(m.clientY-sy)/h,0),1-f.h)};setTmp({id:f.id,...last})};const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);setTmp(null);upd({fields:t.fields.map((x:R)=>x.id===f.id?{...x,...last}:x)})};addEventListener('pointermove',mv);addEventListener('pointerup',up)};
 const delSigner=(i:number)=>{upd({signers:t.signers.filter((_:any,j:number)=>j!==i),fields:t.fields.filter((f:R)=>f.signer!==i).map((f:R)=>({...f,signer:f.signer>i?f.signer-1:f.signer}))});setSg(0)};
 const pal=[...TYPES.map(x=>({type:x[0],label:x[0]})),...s.fields.map((f:R)=>({type:f.base,label:f.name}))];
 return <div><div className="ph"><div><div className="muted"><button className="lnk" onClick={()=>nav('sign/templates')}>Templates</button> / </div><input className="tt" aria-label="Template name" defaultValue={t.name} onBlur={e=>e.target.value.trim()&&upd({name:e.target.value.trim()})}/></div>
  <div className="acts"><button className="btn p" onClick={()=>setSend(true)}>Send</button><button className="btn p" onClick={()=>nav('sign/use/'+t.id)}>Sign Now</button><button className="btn" onClick={()=>{const u=location.origin+location.pathname+'#/sign/use/'+t.id;navigator.clipboard?.writeText(u).then(()=>toast('Link copied'),()=>prompt('Copy this link',u))}}>Share</button></div></div>
  <div className="bar">{s.tags.map((g:R)=><button key={g.id} className={'chip'+(t.tags.includes(g.id)?'':' off')} onClick={()=>upd({tags:t.tags.includes(g.id)?t.tags.filter((x:string)=>x!==g.id):[...t.tags,g.id]})}>{g.name}</button>)}</div>
  <div className="ed"><aside className="pn"><h3>Documents</h3><div className="fl"><span className="nm">{t.name}</span><small className="muted">{t.pages} p.</small></div>
   <h3 style={{marginTop:14}}>Signers <button className="lnk" onClick={()=>upd({signers:[...t.signers,{id:uid(),name:'Signer '+(t.signers.length+1)}]})}>Add</button></h3>
   {t.signers.map((x:R,i:number)=><div key={x.id} className={'sgr'+(sg===i?' on':'')} onClick={()=>setSg(i)}><span className="dot" style={{background:COL[i%5]}}/><input aria-label="Signer name" value={x.name} onChange={e=>upd({signers:t.signers.map((y:R)=>y.id===x.id?{...y,name:e.target.value}:y)})}/><span className="bd info">{t.fields.filter((f:R)=>f.signer===i).length}</span>{i>0&&<button className="ib" aria-label="Remove signer" onClick={()=>delSigner(i)}><X size={14}/></button>}</div>)}
   <div className="pal">{pal.map(x=><button key={x.label} className={tool?.label===x.label?'on':''} style={{borderColor:COL[sg%5]}} onClick={()=>setTool(tool?.label===x.label?null:x)}>{x.label}</button>)}<button onClick={()=>nav('sign/config/fields')}><Plus size={13}/> Add Field</button></div>
   <p className="muted" style={{fontSize:12}}>{tool?`Click on the page to place "${tool.label}" for ${t.signers[sg].name}.`:'Pick a field, then click the page. Drag placed fields to move them.'}</p></aside>
  <section className="pn view"><div className="vt"><button className="ib" disabled={pg<2} onClick={()=>setPg(pg-1)} aria-label="Previous page"><ChevronLeft size={18}/></button>{pg} of {t.pages}<button className="ib" disabled={pg>=t.pages} onClick={()=>setPg(pg+1)} aria-label="Next page"><ChevronRight size={18}/></button><span style={{flex:1}}/><button className="ib" aria-label="Zoom out" onClick={()=>setZoom(Math.max(.4,zoom-.1))}><ZoomOut size={18}/></button>{Math.round(zoom*100)}%<button className="ib" aria-label="Zoom in" onClick={()=>setZoom(Math.min(1.6,zoom+.1))}><ZoomIn size={18}/></button></div>
   <div className="vp"><Page pdf={pdf} n={pg} zoom={zoom}>{(w:number,h:number)=><div className="ov2" style={{cursor:tool?'crosshair':'default'}} onClick={e=>place(e,w,h)}>{t.fields.filter((f:R)=>f.page===pg).map((f:R)=>{const q=tmp?.id===f.id?tmp:f;return <div key={f.id} className="fb" onPointerDown={e=>drag(e,f,w,h)} style={{left:q.x*w,top:q.y*h,width:f.w*w,height:f.h*h,['--c' as any]:COL[f.signer%5],cursor:'move'}}>{f.label||f.type}<button className="x" aria-label="Delete field" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();upd({fields:t.fields.filter((x:R)=>x.id!==f.id)})}}>×</button></div>})}</div>}</Page></div></section></div>
  {send&&<SendMod t={t} onClose={()=>setSend(false)}/>}</div>}

function Pad({kind,name,onOk,onClose}:any){
 const c=useRef<HTMLCanvasElement>(null),[mode,setMode]=useState('draw'),[txt,setTxt]=useState(kind==='Initials'?name.split(' ').map((w:string)=>w[0]||'').join(''):name),dr=useRef(false),drew=useRef(false);
 const g=()=>c.current!.getContext('2d')!;
 const pos=(e:any)=>{const r=c.current!.getBoundingClientRect();return[(e.clientX-r.left)*600/r.width,(e.clientY-r.top)*200/r.height]};
 useEffect(()=>{const x=g();x.clearRect(0,0,600,200);drew.current=false;if(mode==='type'){x.font='italic 80px "Brush Script MT","Segoe Script",cursive';x.fillStyle='#111';x.fillText(txt,20,125)}},[mode,txt]);
 const ok=()=>{if(mode==='draw'&&!drew.current)return toast('Draw your '+kind.toLowerCase()+' first',true);if(mode==='type'&&!txt.trim())return toast('Type your name first',true);onOk(c.current!.toDataURL('image/png'))};
 return <Mod title={'Adopt your '+kind.toLowerCase()} onClose={onClose}><div className="seg" style={{marginBottom:8}}>{[['draw','Draw'],['type','Type']].map(([k,l])=><button key={k} className={mode===k?'on':''} onClick={()=>setMode(k)}>{l}</button>)}</div>
  {mode==='type'&&<input aria-label="Typed name" style={{width:'100%',marginBottom:8}} value={txt} onChange={e=>setTxt(e.target.value)}/>}
  <canvas ref={c} width={600} height={200} className="padc" style={{touchAction:'none'}} onPointerDown={e=>{if(mode!=='draw')return;dr.current=true;drew.current=true;const[x,y]=pos(e);const k=g();k.lineWidth=3;k.lineCap='round';k.strokeStyle='#111';k.beginPath();k.moveTo(x,y)}} onPointerMove={e=>{if(!dr.current)return;const[x,y]=pos(e);const k=g();k.lineTo(x,y);k.stroke()}} onPointerUp={()=>{dr.current=false}} onPointerLeave={()=>{dr.current=false}}/>
  <div className="mf">{mode==='draw'&&<button className="btn" onClick={()=>{g().clearRect(0,0,600,200);drew.current=false}}>Clear</button>}<button className="btn" onClick={onClose}>Cancel</button><button className="btn p" onClick={ok}>Adopt</button></div></Mod>}
const stamp=(n:string)=>{const c=document.createElement('canvas');c.width=360;c.height=120;const x=c.getContext('2d')!;x.strokeStyle='#dc2626';x.fillStyle='#dc2626';x.lineWidth=5;x.strokeRect(6,6,348,108);x.font='bold 30px sans-serif';x.fillText('APPROVED',24,50);x.font='20px sans-serif';x.fillText(n.slice(0,22),24,82);x.fillText(today(),24,106);return c.toDataURL('image/png')};

function Signing({did,idx}:any){
 const s=useSign(),d=s.docs.find((x:R)=>x.id===did),pdf=usePdf(d?.fileId),[pg,setPg]=useState(1),[zoom]=useState(()=>window.matchMedia('(max-width: 600px)').matches?Math.min(.4,(window.innerWidth-60)/(595*1.4)):.9),[vals,setVals]=useState<R>({}),[pad,setPad]=useState<R|null>(null);
 const sg=d?.signers[idx];
 useEffect(()=>{if(!d||!sg)return;const v:R={...sg.values};d.fields.filter((f:R)=>f.signer===idx).forEach((f:R)=>{if(v[f.id]==null){if(f.type==='Name')v[f.id]=sg.name;if(f.type==='Email'&&sg.email)v[f.id]=sg.email;if(f.type==='Date')v[f.id]=today()}});setVals(v)},[d?.id]);
 if(!d||!sg)return <Empty/>;
 if(sg.status!=='Waiting')return <div className="pn empty"><h3>{sg.name} has already {sg.status.toLowerCase()} this document.</h3><button className="btn" onClick={()=>nav('sign/documents/all')}>Back to documents</button></div>;
 if(d.status==='Cancelled'||d.status==='Refused')return <div className="pn empty"><h3>This request is {d.status.toLowerCase()}.</h3></div>;
 const mine=d.fields.filter((f:R)=>f.signer===idx);
 const done=async()=>{const miss=mine.filter((f:R)=>!NOREQ.includes(f.type)&&!vals[f.id]);if(miss.length)return toast(`${miss.length} required field(s) still empty`,true);
  const signers=d.signers.map((x:R,i:number)=>i===idx?{...x,status:'Signed',values:vals,at:Date.now()}:x),all=signers.every((x:R)=>x.status==='Signed'),nd:R={...d,signers,status:all?'Signed':'Sent'};
  try{if(all){await putBlob(d.id+'-signed',await burn(nd));nd.signedId=d.id+'-signed'}}catch{return toast('Could not generate the signed PDF',true)}
  upsert('docs',nd);toast(all?'Document signed by all parties':'Your signature was recorded');nav('sign/documents/all')};
 const cell=(f:R)=>{const v=vals[f.id],set=(x:any)=>setVals({...vals,[f.id]:x}),T=f.type;
  if(T==='Signature'||T==='Initials')return v?<img src={v} alt={T} onClick={()=>setPad(f)}/>:<button className="sf" onClick={()=>setPad(f)}>{T==='Signature'?'Click to sign':'Initials'}</button>;
  if(T==='Stamp')return v?<img src={v} alt="Stamp"/>:<button className="sf" onClick={()=>set(stamp(sg.name))}>Stamp</button>;
  if(T==='Checkbox'||T==='Radio')return <input type="checkbox" aria-label={T} checked={!!v} onChange={e=>set(e.target.checked)}/>;
  if(T==='Strikethrough')return <button className={'sf'+(v?' on':'')} onClick={()=>set(!v)}>{v?'Struck':'Strike'}</button>;
  if(T==='Selection')return <select aria-label="Selection" value={v||''} onChange={e=>set(e.target.value)}><option value="">Select</option>{['Option 1','Option 2','Option 3'].map(o=><option key={o}>{o}</option>)}</select>;
  if(T==='Multiline')return <textarea aria-label={f.label||T} value={v||''} onChange={e=>set(e.target.value)}/>;
  if(T==='Date')return <input type="date" aria-label="Date" value={v||''} onChange={e=>set(e.target.value)}/>;
  return <input aria-label={f.label||T} type={T==='Email'?'email':'text'} placeholder={f.label||T} value={v||''} onChange={e=>set(e.target.value)}/>};
 return <div><div className="ph"><div><h1>{d.name}</h1><p>Signing as <b>{sg.name}</b> · {mine.length} field(s) to complete</p></div><div className="acts"><button className="btn" onClick={()=>{if(confirm('Refuse to sign this document?')){upsert('docs',{...d,status:'Refused',signers:d.signers.map((x:R,i:number)=>i===idx?{...x,status:'Refused'}:x)});toast('Refused');nav('sign/documents/all')}}}>Refuse</button><button className="btn p" onClick={done}>Validate &amp; Send</button></div></div>
  <section className="pn view"><div className="vt"><button className="ib" disabled={pg<2} onClick={()=>setPg(pg-1)} aria-label="Previous page"><ChevronLeft size={18}/></button>{pg} of {d.pages}<button className="ib" disabled={pg>=d.pages} onClick={()=>setPg(pg+1)} aria-label="Next page"><ChevronRight size={18}/></button></div>
  <div className="vp"><Page pdf={pdf} n={pg} zoom={zoom}>{(w:number,h:number)=><div className="ov2">{mine.filter((f:R)=>f.page===pg).map((f:R)=><div key={f.id} className="fb sg" style={{left:f.x*w,top:f.y*h,width:f.w*w,height:f.h*h,['--c' as any]:COL[idx%5]}}>{cell(f)}</div>)}</div>}</Page></div></section>
  {pad&&<Pad kind={pad.type} name={sg.name} onClose={()=>setPad(null)} onOk={(u:string)=>{setVals({...vals,[pad.id]:u});setPad(null)}}/>}</div>}

function Docs({scope}:{scope:string}){
 const s=useSign(),[st,setSt]=useState(''),[q,setQ]=useState('');
 const base=s.docs.filter((d:R)=>scope==='my'?d.status==='Sent'||d.status==='Signed':true),rows=base.filter((d:R)=>(!st||d.status===st)&&d.name.toLowerCase().includes(q.toLowerCase()));
 const bt=(x:string)=>x==='Signed'?'ok':x==='Sent'||x==='Waiting'?'info':x==='Cancelled'||x==='Refused'?'bad':'warn';
 return <div><div className="ph"><div><h1>{scope==='my'?'My Documents':'All Documents'}</h1><p>Track signature requests and download signed files.</p></div></div>
  <div className="bar"><div className="gs sm"><input aria-label="Search documents" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/></div>{['','Sent','Signed','Refused','Cancelled'].map(x=><button key={x} className={'chip'+(st===x?'':' off')} onClick={()=>setSt(x)}>{x||'All'} ({base.filter((d:R)=>!x||d.status===x).length})</button>)}</div>
  <div className="pn flush"><div className="tw"><table><thead><tr><th>Document</th><th>Signers</th><th>Pages</th><th>Created</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((d:R)=><tr key={d.id}><td>{d.name}</td><td>{d.signers.map((x:R,i:number)=><div key={i}>{x.name} {x.email&&<small className="muted">({x.email})</small>} <span className={'bd '+bt(x.status)}>{x.status}</span></div>)}</td><td>{d.pages}</td><td>{fdate(d.created)}</td><td><span className={'bd '+bt(d.status)}>{d.status}</span></td>
   <td className="ra" style={{flexWrap:'wrap'}}>{d.status==='Sent'&&d.signers.map((x:R,i:number)=>x.status==='Waiting'&&<button key={i} onClick={()=>nav(`sign/sign/${d.id}/${i}`)}>Sign as {x.name}</button>)}<button onClick={()=>dl(d)}>{d.signedId?'Download signed':'Download'}</button>{d.status==='Sent'&&<button onClick={()=>{upsert('docs',{...d,status:'Cancelled'});toast('Request cancelled')}}>Cancel</button>}<button className="red" onClick={async()=>{if(confirm('Delete this document?')){remove('docs',d.id);await delBlob(d.fileId).catch(()=>{});if(d.signedId)await delBlob(d.signedId).catch(()=>{});toast('Deleted')}}}><Trash2 size={13}/></button></td></tr>)}</tbody></table>{!rows.length&&<div className="empty"><h3>No documents</h3><p>Send a template or use Sign Now to create one.</p></div>}</div></div></div>}

function Green(){
 const s=useSign(),D=s.docs.filter((d:R)=>d.status==='Signed'),pages=D.reduce((a:number,d:R)=>a+d.pages,0),m:R={};D.forEach((d:R)=>{const k=new Date(d.created).toISOString().slice(0,7);m[k]=(m[k]||0)+d.pages});
 const data=Object.entries(m).sort().map(([k,v])=>({k,Pages:v}));
 return <div><div className="ph"><div><h1>Green Savings</h1><p>Estimated environmental impact of signing electronically.</p></div></div>
  <div className="kpis">{[['Documents signed',D.length],['Sheets of paper saved',pages],['Trees saved',(pages/8333).toFixed(4)],['Water saved (L)',pages*10]].map(([l,v])=><div key={l as string} className="kpi g"><span>{l}</span><b>{v}</b></div>)}</div>
  <section className="pn"><h3>Pages signed per month</h3>{data.length?<div style={{height:240}}><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="k"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="Pages" fill="#059669" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>:<div className="empty">Sign a document to see your savings.</div>}<p className="muted">Illustrative estimates: 8,333 sheets per tree and 10 L of water per sheet.</p></section></div>}

function Config({tab}:{tab:string}){
 const s=useSign(),[st,setSt]=useState<R>(s.settings),[nm,setNm]=useState(''),[base,setBase]=useState('Text');
 const tabs=[['settings','Settings'],['fields','Fields'],['tags','Tags']];
 return <div><div className="ph"><div><h1>{tabs.find(x=>x[0]===tab)?.[1]||'Settings'}</h1><p>Configure Sign for this demo workspace.</p></div></div>
  <div className="bar">{tabs.map(([k,l])=><button key={k} className={'chip'+(tab===k?'':' off')} onClick={()=>nav('sign/config/'+k)}>{l}</button>)}</div>
  {tab==='settings'&&<section className="pn"><div className="fg"><label>Request expiry (days)<input type="number" min="1" value={st.expiry} onChange={e=>setSt({...st,expiry:+e.target.value})}/></label><label>Reminder frequency<select value={st.reminder} onChange={e=>setSt({...st,reminder:e.target.value})}>{['Never','Daily','Weekly'].map(x=><option key={x}>{x}</option>)}</select></label><label>Allow signing by shared link<select value={st.link} onChange={e=>setSt({...st,link:e.target.value})}><option>Yes</option><option>No</option></select></label><label className="full">Default message<textarea rows={3} value={st.message} onChange={e=>setSt({...st,message:e.target.value})}/></label></div><div className="mf"><button className="btn" onClick={()=>setSt(s.settings)}>Discard</button><button className="btn p" onClick={()=>{if(!(st.expiry>0))return toast('Expiry must be at least 1 day',true);sset({settings:st});toast('Settings saved')}}>Save</button></div></section>}
  {tab==='fields'&&<section className="pn"><div className="bar"><input aria-label="Field name" placeholder="New field name" value={nm} onChange={e=>setNm(e.target.value)}/><select aria-label="Field type" value={base} onChange={e=>setBase(e.target.value)}>{TYPES.map(x=><option key={x[0]}>{x[0]}</option>)}</select><button className="btn p" onClick={()=>{if(!nm.trim())return toast('Enter a field name',true);upsert('fields',{id:uid(),name:nm.trim(),base});setNm('');toast('Field added. It now appears in the template editor.')}}><Plus size={14}/>Add field</button></div>
   <table><thead><tr><th>Name</th><th>Type</th><th></th></tr></thead><tbody>{s.fields.map((f:R)=><tr key={f.id}><td>{f.name}</td><td>{f.base}</td><td><button className="ib red" aria-label="Delete" onClick={()=>remove('fields',f.id)}><Trash2 size={14}/></button></td></tr>)}</tbody></table>{!s.fields.length&&<div className="empty">No custom fields yet.</div>}</section>}
  {tab==='tags'&&<section className="pn"><div className="bar"><input aria-label="Tag name" placeholder="New tag" value={nm} onChange={e=>setNm(e.target.value)}/><button className="btn p" onClick={()=>{if(!nm.trim())return toast('Enter a tag name',true);upsert('tags',{id:uid(),name:nm.trim()});setNm('')}}><Plus size={14}/>Add tag</button></div>
   <div>{s.tags.map((g:R)=><span key={g.id} className="chip" style={{marginRight:6}}>{g.name}<button className="ib" aria-label="Delete tag" onClick={()=>remove('tags',g.id)}><X size={12}/></button></span>)}</div></section>}</div>}
