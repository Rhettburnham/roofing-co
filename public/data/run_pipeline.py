#!/usr/bin/env python3
"""
Master script to run the complete custom website templating generation pipeline.
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

def run_script(script_path, step_name):
    """Run a Python script and handle errors."""
    try:
        logging.info(f"Running {step_name}: {script_path}")
        result = subprocess.run([sys.executable, script_path], check=True, capture_output=True, text=True)
        logging.info(f"✓ Completed {step_name}")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"✗ Failed {step_name}: {e}")
        return False

def main():
    """Run the complete pipeline."""
    logging.info("STARTING CUSTOM WEBSITE TEMPLATING PIPELINE")
    
    base_dir = Path.cwd()
    if not (base_dir / "step_1").exists():
        logging.error("Run this script from the public/data directory")
        sys.exit(1)
    
    # Step 1: Data Collection
    logging.info("\nSTEP 1: DATA COLLECTION")
    os.chdir("step_1")
    if not run_script("ScrapeReviews.py", "Google Maps scraping"):
        return False
    if not run_script("ScrapeBBB.py", "BBB scraping"):
        return False
    os.chdir("..")
    
    # Step 2: Analysis
    logging.info("\nSTEP 2: DATA ANALYSIS")
    os.chdir("step_2")
    if not run_script("AnalyzeReviews.py", "Review analysis"):
        return False
    try:
        logging.info("Running Color extraction: color_extractor.py (auto-respond 'n')")
        result = subprocess.run(
            [sys.executable, "color_extractor.py"],
            input="n\n",
            text=True,
            capture_output=True,
            check=True
        )
        logging.info("✓ Completed Color extraction")
    except subprocess.CalledProcessError as e:
        logging.error(f"✗ Failed Color extraction: {e}")
        return False
    if not run_script("research_services.py", "Service research"):
        return False
    os.chdir("..")
    
    # Step 3: Content Generation
    logging.info("\nSTEP 3: CONTENT GENERATION")
    os.chdir("step_3")
    if not run_script("generate_about_page.py", "About page generation"):
        return False
    if not run_script("generate_service_jsons.py", "Service content"):
        return False
    if not run_script("clipimage.py", "Image processing"):
        return False
    os.chdir("..")
    
    # Step 4: Final Integration
    logging.info("\nSTEP 4: FINAL INTEGRATION")
    os.chdir("step_4")
    if not run_script("generate_combined_data.py", "Data combination"):
        return False
    os.chdir("..")
    
    logging.info("\n🎉 PIPELINE COMPLETED! Check raw_data/combined_data.json")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 