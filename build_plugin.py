import os
import zipfile
import shutil

def build_xpi():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_filename = "zotero-abs-ranker-v1.0.1.xpi"
    output_path = os.path.join(current_dir, output_filename)
    
    # ensure plugin/content exists
    content_dir = os.path.join(current_dir, "plugin", "content")
    if not os.path.exists(content_dir):
        os.makedirs(content_dir)
        
    # copy JSON to plugin/content/
    src_json = os.path.join(current_dir, "journal_rankings.json")
    dst_json = os.path.join(content_dir, "journal_rankings.json")
    if os.path.exists(src_json):
        shutil.copy2(src_json, dst_json)
    
    targets = ["manifest.json", "bootstrap.js", "content"]
    
    print(f"Building {output_filename}...")
    
    plugin_dir = os.path.join(current_dir, "plugin")
    
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
                
    print(f"\\nBuild successful! Created: {output_filename}")
    print("You can now drag and drop this .xpi file into Zotero to install it.")

if __name__ == "__main__":
    build_xpi()
