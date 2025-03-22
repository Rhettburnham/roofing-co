#!/usr/bin/env python3

import json
import os
import logging
import sys
from typing import Dict, Any, List, Optional
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Import DeepSeek utilities for business analysis
try:
    from deepseek_utils import analyze_business_data
    HAS_DEEPSEEK = True
    logger.info("DeepSeek utilities imported successfully")
except ImportError:
    logger.warning("DeepSeek utilities not available. Enhanced analysis will be disabled.")
    HAS_DEEPSEEK = False

def load_json(file_path: str) -> Dict[str, Any]:
    """
    Load JSON data from a file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Dict: Loaded JSON data or empty dict if file not found
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            logger.info(f"Successfully loaded {file_path}")
            return data
    except FileNotFoundError:
        logger.warning(f"Error: {file_path} does not exist.")
        return {}
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON from {file_path}: {e}")
        return {}

def enhance_combined_data(bbb_data: Dict[str, Any], reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Enhance combined data with additional insights using DeepSeek analysis.
    
    Args:
        bbb_data: BBB profile data
        reviews: List of review data
        
    Returns:
        Dict: Enhanced combined data
    """
    # Process BBB data for base content
    business_name = bbb_data.get('business_name', 'Roofing Company')
    years_in_business = bbb_data.get('years_in_business', 'Unknown')
    
    try:
        # Try to extract just the number from the years in business string
        if isinstance(years_in_business, str) and 'Years in Business:' in years_in_business:
            years_number = years_in_business.split('Years in Business:')[1].strip()
            years_number = ''.join(filter(str.isdigit, years_number))
            if years_number:
                years_in_business_value = int(years_number)
            else:
                years_in_business_value = 5  # Default value
        elif isinstance(years_in_business, (int, float)):
            years_in_business_value = int(years_in_business)
        else:
            years_in_business_value = 5  # Default value
    except Exception:
        years_in_business_value = 5  # Default value
    
    # Basic gallery and social media sections (empty placeholders to be filled)
    gallery_section = {
        "title": "Our Project Gallery",
        "description": f"See our quality work throughout {bbb_data.get('address', 'the area')}",
        "images": []
    }
    
    social_media_section = {
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "youtube": "",
        "linkedin": ""
    }
    
    # Create warranty and financing sections
    warranty_section = {
        "title": "Our Warranty",
        "description": f"At {business_name}, we stand behind our work with industry-leading warranties.",
        "warranties": [
            {
                "name": "Workmanship Warranty",
                "duration": f"{min(years_in_business_value, 10)} Years",
                "description": "Covers any installation defects or issues related to our craftsmanship."
            },
            {
                "name": "Manufacturer's Warranty",
                "duration": "25-50 Years",
                "description": "Extended coverage on materials from top manufacturers we partner with."
            }
        ]
    }
    
    financing_section = {
        "title": "Financing Options",
        "description": "We offer flexible financing options to help you get the roof you need today.",
        "options": [
            {
                "name": "0% Interest Financing",
                "duration": "12 Months",
                "description": "For qualified customers on approved credit."
            },
            {
                "name": "Low Monthly Payments",
                "description": "Spread the cost of your new roof over time with affordable monthly payments."
            }
        ],
        "disclaimer": "Subject to credit approval. Ask for details."
    }
    
    emergency_section = {
        "title": "24/7 Emergency Services",
        "description": "Don't wait when you have a roofing emergency. We're here to help 24/7.",
        "phone": bbb_data.get('telephone', ''),
        "response_time": "Within 24 Hours",
        "available": True
    }
    
    # Perform enhanced analysis with DeepSeek if available
    business_insights = {}
    if HAS_DEEPSEEK:
        logger.info("Performing enhanced business analysis with DeepSeek...")
        business_insights = analyze_business_data(bbb_data, reviews)
        logger.info("Enhanced analysis completed")
        
        # Use insights to enhance sections
        if business_insights:
            # Update gallery description with personality
            personality_traits = business_insights.get('businessPersonality', [])
            if personality_traits and len(personality_traits) > 1:
                personality_str = ", ".join(personality_traits[:-1]) + " and " + personality_traits[-1]
                gallery_section["description"] = f"See how our {personality_str} approach creates lasting results for our customers."
            
            # Add USPs to a new highlight section
            usps = business_insights.get('uniqueSellingPropositions', [])
            
            # Update warranty based on service guarantees
            guarantees = business_insights.get('serviceGuarantees', [])
            if guarantees and len(guarantees) > 0:
                warranty_section["warranties"] = [
                    {"name": guarantee, "duration": f"{min(years_in_business_value, 10)} Years", "description": ""}
                    for guarantee in guarantees[:3]
                ]
    
    # Create the enhanced combined data
    enhanced_data = {
        "gallery": gallery_section,
        "socialMedia": social_media_section,
        "warranty": warranty_section,
        "financing": financing_section,
        "emergency": emergency_section,
        "businessInsights": business_insights
    }
    
    return enhanced_data

def combine_json_files(input_directory: str, output_file: str, use_deepseek: bool = True) -> None:
    """
    Combine multiple JSON files into a single enriched JSON file.
    
    Args:
        input_directory: Directory containing input JSON files
        output_file: Path to write the combined JSON file
        use_deepseek: Whether to use DeepSeek for enhanced analysis
    """
    combined_data = {}

    # Define the mapping of JSON filenames to their keys in the combined JSON
    json_files = {
        'bbb_profile_data.json': 'bbbProfileData',
        'colors_output.json': 'colorsOutput',
        'richText.json': 'richText',
        'sentiment_reviews.json': 'sentimentReviews'
    }

    # Load base data files
    bbb_data = None
    reviews = None
    
    for filename, key in json_files.items():
        file_path = os.path.join(input_directory, filename)
        data = load_json(file_path)
        combined_data[key] = data
        
        # Save references to BBB and review data for enhancement
        if key == 'bbbProfileData':
            bbb_data = data
        elif key == 'sentimentReviews':
            reviews = data

    # Add enhanced data if DeepSeek is available and use_deepseek is enabled
    if use_deepseek and HAS_DEEPSEEK and bbb_data:
        logger.info("Adding enhanced data using DeepSeek analysis")
        enhanced_data = enhance_combined_data(bbb_data, reviews or [])
        combined_data['enhancedData'] = enhanced_data
    else:
        logger.info("Skipping enhanced data addition - DeepSeek not available or disabled")

    # Write the combined data to the output file
    try:
        with open(output_file, 'w', encoding='utf-8') as outfile:
            json.dump(combined_data, outfile, indent=4)
        logger.info(f"Successfully combined JSON files into {output_file}")
    except IOError as e:
        logger.error(f"Error writing to {output_file}: {e}")

def main():
    # Get the script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Navigate to parent directory (data folder)
    data_dir = os.path.dirname(script_dir)
    processed_data_dir = os.path.join(data_dir, "processed_data")
    
    # Set up input and output paths
    input_dir = processed_data_dir
    output_file = os.path.join(processed_data_dir, "combined_data.json")
    
    # Check if we should use DeepSeek (command line arg)
    use_deepseek = True
    if len(sys.argv) > 1 and sys.argv[1].lower() == 'nods':
        use_deepseek = False
        logger.info("DeepSeek analysis disabled via command line arg")
    
    # Run the combination process
    combine_json_files(input_dir, output_file, use_deepseek)
    
    # Copy to main data directory for immediate use
    main_output_file = os.path.join(data_dir, "combined_data.json")
    try:
        with open(output_file, 'r', encoding='utf-8') as src:
            with open(main_output_file, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        logger.info(f"Copied combined data to {main_output_file}")
    except Exception as e:
        logger.error(f"Error copying combined data to main directory: {e}")

if __name__ == "__main__":
    main()
