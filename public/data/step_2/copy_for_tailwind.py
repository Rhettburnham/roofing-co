#!/usr/bin/env python3
import os
import shutil
import json

def copy_services_for_tailwind():
    """Copy the roofing_services.json file to the root data directory for tailwind to access it."""
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    raw_data_dir = os.path.join(data_dir, "raw_data", "step_2")
    
    source_file = os.path.join(raw_data_dir, "roofing_services.json")
    target_file = os.path.join(data_dir, "roofing_services.json")
    
    # Check if source file exists
    if not os.path.exists(source_file):
        print(f"Source file {source_file} does not exist. Run research_services.py first.")
        return False
    
    # Copy the file
    try:
        shutil.copy2(source_file, target_file)
        print(f"Copied roofing_services.json to {target_file} for tailwind.config.js to access")
        return True
    except Exception as e:
        print(f"Error copying file: {e}")
        return False

if __name__ == "__main__":
    copy_services_for_tailwind() 