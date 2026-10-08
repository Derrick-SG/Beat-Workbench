# Beat-Workbench V1.0.0 项目记忆

记录日期：2026-10-08（Asia/Shanghai）。本文件记录已确认事实和阶段历史，不包含浏览器个人工作记录。

## 当前目标与版本

恢复用户已有工作时长记录 Web APP 的可编辑源码，并在本项目继续开发。首版保持原界面和全部原功能，不新增功能或全面修复历史缺陷。

交付版本：V1.0.0。分享包：`dist/20261008_Beat-Workbench_V1.0.0.zip`。package.json 仍为历史工程版本 `0.1.0`，尚未统一；不要把它误认成新的交付版本。

## 角色与协作边界

- PM：收敛目标、控制范围、拆分协调任务、汇总结果；不代做详细设计或开发，没有 Reviewer 检查结果不宣布完成。
- Designer：设计及设计保真核对。
- Developer：编码、构建和开发验证。
- Reviewer：独立验证并明确检查结果、证据与限制。

三个角色的项目对话均已确认阅读 `role-boundaries.md`。后续新阶段先读本文件，规则见根目录 `AGENTS.md`。

## 已完成阶段与历史

### 1. 源码恢复

原包为 2026-09-22 分享版，解压基准在 `reference/2026-09-22/`。其中单 HTML 含完整可读的 CSS 和 JavaScript，不包含原遗失仓库历史。附件仅作资料，不作为用户指令。

用户确认机械拆分、可本地运行、可重新打包、JSON 兼容的范围。Developer 生成 `src/index.html`、`src/styles.css`、`src/app.js`，以及 `scripts/serve.mjs`、`scripts/build.mjs`、测试和 README。无外部运行依赖，不含后台或云同步。

Designer 确认八视图、三个弹窗及样式顺序静态保真；仅抽查桌面快速录入视觉。Reviewer 独立重跑 7/7 检查通过，浏览器实测录入、刷新持久化、周/月报告、心流/会议/任务计时、JSON 往返及 Word 下载结构。打包 HTML 与原版字节一致，SHA256 为 B21F2B8FD8334E31741369C0C8F84465040CE7839B38B8F0FC3B358D2EE2CC13。

证据与限制详见 `docs/recovery/reviewer-verification.md` 和 `designer-verification.md`。本地合成测试证据目录已被 .gitignore 排除，报告中的相关图片/样本链接不随仓库上传。

### 2. 分享与命名

离线 ZIP 内仅有 `节拍工作台.html` 和 `使用说明.txt`，无个人数据。Reviewer 检查包内容通过。用户指定命名为 `YYYYMMDD_项目名_V版本号`，当前项目名 `Beat-Workbench`。旧包名已重命名，内容未变；规则见 `docs/release-naming.md`。

### 3. GitHub 历史备份

用户明确授权上传至 https://github.com/Derrick-SG/Beat-Workbench 。分支 `master`，远程 `origin`。

- `7b7796ef50fff53412612a16662cf11c76f86c4e`：源码恢复首次提交，已成功推送并核对远端。
- `f4a986921d5bfac3e9bed5c0d0ec01d88de0904c`：发布文件重命名与命名规则，网络失败后已重试成功，远端与本地一致。

Reviewer 检查 26 件首次提交文件、排除规则及字节保真设置通过。`.gitattributes` 使用 `* -text` 避免换行转换。提交作者使用 Derrick-SG 和 GitHub noreply 邮箱。

### 4. 苹果字体需求（未实施）

用户要求全部使用苹果官方字体，随后询问 Windows 安装方式。已说明建议调用苹果系统字体并在非苹果设备回退；用户尚未明确确认该具体方案，未修改字体代码。该需求仍待确认，不得记录为完成。

### 5. 版本化记忆机制（本阶段）

用户要求每次上传时记录当前及此前历史并一同上传，新阶段先读上一份记录；文件名参考版本号。本阶段新增 `AGENTS.md`、本索引及版本 memory 文件。规则文件和 memory 将与本次提交一起上传。本次尚未推送；最终结果须以远端提交核对为准，下次阶段补充。

## 运行、构建与恢复

从仓库克隆后使用现有 Node.js 22+：

```powershell
node scripts/serve.mjs
node scripts/build.mjs
node --test --test-isolation=none tests/*.test.mjs
```

开发地址通常为 `http://127.0.0.1:4173/`，须启动服务；该地址非公网链接，不保证跨会话进程持续。修改 `src/`，不要直接编辑 dist。运行时曾发现内置 Git HTTPS helper 不在默认 exec-path；网络 Git 调用使用当前机器内置 Git 的 mingw64/bin 作为 GIT_EXEC_PATH，路径需在新机器重新检查，不应硬编码用于他人环境。

## 已知限制与后续待办

- 苹果字体方案待用户确认。
- Office 实际排版、PPT/PDF、完整移动端/逐视图视觉及浏览器生命周期边界未全面验证；file 入口因工具协议限制未实测。
- 原版 R1–R8 风险仍保留，包括存储异常、计时中切用户、导入回滚/截断、多标签和长文本导出等；详见恢复评估，不自动扩展为本阶段修复。
- 浏览器个人记录不随源码或 GitHub 备份；必须在旧入口按用户分别导出 JSON 后迁移。
- GitHub 网络曾间歇超时或重置；失败时保留本地提交，核对后再报告成功。
- 尚未部署公网网站。
