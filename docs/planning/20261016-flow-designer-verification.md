# 心流异常结算：在途设计预检查

2026-10-16，Designer。已读最新INDEX及其memory，核对当前文件；仅静态预检查，未冻结、未浏览器实测，未碰4173或真实资料。未修改产品。

## 静态符合

- app.js startSelectedFlow等待startDurableFlow成功后才赋值flowStartedAt并启动显示；未保存显示尚未启动与重试开始。
- createFlowRecoveryDialog为独立模态，阻止cancel/Escape，无关闭/放弃/稍后；renderFlowRecovery对背景设inert并逐个选择异常flow。
- 异常层结束输入datetime-local step=0.001，与开始时间显示毫秒一致；全跨度包含关闭期间说明明确，预览到秒。正常完成completePersistedFlow仍提交segments，meeting/task恢复未改为强制flow。
- 失败保留输入，显示重试保存、导出待保存数据；导出后明确仍须结算。目录模式才显示重新连接。成功await结算后才重新渲染/解锁。
- CSS给模态视口高度限制、滚动和按钮44px最小高度，文字可换行。

## 给Developer/PM的在途可用性问题

1. **下一条待确认flow的主按钮文案没有重置。** confirmAbnormalFlow提交时设“正在保存工作记录…”，成功后renderFlowRecovery换session时仅重置输入/错误/预览；finally启用按钮但不恢复文案。多会话时下一条可能显示已启用的“正在保存…”。每个新session应重置为“确认结束并保存记录”，成功结算后下一条焦点也应移到其输入。
2. **失败焦点在禁用字段上。** catch调用结束输入focus时该字段仍disabled，finally之后才恢复，聚焦可能无效。若仍可编辑，应恢复后再聚焦；若pending冻结时间则聚焦“重试保存”，并说明使用已提交结束时间重试，不能让禁用时间像无响应。
3. **校验错误混作落盘失败。** 空值/边界校验在try内，统一catch显示“记录尚未保存，请重试或导出”，并将按钮改为重试保存。建议区分提交前校验与持久化错误：前者直接就近说明结束时间问题、保持确认按钮；后者才显示重试/导出。
4. **长时间存储检查点失败仅写隐藏区。** checkpointSessions失败只更新数据管理里的storage-detail；心流专注页看不到。建议同步到可见flow-save-state，持续标明“最近修改尚未保存”及最后成功检查点，不用成功开始提示长期掩盖后续失败。

以上来自当前源码路径，不冒称实测缺陷。结束必须严格晚于开始（拒绝零时长）是当前实现额外细化，需PM/Reviewer核对与已确认边界一致；输入精度毫秒比用户实际记忆更细，但当前允许按秒填写即可，不应要求用户回忆毫秒。

冻结后待核对：真实打开异常层、Tab/焦点、Esc遮罩、秒级/跨日/长跨度、重试/导出不解锁、多会话连续确认、窄屏，以及正常完成说明不变。持久化、幂等、异常重开与长时有界队列由Reviewer独立验证；本报告不构成通过或发布结论。

## 最终静态快照复核（2026-10-16追加）

依据Developer冻结交接20261016-flow-developer-handoff.md及实际源码；最新memory索引/记录已复读。app.js SHA256：`BE84A80544A3DA9D05F0893358147FFFF1974F1DF1CF3C1C3C30FE36FB17C658`；styles.css：`F0FE0E21426AE24B59E4C5E047868B583394F02122879BB3130A3D164B60FEED`。64测试通过为Developer交接记录，本角色未重跑，不写成Designer独立测试结果。

此前四项设计意见的静态修复均已确认：

1. renderFlowRecovery换session重置按钮文字、enabled状态和结束输入，并移动焦点。
2. confirmAbnormalFlow finally在disabled状态确定之后移焦；pending锁定时间时聚焦重试按钮并解释按已提交时间核对重试。
3. 日期校验单独try/catch，错误保持确认按钮、就近说明与输入焦点，不再冒称落盘失败。
4. checkpointSessions成功及失败均写入可见flow-save-state，包含最近成功检查点或起始时间已保留的说明。

强制层增加捕获阶段cancel阻止、Escape keydown阻止，以及close事件在仍存在异常flow时排队重开。与背景inert控制及无关闭/放弃按钮配合，**源码防绕过边界符合设计意图**。最后一条成功后才关闭并解除inert；正常完成仍走segments，不改为异常全跨度。

结论：本次最终静态设计核对符合，四项预查意见在该快照静态关闭，未发现新增设计阻塞。Reviewer此前真实Escape导致死页的问题已见针对性代码修复，但**原生Escape复测尚待Reviewer工具审批，不能标记真实浏览器通过**；close兜底可能涉及瞬时焦点/重开呈现，仍须实测。无浏览器操作、未使用4198/4173、未创建记录、未改产品代码。完整窄屏、键盘、异常重开与落盘实测限制继续保留。当前仍候选，稳定交付和发布判断由PM结合Reviewer结果决定。
