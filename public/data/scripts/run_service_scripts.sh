#!/bin/bash

# Directory of this script
SCRIPT_DIR=$(dirname "$0")

# Change to the script directory
cd "$SCRIPT_DIR"

# Clear screen
clear

echo "=================================="
echo "  WEBSITE CONTENT GENERATOR"
echo "=================================="
echo ""
echo "This script will generate all website content:"
echo "1. Research services"
echo "2. Generate service pages"
echo "3. Find service images"
echo "4. Generate About page"
echo "5. Generate All-Blocks showcase page"
echo ""
echo "Press ENTER to continue or CTRL+C to cancel..."
read -r

# Step 1: Research services
echo ""
echo "==========================================="
echo "  STEP 1: RESEARCHING SERVICES"
echo "==========================================="
echo "Running service researcher..."
python3 research_services.py
echo "Service research completed."

# Step 2: Generate service pages
echo ""
echo "==========================================="
echo "  STEP 2: GENERATING SERVICE PAGES"
echo "==========================================="
echo "Running service page generator..."
python3 generate_services.py
echo "Service page generation completed."

# Step 3: Find images
echo ""
echo "==========================================="
echo "  STEP 3: FINDING SERVICE IMAGES"
echo "==========================================="
echo "Running image finder..."
python3 find_service_images.py
echo "Image finding completed."

# Step 4: Generate About page
echo ""
echo "==========================================="
echo "  STEP 4: GENERATING ABOUT PAGE"
echo "==========================================="
echo "Running about page generator..."
python3 generate_about_page.py
echo "About page generation completed."

# Step 5: Generate All-Blocks page
echo ""
echo "==========================================="
echo "  STEP 5: GENERATING ALL-BLOCKS PAGE"
echo "==========================================="
echo "Running all-blocks page generator..."
python3 generate_all_blocks_page.py
echo "All-blocks page generation completed."

echo ""
echo "=================================="
echo "  ALL SCRIPTS COMPLETED"
echo "=================================="
echo ""
echo "The website content has been updated successfully."
echo "You can now view and edit it in the OneForm editor."
echo "" 