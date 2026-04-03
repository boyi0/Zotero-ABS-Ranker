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
1. Download the latest `.xpi` file by clicking this direct link: **[⏬ Download zotero-abs-ranker-v1.0.1.xpi](https://github.com/boyi0/Zotero-ABS-Ranker/raw/main/zotero-abs-ranker-v1.0.1.xpi)**.
2. Open Zotero 7 and go to **Tools** > **Add-ons**.
3. Drag and drop the downloaded `.xpi` file into the Add-ons window to install it. 
4. Acknowledge the permissions prompt if it appears.

### 🚀 Usage
1. In your main Zotero item pane, select one or multiple papers you wish to update.
2. **Right-click** on the selected items.
3. Click on the new **Update ABS ranking** button in the context menu.
4. Watch as the magic happens—tags and your Extra field are instantly populated.

### 🎨 Pro Tip: Colored Tags Guide
Zotero officially restricts users to a **maximum of 9 global colored tags** across the entire software application (tied to your keyboard shortcuts 1-9). By design, this plugin **does not** invasively hardcode or force colors onto your tags behind the scenes. Doing so would aggressively overwrite your personal color slots (e.g., your "Must Read" colored tag).

**How to assign permanent colors yourself:**
Once the plugin has assigned a text tag (like `ABS 4*` or `UTD24`) to an article:
1. Locate the Tag Selector window at the bottom-left of your Zotero application.
2. **Right-click** on the newly generated `ABS 4*` tag.
3. Select **Assign Color...** and choose your favorite color (e.g., Red).
4. **You're done forever!** From now on, whenever this plugin automatically assigns the `ABS 4*` text tag to any new future papers, Zotero will instantly remember your preference and render it as a bright red badge.

### ⭐️ Support & Feedback
If you find this plugin helpful and it saves your precious research time, please consider giving this repository a ⭐️ **Star** at the top right, and share it with your colleagues!
If you have any extra journal list requests (e.g., CCF, CSSCI) or encounter any bugs, please feel free to open an **Issue** or submit a PR. Your feedback is highly welcome!

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
1. 点击这里直接下载全功能插件安装包： **[⏬ 下载 zotero-abs-ranker-v1.0.1.xpi](https://github.com/boyi0/Zotero-ABS-Ranker/raw/main/zotero-abs-ranker-v1.0.1.xpi)** 。
2. 启动 Zotero 7 主程序，点击顶部菜单栏的 **工具(Tools)** > **附加组件(Add-ons)**。
3. 将下载好的 `.xpi` 文件直接**拖拽**到打开的附加组件窗口中。
4. 在弹出的安全提示对话框中点击确定安装。

### 🚀 如何使用
1. 在 Zotero 的文献列表主界面，鼠标框选或多选任意你想测试处理的文献。
2. 呼出**右键菜单**。
3. 点击右键菜单底部的 **Update ABS ranking** 按钮。
4. 瞬间完成！你的文献已佩戴好荣耀的顶刊徽章。

### 🎨 高阶技巧：为标签赋予颜色
请注意，本插件**没有在底层系统级强制写入标签颜色**。因为 Zotero 官方设定了一个极为严苛的限制：**全软件最多只能拥有 9 个彩色标签**（与键盘区 1-9 快捷键强制绑定）。如果我们用代码霸道地强行锁死颜色，将会暴力覆盖并摧毁你个人常用的那些标红槽位（比如你自己的“精读”标签）。

**正确且一劳永逸的上色方法：**
只需在使用插件为随便一篇文章打出标签后，顺手进行一次如下设定：
1. 看向 Zotero 界面左下角的 **标签列表 (Tag Selector)** 区域。
2. **右键点击**新生成的 `ABS 4*` (或者 `FT50` 等) 标签词汇。
3. 选择 **指定颜色 (Assign Color...)**，为你心仪的顶刊挑选一个耀眼的颜色并保存。
4. **大功告成，终身自动生效！** 今后，只要本插件在后台往任何新文章上打上了这串 `ABS 4*` 的文字，Zotero 强大的记忆系统就会如同条件反射般，瞬间将其渲染成你选配好的彩色方块！

### ⭐️ 支持与反馈
如果这个开源小工具切切实实地拯救了你的科研时间，**请务必在页面右上角给我点一颗 ⭐️ Star**，并把它极力安利给你身边的学术战友们！
如果你想要我们为其追加更多的期刊名单库（比如 CCF、CSSCI、CSCD），或者在平时遇到了什么奇怪无法识别的情况，非常欢迎直接在 **Issues** 区给我留言提出需求。随时欢迎探讨与贡献代码！
