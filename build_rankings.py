import pandas as pd
import json
import re
import os
import glob

def standardize(name):
    if not isinstance(name, str):
        return ""
    # 转小写
    name = name.lower()
    # 替换所有非字母数字字符为空格
    name = re.sub(r'[^\w\s]', '', name)
    # 替换连续多余空格为单空格
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def main():
    # 默认内置名单，如果外部没有任何 csv，也会自带这些顶级期刊
    default_utd24 = [
        "The Accounting Review", "Journal of Accounting and Economics", "Journal of Accounting Research",
        "Journal of Finance", "Journal of Financial Economics", "The Review of Financial Studies",
        "Information Systems Research", "Journal of Management Information Systems", "MIS Quarterly",
        "Journal of Consumer Research", "Journal of Marketing", "Journal of Marketing Research", "Marketing Science",
        "Management Science", "Operations Research", "Journal of Operations Management",
        "Manufacturing and Service Operations Management", "Production and Operations Management",
        "Academy of Management Journal", "Academy of Management Review", "Administrative Science Quarterly",
        "Organization Science", "Strategic Management Journal", "Journal of International Business Studies"
    ]
    
    default_ft50 = default_utd24 + [
        "Accounting, Organizations and Society", "Contemporary Accounting Research", "Review of Accounting Studies",
        "Journal of Financial and Quantitative Analysis", 
        "American Economic Review", "Econometrica", "Journal of Political Economy", "Quarterly Journal of Economics", "Review of Economic Studies",
        "Entrepreneurship Theory and Practice", "Journal of Business Venturing", 
        "Human Relations", "Journal of Applied Psychology", "Organizational Behavior and Human Decision Processes", "Personnel Psychology",
        "Academy of Management Perspectives", "Journal of Management", "Journal of Management Studies", 
        "California Management Review", "Harvard Business Review", "MIT Sloan Management Review", 
        "Journal of Business Ethics", "Research Policy", "Strategic Entrepreneurship Journal", "Human Resource Management", "Journal of International Business Policy"
    ]

    output = {
        "ABS": {},
        "FT50": [standardize(x) for x in default_ft50],
        "UTD24": [standardize(x) for x in default_utd24],
        "SSCI": []
    }

    # 1. 处理 ABS
    abs_file = 'ABS 2024.xlsx'
    if os.path.exists(abs_file):
        print(f"正在读取 {abs_file}...")
        df_abs = pd.read_excel(abs_file, sheet_name=0)
        
        if 'title' in df_abs.columns and 'ajg_2024' in df_abs.columns:
            for index, row in df_abs.iterrows():
                title = row['title']
                rating = row['ajg_2024']
                
                if pd.isna(title) or pd.isna(rating):
                    continue
                
                clean_title = standardize(str(title))
                rating_str = str(rating).strip()
                
                # 特殊处理：原表中如果用 5 代表 4*
                if rating_str == '5':
                    rating_str = '4*'
                
                if clean_title:
                    output["ABS"][clean_title] = rating_str
            print(f"成功导入 {len(output['ABS'])} 条 ABS 期刊记录！")
        else:
            print("ABS 表格中没有找到 'title' 或 'ajg_2024' 列！请检查。")

    # 2. 如果存在外部 csv 列表 (未来你可以直接往文件夹里放 csv，一列写期刊名即可)
    for category in ["FT50", "UTD24", "SSCI"]:
        for ext in ["csv", "xlsx"]:
            file_name = f"{category}.{ext}" # 比如 FT50.csv 或者 UTD24.xlsx
            if os.path.exists(file_name):
                print(f"正在读取 {file_name}...")
                if ext == "csv":
                    df = pd.read_csv(file_name, header=None)
                else:
                    df = pd.read_excel(file_name, header=None)
                
                for _, row in df.iterrows():
                    val = row[0]
                    if pd.notna(val):
                        clean_title = standardize(str(val))
                        if clean_title:
                            output[category].append(clean_title)
                
                output[category] = list(set(output[category])) # 去重
                print(f"成功导入 {len(output[category])} 条 {category} 期刊记录！")
    
    # 导出 json 文件
    out_file = 'journal_rankings.json'
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n所有数据已整理完毕并保存至 {out_file}！")

if __name__ == "__main__":
    main()
