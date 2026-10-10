import { validateWorkspace, storageError } from '../model/workspace.js';
export function detectDirectorySupport() {return !!(globalThis.isSecureContext && globalThis.showDirectoryPicker && globalThis.indexedDB && globalThis.navigator?.locks && location.protocol!=='file:');}
export function pickDirectory() {return globalThis.showDirectoryPicker({mode:'readwrite',id:'beat-workbench'});}
export function queryAccess(handle) {return handle.queryPermission({mode:'readwrite'});}
export async function requestAccess(handle) {return (await handle.requestPermission({mode:'readwrite'}))==='granted';}
async function read(handle,name) {
  try {return await (await (await handle.getFileHandle(name)).getFile()).text();}
  catch(e) {if(e.name==='NotFoundError')return null;throw e;}
}
function decode(raw) {
  try {return validateWorkspace(JSON.parse(raw));} catch(e){throw e.code?e:storageError('invalid','工作台文件为空白或损坏，未作任何覆盖');}
}
async function write(handle,name,text) {
  const stream=await (await handle.getFileHandle(name,{create:true})).createWritable();
  try {await stream.write(text);await stream.close();}catch(e){try{await stream.abort();}catch{}throw e;}
}
export async function readPreviousSnapshot(handle) {
  const raw=await read(handle,'beat-workbench.previous.json');
  if(raw===null)throw storageError('missing','没有上一份快照');return decode(raw);
}
export function createDirectoryRepository(handle) {
  let fingerprint=null, tail=Promise.resolve();
  async function load(){const raw=await read(handle,'beat-workbench.workspace.json');const w=raw===null?null:decode(raw);fingerprint=raw;return w;}
  function save(candidate,expectedRevision){
    const operation=tail.then(async()=>{
      validateWorkspace(candidate);
      const raw=await read(handle,'beat-workbench.workspace.json');
      const prior=raw===null?null:decode(raw);
      if((prior?.revision??null)!==expectedRevision || raw!==fingerprint)throw storageError('conflict','文件已在其他位置修改，已停止自动保存');
      if(raw!==null)await write(handle,'beat-workbench.previous.json',raw);
      const serialized=JSON.stringify(candidate);
      await write(handle,'beat-workbench.workspace.json',serialized);
      const verified=await read(handle,'beat-workbench.workspace.json');
      if(verified!==serialized)throw storageError('io','文件重新读取验证失败');
      decode(verified); fingerprint=verified;
      return {workspaceId:candidate.workspaceId,revision:candidate.revision,savedAt:candidate.updatedAt};
    });
    tail=operation.catch(()=>{});return operation;
  }
  async function restorePrevious(confirmation){
    if(!confirmation)return;await tail;
    const candidate=await readPreviousSnapshot(handle),raw=await read(handle,'beat-workbench.workspace.json');
    if(raw!==null){
      const existingDamage=await read(handle,'beat-workbench.damaged.json');
      if(existingDamage===null){
        const originalFile=await (await handle.getFileHandle('beat-workbench.workspace.json')).getFile();
        const originalBytes=originalFile.arrayBuffer?new Uint8Array(await originalFile.arrayBuffer()):raw;
        await write(handle,'beat-workbench.damaged.json',originalBytes);
      }
    }
    candidate.revision++;candidate.updatedAt=new Date().toISOString();const serialized=JSON.stringify(candidate);
    await write(handle,'beat-workbench.workspace.json',serialized);
    if(await read(handle,'beat-workbench.workspace.json')!==serialized)throw storageError('io','恢复重新读取验证失败');
    fingerprint=serialized;return candidate;
  }
  return {load,save,restorePrevious,flush:()=>tail,handle};
}
