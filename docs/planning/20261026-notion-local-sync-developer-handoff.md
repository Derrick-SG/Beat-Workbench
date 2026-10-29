# V1.1.2 Notion本机同步 Developer交接 / 2026-10-26

实现已冻结供独立Reviewer/Designer核验，尚未真实Notion联通、未上传或提交Git、未操作4173/个人数据。

## 范围
- 当前用户完整已提交快照；与原APP共用跨日/重叠去重及跨项目分摊统计；稳定scope+类型来源键，系统未分类独立命名空间。
- 私有原子磁盘队列、互斥worker、持久创建意图、未知结果分页核对；历史首次与后续增量同引擎；删除仅来源移除状态，不删除/归档，独立备注不写。
- 固定Notion API 2025-09-03；父页内结构标记、关联字段、分页、长文本索引明细、未知append保护；POST成功而后续数据源读取失败保持未知；缺失page id/分页cursor不继续写入。
- 严格127.0.0.1 Host/Origin、随机进程请求token、JSON/大小限制；浏览器同步独立于本地保存，旧用户切换暂停，离线HTML明确不可用。
- scripts/configure-notion.cmd双击调用PS隐藏输入；自动选择已安装或既有bundled Node 22+。Node先删除handoff token环境再创建ACL子进程。令牌仅写LOCALAPPDATA/Beat-Workbench/notion；路径检查最近存在祖先realpath，拒绝同步盘和junction绕过；私有目录/已有普通文件重新约束当前用户SID及SYSTEM，目录DACL读回核验。拒绝非普通文件，权限失败不写token。

## 验证
2026-10-26最终 node --test --test-isolation=none tests/*.test.mjs：129/129通过，0失败。配置PS parser通过，git diff --check通过，node scripts/build.mjs通过。只使用假token、临时磁盘、模拟HTTP和DOM替身。
新增验证包括Windows预置Everyone显式ACL清除、云盘/junction拒绝、实际磁盘队列关闭重开未知成功POST去重、真实adapter请求体schema/关联/Notes保留、未知数据源回执、缺失ID/分页fail-closed、跨日25h与__proto__项目、用户切换和离线HTML、挂起同步不阻塞本地成功commit。
旧data VM harness补注入新共享timeStatsFor依赖，未更改原统计断言。本地指数退避含jitter最多5分钟；服务端Retry-After下限独立持久化，不截短，显式重试/其他行/切scope也不能绕过整个worker的等待。

## 交付
package/source/footer/standalone均1.1.2。分享ZIP严格仅节拍工作台.html及使用说明.txt，HTML与dist一致。
HTML SHA256 7ECDDDF88E9D3EEEDECB013CF71583366AB9D7B044F1768ADB61F2143C86C8CB
ZIP SHA256 E3DE73595194EC86288349B75D51C22425DC6699824D809EF2D73296BAAD9CE5
保留V1.1.1 ZIP 966D090DA3BF5DC26CF8408627EE7B7B0F19EF12FA901EAC3E67E58D04E7F828
保留V1.1.0 ZIP 22467BD1D74688C308B886EF6A36073A647A36C24EF2FF3CA8D0051B7D937054

## 真实使用前
用户独立内部连接/父页授权后，双击安全配置入口（不向聊天发token）。新路由需用户重启原本机服务。在UI核对目标/当前用户/数量，一次首次同步按钮才写外部；真实验证先合成资料。独立Reviewer/Designer仍需验收；模拟通过不宣称真实API通过。未保证多台并发唯一性、真实断电、全平台或原生长期运行。
PM负责PRD/memory和发布，不覆盖其文档。独立反馈若修改源码/样式，必须重建ZIP并更新上述哈希。

## 独立评审修正后的冻结（取代前次119项冻结）

仅后台命令行和源码操作，遵守用户暂停电脑/浏览器UI要求。完整129/129通过，build和diff --check通过；ZIP两项白名单与HTML逐字节SHA256一致，历史111/110哈希未变。

Designer真实缺口：成功预览绑定完整snapshot指纹（scope/revision/全部内容）与parentPageId，当前预览前禁用首次导入；点击重新读取目标状态，范围/目标变化仅重新展示且要求看后再点击。请求代次防乱序响应覆盖；双击busy门闩。错误独立alert，统计仍显示。真实三表n/3及当前实体已完成/待同步/失败数量，部分结构继续初始化，unknown只核对。6项新桥接race/呈现回归通过（4项原缺口先红后绿）。

Reviewer真实缺口：旧dead-PID锁回收存在unlink新锁竞态；现用独占recovery.lock覆盖重新验证、删除旧worker锁、独占新worker锁，不自动回收recovery.lock本身，未知恢复fail-closed保留队列。临时6并发进程最多一worker、现有恢复互斥不删旧worker锁回归通过，后者先红后绿。恢复锁残留需人工确认所有服务进程已停止后处置，不将删除锁作为普通自动重试。

429秒值及HTTP-date正确解析；600秒前tick和显式retry不派发，到期才恢复。持久notBefore针对整个worker，不能换行或换用户绕过。HTTP-date、600秒下限及跨行限流回归先红后绿。原5分钟包含Retry-After裁剪规则已纠正，服务端下限优先。

未进行真实Notion/用户token/4173/电脑UI操作；未Git提交或上传。独立Reviewer仍需复核本次变更。
