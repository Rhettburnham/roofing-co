#!/usr/bin/env python3
"""
Website Generation Pipeline - Main Orchestrator

This script organizes the complete website generation process into sequential steps.
It allows running the entire process or specific sections based on arguments.

Usage:
    python website_generation_pipeline.py --all               # Run complete process
    python website_generation_pipeline.py --step1             # Run only Step 1
    python website_generation_pipeline.py --from-step 2       # Run from Step 2 to end
    python website_generation_pipeline.py --steps 1,3,5       # Run specific steps
"""

import os
import sys
import argparse
import subprocess
import json
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('website_generation.log'),
        logging.StreamHandler()
    ]
)

# Define paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR
SCRIPTS_DIR = BASE_DIR / 'scripts'
RAW_DATA_DIR = BASE_DIR / 'raw_data'
PROCESSED_DATA_DIR = BASE_DIR / 'processed_data'
ASSETS_DIR = Path('public/assets')
IMAGES_DIR = ASSETS_DIR / 'images'
SERVICES_IMAGES_DIR = IMAGES_DIR / 'services'

# Create necessary directories
os.makedirs(RAW_DATA_DIR, exist_ok=True)
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
os.makedirs(SERVICES_IMAGES_DIR, exist_ok=True)

def run_script(script_path, *args):
    """Run a Python script with arguments and return its output"""
    cmd = [sys.executable, script_path] + list(args)
    logging.info(f"Running: {' '.join(cmd)}")
    
    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    if result.returncode != 0:
        logging.error(f"Script failed with code {result.returncode}")
        logging.error(f"Error: {result.stderr}")
        return False
    
    logging.info(f"Script completed successfully")
    return True

def step1_scrape_business_data(bbb_url):
    """
    Step 1: Scrape BBB profile and Google reviews
    
    - Gets business information from BBB
    - Scrapes Google reviews
    - Downloads business logo
    """
    logging.info("=== STEP 1: SCRAPING BUSINESS DATA ===")
    
    # Scrape BBB profile
    bbb_script = DATA_DIR / 'ScrapeBBB.py'
    if not run_script(bbb_script, bbb_url):
        return False
    
    # Scrape Google reviews
    reviews_script = DATA_DIR / 'ScrapeReviews.py'
    if not run_script(reviews_script):
        return False
    
    return True

def step2_analyze_reviews():
    """
    Step 2: Analyze reviews for sentiment
    
    - Analyzes scraped reviews for sentiment
    - Ranks reviews by positivity
    - Generates sentiment_reviews.json
    """
    logging.info("=== STEP 2: ANALYZING REVIEWS ===")
    
    analyze_script = DATA_DIR / 'AnalyzeReviews.py'
    return run_script(analyze_script)

def step3_extract_colors():
    """
    Step 3: Extract colors from business logo
    
    - Extracts dominant colors from logo
    - Generates color scheme
    - Creates colors_output.json
    """
    logging.info("=== STEP 3: EXTRACTING COLOR SCHEME ===")
    
    color_script = DATA_DIR / 'color_extractor.py'
    return run_script(color_script)

def step4_research_services():
    """
    Step 4: Research services
    
    - Research default and business-specific services
    - Generate detailed information about each service
    - Create services_research.json
    """
    logging.info("=== STEP 4: RESEARCHING SERVICES ===")
    
    research_script = SCRIPTS_DIR / 'research_services.py'
    return run_script(research_script)

def step5_generate_service_pages():
    """
    Step 5: Generate service pages with blocks
    
    - Create blocks for each service page
    - Build services.json with full page definitions
    """
    logging.info("=== STEP 5: GENERATING SERVICE PAGES ===")
    
    service_pages_script = SCRIPTS_DIR / 'generate_service_pages.py'
    return run_script(service_pages_script)

def step6_scrape_service_images():
    """
    Step 6: Scrape images for services
    
    - Download images for each service
    - Update services.json with image paths
    """
    logging.info("=== STEP 6: SCRAPING SERVICE IMAGES ===")
    
    images_script = SCRIPTS_DIR / 'scrape_service_images.py'
    return run_script(images_script)

def step7_generate_combined_data():
    """
    Step 7: Generate combined data for main page
    
    - Combines business data, reviews, and services
    - Creates combined_data.json used for main page sections
    """
    logging.info("=== STEP 7: GENERATING COMBINED DATA ===")
    
    combined_script = SCRIPTS_DIR / 'generate_combined_data.py'
    return run_script(combined_script)

def step8_cleanup_assets():
    """
    Step 8: Cleanup and organize assets
    
    - Optimizes images
    - Removes temporary files
    - Organizes assets into proper directories
    """
    logging.info("=== STEP 8: CLEANING UP ASSETS ===")
    
    cleanup_script = SCRIPTS_DIR / 'cleanup_assets.py'
    return run_script(cleanup_script)

def step9_organize_assets():
    """
    Step 9: Final organization of assets
    
    - Makes final organization of all assets
    - Ensures proper file structure for the website
    """
    logging.info("=== STEP 9: ORGANIZING ASSETS ===")
    
    organize_script = SCRIPTS_DIR / 'organize_assets.py'
    return run_script(organize_script)

def main():
    parser = argparse.ArgumentParser(description='Website Generation Pipeline')
    parser.add_argument('--all', action='store_true', help='Run all steps')
    parser.add_argument('--step1', action='store_true', help='Run step 1: Scrape business data')
    parser.add_argument('--step2', action='store_true', help='Run step 2: Analyze reviews')
    parser.add_argument('--step3', action='store_true', help='Run step 3: Extract colors')
    parser.add_argument('--step4', action='store_true', help='Run step 4: Research services')
    parser.add_argument('--step5', action='store_true', help='Run step 5: Generate service pages')
    parser.add_argument('--step6', action='store_true', help='Run step 6: Scrape service images')
    parser.add_argument('--step7', action='store_true', help='Run step 7: Generate combined data')
    parser.add_argument('--step8', action='store_true', help='Run step 8: Cleanup assets')
    parser.add_argument('--step9', action='store_true', help='Run step 9: Organize assets')
    parser.add_argument('--from-step', type=int, help='Run from specified step to the end')
    parser.add_argument('--steps', type=str, help='Run specific steps (comma-separated, e.g., "1,3,5")')
    parser.add_argument('--bbb-url', type=str, help='BBB profile URL to scrape')
    
    args = parser.parse_args()
    
    # Default BBB URL if not provided
    bbb_url = args.bbb_url or "https://www.bbb.org/us/ga/example-business"
    
    # Determine which steps to run
    steps_to_run = []
    
    if args.all:
        steps_to_run = range(1, 10)  # All steps (1-9)
    elif args.from_step:
        steps_to_run = range(args.from_step, 10)
    elif args.steps:
        steps_to_run = [int(s.strip()) for s in args.steps.split(',')]
    else:
        # If no specific steps are provided, check individual step flags
        if args.step1: steps_to_run.append(1)
        if args.step2: steps_to_run.append(2)
        if args.step3: steps_to_run.append(3)
        if args.step4: steps_to_run.append(4)
        if args.step5: steps_to_run.append(5)
        if args.step6: steps_to_run.append(6)
        if args.step7: steps_to_run.append(7)
        if args.step8: steps_to_run.append(8)
        if args.step9: steps_to_run.append(9)
    
    # If no steps were specified, run all steps
    if not steps_to_run:
        steps_to_run = range(1, 10)
    
    # Run the selected steps
    for step in steps_to_run:
        if step == 1:
            if not step1_scrape_business_data(bbb_url):
                logging.error("Step 1 failed. Stopping pipeline.")
                break
        elif step == 2:
            if not step2_analyze_reviews():
                logging.error("Step 2 failed. Stopping pipeline.")
                break
        elif step == 3:
            if not step3_extract_colors():
                logging.error("Step 3 failed. Stopping pipeline.")
                break
        elif step == 4:
            if not step4_research_services():
                logging.error("Step 4 failed. Stopping pipeline.")
                break
        elif step == 5:
            if not step5_generate_service_pages():
                logging.error("Step 5 failed. Stopping pipeline.")
                break
        elif step == 6:
            if not step6_scrape_service_images():
                logging.error("Step 6 failed. Stopping pipeline.")
                break
        elif step == 7:
            if not step7_generate_combined_data():
                logging.error("Step 7 failed. Stopping pipeline.")
                break
        elif step == 8:
            if not step8_cleanup_assets():
                logging.error("Step 8 failed. Stopping pipeline.")
                break
        elif step == 9:
            if not step9_organize_assets():
                logging.error("Step 9 failed. Stopping pipeline.")
                break
    
    logging.info("Website generation pipeline completed!")
    logging.info("The website is now ready in the public directory.")
    logging.info("The site owner can now use the edit components to personalize the site.")

if __name__ == "__main__":
    main() 