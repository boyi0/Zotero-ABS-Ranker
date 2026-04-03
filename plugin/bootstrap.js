var Zotero;

function log(msg) {
    if (Zotero && Zotero.debug) {
        Zotero.debug("Zotero-ABS-Ranker: " + msg);
    }
}

let rootURI;
let menuitem;

function standardize(name) {
    if (!name) return "";
    return name.toLowerCase()
               .replace(/&/g, ' and ')
               .replace(/-/g, ' ')
               .replace(/[^\w\s]/g, '')
               .replace(/\s+/g, ' ')
               .trim();
}

async function updateABSRanking() {
    let items = Zotero.getActiveZoteroPane().getSelectedItems();
    if (!items || items.length === 0) return;

    let jsonPath = rootURI + "content/journal_rankings.json";
    let dict;
    try {
        dict = await new Promise((resolve, reject) => {
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
    } catch (e) {
        Zotero.alert(null, "Error", "Could not load journal rankings database!\nPath: " + jsonPath + "\nReason: " + e.message);
        return;
    }

    let processedCount = 0;

    await Zotero.DB.executeTransaction(async function() {
        for (let item of items) {
            if (!item.isRegularItem()) continue;

            let pubTitle = item.getField('publicationTitle');
            let cleanTitle = standardize(pubTitle);
            if (!cleanTitle) continue;

            let matchedRanks = [];

            // Match current ranks
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

            if (matchedRanks.length > 0) {
                // 1. Fully replace tags (remove old ones first to handle upgrades/downgrades)
                let existingTags = item.getTags();
                for (let t of existingTags) {
                    if (t.tag.startsWith("ABS ") || t.tag === "FT50" || t.tag === "UTD24" || t.tag === "SSCI") {
                        item.removeTag(t.tag);
                    }
                }
                
                for (let label of matchedRanks) {
                    item.addTag(label);
                }

                // 2. Fully replace Extra field Ranking line without touching other lines
                let extra = item.getField('extra') || "";
                // Robust split handling \r\n and \n
                let newExtraLines = extra.split(/\r?\n/).filter(line => !line.startsWith('Ranking:'));
                newExtraLines.push("Ranking: " + matchedRanks.join(" | "));
                item.setField('extra', newExtraLines.join('\n').trim());
                
                await item.save();
                processedCount++;
            }
        }
    });
    
    Zotero.Notifier.trigger('modify', 'item', items.map(item => item.id));

    let regularItems = items.filter(item => item.isRegularItem() && item.getField('publicationTitle'));
    let skippedCount = regularItems.length - processedCount;
    let msg = `Updated ${processedCount} item(s).`;
    if (skippedCount > 0) {
        msg += `\n${skippedCount} item(s) had no matching journal in the database.`;
    }
    Zotero.alert(null, "ABS Ranking Update", msg);
    log(`Finished updating ${items.length} items. Updated ${processedCount} successfully.`);
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

    menuitem = doc.createXULElement('menuitem');
    menuitem.id = 'zotero-abs-ranker-update';
    menuitem.setAttribute('label', 'Update ABS ranking');
    menuitem.addEventListener('command', function(e) {
        e.stopPropagation();
        updateABSRanking().catch(err => {
            Zotero.debug("Zotero-ABS-Ranker error: " + err);
        });
    });
    menu.appendChild(menuitem);
    log("Menu item added successfully");
}

function removeFromRightClickMenu() {
    if (menuitem && menuitem.parentNode) {
        menuitem.parentNode.removeChild(menuitem);
        menuitem = null;
    }
}

function install() {}
function uninstall() {}

function startup({ id, version, resourceURI, rootURI: _rootURI }, reason) {
    if (typeof Zotero === 'undefined') {
        Zotero = Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
    }
    log("Starting up...");
    rootURI = _rootURI;
    Zotero.uiReadyPromise.then(() => {
        try {
            addToRightClickMenu();
        } catch(e) {
            log("Failed to add menu item: " + e);
        }
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
}
