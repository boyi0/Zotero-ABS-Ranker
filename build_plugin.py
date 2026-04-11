import os
import json
import zipfile
import shutil

def build_xpi():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    plugin_dir = os.path.join(current_dir, "plugin")

    # Read version from manifest.json
    manifest_path = os.path.join(plugin_dir, "manifest.json")
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    version = manifest.get("version", "0.0.0")

    output_filename = f"zotero-abs-ranker-v{version}.xpi"
    output_path = os.path.join(current_dir, output_filename)

    # Ensure plugin/content exists
    content_dir = os.path.join(plugin_dir, "content")
    if not os.path.exists(content_dir):
        os.makedirs(content_dir)

    # Copy JSON to plugin/content/
    src_json = os.path.join(current_dir, "journal_rankings.json")
    dst_json = os.path.join(content_dir, "journal_rankings.json")
    if os.path.exists(src_json):
        shutil.copy2(src_json, dst_json)

    targets = ["manifest.json", "bootstrap.js", "content"]

    print(f"Building {output_filename} (version {version})...")

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for target in targets:
            target_path = os.path.join(plugin_dir, target)
            if os.path.isdir(target_path):
                for root, dirs, files in os.walk(target_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, plugin_dir)
                        zipf.write(file_path, arcname)
                        print(f"  Added {arcname}")
            elif os.path.isfile(target_path):
                zipf.write(target_path, target)
                print(f"  Added {target}")

    # Clean up old .xpi files with different version numbers
    for f in os.listdir(current_dir):
        if f.startswith("zotero-abs-ranker-v") and f.endswith(".xpi") and f != output_filename:
            old_path = os.path.join(current_dir, f)
            os.remove(old_path)
            print(f"  Removed old build: {f}")

    print(f"\nBuild successful! Created: {output_filename}")
    print("You can now drag and drop this .xpi file into Zotero to install it.")

if __name__ == "__main__":
    build_xpi()
