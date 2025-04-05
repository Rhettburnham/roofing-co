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

def categorize_by_keywords(product_name):
    """Categorize product by keywords in its name"""
    lower_name = product_name.lower()
    
    if any(keyword in lower_name for keyword in ["shingle", "architectural", "laminate", "3-tab", "tab", "timberline", "oakridge", "hdz", "duration"]):
        return "Shingles"
    elif any(keyword in lower_name for keyword in ["metal", "steel", "galvanized", "aluminum"]):
        return "Metal_Roofing"
    elif any(keyword in lower_name for keyword in ["felt", "underlayment", "synthetic", "barrier", "feltbuster", "stormguard", "weatherwatch"]):
        return "Underlayment"
    elif any(keyword in lower_name for keyword in ["flashing", "step", "valley", "drip edge"]):
        return "Flashing"
    elif any(keyword in lower_name for keyword in ["ridge", "starter", "cap", "seal-a-", "vent", "pro-start"]):
        return "Accessories"
    elif any(keyword in lower_name for keyword in ["panel", "corrugated", "polycarbonate", "pvc"]):
        return "Panels"
    elif any(keyword in lower_name for keyword in ["sealant", "coating", "patch", "adhesive", "wet patch"]):
        return "Sealants"
    else:
        return "Other"

def get_deepseek_categories(product_brands_and_names):
    """Use DeepSeek API to categorize products"""
    # Create a batch to send to DeepSeek (limit to avoid token issues)
    prompt = """I need you to categorize these roofing products into the following categories:
- Shingles: For any asphalt, architectural, laminate, or 3-tab shingles
- Metal_Roofing: For metal panels, sheets, or metal roofing components
- Underlayment: For felt, synthetic underlayment, or barrier materials
- Flashing: For step flashing, roof flashing or similar sealing components
- Accessories: For ridge caps, starter strips, vents, or other roofing accessories
- Panels: For non-metal roof panels like polycarbonate or PVC
- Sealants: For roof sealants, coatings, patch materials, or adhesives

Return your response as a simple JSON object with product descriptions as keys and category names as values.
Products to categorize:
"""

    # Add products to the prompt
    for product_info in product_brands_and_names:
        prompt += f"\n- {product_info}"
    
    # Get response from DeepSeek
    logging.info(f"Requesting DeepSeek categorization for {len(product_brands_and_names)} products")
    response = query_deepseek_api(prompt)
    
    if not response:
        logging.error("Failed to get response from DeepSeek")
        return {}
    
    # Extract JSON from response
    try:
        # First try to parse JSON within code blocks
        json_match = re.search(r'```(?:json)?\n(.*?)\n```', response, re.DOTALL)
        if json_match:
            categories = json.loads(json_match.group(1))
        else:
            # Try to parse the entire response as JSON
            categories = json.loads(response)
        
        logging.info(f"Successfully got categories for {len(categories)} products from DeepSeek")
        return categories
    except Exception as e:
        logging.error(f"Error parsing DeepSeek response: {str(e)}")
        logging.debug(f"Response: {response}")
        return {}

def get_unique_products(mapping_data):
    """Get unique product descriptions from the mapping data"""
    unique_products = set()
    product_to_files = defaultdict(list)
    
    for filename, data in mapping_data.items():
        metadata = data.get('metadata', {})
        brand = metadata.get('brand', 'Unknown')
        product = metadata.get('product', 'Unknown')
        
        product_desc = f"{brand} - {product}"
        unique_products.add(product_desc)
        product_to_files[product_desc].append(filename)
    
    return list(unique_products), product_to_files

def main():
    try:
        # Define paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        mapping_file = os.path.join(script_dir, 'comprehensive_filename_mapping.json')
        image_dir = os.path.join(os.path.dirname(os.path.dirname(script_dir)), 'raw_data', 'shingles')
        organized_dir = os.path.join(image_dir, 'by_type')
        
        # Ensure directories exist
        os.makedirs(organized_dir, exist_ok=True)
        
        # Load mapping file
        with open(mapping_file, 'r', encoding='utf-8') as f:
            mapping_data = json.load(f)
        
        logging.info(f"Loaded mapping data for {len(mapping_data)} images")
        
        # Get unique product descriptions
        unique_products, product_to_files = get_unique_products(mapping_data)
        logging.info(f"Found {len(unique_products)} unique products")
        
        # Use DeepSeek for smart categorization
        use_deepseek = True
        deepseek_categories = {}
        
        if use_deepseek:
            # Use batches to avoid token limits
            batch_size = 30
            for i in range(0, len(unique_products), batch_size):
                batch = unique_products[i:i+batch_size]
                batch_categories = get_deepseek_categories(batch)
                deepseek_categories.update(batch_categories)
        
        # Categorize files
        category_files = defaultdict(list)
        
        for original_filename, data in mapping_data.items():
            metadata = data.get('metadata', {})
            brand = metadata.get('brand', 'Unknown')
            product = metadata.get('product', 'Unknown')
            new_filename = data.get('new_filename', '')
            
            # Use either DeepSeek categorization or keyword-based fallback
            product_desc = f"{brand} - {product}"
            if product_desc in deepseek_categories:
                category = deepseek_categories[product_desc]
                source = "DeepSeek"
            else:
                category = categorize_by_keywords(product)
                source = "Keywords"
            
            # Add to category with tracking info
            category_files[category].append((original_filename, new_filename, source))
        
        # Create category directories and copy files
        files_copied = 0
        deepseek_count = 0
        keyword_count = 0
        
        for category, files in category_files.items():
            category_dir = os.path.join(organized_dir, category)
            os.makedirs(category_dir, exist_ok=True)
            
            for original_filename, new_filename, source in files:
                if new_filename:
                    source_path = os.path.join(image_dir, new_filename)
                    dest_path = os.path.join(category_dir, new_filename)
                    
                    if os.path.exists(source_path):
                        shutil.copy2(source_path, dest_path)
                        files_copied += 1
                        
                        if source == "DeepSeek":
                            deepseek_count += 1
                        else:
                            keyword_count += 1
        
        # Generate metadata file
        category_metadata = {}
        for category, files in category_files.items():
            category_metadata[category] = []
            
            for original_filename, new_filename, source in files:
                if original_filename in mapping_data:
                    file_data = mapping_data[original_filename]
                    metadata = file_data.get('metadata', {})
                    
                    category_metadata[category].append({
                        'original_filename': original_filename,
                        'new_filename': new_filename,
                        'brand': metadata.get('brand', 'Unknown'),
                        'product': metadata.get('product', 'Unknown'),
                        'model_number': metadata.get('model_number', 'Unknown'),
                        'categorization_source': source
                    })
        
        # Save the metadata file
        metadata_file = os.path.join(script_dir, 'shingle_categories.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(category_metadata, f, indent=2)
        
        logging.info(f"Saved category metadata to {metadata_file}")
        logging.info(f"Copied {files_copied} files to category folders")
        logging.info(f"DeepSeek categorized: {deepseek_count}, Keyword categorized: {keyword_count}")
        logging.info("Categorization summary:")
        for category, files in category_files.items():
            logging.info(f"  {category}: {len(files)} files")
        
    except Exception as e:
        logging.error(f"Error organizing shingles: {str(e)}")

if __name__ == "__main__":
    main() 