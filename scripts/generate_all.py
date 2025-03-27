#!/usr/bin/env python3
import os
import subprocess
import time
import sys
from typing import List, Tuple

def print_step(step: str):
    """Print a formatted step header to the console."""
    print("\n" + "=" * 80)
    print(f"  {step}")
    print("=" * 80 + "\n")

def run_command(command: List[str]) -> Tuple[int, str, str]:
    """Run a command and return its exit code, stdout, and stderr."""
    try:
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate()
        return process.returncode, stdout, stderr
    except Exception as e:
        return 1, "", str(e)

def check_dependencies():
    """Check and install required dependencies."""
    print_step("Checking and installing dependencies")
    
    # Check if requirements.txt exists in the same directory as this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    requirements_path = os.path.join(script_dir, "requirements.txt")
    
    if not os.path.exists(requirements_path):
        print("Error: requirements.txt not found in the script directory.")
        return False
    
    print("Installing required Python packages...")
    returncode, stdout, stderr = run_command([sys.executable, "-m", "pip", "install", "-r", requirements_path])
    
    if returncode != 0:
        print(f"Error installing dependencies: {stderr}")
        return False
    
    print("Dependencies installed successfully.")
    return True

def check_api_key():
    """Check if the DeepSeek API key has been set in the scripts."""
    print_step("Checking API key configuration")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    research_script_path = os.path.join(script_dir, "research_services.py")
    
    with open(research_script_path, "r") as f:
        content = f.read()
    
    if "YOUR_DEEPSEEK_API_KEY" in content:
        print("Warning: DeepSeek API key has not been set in the scripts.")
        print("Please replace 'YOUR_DEEPSEEK_API_KEY' with your actual API key in:")
        print(f"  - {os.path.join(script_dir, 'research_services.py')}")
        print(f"  - {os.path.join(script_dir, 'generate_service_pages.py')}")
        
        user_input = input("Would you like to continue without setting the API key? (y/n): ")
        return user_input.lower() == "y"
    
    print("DeepSeek API key appears to be configured.")
    return True

def main():
    """Run all scripts in sequence to generate service pages."""
    # Make sure directory structure exists
    os.makedirs("public/data", exist_ok=True)
    os.makedirs("public/assets/images/services", exist_ok=True)
    
    # Check and install dependencies
    if not check_dependencies():
        print("Failed to install required dependencies. Exiting.")
        return
    
    # Check API key configuration
    if not check_api_key():
        print("API key not configured. Exiting.")
        return
    
    # 1. Research all services
    print_step("Step 1: Researching roofing services")
    returncode, stdout, stderr = run_command([sys.executable, "scripts/research_services.py"])
    print(stdout)
    if returncode != 0:
        print(f"ERROR: {stderr}")
        return
    
    # 2. Generate service pages with blocks
    print_step("Step 2: Generating service pages with blocks")
    returncode, stdout, stderr = run_command([sys.executable, "scripts/generate_service_pages.py"])
    print(stdout)
    if returncode != 0:
        print(f"ERROR: {stderr}")
        return
    
    # 3. Scrape images for services
    print_step("Step 3: Scraping images for service pages")
    returncode, stdout, stderr = run_command([sys.executable, "scripts/scrape_service_images.py"])
    print(stdout)
    if returncode != 0:
        print(f"ERROR: {stderr}")
        return
    
    print_step("Service Page Generation Complete")
    print("""
All steps completed successfully! You now have:
1. Researched services data in public/data/services_research.json
2. Generated service pages with blocks in public/data/services.json
3. Scraped images for each service block

Next steps:
- Review and edit the services.json file as needed
- If any images failed to download, you can manually add them
- Restart your application to see the changes
    """)

if __name__ == "__main__":
    main() 