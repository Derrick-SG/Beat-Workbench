import test from 'node:test';
import assert from 'node:assert/strict';
import {newWorkspace} from '../src/model/workspace.js';
function repo(initial){let w=initial;return {load:async()=>structuredClone(w),save:async v=>{w=structuredClone(v);return{revision:v.revision,savedAt:v.updatedAt};},flush:async()=>{}};}
test('controller commits serially, keeps official values on failure and switches only after confirmation',async()=>{
  const {createWorkspaceController}=await import('../src/storage/controller.js');
  const w=newWorkspace(),browser=repo(w),directory=repo(null);let setting={mode:'browser'};
  const c=createWorkspaceController({browserRepo:browser,settings:{read:async()=>setting,write:async s=>{setting=s;}},directoryFactory:()=>directory});
  await c.initialize();
  await Promise.all([c.commit(v=>{v.profiles[0].name='第一';return v;}),c.commit(v=>{v.profiles[0].name+='二';return v;})]);
  assert.equal(c.getWorkspace().profiles[0].name,'第一二');
  directory.save=async()=>{throw Error('disk failed');};
  const preview=await c.previewDirectory({name:'folder'});
  await c.activateDirectory(preview,false);assert.equal(c.getState().mode,'browser');
  await assert.rejects(c.activateDirectory(preview,true));assert.equal(c.getState().mode,'browser');
  assert.equal(c.getWorkspace().profiles[0].name,'第一二');
});
test('unreadable selected directory prevents default writes and allows explicit original-browser fallback',async()=>{
  const {createWorkspaceController}=await import('../src/storage/controller.js');
  const w=newWorkspace(),browser=repo(w);let writes=0;
  const c=createWorkspaceController({browserRepo:browser,settings:{read:async()=>({mode:'directory',handle:{name:'locked'}}),write:async()=>{writes++;}},directoryFactory:()=>({load:async()=>{throw Error('permission denied');}})});
  await c.initialize();assert.equal(c.getState().phase,'reconnect');assert.equal(c.getWorkspace(),null);assert.equal(writes,0);
  await c.useOriginalBrowserData(true);assert.equal(c.getWorkspace().workspaceId,w.workspaceId);assert.equal(c.getState().mode,'browser');
});
test('directory confirmation re-reads and refuses a changed preview',async()=>{
  const {createWorkspaceController}=await import('../src/storage/controller.js');
  const browser=repo(newWorkspace()),directory=repo(newWorkspace());
  const c=createWorkspaceController({browserRepo:browser,settings:{read:async()=>({mode:'browser'}),write:async()=>{}},directoryFactory:()=>directory});await c.initialize();
  const preview=await c.previewDirectory({name:'folder'}),changed=await directory.load();changed.profiles[0].name='changed';await directory.save(changed);
  await assert.rejects(c.activateDirectory(preview,true),{code:'conflict'});assert.equal(c.getState().mode,'browser');
});

test('migration preserves the complete workspace and refuses occupied destinations without switching',async()=>{
  const {createWorkspaceController}=await import('../src/storage/controller.js');
  const w=newWorkspace();w.profiles[0].avatar={mime:'image/png',dataUrl:'data:image/png;base64,iVBORw0KGgo='};w.profiles[0].records=[{id:1,workDate:'2026-10-10',title:'合成记录',project:'A',hours:1,startTime:'09:00',endTime:'10:00'}];w.profiles.push({id:'second-user',name:'第二合成用户',avatar:null,records:[],tasks:[]});w.settledSessionIds=['settled-synthetic'];w.profiles[0].tasks=[{id:'task',text:'合成任务',project:'A',completed:false}];
  const browser=repo(w),directory=repo(null);let setting={mode:'browser'},writes=0;
  const save=directory.save;directory.save=async v=>{writes++;return save(v);};
  const c=createWorkspaceController({browserRepo:browser,settings:{read:async()=>setting,write:async v=>{setting=v;}},directoryFactory:()=>directory});await c.initialize();
  let preview=await c.previewDirectory({name:'empty'});
  await c.migrateDirectory(preview,false);assert.equal(writes,0);
  await c.migrateDirectory(preview,true);assert.deepEqual(await directory.load(),w);assert.deepEqual(await browser.load(),w);assert.deepEqual(c.getWorkspace(),w);
  const occupied=newWorkspace();await save(occupied);preview=await c.previewDirectory({name:'occupied'});
  await assert.rejects(c.migrateDirectory(preview,true),{code:'occupied'});assert.deepEqual(await directory.load(),occupied);assert.deepEqual(c.getWorkspace(),w);assert.equal(writes,1);
});

test('migration readback failure keeps original source and does not save source settings',async()=>{
  const {createWorkspaceController}=await import('../src/storage/controller.js');
  const w=newWorkspace();let saved=false,settingsWrites=0;
  const directory={load:async()=>saved?newWorkspace():null,save:async()=>{saved=true;return{};}};
  const c=createWorkspaceController({browserRepo:repo(w),settings:{read:async()=>({mode:'browser'}),write:async()=>settingsWrites++},directoryFactory:()=>directory});await c.initialize();
  await assert.rejects(c.migrateDirectory(await c.previewDirectory({name:'bad-readback'}),true),/重新读取/);
  assert.equal(c.getState().mode,'browser');assert.deepEqual(c.getWorkspace(),w);assert.equal(settingsWrites,0);
});

test('migration settings failure leaves source identity intact and never changes old repository',async()=>{
  const {createWorkspaceController}=await import('../src/storage/controller.js');
  const w=newWorkspace(),browser=repo(w),directory=repo(null);let calls=0;
  const c=createWorkspaceController({browserRepo:browser,settings:{read:async()=>({mode:'browser'}),write:async()=>{calls++;throw Error('settings failed');}},directoryFactory:()=>directory});await c.initialize();
  await assert.rejects(c.migrateDirectory(await c.previewDirectory({name:'settings-fail'}),true),/目标可能已生成副本/);
  assert.equal(calls,1);assert.equal(c.getSource().mode,'browser');assert.equal(c.getState().mode,'browser');assert.deepEqual(c.getWorkspace(),w);assert.deepEqual(await browser.load(),w);assert.deepEqual(await directory.load(),w);
});
