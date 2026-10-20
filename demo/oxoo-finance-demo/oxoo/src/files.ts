import {toast} from './data';
const op=()=>new Promise<IDBDatabase>((res,rej)=>{const r=indexedDB.open('ledgerly',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
export const putBlob=async(k:string,b:Blob)=>{const x=await op();return new Promise<void>((res,rej)=>{const t=x.transaction('f','readwrite');t.objectStore('f').put(b,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})};
export const getBlob=async(k:string)=>{const x=await op();return new Promise<Blob|undefined>((res,rej)=>{const q=x.transaction('f').objectStore('f').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})};
export const delBlob=async(k:string)=>{const x=await op();return new Promise<void>((res,rej)=>{const t=x.transaction('f','readwrite');t.objectStore('f').delete(k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})};
export const clearBlobs=async()=>{const x=await op();return new Promise<void>((res,rej)=>{const t=x.transaction('f','readwrite');t.objectStore('f').clear();t.oncomplete=()=>res();t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||new Error('File storage clear was aborted'))})};
export const viewAtt=async(a:{id:string})=>{const b=await getBlob(a.id).catch(()=>undefined);if(!b)return toast('File not found in browser storage',true);window.open(URL.createObjectURL(b))};
