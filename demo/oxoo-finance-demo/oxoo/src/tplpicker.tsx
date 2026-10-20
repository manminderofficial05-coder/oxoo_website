import {useState} from 'react';
import {X} from 'lucide-react';
import {docPdf,TPL,TPLS,getTpl,setTpl} from './pdf';
const css=(c:number[])=>`rgb(${c.join(',')})`;
export default function TplPicker({coll,rec,onClose}:any){const [t,setT]=useState(getTpl());const go=(m:string)=>{setTpl(t);docPdf(coll,rec,m,t)};
 return <div className="ov" onClick={onClose}><div className="md wide" role="dialog" aria-modal="true" aria-label="Choose PDF template" onClick={e=>e.stopPropagation()}><div className="mh"><b>Choose a PDF template – {rec.number}</b><button className="ib" aria-label="Close" onClick={onClose}><X size={18}/></button></div>
  <div className="tpls">{TPLS.map(([k,n])=>{const h=TPL[k];return <button key={k} className={'tp'+(t===k?' on':'')} onClick={()=>setT(k)}><span className="tpv" style={{background:h.bg?css(h.bg):'#fff'}}><span className="tpb" style={{background:h.band?`linear-gradient(90deg,${css(h.band[0])},${css(h.band[1])})`:'transparent'}}/><span className="tpl" style={{background:css(h.head)}}/><span className="tpl2"/><span className="tpt" style={{background:css(h.tot)}}/>{h.foot&&<span className="tpf" style={{background:css(h.footFill||h.acc)}}/>}</span>{n}</button>})}</div>
  <div className="mf"><button className="btn" onClick={onClose}>Close</button>{[['View','view'],['Download','save'],['Print','print']].map(([l,m])=><button key={m} className={'btn'+(m==='save'?' p':'')} onClick={()=>go(m)}>{l}</button>)}</div></div></div>}
