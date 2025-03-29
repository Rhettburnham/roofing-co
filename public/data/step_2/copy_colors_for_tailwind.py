#!/usr/bin/env python3
import os
import shutil
import json

def copy_colors_for_tailwind():
    """Copy the colors_output.json file to the public/data directory for tailwind to access it."""
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    raw_data_dir = os.path.join(data_dir, "raw_data", "step_2")
    
    source_file = os.path.join(raw_data_dir, "colors_output.json")
    target_file = os.path.join(data_dir, "colors_output.json")
    
    # Check if source file exists
    if not os.path.exists(source_file):
        print(f"Source file {source_file} does not exist. Creating a default colors file.")
        # Create a default colors file
        default_colors = {
            "accent": "#2B4C7E",
            "banner": "#1A2F4D",
            "second-accent": "#FFF8E1",
            "faint-color": "#E0F7FA"
        }
        
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(source_file), exist_ok=True)
        
        # Write the default colors to the source file
        with open(source_file, 'w') as f:
            json.dump(default_colors, f, indent=2)
    
    # Copy the file
    try:
        shutil.copy2(source_file, target_file)
        print(f"Copied colors_output.json to {target_file} for tailwind.config.js to access")
        return True
    except Exception as e:
        print(f"Error copying file: {e}")
        return False

if __name__ == "__main__":
    copy_colors_for_tailwind() 