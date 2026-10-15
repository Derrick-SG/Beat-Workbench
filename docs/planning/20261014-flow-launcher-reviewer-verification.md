# 2026-10-14 Reviewer：长心流与本地启动专项复验

范围：超过24小时心流结算及保存/导入/统计；固定4173启动器与当前用户登录自启。未修改产品代码、提交或上传，未读写4173个人数据。

## 结论

本轮修复的自动化与集成检查通过。完整独立执行 node --test --test-isolation=none tests/*.test.mjs：37/37通过，0失败/跳过/取消。git diff --check无输出。此结论不替代V1.1.0整版验收。

- 生产completeFlow在浏览器/目录两模式下24、25、49小时结算通过；显示分别为累计小时，不按24小时回绕。按本地日期分配为0.5/24/0.5小时等，周/月/年范围总量保持。实际时间由VM Clock推进，非真实页面运行49小时。
- 独立审阅并执行long-flow-persistence：提取生产completeFlow/save/persistData/flushLegacy/importBackup，组合真实controller与repository；浏览器使用localStorage接口Map替身，目录使用FileSystemHandle替身写临时真实磁盘文件。重新建立repository读取25小时记录通过；v4导入第二独立用户并再次回读，两用户各一条25小时记录，统计总量不截断。未执行原生权限选择器/浏览器IndexedDB端到端。
- 分段计时记录编辑保留实际hours/timeSegments，拒绝用单日日期时段替换；相关回归通过。日周月年证据属于生产统计输入/函数层，未驱动四个真实报表页面。
- launcher在隔离动态端口实际冷启动进程、探测就绪；复用相符服务不启动重复进程；不相关服务保持存活且拒绝启动，通过。测试自行清理其子进程，没有停止4173。
- PM安装后只读检查Startup快捷方式：目标Windows PowerShell；参数精确指向本项目start-workbench.ps1，含ServiceOnly与WindowStyle Hidden；工作目录正确处理空格。快捷方式WindowStyle属性为7，隐藏由PowerShell启动参数指定。实际登录触发未测，不注销用户。
- 4173 health返回ready及PID48024；项目身份与.local/server.json匹配，实际node路径和启动ticks匹配。13源码资源全部200且内容逐项匹配；netstat证实127.0.0.1:4173由同PID监听。Get-NetTCPConnection权限受限，使用netstat读取替代，没有升级权限。
- .local运行记录与日志被gitignore排除。未实际停用/重新启用注册项，幂等与撤销行为目前为静态审阅；退出后的冷启动有隔离Node启动器证据，不代表Windows重新登录实测。

## 仍保留的限制

真实长时页面运行、实际Windows注销登录触发、注册项启停幂等操作、原生目录迁移/授权以及三类计时恢复/完成重试/重开去重完整UI链路未在本轮完成。此前整版限制不因本轮37项通过而关闭。HTTP链接不能启动已经停止的本地服务；应使用启动器或已启用的登录启动。候选包/版本/上传记录由PM另行冻结和审核，本报告不授权发布。

## 2026-10-14 保存与重开调查最终冻结复验

本轮确定代码缺陷修复的自动/集成验收通过；用户原现场唯一根因、缺失记录是否已落盘尚未确认。独立重跑最终完整测试44/44通过，0失败/跳过/取消，git diff --check退出0。审阅最新20261014-storage-reopen-developer-handoff与实际代码，旧37项及旧包哈希由新冻结取代。

- 正常HTTP环境中来源设置读失败，实际bootstrap设置声明+controller进入workspace=null/reconnect；没有自动激活或写旧浏览器数据。浏览器能力不足/file的明确browser-only回退保留，设置写失败不能启用目录源。
- 实际flushLegacy与实际controller故障注入：显示show类、清除旧toastTimer及成功提示队列，正式资料/记录不提前生效，pending候选保留，恢复存储后retry成功。失败后新数据点击/编辑被阻止，恢复控件仍可达。未完成保存及心流离页新生成dirty数据触发退出保护。测试DOM及浏览器事件为替身，不宣称浏览器必然执行强制关页提示。
- 除新增控制器回归外，Reviewer独立临时磁盘实验使用生产directoryRepository/controller，文件句柄与settings接口替身：A迁移B后commit一条合成完成记录，新controller按设置重开从B读到记录，A原文件字节不变，browser读写次数均0。B权限失败模拟后workspace=null/reconnect，commit被拒，未读写旧浏览器。没有复现迁移后写回旧repository的缺陷。
- 只读工具浏览器此前仅读source/status/time，4173显示browser ready；4195当时服务不可访问。工具profile不代表用户日常profile，不能断定用户来源或权限。没有读取记录正文、头像或实际目录数据；私人目录路径不写入本报告。
- 最终20261014_Beat-Workbench_V1.1.0.zip仅两根条目：节拍工作台.html 246171字节、使用说明.txt 2207字节。包内HTML与dist均SHA256 6AB2BA7548A588AEFB3AAD571CEA031D27CD64D51C217B1F68150020764A2749；ZIP SHA256 D9A40A22128144F4930C01794AC029BC36360220634A4E08F41DD4D0741254F8，与冻结交接一致。构建源码内联一致性由本次完整测试确认。

本轮可报告上述确定缺陷修复通过，不报告历史数据已恢复或原现场根因已确定。Windows登录实际触发、原生目录权限/迁移及完整恢复UI等整版遗留仍保留；目录迁移不是云同步。未提交、上传或修改真实数据，最终发布与上传由PM依用户授权和整版状态另判。
