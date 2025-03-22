#!/usr/bin/env python3

import os
import json
import pandas as pd

def list_directory_structure(base_dir, indent=0):
    """
    Recursively lists all files in the directory structure.
    Analyzes CSV and JSON files to provide additional information.
    """
    for item in sorted(os.listdir(base_dir)):
        path = os.path.join(base_dir, item)
        rel_path = os.path.relpath(path, start=base_dir)

        # Skip __pycache__ and similar directories
        if item.startswith('__') or item.startswith('.'):
            continue

        if os.path.isdir(path):
            print(f"{' ' * indent}📁 {rel_path}/")
            list_directory_structure(path, indent + 2)
        else:
            file_info = ""
            try:
                # Get file info based on extension
                if item.endswith('.csv'):
                    try:
                        df = pd.read_csv(path)
                        file_info = f"[CSV: {len(df)} rows, {len(df.columns)} columns]"
                    except Exception as e:
                        file_info = f"[CSV: Error reading file - {str(e)}]"
                elif item.endswith('.json'):
                    try:
                        with open(path, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                        if isinstance(data, list):
                            file_info = f"[JSON: Array with {len(data)} items]"
                        elif isinstance(data, dict):
                            file_info = f"[JSON: Object with {len(data)} keys]"
                    except Exception as e:
                        file_info = f"[JSON: Error reading file - {str(e)}]"
                elif item.endswith('.py'):
                    file_info = "[Python script]"
            except Exception as e:
                file_info = f"[Error analyzing file: {str(e)}]"
                
            print(f"{' ' * indent}📄 {rel_path} {file_info}")

def main():
    # Get the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Navigate to parent directory (data folder)
    data_dir = os.path.dirname(script_dir)
    
    print(f"Data Directory Structure: {data_dir}\n")
    print("===============================================")
    
    # List all files
    list_directory_structure(data_dir)
    
    print("\n===============================================")
    print("Data Analysis Summary:")
    
    # Count files by type
    file_counts = {}
    for root, _, files in os.walk(data_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext:
                file_counts[ext] = file_counts.get(ext, 0) + 1
    
    for ext, count in sorted(file_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {ext} files: {count}")

if __name__ == "__main__":
    main() 