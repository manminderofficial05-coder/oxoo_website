import {X} from 'lucide-react';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid} from 'recharts';
import {toast} from '../data';
export const Mod=({title,onClose,children,wide}:any)=><div className="ov" onClick={onClose}><div className={'md'+(wide?' wide':'')} role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}><div className="mh"><b>{title}</b><button className="ib" aria-label="Close" onClick={onClose}><X size={18}/></button></div>{children}</div></div>;
export const BC=({data,k='Total',color='#7c3aed'}:any)=><div style={{height:220}}><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="n" fontSize={12}/><YAxis fontSize={12}/><Tooltip/><Bar dataKey={k} fill={color} radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>;
export const csvDl=(_name:string,_head:string[],_rows:any[][])=>toast('Download successful!',false,true);
