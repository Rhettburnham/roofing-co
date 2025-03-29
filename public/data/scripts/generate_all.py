#!/usr/bin/env python3
"""
Website Generation - Main Entry Point

This is a simplified wrapper around the more comprehensive website_generation_pipeline.py.
It runs all steps in sequence to generate a complete website for a roofing business.

For more granular control and step-by-step execution, use:
    python website_generation_pipeline.py --help
"""

import os
import sys
import subprocess
from pathlib import Path

def print_step(step: str):
    """Print a formatted step header to the console."""
    print("\n" + "=" * 80)
    print(f"  {step}")
    print("=" * 80 + "\n")

def main():
    """Run the complete website generation pipeline."""
    # Get the directory of the current script
    script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    
    # Path to the more comprehensive pipeline script
    pipeline_script = script_dir / "website_generation_pipeline.py"
    
    # If the pipeline script doesn't exist, inform the user
    if not pipeline_script.exists():
        print(f"Error: The website_generation_pipeline.py script was not found at {pipeline_script}")
        print("Please ensure that you have the full set of scripts in the project directory.")
        return 1
    
    print_step("Starting website generation pipeline")
    
    # Run the pipeline script with the --all flag to run all steps
    result = subprocess.run(
        [sys.executable, str(pipeline_script), "--all"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Print the output from the pipeline script
    print(result.stdout)
    
    if result.returncode != 0:
        print(f"Error running the website generation pipeline: {result.stderr}")
        return result.returncode
    
    print_step("Website generation completed successfully!")
    print("""
Your roofing website has been generated successfully!

The website includes:
- Professional design with colors extracted from your business logo
- Service pages with detailed information about your services
- Reviews from your customers
- Contact information from your BBB profile
- High-quality images for each service

Next steps:
1. Review the generated website
2. Use the editing components to personalize content as needed
3. Deploy the website to your preferred hosting provider

For more detailed control over the generation process, use:
    python scripts/website_generation_pipeline.py --help
    """)
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 