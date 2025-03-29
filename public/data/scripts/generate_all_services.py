#!/usr/bin/env python3
import os
import subprocess
import sys
import time

def run_command(command):
    """Run a command and print its output in real-time."""
    print(f"Running: {command}")
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        shell=True
    )
    
    # Print output in real-time
    for line in process.stdout:
        print(line, end='')
    
    # Wait for process to complete and get return code
    return_code = process.wait()
    if return_code != 0:
        print(f"Command failed with exit code {return_code}")
        return False
    return True

def main():
    """Run the complete service generation pipeline."""
    print("=== Starting Complete Services Generation Pipeline ===")
    
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Step 1: Run research_services.py to create the initial JSON
    print("\n=== Step 1: Researching Services ===")
    research_script = os.path.join(script_dir, "research_services.py")
    if not run_command(f"python {research_script}"):
        print("Research services step failed. Aborting pipeline.")
        return 1
    
    print("Research services step completed.")
    time.sleep(1)  # Small pause between steps
    
    # Step 2: Run generate_service_pages.py to create the frontend format
    print("\n=== Step 2: Generating Service Pages ===")
    generate_script = os.path.join(script_dir, "generate_service_pages.py")
    if not run_command(f"python {generate_script}"):
        print("Generate service pages step failed. Aborting pipeline.")
        return 1
    
    print("Generate service pages step completed.")
    time.sleep(1)  # Small pause between steps
    
    # Step 3: Run scrape_service_images.py to download images
    print("\n=== Step 3: Scraping Service Images ===")
    images_script = os.path.join(script_dir, "scrape_service_images.py")
    if not run_command(f"python {images_script}"):
        print("Note: Image scraping completed with some errors, but continuing pipeline.")
    else:
        print("Image scraping step completed.")
    
    print("\n=== Services Generation Pipeline Completed ===")
    print("Services data has been generated in the following locations:")
    print("1. Raw research data: public/data/raw_data/services.json")
    print("2. Frontend data: public/data/scripts/services.json")
    print("3. Images: public/assets/images/services/...")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 