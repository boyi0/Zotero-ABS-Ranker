var Zotero;

function log(msg) {
    if (Zotero && Zotero.debug) {
        Zotero.debug("Zotero-ABS-Ranker: " + msg);
    }
}

let rootURI;
let menuitemSelected;
let menuitemAll;
let cachedDict = null;

function standardize(name) {
    if (!name) return "";
    return name.toLowerCase()
               .replace(/&/g, ' and ')
               .replace(/-/g, ' ')
               .replace(/[^\w\s]/g, '')
               .replace(/\s+/g, ' ')
               .trim();
}

async function loadRankings() {
    if (cachedDict) return cachedDict;

    let jsonPath = rootURI + "content/journal_rankings.json";
    try {
        cachedDict = await new Promise((resolve, reject) => {
            let req = new XMLHttpRequest();
            req.open('GET', jsonPath, true);
            req.overrideMimeType("application/json");
            req.onload = () => {
                if (req.status === 200 || req.status === 0) {
                    try { resolve(JSON.parse(req.responseText)); }
                    catch(e) { reject(e); }
                } else {
                    reject(new Error(`XHR failed with status: ${req.status}`));
                }
            };
            req.onerror = () => reject(new Error("Network error"));
            req.send(null);
        });
        log("Rankings database loaded and cached (" + Object.keys(cachedDict.ABS || {}).length + " ABS entries)");
        return cachedDict;
    } catch (e) {
        Zotero.alert(null, "Error", "Could not load journal rankings database!\nPath: " + jsonPath + "\nReason: " + e.message);
        return null;
    }
}

function matchRankings(dict, cleanTitle) {
    let matchedRanks = [];

    if (dict["ABS"] && dict["ABS"][cleanTitle]) {
        matchedRanks.push("ABS " + dict["ABS"][cleanTitle]);
    }
    if (dict["FT50"] && dict["FT50"].includes(cleanTitle)) {
        matchedRanks.push("FT50");
    }
    if (dict["UTD24"] && dict["UTD24"].includes(cleanTitle)) {
        matchedRanks.push("UTD24");
    }
    if (dict["SSCI"] && dict["SSCI"].includes(cleanTitle)) {
        matchedRanks.push("SSCI");
    }

    return matchedRanks;
}

async function applyRankings(items, dict) {
    let processedCount = 0;
    let totalRegular = 0;

    await Zotero.DB.executeTransaction(async function() {
        for (let item of items) {
            if (!item.isRegularItem()) continue;

            let pubTitle = item.getField('publicationTitle');
            let cleanTitle = standardize(pubTitle);
            if (!cleanTitle) continue;

            totalRegular++;
            let matchedRanks = matchRankings(dict, cleanTitle);

            if (matchedRanks.length > 0) {
                // Remove old ranking tags to handle upgrades/downgrades
                let existingTags = item.getTags();
                for (let t of existingTags) {
                    if (t.tag.startsWith("ABS ") || t.tag === "FT50" || t.tag === "UTD24" || t.tag === "SSCI") {
                        item.removeTag(t.tag);
                    }
                }

                for (let label of matchedRanks) {
                    item.addTag(label);
                }

                // Replace Ranking line in Extra field without touching other lines
                let extra = item.getField('extra') || "";
                let newExtraLines = extra.split(/\r?\n/).filter(line => !line.startsWith('Ranking:'));
                newExtraLines.push("Ranking: " + matchedRanks.join(" | "));
                item.setField('extra', newExtraLines.join('\n').trim());

                await item.save();
                processedCount++;
            }
        }
    });

    Zotero.Notifier.trigger('modify', 'item', items.map(item => item.id));

    return { processedCount, totalRegular };
}

async function updateSelected() {
    let items = Zotero.getActiveZoteroPane().getSelectedItems();
    if (!items || items.length === 0) {
        Zotero.alert(null, "ABS Ranking Update", "No items selected. Please select one or more items first.");
        return;
    }

    let dict = await loadRankings();
    if (!dict) return;

    let { processedCount, totalRegular } = await applyRankings(items, dict);

    let skippedCount = totalRegular - processedCount;
    let msg = `Updated ${processedCount} item(s).`;
    if (skippedCount > 0) {
        msg += `\n${skippedCount} item(s) had no matching journal in the database.`;
    }
    Zotero.alert(null, "ABS Ranking Update", msg);
    log(`Selected: updated ${processedCount}/${totalRegular} regular items.`);
}

async function updateAll() {
    let libraryID = Zotero.getActiveZoteroPane().getSelectedLibraryID();
    let s = new Zotero.Search();
    s.libraryID = libraryID;
    s.addCondition('itemType', 'isNot', 'attachment');
    s.addCondition('itemType', 'isNot', 'note');
    let ids = await s.search();
    if (!ids || ids.length === 0) {
        Zotero.alert(null, "ABS Ranking Update", "No items found in the current library.");
        return;
    }

    let items = await Zotero.Items.getAsync(ids);

    let dict = await loadRankings();
    if (!dict) return;

    let { processedCount, totalRegular } = await applyRankings(items, dict);

    let skippedCount = totalRegular - processedCount;
    let msg = `Scanned entire library (${totalRegular} items).\nUpdated ${processedCount} item(s).`;
    if (skippedCount > 0) {
        msg += `\n${skippedCount} item(s) had no matching journal in the database.`;
    }
    Zotero.alert(null, "ABS Ranking Update — All Items", msg);
    log(`All: updated ${processedCount}/${totalRegular} regular items in library.`);
}

function addToRightClickMenu() {
    let win = Zotero.getMainWindow();
    if (!win) {
        log("Could not get main window");
        return;
    }
    let doc = win.document;
    let menu = doc.getElementById('zotero-itemmenu');
    if (!menu) {
        log("Could not find zotero-itemmenu element");
        return;
    }
    // Avoid duplicate registration
    if (doc.getElementById('zotero-abs-ranker-update')) return;

    // "Update ABS ranking" — selected items
    menuitemSelected = doc.createXULElement('menuitem');
    menuitemSelected.id = 'zotero-abs-ranker-update';
    menuitemSelected.setAttribute('label', 'Update ABS ranking');
    menuitemSelected.addEventListener('command', function(e) {
        e.stopPropagation();
        updateSelected().catch(err => {
            Zotero.debug("Zotero-ABS-Ranker error: " + err);
        });
    });
    menu.appendChild(menuitemSelected);

    // "Update ABS ranking — All Items" — entire library
    menuitemAll = doc.createXULElement('menuitem');
    menuitemAll.id = 'zotero-abs-ranker-update-all';
    menuitemAll.setAttribute('label', 'Update ABS ranking — All Items');
    menuitemAll.addEventListener('command', function(e) {
        e.stopPropagation();
        updateAll().catch(err => {
            Zotero.debug("Zotero-ABS-Ranker error: " + err);
        });
    });
    menu.appendChild(menuitemAll);

    log("Menu items added successfully");
}

function removeFromRightClickMenu() {
    if (menuitemSelected && menuitemSelected.parentNode) {
        menuitemSelected.parentNode.removeChild(menuitemSelected);
        menuitemSelected = null;
    }
    if (menuitemAll && menuitemAll.parentNode) {
        menuitemAll.parentNode.removeChild(menuitemAll);
        menuitemAll = null;
    }
}

function install() {}
function uninstall() {}

function startup({ id, version, resourceURI, rootURI: _rootURI }, reason) {
    if (typeof Zotero === 'undefined') {
        Zotero = Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    }
    log("Starting up v" + version + "...");
    rootURI = _rootURI;

    // Pre-load rankings on startup so first use is instant
    Zotero.uiReadyPromise.then(() => {
        try {
            addToRightClickMenu();
        } catch(e) {
            log("Failed to add menu item: " + e);
        }
        loadRankings().catch(e => log("Pre-load failed (non-fatal): " + e));
    });
}

function onMainWindowLoad({ window }, reason) {
    try {
        addToRightClickMenu();
    } catch(e) {
        log("Failed to add menu item: " + e);
    }
}

function onMainWindowUnload({ window }, reason) {
    removeFromRightClickMenu();
}

function shutdown(data, reason) {
    removeFromRightClickMenu();
    cachedDict = null;
}
