import {jsPDF} from 'jspdf';import autoTable from 'jspdf-autotable';
import {getBlob} from './files';import {snap,R,toast} from './data';
export const m=(n:any)=>'Rs. '+(+n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
async function logo(){const b=await getBlob('logo');if(!b)return null;const u=URL.createObjectURL(b);try{const im=new Image();await new Promise<void>((r,j)=>{im.onload=()=>r();im.onerror=()=>j(new Error('Could not load the uploaded company logo'));im.src=u});const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d')!.drawImage(im,0,0);return{u:c.toDataURL('image/png'),w:im.width,h:im.height}}finally{URL.revokeObjectURL(u)}}
async function head(doc:jsPDF,title:string,no:string){const co=snap().company?.[0]||{};const lg=await logo().catch(()=>null);const W=doc.internal.pageSize.getWidth();let y=40;
 if(lg){const w=Math.min(150,48*lg.w/lg.h),h=w*lg.h/lg.w;doc.addImage(lg.u,'PNG',40,y,w,h);y+=h+6}else{doc.setFont('helvetica','bold').setFontSize(18).text(co.name||'Your Company',40,y+14);y+=26}
 doc.setFont('helvetica','normal').setFontSize(9).setTextColor(90);let ry=40;
 [lg?co.name:'',co.street,[co.city,co.state,co.zip].filter(Boolean).join(', '),co.country,co.gstin&&'GSTIN: '+co.gstin,co.pan&&'PAN: '+co.pan,co.email,co.phone,co.website].filter(Boolean).forEach((l:any)=>{doc.text(String(l),W-40,ry,{align:'right'});ry+=12});
 y=Math.max(y,ry)+14;doc.setTextColor(20).setFont('helvetica','bold').setFontSize(20).text(title,40,y);doc.setFontSize(11).setFont('helvetica','normal').text(no||'',40,y+16);return y+34}
const foot=(doc:jsPDF)=>{const n=doc.getNumberOfPages(),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight();for(let i=1;i<=n;i++){doc.setPage(i);doc.setFontSize(8).setTextColor(130).text(`Demo document - fictional data - Page ${i} of ${n}`,W/2,H-20,{align:'center'})}};
export const out=(doc:jsPDF,name:string,mode:string)=>{foot(doc);if(mode==='save'){toast('Download successful!',false,true);return}if(mode==='print')doc.autoPrint();window.open(doc.output('bloburl') as any,'_blank')};
const fy=(doc:any)=>doc.lastAutoTable.finalY;
const T:R={invoices:'Invoice',cnotes:'Credit Note',vbills:'Vendor Bill',vrefunds:'Vendor Refund'};
export const TPL:R={
 modern:{n:'Modern Clean',acc:[79,70,229],head:[79,70,229],headT:1,tot:[79,70,229],totT:1,foot:'tri',pay:1,thanks:'Thank you for your business!'},
 minimal:{n:'Minimal',acc:[20,20,20],head:[238,238,238],tot:[0,0,0],totT:1,terms:1},
 pro:{n:'Professional',band:[[12,26,70],[99,66,241]],bandT:1,acc:[99,66,241],head:[99,66,241],headT:1,tot:[99,66,241],totT:1,thanks:'Thank you!',sig:1,logoCard:1},
 elegant:{n:'Elegant',bg:[253,248,235],acc:[176,134,48],head:[233,214,170],tot:[176,134,48],totT:1,serif:1,thanks:'Thank you for your business'},
};
const TPL_KEYS=['modern','minimal','pro','elegant'];
export const TPLS:string[][]=TPL_KEYS.map(k=>[k,TPL[k].n]);
export const getTpl=()=>{const k=localStorage.getItem('oxoo-tpl');return k&&TPL_KEYS.includes(k)?k:'modern'};
export const setTpl=(k:string)=>{if(TPL_KEYS.includes(k))localStorage.setItem('oxoo-tpl',k)};
export const clearTpl=()=>localStorage.removeItem('oxoo-tpl');
export async function docPdf(coll:string,r:R,mode='save',tpl?:string){
 const th=TPL[tpl||getTpl()]||TPL.modern,doc=new jsPDF({unit:'pt',format:'a4'}),W=595,H=842,co=snap().company?.[0]||{},v=coll.startsWith('v');
 const fill=(c:number[])=>doc.setFillColor(c[0],c[1],c[2]),tcol=(c:number[])=>doc.setTextColor(c[0],c[1],c[2]);
 const bg=()=>{if(th.bg){fill(th.bg);doc.rect(0,0,W,H,'F')}};bg();
 const ink=th.dark?[255,255,255]:[30,30,40],hc=th.dark||th.bandT?[255,255,255]:ink,fam=th.serif?'times':'helvetica';
 if(th.band){const[a,b]=th.band;for(let i=0;i<30;i++){const t=i/29;fill(a.map((x:number,j:number)=>Math.round(x+(b[j]-x)*t)));doc.rect(i*W/30,0,W/30+1,120,'F')}}
 const lg=await logo().catch(()=>null);
 if(lg){const h=44,w=Math.min(170,h*lg.w/lg.h),hh=w*lg.h/lg.w;if(th.logoCard){fill([255,255,255]);doc.roundedRect(34,20,w+12,hh+12,6,6,'F')}doc.addImage(lg.u,'PNG',40,26,w,hh)}else{tcol(hc);doc.setFont(fam,'bold').setFontSize(18).text(co.name||'Your Company',40,50)}
 tcol(hc);doc.setFont(fam,'bold').setFontSize(22).text(T[coll].toUpperCase(),W-40,52,{align:'right'});doc.setFont('helvetica','normal').setFontSize(9);
 [`${T[coll]} #: ${r.number}`,`Date: ${r.date}`,`Due Date: ${r.due}`].forEach((l,i)=>doc.text(l,W-40,68+i*12,{align:'right'}));
 let y=th.band?145:112;tcol(ink);
 const p=(snap()[v?'vendors':'customers']||[]).find((c:R)=>c.name===r.party)||{};
 doc.setFont('helvetica','bold').setFontSize(10).text('From:',40,y).text(v?'Vendor:':'Bill To:',330,y);doc.setFont('helvetica','normal').setFontSize(9);
 [co.name,co.street,[co.city,co.state,co.zip].filter(Boolean).join(', '),co.gstin&&'GSTIN: '+co.gstin,co.pan&&'PAN: '+co.pan,co.email,co.phone].filter(Boolean).forEach((l:any,i:number)=>doc.text(String(l),40,y+14+i*12));
 [r.party,p.email,[p.city,p.country].filter(Boolean).join(', '),r.ref&&'Ref: '+r.ref].filter(Boolean).forEach((l:any,i:number)=>doc.text(String(l),330,y+14+i*12));
 y+=106;const wb=()=>{if(th.bg)return{willDrawPage:(x:any)=>{if(x.pageNumber>1)bg()}};return{}};
 autoTable(doc,{startY:y,theme:'grid',head:[['#','Description','Qty','Unit Price','GST %','Amount']],body:r.lines.map((l:R,i:number)=>[i+1,l.desc,l.qty,m(l.price),l.tax,m(l.qty*l.price*(1-(l.disc||0)/100))]),headStyles:{fillColor:th.head,textColor:th.headT?255:30},styles:{fontSize:9,cellPadding:6,lineColor:th.dark?[50,60,110]:[225,225,235],textColor:ink,fillColor:th.dark?[20,28,66]:th.bg?th.bg:255},columnStyles:{0:{cellWidth:28},1:{cellWidth:190}},...wb()});
 const tx:R={};r.lines.forEach((l:R)=>{tx[l.tax]=(tx[l.tax]||0)+l.qty*l.price*(1-(l.disc||0)/100)*l.tax/100});
 autoTable(doc,{startY:fy(doc)+10,margin:{left:330},theme:'plain',styles:{fontSize:10,textColor:ink},body:[['Subtotal',m(r.untaxed)],...Object.entries(tx).map(([k,x]:any)=>['GST ('+k+'%)',m(x)])],columnStyles:{1:{halign:'right'}},...wb()});
 let y2=fy(doc)+4;fill(th.tot);doc.rect(330,y2,W-370,26,'F');tcol(th.totT?[255,255,255]:[30,30,40]);doc.setFont('helvetica','bold').setFontSize(11).text('Total',340,y2+17).text(m(r.total),W-48,y2+17,{align:'right'});
 autoTable(doc,{startY:y2+32,margin:{left:330},theme:'plain',styles:{fontSize:9.5,textColor:ink},body:[['Paid',m(r.paid)],['Balance due',m(r.amountDue)],['Status',r.status]],columnStyles:{1:{halign:'right'}},...wb()});
 let y3=fy(doc)+22;if(y3>690){doc.addPage();bg();y3=60}
 tcol(ink);doc.setFont('helvetica','normal').setFontSize(9);
 if(r.notes){doc.text(doc.splitTextToSize('Notes: '+r.notes,500),40,y3);y3+=24}
 if(th.pay){doc.setFont('helvetica','bold').text('Payment Methods:',40,y3).setFont('helvetica','normal').text('UPI   |   Razorpay   |   Bank Transfer',130,y3);y3+=18}
 if(th.terms){doc.setFont('helvetica','bold').text('Terms & Conditions',40,y3).setFont('helvetica','normal');['1. Payment due within 15 days.','2. Late payments may incur additional charges.','3. Thank you for your business!'].forEach((l,i)=>doc.text(l,40,y3+14+i*12));y3+=52}
 if(th.thanks){tcol(th.acc);doc.setFont(th.serif?'times':'helvetica','italic').setFontSize(16).text(th.thanks,40,y3+22);y3+=34}
 if(th.sig){tcol(ink);doc.setFontSize(9).setFont('helvetica','normal').line(W-190,y3+14,W-40,y3+14);doc.text('Authorized Signatory',W-115,y3+26,{align:'center'})}
 const n=doc.getNumberOfPages();for(let i=1;i<=n;i++){doc.setPage(i);
  if(th.foot==='tri'){fill(th.acc);doc.triangle(W-130,H,W,H,W,H-110,'F')}
  if(th.foot==='bar'){fill(th.footFill);doc.rect(0,H-70,W,70,'F')}
  if(th.foot==='contact'){fill(th.footFill);doc.rect(0,H-48,W,48,'F');tcol(th.footT?[255,255,255]:[30,60,100]);doc.setFont('helvetica','normal').setFontSize(9).text([co.website,co.email,co.phone].filter(Boolean).join('     |     ')||'Oxoo - One Platform. Infinite Possibilities.',W/2,H-30,{align:'center'})}}
 out(doc,String(r.number).replace(/\//g,'-'),mode)}
export async function kvPdf(title:string,no:string,pairs:string[][],file:string,mode='save'){const doc=new jsPDF({unit:'pt',format:'a4'});const y=await head(doc,title,no);
 autoTable(doc,{startY:y,body:pairs,theme:'grid',styles:{fontSize:10},columnStyles:{0:{fontStyle:'bold',cellWidth:150,fillColor:[245,245,250]}}});out(doc,file,mode)}
export const expensePdf=(r:R,mode='save')=>kvPdf('Expense',r.number,[['Reference',r.number],['Employee',r.employee],['Description',r.description],['Date',r.date],['Vendor',r.vendor||'-'],['Category',r.product],['Amount',m(r.total)],['Included taxes',m(r.etax)],['Payment method',r.method],['Account',r.account],['Reimbursement',r.reimb],['Status',r.status],['Receipt',(r.att||[]).map((a:R)=>a.name).join(', ')||'None'],['Notes',r.notes||'-']],String(r.number),mode);
export async function tablePdf(title:string,period:string,metrics:string[][],tables:R[],file:string,mode='save'){const doc=new jsPDF({unit:'pt',format:'a4'});let y=await head(doc,title,'Period: '+period+'  |  Generated: '+new Date().toLocaleDateString());
 if(metrics.length){autoTable(doc,{startY:y,body:metrics,theme:'plain',styles:{fontSize:10,fontStyle:'bold'}});y=fy(doc)+10}
 for(const t of tables){doc.setFontSize(12).setTextColor(20).text(t.h,40,y+12);autoTable(doc,{startY:y+20,head:[t.cols],body:t.rows,headStyles:{fillColor:[109,40,217]},styles:{fontSize:8.5},didParseCell:(c:any)=>{if(c.column.index>0&&/^Rs\./.test(String(c.cell.raw)))c.cell.styles.halign='right'}});y=fy(doc)+16}
 out(doc,file,mode)}
