import {uid} from '../model/workspace.js';
export function createSessionManager({controller,clock=()=>performance.now(),setInterval=globalThis.setInterval,clearInterval=globalThis.clearInterval,onError=()=>{}}){
  const running=new Map();let timer=null;
  const elapsed=s=>s.elapsedMs+(running.has(s.id)?Math.max(0,clock()-running.get(s.id)):0);
  async function start(kind,profileId,draft){
    const w=controller.getWorkspace(),id=uid();
    await controller.commit(v=>{v.sessions.push({id,workspaceId:w.workspaceId,profileId,kind,elapsedMs:0,checkpointAt:new Date().toISOString(),status:'running',draft:structuredClone(draft)});return v;});
    running.set(id,clock());ensureTimer();return id;
  }
  function ensureTimer(){if(!timer)timer=setInterval(()=>checkpoint().catch(onError),15000);}
  async function checkpoint(drafts={}){
    const captures=new Map([...running].map(([id,start])=>[id,Math.max(0,clock()-start)]));
    if(!captures.size)return;
    await controller.commit(w=>{for(const s of w.sessions)if(captures.has(s.id)){s.elapsedMs+=captures.get(s.id);s.checkpointAt=new Date().toISOString();if(drafts[s.kind])s.draft=structuredClone(drafts[s.kind]);}return w;});
    for(const [id,amount] of captures)if(running.has(id))running.set(id,running.get(id)+amount);
  }
  async function restore(id){
    const s=controller.getWorkspace().sessions.find(s=>s.id===id);if(!s)throw Error('计时会话不存在');
    running.set(id,clock());ensureTimer();return structuredClone(s);
  }
  async function discard(id){await controller.commit(w=>{w.sessions=w.sessions.filter(s=>s.id!==id);return w;});running.delete(id);stopIfEmpty();}
  async function complete(id,makeRecord){
    let w=controller.getWorkspace();if(w.settledSessionIds.includes(id))return;
    const s=w.sessions.find(s=>s.id===id);if(!s)throw Error('计时会话不存在');
    const record=makeRecord({sessionId:id,profileId:s.profileId,elapsedMs:elapsed(s),draft:structuredClone(s.draft)});
    await controller.commit(v=>{if(v.settledSessionIds.includes(id))return v;v.profiles.find(p=>p.id===s.profileId).records.push({...record,sessionId:id});v.settledSessionIds.push(id);v.sessions=v.sessions.filter(s=>s.id!==id);return v;});
    running.delete(id);stopIfEmpty();
  }
  function stopIfEmpty(){if(!running.size&&timer){clearInterval(timer);timer=null;}}
  async function pause(){await checkpoint();running.clear();stopIfEmpty();}
  return {start,checkpoint,restore,discard,complete,pause,hasActiveSession:()=>running.size>0};
}
