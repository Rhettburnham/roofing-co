#!/usr/bin/env python3
import os
import subprocess
import sys
import time
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
    
    # Check if requirements.txt exists
    requirements_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt")
    
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
    """Check if the DeepSeek API key has been set in the .env.deepseek file."""
    print_step("Checking API key configuration")
    
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env.deepseek")
    
    if not os.path.exists(env_path):
        print("Error: .env.deepseek file not found in the script directory.")
        return False
    
    with open(env_path, "r") as f:
        content = f.read()
    
    if "DEEPSEEK_API_KEY=" not in content or "DEEPSEEK_API_KEY=YOUR_API_KEY" in content:
        print("Warning: DeepSeek API key not properly set in .env.deepseek file.")
        print("Please ensure you have a valid API key in the .env.deepseek file.")
        
        user_input = input("Would you like to continue without a valid API key? (y/n): ")
        return user_input.lower() == "y"
    
    print("DeepSeek API key appears to be configured.")
    return True

def main():
    """Run all scripts in sequence to generate service pages."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Make sure directory structure exists
    os.makedirs("public/data", exist_ok=True)
    os.makedirs("public/assets/images/services/residential", exist_ok=True)
    os.makedirs("public/assets/images/services/commercial", exist_ok=True)
    
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
    service_research_path = os.path.join(script_dir, "service_research.py")
    returncode, stdout, stderr = run_command([sys.executable, service_research_path])
    print(stdout)
    if returncode != 0:
        print(f"ERROR: {stderr}")
        return
    
    # 2. Generate service pages with blocks
    print_step("Step 2: Generating service pages with blocks")
    service_generator_path = os.path.join(script_dir, "service_generator.py")
    returncode, stdout, stderr = run_command([sys.executable, service_generator_path])
    print(stdout)
    if returncode != 0:
        print(f"ERROR: {stderr}")
        return
    
    # 3. Scrape images for services
    print_step("Step 3: Scraping images for service pages")
    service_image_scraper_path = os.path.join(script_dir, "service_image_scraper.py")
    returncode, stdout, stderr = run_command([sys.executable, service_image_scraper_path])
    print(stdout)
    if returncode != 0:
        print(f"ERROR: {stderr}")
        return
    
    # 4. Generate the all-blocks service page for editing
    print_step("Step 4: Generating all-blocks service page for editing")
    generate_all_blocks_path = os.path.join(script_dir, "generate_all_blocks_page.py")
    
    # Check if the file exists
    if os.path.exists(generate_all_blocks_path):
        returncode, stdout, stderr = run_command([sys.executable, generate_all_blocks_path])
        print(stdout)
        if returncode != 0:
            print(f"ERROR: {stderr}")
            # Don't return here, as this is optional
    else:
        # Create the all-blocks script on the fly
        print("All-blocks generator not found. Creating it...")
        create_all_blocks_script()
        returncode, stdout, stderr = run_command([sys.executable, generate_all_blocks_path])
        print(stdout)
    
    print_step("Service Page Generation Complete")
    print("""
All steps completed successfully! You now have:
1. Researched services data in public/data/services_research.json
2. Generated service pages with blocks in public/data/services.json
3. Scraped images for each service block
4. Created an all-blocks page for easy editing at /all-service-blocks

Next steps:
- Review and edit the services.json file as needed
- Visit the all-blocks page to see and edit all service blocks in one place
- If any images failed to download, you can manually add them
- Restart your application to see the changes
    """)

def create_all_blocks_script():
    """Create the script to generate the all-blocks service page."""
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "generate_all_blocks_page.py")
    
    script_content = """#!/usr/bin/env python3
import json
import os

def main():
    \"\"\"Generate a special service page that includes all blocks from all services.\"\"\"
    try:
        # Load the services data
        with open("public/data/services.json", "r") as f:
            services_data = json.load(f)
        
        # Create an all-blocks service
        all_blocks = []
        
        # Add a title block
        all_blocks.append({
            "blockName": "HeroBlock",
            "config": {
                "title": "All Service Blocks",
                "subtitle": "This page shows all blocks from all services for easy editing",
                "backgroundOpacity": 0.5,
                "buttonText": "Return Home",
                "buttonUrl": "/"
            }
        })
        
        # Add a separator block
        all_blocks.append({
            "blockName": "HeaderBannerBlock",
            "config": {
                "title": "Residential Service Blocks",
                "subtitle": "All blocks from residential services",
                "textAlign": "center"
            }
        })
        
        # Add all residential blocks
        for service in services_data["residential"]:
            # Add a service title block
            all_blocks.append({
                "blockName": "HeaderBannerBlock",
                "config": {
                    "title": service["name"],
                    "subtitle": f"Service ID: {service['id']}",
                    "textAlign": "left"
                }
            })
            
            # Add all blocks from this service
            for block in service["blocks"]:
                all_blocks.append(block)
        
        # Add a separator block
        all_blocks.append({
            "blockName": "HeaderBannerBlock",
            "config": {
                "title": "Commercial Service Blocks",
                "subtitle": "All blocks from commercial services",
                "textAlign": "center"
            }
        })
        
        # Add all commercial blocks
        for service in services_data["commercial"]:
            # Add a service title block
            all_blocks.append({
                "blockName": "HeaderBannerBlock",
                "config": {
                    "title": service["name"],
                    "subtitle": f"Service ID: {service['id']}",
                    "textAlign": "left"
                }
            })
            
            # Add all blocks from this service
            for block in service["blocks"]:
                all_blocks.append(block)
        
        # Create the all-blocks service
        all_blocks_service = {
            "id": "all-blocks",
            "name": "All Service Blocks",
            "slug": "all-service-blocks",
            "category": "special",
            "blocks": all_blocks
        }
        
        # Save the all-blocks service to a file
        with open("public/data/all_blocks_service.json", "w") as f:
            json.dump(all_blocks_service, f, indent=2)
        
        print("All-blocks service page generated and saved to public/data/all_blocks_service.json")
        print("To view this page, add a route for '/all-service-blocks' in your App.jsx file.")
        
    except FileNotFoundError:
        print("Error: services.json not found. Run service_generator.py first.")
    except Exception as e:
        print(f"Error generating all-blocks service page: {e}")

if __name__ == "__main__":
    main()
"""
    
    with open(script_path, "w") as f:
        f.write(script_content)
    
    # Make it executable
    os.chmod(script_path, 0o755)
    
    print(f"Created all-blocks generator script at {script_path}")

if __name__ == "__main__":
    main() 