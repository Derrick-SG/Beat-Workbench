# 2026-10-19 Developer：目录文件状态错误调查与安全读取恢复

基线HEAD43ffee2，版本V1.1.0，不升号、不加候选标签；本地修复未提交/未上传，待Reviewer独立验收。PM维护memory/PRD/AGENTS，本阶段不覆盖。没有读取或操作真实4173、个人数据目录/文件，没有重启日常服务。

## 确定证据与边界

用户截图约02:24:20显示原生文件缓存状态变化英文错误；只能证明一次检查点操作失败，无法确定getFile、text、备份写、主写或close中的哪一步，不能证明外部同步软件、文件破坏或长期缓存句柄为唯一原因。

检查43ffee2：read每次均重新getFileHandle→getFile→text，并未跨检查点缓存File。任何阶段原生错误直接上抛，没有阶段上下文，单次瞬时快照失效也直接使整次checkpoint失败。测试以相同InvalidStateError英文分别注入getFile/text/createWritable/write/close，旧代码均无阶段标记；读取瞬时失效可复现0写失败，pending仍保留；解除后controller.retry可恢复。外部内容确实变化时，原revision/raw校验仍拒绝，未绕过。

官方参考：[Chromium FileError定义](https://chromium.googlesource.com/chromium/src/+/5aa817a82b1c5b96bef7f77c3b8a5e4957151b76/third_party/blink/renderer/core/fileapi/file_error.cc)将该文案归于InvalidStateError；[File System标准](https://fs.spec.whatwg.org/#api-filesystemfilehandle-getfile)定义getFile的文件快照语义，并说明宿主文件外部变化如何反映取决于实现。这里的故障实验为接口注入，不冒称真实浏览器现场同因复现。

## 最小修改

- 唯一产品源码修改src/storage/directory.js：读取遇到InvalidStateError或NotReadableError只重取一次句柄和File，再读内容，最多两次。权限错误不重试；第二次仍失败或读取过程中目标消失则明确报错，不用空工作区替代，不进行写入恢复。
- 写createWritable/write/close均不自动重放；已创建stream失败时仍尽力abort，原失败保留cause。错误加入固定工作台文件名、操作环节和具体API阶段（directoryOperation/directoryStage/directoryFile），显示可理解的中文建议和原异常name，不添加个人目录路径或数据内容。未来复发可辨load/preflight/backup/recheck/primary/verify及getFile/text/createWritable/write/close；本次截图无法补推其实际阶段。
- 保存原revision/raw/fingerprint校验保留。备份完成后再读取主文件并与本次保存前raw逐字节核对，变化立即conflict且不创建主写入器。写后验证允许只读快照刷新，不重放写入。无法对浏览器外部程序建立跨进程原子锁，未宣称任意外部并发都已解决。
- controller保存队列、15秒deadline、inFlight写入隔离及回读重试逻辑不改。原流起点、稍后选项目、完成按钮位置、最后成功检查点自动结束和不计关闭间隔不变；pending未保存检查点不得推进自动结算终点。

## 验证

新增tests/directory-stale.test.mjs 12项，先观察旧代码失败再修改；最终12/12及完整96/96通过（保留此前84项基线）。JavaScript语法、构建及相关diff-check通过。

覆盖单次getFile/text失效重取、持续失败两次上限、权限不重试、备份准备/写/关闭阶段可诊断且不重放、fresh read发现外部内容变化阻止0写、备份期间主文件变化阻止主写入、关闭实际提交后异常由controller回读确认不重复主写、写后验证只读刷新、合成2小时已保存检查点与2.5小时pending分离。新控制器重开只结算落盘2小时；原pending重试看到新外部结算结果仍conflict不覆盖。旧超时、迟到读/写隔离、有界队列回归继续通过。

故障及长时均为合成FileSystem接口/历史时间参数；真实临时磁盘由既有基线覆盖，新原生浏览器磁盘快照失效、外部同步软件触发、实际连续2小时运行与全平台未新增实测，不能外推用户历史记录完整性或现场唯一原因。

## 分享包

dist/20261019_Beat-Workbench_V1.1.0.zip仅HTML和说明，保持V1.1.0无候选标记，旧日期包不变。当前包内HTML等于dist构建；README和CHANGELOG新增本地修复及实际证据边界，旧阶段hash为历史。

HTML SHA256：825BE519A59993D2E19B5A65A86465B7A31206EFD7F66148F5B6630865BA25BE

ZIP SHA256：C813504C7FB89A3152DCD52C8158CC719AE714E90EEBCD740C05B0EDF423F76B

待Reviewer独立故障/冲突/最终包核验。固定入口：http://127.0.0.1:4173/#work-entry 。
