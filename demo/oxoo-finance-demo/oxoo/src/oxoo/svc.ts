import {useSyncExternalStore} from 'react';
import {d} from '../data';
export type R=Record<string,any>;
export const METRICS:R={Environmental:[['Electricity','kWh',.00082],['Diesel','L',.00268],['Petrol','L',.00231],['Natural gas','m3',.00202],['Business flights','km',.000255],['Waste to landfill','kg',.00046],['Water use','m3',0]],Social:[['Employees','count'],['Female employees','count'],['Training hours','hours'],['Injuries','count']],Governance:[['Board members','count'],['Independent directors','count'],['Policies reviewed','count'],['Compliance incidents','count']]};
const rec=(cat:string,metric:string,value:number,i:number):R=>{const m=METRICS[cat].find((x:any)=>x[0]===metric);return{id:cat+metric+i,cat,metric,unit:m[1],value,co2e:+(value*(m[2]||0)).toFixed(4),date:d(-i*12),site:'Head office',notes:''}};
const seed=():R=>({sheets:[],
 esg:[...[['Electricity',14000,0],['Electricity',13500,1],['Electricity',12800,2],['Diesel',300,1],['Petrol',150,2],['Business flights',9000,3],['Waste to landfill',800,1],['Water use',300,0],['Natural gas',150,4]].map(([m,v,i]:any)=>rec('Environmental',m,v,i)),...[['Employees',120],['Female employees',46],['Training hours',1900],['Injuries',2]].map(([m,v]:any,i)=>rec('Social',m,v,i)),...[['Board members',7],['Independent directors',4],['Policies reviewed',12],['Compliance incidents',0]].map(([m,v]:any,i)=>rec('Governance',m,v,i))],
 targets:[{id:'co2',label:'Total emissions (tCO2e) at or below',goal:35,dir:'max'},{id:'fem',label:'Female employees (%) at least',goal:40,dir:'min'},{id:'trn',label:'Training hours per employee at least',goal:20,dir:'min'},{id:'ind',label:'Independent directors (%) at least',goal:50,dir:'min'}]});
const K='oxoo-svc-v1';
let S:R=(()=>{try{const s=localStorage.getItem(K);return s?{...seed(),...JSON.parse(s)}:seed()}catch{return seed()}})();
const subs=new Set<()=>void>();
export const sset=(p:R)=>{S={...S,...p};try{localStorage.setItem(K,JSON.stringify(S))}catch{}subs.forEach(f=>f())};
export const clearSvc=()=>sset({sheets:[],esg:[],targets:[]});
export const useSvc=():R=>useSyncExternalStore(f=>{subs.add(f);return()=>subs.delete(f)},()=>S);
export const upsertS=(k:string,r:R)=>sset({[k]:S[k].some((x:R)=>x.id===r.id)?S[k].map((x:R)=>x.id===r.id?r:x):[r,...S[k]]});
export const removeS=(k:string,id:string)=>sset({[k]:S[k].filter((x:R)=>x.id!==id)});
export const uid=()=>crypto.randomUUID();
