# Zotero ABS Ranker

🌍 [中文说明 / Chinese Documentation](#中文说明) | 🇬🇧 [English Documentation](#english-documentation)

---

<a id="english-documentation"></a>
## 🇬🇧 English Documentation

**Zotero ABS Ranker** is an open-source Zotero 7 extension that empowers researchers by automatically identifying and tagging academic papers with their authoritative journal rankings (ABS/AJG, FT50, UTD24, SSCI). 

Built specifically for Zotero 7, it utilizes an embedded offline database and bulk database transactions for lightning-fast performance.

### ✨ Key Features
- **Offline Database Included:** Native built-in support for the full ABS (AJG) 2024 list (~1800 journals) mapped beautifully, alongside complete hardcoded coverage for internationally recognized FT50 and UTD24 panels.
- **Auto-Tagging & Metadata Injection:** Automatically attaches colored tags (e.g., `ABS 4*`, `FT50`, `UTD24`) and injects a clean, searchable `Ranking: ABS 4* | FT50` string safely into the bottom of the item's `Extra` field.
- **Robust Idempotency:** Running it multiple times on the same item is perfectly safe. It intelligently scans, cleans up old ranking tags, and replaces previous ranking lines in the Extra field without altering other custom user metadata.
- **High Performance:** Resolves the notorious Zotero SQLite bottleneck by wrapping item array updates inside `Zotero.DB.executeTransaction(...)`, making it handle hundreds of papers flawlessly down to fractional milliseconds.
- **Fuzzy Name Matching:** Hardened against academic database discrepancies. Normalizes journal names by turning titles into lowercase, stripping special characters, and squashing redundant spaces (e.g., handles differences between `&` and `and`).

### 📦 Installation
1. Go to the [Releases](#) page and download the latest `.xpi` file (e.g., `zotero-abs-ranker-v1.0.1.xpi`).
2. Open Zotero 7 and go to **Tools** > **Add-ons**.
3. Drag and drop the downloaded `.xpi` file into the Add-ons window to install it. 
4. Acknowledge the permissions prompt if it appears.

### 🚀 Usage
1. In your main Zotero item pane, select one or multiple papers you wish to update.
2. **Right-click** on the selected items.
3. Click on the new **Update ABS ranking** button in the context menu.
4. Watch as the magic happens—tags and your Extra field are instantly populated.

---

<a id="中文说明"></a>
## 🌍 中文说明

**Zotero ABS Ranker** 是一款专为 Zotero 7 打造的开源核心学术辅助插件。它能自动识别你库中的学术论文所属的期刊，并一键为你打上最权威的商科/社科期刊评级标签（ABS/AJG, FT50, UTD24, SSCI）。

插件内嵌了完整的本地离线数据库，并采用了批量数据库事务写入技术，无需联网即可体验极速打标。

### ✨ 核心特性
- **全面且开箱即用的离线词库:** 插件安装包内自带了最新的商科研标配引擎：超过 1800+ 本的完整 ABS (AJG) 2024 期刊映射词典，外加国际公认标准版 FT50 与 UTD24 顶刊名录。
- **自动化交叉双标体系:** 选中文章后，插件会自动生成专属且带有层级的彩色标签 (例如 `ABS 4*`, `FT50`)，同时智能在文献的 `Extra` (附加) 字段最底部写入干净的记录（例如：`Ranking: ABS 4* | UTD24` ），不影响正常排版且极为便携检索。
- **100% 幂等与无损覆盖防抖机制:** 重复运行完全自由。它会在更新前智能剥除它曾经打过的旧星级标签，精准替换 Extra 里的特定排名行，绝不会干扰污染你的原有笔记及其他插件数据。
- **极致的百倍提速:** 绕过了传统 Zotero 脚本 `saveTx()` 单线死循环的通病。通过原生调用 `Zotero.DB.executeTransaction(...)` 实现数据库打包提交，即使一秒拉取并批量改写几百篇文献也毫无阻滞反馈。
- **强力容错型清洗匹配:** 无论论文抓取时的期刊名是全大写、词首大写，还是内部包含了奇奇怪怪的标点与空格缩进（如 `&` 与 `and`），底层的标准化算法一律将其进行深度清洗与降维匹配，确保极高命中率。

### 📦 如何安装
1. 前往 GitHub 的 [Releases](#) 页面，下载最新的安装包文件（如 `zotero-abs-ranker-v1.0.1.xpi`）。
2. 启动 Zotero 7 主程序，点击顶部菜单栏的 **工具(Tools)** > **附加组件(Add-ons)**。
3. 将下载好的 `.xpi` 文件直接**拖拽**到打开的附加组件窗口中。
4. 在弹出的安全提示对话框中点击确定安装。

### 🚀 如何使用
1. 在 Zotero 的文献列表主界面，鼠标框选或多选任意你想测试处理的文献。
2. 呼出**右键菜单**。
3. 点击右键菜单底部的 **Update ABS ranking** 按钮。
4. 瞬间完成！你的文献已佩戴好荣耀的顶刊徽章。
