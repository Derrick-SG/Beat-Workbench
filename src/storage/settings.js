export function openDatabase(indexedDB=globalThis.indexedDB) {
  return new Promise((resolve,reject)=>{
    if(!indexedDB){reject(Error('浏览器不支持 IndexedDB'));return;}
    const request=indexedDB.open('beat-workbench',1);
    request.onupgradeneeded=()=>{for(const name of ['workspaces','settings'])if(!request.result.objectStoreNames.contains(name))request.result.createObjectStore(name);};
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(Error('请关闭其他工作台标签后重试'));
    request.onsuccess=()=>resolve(request.result);
  });
}
export async function databaseTransaction(store,mode,action,indexedDB=globalThis.indexedDB) {
  const db=await openDatabase(indexedDB);
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,mode),objectStore=tx.objectStore(store);let result;
    tx.oncomplete=()=>{db.close();resolve(result);};
    tx.onerror=tx.onabort=()=>{db.close();reject(tx.error||Error('浏览器写入失败'));};
    try{action(objectStore,value=>{result=value;});}catch(e){tx.abort();db.close();reject(e);}
  });
}
export function readSourceSettings() {return databaseTransaction('settings','readonly',(s,set)=>{const r=s.get('source');r.onsuccess=()=>set(r.result||{mode:'browser'});});}
export function writeSourceSettings(value) {return databaseTransaction('settings','readwrite',s=>s.put(value,'source'));}
