#!/usr/bin/env python3

import os
import sys
import shutil
import json
import subprocess
from pathlib import Path
import time

def check_dependencies():
    """Check if dependencies are installed"""
    try:
        import pandas
        import openai
        import dotenv
        import geopy
        print("✅ All required dependencies are installed.")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Installing dependencies from requirements.txt...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
            print("✅ Dependencies installed successfully.")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies. Please install them manually:")
            print("   pip install -r requirements.txt")
            return False

def setup_environment():
    """Set up the environment for content generation"""
    # Check if .env file exists
    if not os.path.exists(".env"):
        if os.path.exists(".env.example"):
            print("❌ .env file not found. Please create it from .env.example.")
            print("   Copy .env.example to .env and add your API key.")
            return False
        else:
            print("❌ Neither .env nor .env.example found.")
            return False
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check if API key is set
    if not os.environ.get("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY not found in .env file.")
        return False
    
    print("✅ Environment set up successfully.")
    return True

def check_input_files():
    """Check if required input files exist"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    processed_data_dir = os.path.join(data_dir, "processed_data")
    
    # Check BBB profile data
    bbb_file = os.path.join(processed_data_dir, "bbb_profile_data.json")
    if not os.path.exists(bbb_file):
        print(f"❌ BBB profile data not found at {bbb_file}")
        return False
    
    # Check if reviews data exists (optional)
    reviews_file = os.path.join(processed_data_dir, "sentiment_reviews.json")
    if not os.path.exists(reviews_file):
        print(f"⚠️ Reviews data not found at {reviews_file}. Will proceed without reviews.")
    
    print("✅ Required input files found.")
    return True

def create_backup(files_to_backup):
    """Create backup of existing files"""
    backup_dir = "backup_" + time.strftime("%Y%m%d_%H%M%S")
    os.makedirs(backup_dir, exist_ok=True)
    
    for file_path in files_to_backup:
        if os.path.exists(file_path):
            file_name = os.path.basename(file_path)
            backup_path = os.path.join(backup_dir, file_name)
            shutil.copy2(file_path, backup_path)
            print(f"✅ Backed up {file_path} to {backup_path}")
    
    return backup_dir

def run_content_generator():
    """Run the content generator script"""
    try:
        print("\n🔄 Running content generator...")
        result = subprocess.run([sys.executable, "content_generator.py"], 
                               capture_output=True, text=True, check=True)
        print("✅ Content generation completed successfully.")
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Content generation failed: {e}")
        print(e.stdout)
        print(e.stderr)
        return False

def copy_files_to_correct_locations():
    """Copy generated files to the correct locations"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    processed_data_dir = os.path.join(data_dir, "processed_data")
    
    # Copy combined_data.json to public/data
    source = os.path.join(processed_data_dir, "combined_data.json")
    dest = os.path.join(data_dir, "combined_data.json")
    
    if os.path.exists(source):
        shutil.copy2(source, dest)
        print(f"✅ Copied {source} to {dest}")
    else:
        print(f"❌ Failed to copy {source} to {dest}: File not found")
    
    # Copy services.json to public/data
    source = os.path.join(processed_data_dir, "services.json")
    dest = os.path.join(data_dir, "services.json")
    
    if os.path.exists(source):
        shutil.copy2(source, dest)
        print(f"✅ Copied {source} to {dest}")
    else:
        print(f"❌ Failed to copy {source} to {dest}: File not found")
    
    return True

def main():
    """Main function to run the content generation pipeline"""
    print("=" * 80)
    print("🏗️  WEBSITE CONTENT GENERATION PIPELINE")
    print("=" * 80)
    
    # 1. Check dependencies
    if not check_dependencies():
        return
    
    # 2. Set up environment
    if not setup_environment():
        return
    
    # 3. Check input files
    if not check_input_files():
        return
    
    # 4. Create backup of existing files
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    files_to_backup = [
        os.path.join(data_dir, "combined_data.json"),
        os.path.join(data_dir, "services.json")
    ]
    
    backup_dir = create_backup(files_to_backup)
    
    # 5. Run content generator
    if not run_content_generator():
        print(f"Content generation failed. Backup files are in {backup_dir}")
        return
    
    # 6. Copy files to correct locations
    if not copy_files_to_correct_locations():
        print(f"Failed to copy files. Backup files are in {backup_dir}")
        return
    
    print("\n=" * 80)
    print("✅ WEBSITE CONTENT GENERATION COMPLETED SUCCESSFULLY")
    print("=" * 80)
    print(f"Backup of previous files is in {backup_dir}")
    print("You can now restart your website to see the new content.")

if __name__ == "__main__":
    main() 