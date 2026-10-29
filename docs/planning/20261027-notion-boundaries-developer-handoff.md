# V1.1.2 Notion边界修正 Developer交接 / 2026-10-27

下述边界修正阶段132项已由文末同日配置诊断137项冻结取代；10/27冻结取代10/26的129项实现冻结；旧阶段说明与10/26包保留。未发布1.1.2不再次升号。仅命令行、源码及合成测试，未控制电脑/浏览器UI，未碰4173、真实Notion、用户token或个人工作数据，未Git提交或上传。

## 两个问题与证据
1. 旧client按UTF-16下标每1800 slice，把跨边界emoji拆为两个不完整代理。新请求体测试在旧实现实际发出的rich_text上isWellFormed()为false，先红；修后按Unicode码点累积，payload预留marker/index长度，完整段含标记<=1800 UTF-16代码单元，不丢原文。每个实际请求段well-formed、总长有界、移除marker后拼回完全等于原JSON，绿。
2. 旧engine保留jobs插入顺序，既有record/task改新项目B后可在B pageId登记前先执行，真实client抛permanent关联错误，最终partial。新真实engine+client模拟HTTP契约先红；现优先调度项目，并只在project.pageId已登记后派发task/record，缺关联为可等待依赖。改项目后保留原record/task远端pageId，关联自动更新B，不需手动retry。
3. 增补实际client未知成功项目POST契约：B页已创建但响应丢失时只有B处unknown，record/task不被永久阻塞或错误改关联；retry先核对B，恢复原行关联且B仅一个。通过。

## 最终验证
2026-10-27：node --test --test-isolation=none tests/*.test.mjs 完整132/132通过，0失败。相关client+engine 15/15通过。node scripts/build.mjs与git diff --check通过。无实际HTTP访问，fetchImpl为合成内存Notion契约，不代表真实Notion API验收。

10/27 ZIP严格仅节拍工作台.html、使用说明.txt两项，包内HTML SHA256与dist逐字节一致。服务端改动不进入单HTML，因此当前HTML与10/26相同；10/27说明增加边界修正及验收范围。

HTML SHA256 7ECDDDF88E9D3EEEDECB013CF71583366AB9D7B044F1768ADB61F2143C86C8CB
10/27 ZIP SHA256 E9460909942925F1C8DD1B222E1515E682E5E50301385FE3ADF844E7FC085B46
保留10/26阶段ZIP SHA256 E3DE73595194EC86288349B75D51C22425DC6699824D809EF2D73296BAAD9CE5
保留1.1.1 ZIP SHA256 966D090DA3BF5DC26CF8408627EE7B7B0F19EF12FA901EAC3E67E58D04E7F828
保留1.1.0 ZIP SHA256 22467BD1D74688C308B886EF6A36073A647A36C24EF2FF3CA8D0051B7D937054
client.mjs SHA256 0A927588046A5D957B5699F02B4F17D14BD78CE88F3012B90B20AF9B873FB404
engine.mjs SHA256 98940A72243B052FEA6A225766EF1D45987A89D17A8278CA8B6035D25C0E912D

## 仍需验收
独立Reviewer复核本次3项新回归与两处生产修正。用户尚未明确电脑空闲，所有UI检查继续暂停；真实内部token未配置，不进行真实合成联通或实际历史导入。已有安全配置、范围预览、并发锁/限流约束保持；完整设置流程和10/26证据见前次交接。PM负责PRD/memory，未改这两处资料。

## 同日配置诊断增量：最终137项冻结

窗口此前泛化失败的真实原因未确定；不能根据隐藏输入星号数量推断输入错误。本轮未读取真实配置、令牌、剪贴板或UI。

configure.mjs仅trim两项输入边界，token仍20–500位A-Z/a-z/0-9/下划线/连字符，父页32hex或标准UUID。输入错误发生在建私有目录前；受信ConfigurationError白名单按令牌2/父页3/路径4/权限5/写入6分类，未知1。原始异常、token和子进程env不输出，handoff env在Node安全流程前删除。PS不再throw重复红异常；输入类别2/3可Y隐藏重输两项，其他分类退出保留明确提示。UTF8 BOM+Console/OutputEncoding确保PS5和pwsh中文；Node已安装/bundled fallback不变。

相关6/6通过：真实CLI假secret无stdout/stderr泄露、trim成功及内部空白拒绝、写入故障/未知异常只出安全诊断，PS5与pwsh非交互模拟Read-Host验证中文、隐藏重试成功及handoff清除。所有配置成功测试只指向临时LOCALAPPDATA，测试结束清理；VM只替代文件IO边界以注入ENOSPC，不暴露生产测试开关。

必要最终完整 node --test --test-isolation=none tests/*.test.mjs 137/137通过，build、git diff --check通过。配置脚本已提前交PM可请用户本机安全重试，真实授权仍由PM核实。此后只修改交付文档与ZIP说明，产品HTML未变。

当前10/27 ZIP SHA256 CE4461D1016CD9DC5FEE02E15FA7C58E7B166FD5352A4A8A4D66BB1BF3483C51（取代同日132阶段E9460909942925F1C8DD1B222E1515E682E5E50301385FE3ADF844E7FC085B46）；两项白名单及包内HTML字节hash通过。
HTML SHA256 7ECDDDF88E9D3EEEDECB013CF71583366AB9D7B044F1768ADB61F2143C86C8CB。
configure.mjs SHA256 DAAD29E8278E97ECA3A861EB0DF0D16C0BC86ADCF7E87646DBB9F37AEB211A64。
configure-notion.ps1 SHA256 D203CFBBBF71050CBE9EEDDAF1E23524DE95664FBE8C55B94C5C8CB70C8277BA。
10/26包SHA256仍E3DE73595194EC86288349B75D51C22425DC6699824D809EF2D73296BAAD9CE5。无真实Notion/4173/UI操作，无Git提交上传。
