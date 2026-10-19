# 2026-10-19 Developer：心流按持久化检查点自动结算

本地 V1.1.0 候选，未提交、未上传、未升号；稳定交付仍 V1.0.0。本阶段覆盖此前人工结束全跨度确认规则。PM维护PRD与memory；新语义待Reviewer独立验收，旧快照的专项通过结论不自动适用。

## 调查证据

使用systematic-debugging核对旧生产恢复层与结算模型，重跑旧相关15项通过，未复现有效项目与时间的普遍保存失败。独立合成旧会话draft.project为单个空格：恢复层以!!project隐藏项目输入，settleDurableFlow却trim后拒绝，输出“请补选有效所属项目，已计时间仍保留”，commit次数0。该分支可阻塞补填及保存，不声称用户现场唯一原因已确定；未读取个人记录。新流程不依赖该人工输入链。

## 最终实现

- src/timers/sessions.js：新增checkpointFlowPlan与settleCheckpointFlow。只用controller正式工作区中成功落盘的checkpointAt与draft.segments，不把start→checkpoint跨度替代已有实际分段。旧无分段会话仅在elapsedMs可由起点与检查点界限验证时使用该时长；无法验证时保留会话并报错。新会话policy为checkpoint-end，旧confirm-end会话也自动处理。
- 关闭后间隔不计入；自动记录flowSettlement=checkpoint。空项目使用“未分类”，标记flowProjectUnassigned=true，成果文字明确为系统占位、可后编辑；不猜测真实项目。正常完成仍要求补选有效项目，使用现有实际分段。
- 只有起点而无正时长时：不生成0小时或一分钟记录；原子写入工作台级flowClosures凭据（sessionId、profileId、startedAt、checkpointAt、elapsedMs=0、reason），移除活动会话并写settledSessionIds。同ID重复执行返回已关闭，不阻止下一次心流。凭据保存在整工作台持久数据及全工作台导出内，每用户记录备份不包含工作台级凭据。src/model/workspace.js验证新增可选字段，不变更schemaVersion。
- pending未成功检查点不自动重试/不作为终点。仅自动结算自身已生成的settled candidate可走现有retry回读核对，防回执丢失重复记账。原用户归属不随当前用户变化，多开页仍使用现有仓库快照/版本冲突检查，不覆盖竞争结果。
- src/app.js：移除人工恢复dialog、实际结束输入及inert背景锁；启动、来源刷新及BFCache返回自动调度。排除live sessionIds和正在持久化的启动intent；不结束当前页运行会话。关闭事件不依赖异步落盘。成功提示条数；零时长提示凭据保留且未生成工时；失败保留会话，以页面持续非弹窗提示提供重试、保存状态/授权和全工作台导出。
- src/bootstrap.js：pending/写入中点击保护允许新自动恢复入口，不放开业务编辑。src/index.html更新恢复说明。顶部立即起点、运行中改项目、快速会议右侧唯一完成按钮及此前资料/迁移/UI精简保留。

## 验证

最终完整node --test --test-isolation=none tests/*.test.mjs：84/84通过，0失败/跳过/取消；构建与JavaScript语法通过。新增flow-auto-recovery六项模型回归，旧强制人工确认UI测试按新规则替换。生产UI函数配DOM替身验证自动保存/不弹层/live排除/BFCache/失败重试导出；临时真实目录文件配文件句柄适配验证重开自动结算15秒、不计关闭间隔，原归属保持。失败回执重试、未成功pending检查点不推进、多用户和竞争开页冲突、旧分段与旧elapsed边界、零时长凭据及幂等均覆盖。此前正常25/49小时、存储写入隔离与有界队列回归保留。

未操作真实4173数据、真实个人目录或头像，不重启日常服务；新语义原生UI、真实目录授权全生命周期、真实断电与长期连续运行仍待独立验证，不据此宣称个人历史缺失数据找回或整版稳定发布。

## 候选包

dist/20261019_Beat-Workbench_V1.1.0.zip，仅节拍工作台.html与使用说明.txt；同日新快照替代旧候选，旧日期包保留。当前HTML与ZIP内HTML一致。

HTML SHA256：810426F5A76D1F7773D66CAA81F507BA6BDCD585EA9B96877741685E0EE74561

ZIP SHA256：003D7F90F64C08077629A972B23A8916C7575A5CDD0DEB0777A22525A608783E

固定入口：http://127.0.0.1:4173/#work-entry 。
