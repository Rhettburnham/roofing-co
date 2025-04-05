#!/usr/bin/env python3
import os
import json
import shutil
import logging
import re
from collections import defaultdict
from deepseek_utils import query_deepseek_api

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def load_mapping_file():
    """Load the comprehensive filename mapping JSON file"""
    try:
        mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'comprehensive_filename_mapping.json')
        if not os.path.exists(mapping_file):
            logging.error(f"Mapping file not found: {mapping_file}")
            return None
        
        with open(mapping_file, 'r', encoding='utf-8') as f:
            mapping_data = json.load(f)
        
        logging.info(f"Loaded mapping data for {len(mapping_data)} images")
        return mapping_data
    except Exception as e:
        logging.error(f"Error loading mapping file: {str(e)}")
        return None

def get_product_categories(mapping_data):
    """Use DeepSeek API to categorize products into types"""
    # Extract unique product descriptions
    product_descriptions = []
    product_lookup = {}
    
    for original_filename, data in mapping_data.items():
        metadata = data.get('metadata', {})
        brand = metadata.get('brand', 'Unknown')
        product = metadata.get('product', 'Unknown')
        
        # Only add unique product descriptions
        product_desc = f"{brand} - {product}"
        if product_desc not in product_descriptions:
            product_descriptions.append(product_desc)
        
        # Create lookup to map back to filenames
        product_lookup[product_desc] = product_lookup.get(product_desc, []) + [original_filename]
    
    # Prepare prompt for DeepSeek
    prompt = """I have a collection of roofing product descriptions that I need to categorize into specific product types.
Please analyze each product description and assign it to one of the following categories:
1. "Shingles" - For any asphalt, architectural, laminate, or 3-tab shingles
2. "Metal_Roofing" - For metal panels, sheets, or metal roofing components
3. "Underlayment" - For felt, synthetic underlayment, or barrier materials
4. "Flashing" - For step flashing, roof flashing or similar sealing components
5. "Accessories" - For ridge caps, starter strips, vents, or other roofing accessories
6. "Panels" - For non-metal roof panels like polycarbonate or PVC
7. "Sealants" - For roof sealants, coatings, patch materials, or adhesives

For each product, return the category it belongs to. Format your response as a JSON object where the key is the exact product description and the value is the category name.

Here are the product descriptions:
"""
    
    # Add product descriptions to the prompt (limit to 20 at a time to avoid token limits)
    batch_size = 20
    all_categories = {}
    
    for i in range(0, len(product_descriptions), batch_size):
        batch = product_descriptions[i:i+batch_size]
        batch_prompt = prompt
        
        for desc in batch:
            batch_prompt += f"\n- {desc}"
        
        logging.info(f"Requesting categorization for batch {i//batch_size + 1} ({len(batch)} products)")
        response = query_deepseek_api(batch_prompt)
        
        if response:
            try:
                # Try to extract JSON using regex first
                json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
                if json_match:
                    categories = json.loads(json_match.group(1))
                else:
                    # Try to extract as plain JSON
                    categories = json.loads(response)
                
                all_categories.update(categories)
                logging.info(f"Successfully categorized batch {i//batch_size + 1}")
            except Exception as e:
                logging.error(f"Error parsing API response for batch {i//batch_size + 1}: {str(e)}")
                logging.debug(response)
                # Apply fallback categorization for this batch
                for desc in batch:
                    all_categories[desc] = categorize_by_keywords(desc)
        else:
            logging.error(f"Failed to get response for batch {i//batch_size + 1}")
            # Apply fallback categorization for this batch
            for desc in batch:
                all_categories[desc] = categorize_by_keywords(desc)
    
    # Convert to filename-to-category mapping
    filename_categories = {}
    for desc, category in all_categories.items():
        for filename in product_lookup.get(desc, []):
            filename_categories[filename] = category
    
    logging.info(f"Categorized {len(filename_categories)} files into {len(set(all_categories.values()))} categories")
    return filename_categories

def categorize_by_keywords(product_desc):
    """Fallback categorization using keywords"""
    lower_desc = product_desc.lower()
    
    if any(keyword in lower_desc for keyword in ["shingle", "architectural", "laminate", "3-tab", "tab"]):
        return "Shingles"
    elif any(keyword in lower_desc for keyword in ["metal", "steel", "galvanized", "aluminum"]):
        return "Metal_Roofing"
    elif any(keyword in lower_desc for keyword in ["felt", "underlayment", "synthetic", "barrier", "feltbuster", "stormguard", "weatherwatch"]):
        return "Underlayment"
    elif any(keyword in lower_desc for keyword in ["flashing", "step", "valley", "drip edge"]):
        return "Flashing"
    elif any(keyword in lower_desc for keyword in ["ridge", "starter", "cap", "seal-a-", "vent", "pro-start"]):
        return "Accessories"
    elif any(keyword in lower_desc for keyword in ["panel", "corrugated", "polycarbonate", "pvc"]):
        return "Panels"
    elif any(keyword in lower_desc for keyword in ["sealant", "coating", "patch", "adhesive", "wet patch"]):
        return "Sealants"
    else:
        return "Other"

def organize_files_by_category(mapping_data, filename_categories):
    """Create folders for each category and copy files into them"""
    try:
        # Define image directory
        image_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'raw_data', 'shingles')
        if not os.path.exists(image_dir):
            logging.error(f"Image directory not found: {image_dir}")
            return False
        
        # Create organized directory
        organized_dir = os.path.join(image_dir, 'by_type')
        os.makedirs(organized_dir, exist_ok=True)
        
        # Group files by category
        category_files = defaultdict(list)
        for filename, category in filename_categories.items():
            category_files[category].append(filename)
        
        # Create category directories and copy files
        files_copied = 0
        
        for category, files in category_files.items():
            # Create category directory
            category_dir = os.path.join(organized_dir, category)
            os.makedirs(category_dir, exist_ok=True)
            
            # Copy files to category directory
            for original_filename in files:
                if original_filename in mapping_data:
                    new_filename = mapping_data[original_filename].get('new_filename')
                    
                    if new_filename:
                        # Source is the original file with the new renamed filename
                        source = os.path.join(image_dir, new_filename)
                        # Destination is in the category folder
                        dest = os.path.join(category_dir, new_filename)
                        
                        # Copy the file if it exists
                        if os.path.exists(source):
                            shutil.copy2(source, dest)
                            files_copied += 1
                        else:
                            logging.warning(f"File not found: {source}")
        
        # Print summary
        logging.info("Files organized by category:")
        for category, files in category_files.items():
            logging.info(f"  {category}: {len(files)} files")
        
        logging.info(f"Copied {files_copied} files to category folders")
        
        # Generate metadata file
        category_metadata = {category: [] for category in category_files.keys()}
        
        for category, files in category_files.items():
            for original_filename in files:
                if original_filename in mapping_data:
                    file_data = mapping_data[original_filename]
                    metadata = file_data.get('metadata', {})
                    
                    category_metadata[category].append({
                        'original_filename': original_filename,
                        'new_filename': file_data.get('new_filename'),
                        'brand': metadata.get('brand', 'Unknown'),
                        'product': metadata.get('product', 'Unknown'),
                        'model_number': metadata.get('model_number', 'Unknown')
                    })
        
        # Save the metadata file
        metadata_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shingle_type_categories.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(category_metadata, f, indent=2)
            
        logging.info(f"Saved category metadata to {metadata_file}")
        return True
        
    except Exception as e:
        logging.error(f"Error organizing files: {str(e)}")
        return False

def main():
    """Main function to organize shingle images by product type"""
    logging.info("Starting shingle organization by product type")
    
    # Load the mapping file
    mapping_data = load_mapping_file()
    if not mapping_data:
        logging.error("Failed to load mapping data")
        return
    
    # Get product categories
    filename_categories = get_product_categories(mapping_data)
    
    # Organize files by category
    if organize_files_by_category(mapping_data, filename_categories):
        logging.info("Successfully organized files by product type")
    else:
        logging.error("Failed to organize files by product type")
    
    logging.info("Shingle organization process completed")

if __name__ == "__main__":
    main() 