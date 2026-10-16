import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as flows from '../src/timers/sessions.js';
import * as time from '../src/model/time.js';
import {newWorkspace} from '../src/model/workspace.js';
import {createBrowserRepository} from '../src/storage/browser.js';
import {createWorkspaceController} from '../src/storage/controller.js';
const source=readFileSync('src/app.js','utf8');
const names=['startSelectedFlow','updateFlowStartControls','updateFlowControls','formatMeetingElapsed','clearFlowTimer','completePersistedFlow','flowTaskTitle','sessionSnapshot','dateKey','timeString','formatFlowTimestamp','freezeFlowBackground','createFlowRecoveryDialog','previewAbnormalFlow','renderFlowRecovery','confirmAbnormalFlow','checkpointSessions','completeFlowOnPageExit','resumeFlowPage'];
const code=names.map(n=>source.match(new RegExp('    (?:async )?function '+n+'\\([\\s\\S]*?\\n    }'))[0]).join('\n');
async function harness(){
  let now=new Date('2026-12-31T23:30:00').getTime();class Clock extends Date{constructor(v){super(v===undefined?now:v);}static now(){return now;}}
  const w=newWorkspace(),map=new Map([['beat-workbench-current-v1',JSON.stringify(w)]]),local={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)},repo=createBrowserRepository(null,local),controller=createWorkspaceController({browserRepo:repo,settings:{read:async()=>({mode:'browser'})},directoryFactory:()=>{}});await controller.initialize();
  const fields=new Map(),elements=new Map(['main','body > header','.main-nav'].map(k=>[k,{inert:false}]));
  const get=id=>{if(!fields.has(id))fields.set(id,{value:id==='flow-project'?'A':id==='flow-category'?'项目推进':'',textContent:'',disabled:false,hidden:false,focus(){if(!this.disabled)this.focused=true;},reset(){}});return fields.get(id);};
  const document={querySelector:k=>elements.get(k),body:{append(){}},createElement:()=>({dataset:{},open:false,listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},showModal(){this.open=true;},close(){this.open=false;this.listeners.close?.();}})};
  const c=vm.createContext({...flows,...time,Date:Clock,structuredClone,queueMicrotask,document,get,flowStartedAt:null,flowStartIntent:null,flowStartBusy:false,flowFinishIntent:null,flowFinishBusy:false,flowRecoveryBusy:false,flowPageEpoch:0,checkpointBusy:false,flowDraftTasks:[],meetingDraftTasks:[],meetingStartedAt:null,meetingDraft:null,taskTracking:null,flowTimer:null,sessionIds:{},sessionRuns:{},activeProfileId:w.activeProfileId,window:{setInterval:()=>1,clearInterval(){}},renderDraftTasks(){},switchFeaturePanel(){},toast(){},taskSummary:()=>'',workbench:{controller,temporary:false,isDirectory:()=>false,isPending:()=>!!controller.getPending(),exportCurrentSnapshot:()=>{c.exports++;},requestSourceAccess:async()=>{},sync:()=>{c.renderFlowRecovery();}},exports:0});
  vm.runInContext(code,c);c.flowRecoveryDialog=c.createFlowRecoveryDialog();return {c,get,repo,controller,elements,w,start:now,setNow:v=>now=v};
}
const inputTime=ms=>{const d=new Date(ms);return new Date(ms-d.getTimezoneOffset()*60000).toISOString().slice(0,23);};
test('actual start UI activates only after acknowledgment; failed start preserves retry identity/project',async()=>{
  const {c,get,repo,controller,start}=await harness(),save=repo.save;repo.save=async()=>{throw Error('write failed');};await c.startSelectedFlow();const id=c.flowStartIntent.id;assert.equal(c.flowStartedAt,null);assert.equal(get('flow-project').value,'A');assert.match(get('flow-save-state').textContent,/尚未启动/);
  repo.save=save;await c.startSelectedFlow();assert.equal(c.flowStartedAt.getTime(),start);assert.equal(controller.getWorkspace().sessions.length,1);assert.equal(controller.getWorkspace().sessions[0].id,id);assert.equal(get('flow-project').disabled,true);
});
test('actual forced recovery UI rejects empty/zero/future, cannot cancel/export-skip, retains failed input, unlocks only on saved retry',async()=>{
  const {c,get,repo,controller,elements,w,start,setNow}=await harness(),intent=flows.createFlowStartIntent(w.workspaceId,w.activeProfileId,'A',start);await flows.startDurableFlow(controller,intent);setNow(start+26*3600000);c.renderFlowRecovery();assert.equal(c.flowRecoveryDialog.open,true);assert.equal(get('flow-recovery-end').value,'');assert.equal(elements.get('main').inert,true);
  let canceled=false;c.flowRecoveryDialog.listeners.cancel({preventDefault(){canceled=true;}});assert.equal(canceled,true);get('flow-recovery-export').onclick();assert.equal(c.exports,1);assert.equal(c.flowRecoveryDialog.open,true);
  for(const value of ['',inputTime(start),inputTime(start+27*3600000)]){get('flow-recovery-end').value=value;await c.confirmAbnormalFlow();assert.equal(c.flowRecoveryDialog.open,true);assert.equal(controller.getWorkspace().profiles[0].records.length,0);assert.match(get('flow-recovery-error').textContent,/结束时间|实际结束/);assert.equal(get('flow-confirm-save').textContent,'确认结束并保存记录');}
  const end=inputTime(start+25*3600000);get('flow-recovery-end').value=end;c.previewAbnormalFlow();assert.match(get('flow-recovery-preview').textContent,/25小时/);const save=repo.save;repo.save=async()=>{throw Error('write failed');};await c.confirmAbnormalFlow();assert.equal(c.flowRecoveryDialog.open,true);assert.equal(get('flow-recovery-end').value,end);assert.match(get('flow-recovery-error').textContent,/重试或导出/);
  repo.save=save;await c.confirmAbnormalFlow();assert.equal(c.flowRecoveryDialog.open,false);assert.equal(elements.get('main').inert,false);assert.equal(controller.getWorkspace().profiles[0].records.length,1);assert.equal(controller.getWorkspace().profiles[0].records[0].hours,25);await c.confirmAbnormalFlow();assert.equal(controller.getWorkspace().profiles[0].records.length,1);
});
for(const duration of [4000,25*3600000,49*3600000])test('actual normal completion '+duration+'ms remains segmented and waits for acknowledged persistence',async()=>{
  const {c,controller,start,setNow}=await harness();await c.startSelectedFlow();setNow(start+duration);assert.equal(await c.completePersistedFlow(),'saved');assert.equal(c.flowStartedAt,null);assert.equal(controller.getWorkspace().profiles[0].records[0].hours,duration/3600000);assert.equal(controller.getWorkspace().profiles[0].records[0].flowSettlement,'segments');
});

test('actual start UI remains unstarted while writer is held, then activates original captured time',async()=>{
  const {c,repo,start}=await harness(),save=repo.save;let release;const wait=new Promise(r=>release=r);repo.save=async(...args)=>{await wait;return save(...args);};const attempt=c.startSelectedFlow();await new Promise(r=>setTimeout(r,1));assert.equal(c.flowStartedAt,null);assert.equal(c.flowStartBusy,true);release();await attempt;assert.equal(c.flowStartedAt.getTime(),start);
});

test('multiple abnormal flows keep background locked, reset next-button text/focus and retain original owners',async()=>{
  const {c,get,controller,w,start,setNow}=await harness();await controller.commit(value=>{value.profiles.push({id:'other',name:'第二合成用户',avatar:null,records:[],tasks:[]});return value;});
  const first=flows.createFlowStartIntent(w.workspaceId,w.activeProfileId,'A',start),second=flows.createFlowStartIntent(w.workspaceId,'other','B',start+3600000);await flows.startDurableFlow(controller,first);await flows.startDurableFlow(controller,second);setNow(start+26*3600000);c.renderFlowRecovery();get('flow-recovery-end').value=inputTime(start+25*3600000);get('flow-recovery-end').focused=false;await c.confirmAbnormalFlow();
  assert.equal(c.flowRecoveryDialog.open,true);assert.equal(c.flowRecoveryDialog.dataset.sessionId,second.id);assert.equal(get('flow-recovery-end').value,'');assert.equal(get('flow-recovery-end').focused,true);assert.equal(get('flow-confirm-save').textContent,'确认结束并保存记录');
  get('flow-recovery-end').value=inputTime(start+25*3600000);await c.confirmAbnormalFlow();assert.equal(c.flowRecoveryDialog.open,false);assert.deepEqual(controller.getWorkspace().profiles.map(p=>p.records.length),[1,1]);assert.deepEqual(controller.getWorkspace().profiles.map(p=>p.records[0].project),['A','B']);
});
test('browser checkpoint preserves start policy and shows failures on visible flow page',async()=>{
  const {c,get,repo,controller,start,setNow}=await harness();await c.startSelectedFlow();setNow(start+20000);await c.checkpointSessions();const session=controller.getWorkspace().sessions[0];assert.equal(session.draft.recoveryPolicy,'confirm-end');assert.equal(session.draft.startedAt,start);assert.match(get('flow-save-state').textContent,/最近成功检查点/);
  repo.save=async()=>{throw Error('checkpoint failure');};setNow(start+40000);await c.checkpointSessions();assert.match(get('flow-save-state').textContent,/心流检查点未保存/);assert.match(get('flow-save-state').textContent,/最近成功检查点/);assert.ok(controller.getPending());
});

test('native Escape and unexpected close cannot leave an inert page without the mandatory dialog',async()=>{
  const {c,controller,w,start,setNow}=await harness();await flows.startDurableFlow(controller,flows.createFlowStartIntent(w.workspaceId,w.activeProfileId,'A',start));setNow(start+3600000);c.renderFlowRecovery();
  assert.equal(typeof c.flowRecoveryDialog.listeners.keydown,'function');let prevented=false;c.flowRecoveryDialog.listeners.keydown({key:'Escape',preventDefault(){prevented=true;},stopImmediatePropagation(){}});assert.equal(prevented,true);
  assert.equal(typeof c.flowRecoveryDialog.listeners.close,'function');c.flowRecoveryDialog.close();await new Promise(r=>queueMicrotask(r));assert.equal(c.flowRecoveryDialog.open,true);
});

test('normal UI finish keeps timer context on uncertain receipt and retries one record',async()=>{
  const {c,get,controller,repo,start,setNow}=await harness();await c.startSelectedFlow();const save=repo.save;let fail=true;repo.save=async(...args)=>{const receipt=await save(...args);if(fail){fail=false;throw Error('receipt lost');}return receipt;};setNow(start+10000);assert.equal(await c.completePersistedFlow(),'save-failed');assert.ok(c.flowStartedAt);assert.ok(c.flowFinishIntent);assert.match(get('flow-save-state').textContent,/尚未保存/);assert.equal(await c.completePersistedFlow(),'saved');assert.equal(c.flowStartedAt,null);assert.equal(controller.getWorkspace().profiles[0].records.length,1);
});

test('pagehide and BFCache-style return cannot silently resume an interrupted durable flow',async()=>{
  const {c,controller,start,setNow}=await harness();await c.startSelectedFlow();setNow(start+3600000);c.completeFlowOnPageExit({type:'pagehide',persisted:true});assert.equal(c.flowStartedAt,null);assert.equal(controller.getWorkspace().sessions.length,1);c.resumeFlowPage({persisted:true});assert.equal(c.flowRecoveryDialog.open,true);
});
