// ============================================
// Zotero 期刊自动评级工具
// 使用方法：在 Zotero 主界面选中需要处理的条目，
// 点击顶部菜单 “工具” -> “开发者” -> “运行 JavaScript”，
// 将此代码粘贴并运行。
// ============================================

const jsonPath = "/Users/boyijin/Documents/Develop/PY/zotero_journal_ranking/journal_rankings.json";

// 辅助函数：标准化名称 (去符号，去空格，全小写)
function standardize(name) {
    if (!name) return "";
    return name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

try {
    // 1. 获取选中的条目
    var items = Zotero.getActiveZoteroPane().getSelectedItems();
    if (items.length === 0) {
        return "请先在 Zotero 主界面选中你要处理的文献！";
    }

    // 2. 读取我们准备好的 JSON 文件
    let rawJSON;
    try {
        // 尝试使用异步读取 (针对 Zotero 7)
        if (Zotero.File.getContentsAsync) {
            let file = Zotero.File.pathToFile(jsonPath);
            rawJSON = await Zotero.File.getContentsAsync(file);
        } else {
            // 兼容 Zotero 6
            rawJSON = Zotero.File.getContents(jsonPath);
        }
    } catch (e) {
        return "无法读取期刊配置文件，请确保 JSON 文件路径正确并且文件存在：" + jsonPath + "\\n错误信息: " + e;
    }

    const dict = JSON.parse(rawJSON);
    
    var processedCount = 0;

    // 3. 逐个处理文献
    for (let item of items) {
        if (!item.isRegularItem()) continue;

        let pubTitle = item.getField('publicationTitle');
        let cleanTitle = standardize(pubTitle);

        if (!cleanTitle) continue;

        let matchedRanks = [];

        // 匹配 ABS
        if (dict["ABS"] && dict["ABS"][cleanTitle]) {
            matchedRanks.push("ABS " + dict["ABS"][cleanTitle]);
        }

        // 匹配 FT50
        if (dict["FT50"] && dict["FT50"].includes(cleanTitle)) {
            matchedRanks.push("FT50");
        }

        // 匹配 UTD24
        if (dict["UTD24"] && dict["UTD24"].includes(cleanTitle)) {
            matchedRanks.push("UTD24");
        }

        // 匹配 SSCI
        if (dict["SSCI"] && dict["SSCI"].includes(cleanTitle)) {
            matchedRanks.push("SSCI");
        }

        if (matchedRanks.length > 0) {
            // 1. 彻底清空本文章曾经存在过的 ABS, FT50, UTD24 标签，避免因修改或重复运行累积多个同类标签
            let existingTags = item.getTags();
            for (let t of existingTags) {
                if (t.tag.startsWith("ABS ") || t.tag === "FT50" || t.tag === "UTD24" || t.tag === "SSCI") {
                    item.removeTag(t.tag); 
                }
            }
            
            // 加入最新匹配到的标签
            for (let label of matchedRanks) {
                item.addTag(label);
            }

            // 2. 更稳健的 Extra 替换机制 (兼容 Mac 的 \r 和 Windows 的 \n)
            let extra = item.getField('extra') || "";
            let newExtraLines = extra.split(/\r?\n/).filter(line => !line.startsWith('Ranking:'));
            
            // 压入最新的 Ranking 行
            newExtraLines.push("Ranking: " + matchedRanks.join(" | "));
            
            item.setField('extra', newExtraLines.join('\n').trim());
            
            await item.saveTx(); // 这里因为是手动执行，单线程保存还是用最原始的即可（插件里我们用了更快的事务法）
            processedCount++;
        }
    }

    return "✅ 处理完成！\\n刚才共检查了 " + items.length + " 个条目，其中成功识别并标注了 " + processedCount + " 个。\\n你可以去查看它们的 Extra(附加) 字段和标签。";

} catch (e) {
    return "代码运行出错: " + e.message;
}
