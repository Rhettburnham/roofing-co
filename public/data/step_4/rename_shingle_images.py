#!/usr/bin/env python
import os
import json
import re
import logging
import shutil
from deepseek_utils import query_deepseek_api

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def load_metadata():
    """Load the metadata JSON file"""
    try:
        # Load metadata file
        metadata_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shingle_images_metadata.json')
        if not os.path.exists(metadata_file):
            logging.error(f"Metadata file not found: {metadata_file}")
            return None
        
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        logging.info(f"Loaded metadata for {len(metadata)} images")
        return metadata
    except Exception as e:
        logging.error(f"Error loading metadata: {str(e)}")
        return None

def remove_duplicate_models(metadata):
    """Remove duplicate model numbers from metadata to ensure unique products"""
    try:
        if not metadata:
            logging.error("No metadata provided")
            return None
            
        # Create a dictionary to track unique model numbers
        unique_models = {}
        duplicate_indices = set()
        
        # First, identify duplicates
        for i, item in enumerate(metadata):
            model_number = item.get('model_number')
            if not model_number or model_number == 'Unknown':
                continue
                
            if model_number in unique_models:
                # This is a duplicate model
                duplicate_indices.add(i)
                logging.info(f"Found duplicate model number: {model_number}")
            else:
                unique_models[model_number] = i
                
        # Create new list without duplicates
        cleaned_metadata = [item for i, item in enumerate(metadata) if i not in duplicate_indices]
        
        logging.info(f"Removed {len(duplicate_indices)} duplicate model numbers")
        logging.info(f"Cleaned metadata contains {len(cleaned_metadata)} unique products")
        
        return cleaned_metadata
    except Exception as e:
        logging.error(f"Error removing duplicate models: {str(e)}")
        return metadata

def generate_simplified_names(metadata):
    """Use DeepSeek to generate simplified names for shingle images"""
    try:
        simplified_metadata = []
        unique_products = {}
        
        # First, extract unique products to reduce the number of API calls
        for item in metadata:
            product_key = f"{item['brand']}_{item['product']}"
            model_key = item.get('model_number', 'Unknown')
            if model_key != 'Unknown':
                product_key = f"{product_key}_{model_key}"
                
            if product_key not in unique_products:
                unique_products[product_key] = {
                    'brand': item['brand'],
                    'product': item['product'],
                    'type': item.get('type', 'main'),
                    'model_number': item.get('model_number', 'Unknown'),
                    'colors': set()
                }
            
            if 'color' in item and item['color'] != 'default':
                unique_products[product_key]['colors'].add(item['color'])
        
        logging.info(f"Found {len(unique_products)} unique products to rename")
        
        # Prepare the prompt for DeepSeek
        prompt = """You are an expert at creating concise, standardized filenames for roofing shingle products. 
I need you to create simplified names for each product based on the brand, product description, model number, and colors.

For each product, please provide:
1. A simplified product name in the format "brand_type_product_model" where:
   - brand: Keep the brand name short (e.g., "Owens" instead of "Owens Corning")
   - type: Extract the main type (e.g., "Laminate", "Architectural", "Duration", etc.)
   - product: Include one distinctive feature or name
   - model: Include a shortened version of the model number (only if available)
2. For each color, create a standardized color name (1-2 words maximum)

Output should be formatted as JSON with the following structure:
{
  "product_key": {
    "simplified_name": "brand_type_product_model",
    "colors": {
      "original_color_name": "simplified_color"
    }
  }
}

Here are the products to rename:
"""
        
        # Add product details to prompt
        for key, product in unique_products.items():
            model_info = f"\n  Model Number: {product['model_number']}" if product['model_number'] != 'Unknown' else ""
            prompt += f"\n- Brand: {product['brand']}\n  Product: {product['product']}{model_info}\n  Colors: {', '.join(product['colors'])}\n"
        
        # Get response from DeepSeek using query_deepseek_api
        logging.info("Requesting simplified names from DeepSeek...")
        response = query_deepseek_api(prompt)
        
        if not response:
            logging.error("Failed to get response from DeepSeek")
            return None
        
        logging.info("Received response from DeepSeek")
        
        # Extract JSON from the response
        json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
        if not json_match:
            json_match = re.search(r'{.*}', response, re.DOTALL)
        
        if json_match:
            try:
                naming_data = json.loads(json_match.group(1) if '```json' in response else json_match.group(0))
                
                # Process the naming data
                for item in metadata:
                    product_key = f"{item['brand']}_{item['product']}"
                    model_key = item.get('model_number', 'Unknown')
                    if model_key != 'Unknown':
                        product_key = f"{product_key}_{model_key}"
                    
                    if product_key in naming_data:
                        simplified_name = naming_data[product_key]['simplified_name']
                        
                        if item.get('color', 'default') == 'default':
                            new_filename = f"{simplified_name}.jpg"
                        else:
                            color = item.get('color', 'default')
                            simplified_color = naming_data[product_key]['colors'].get(color, color)
                            new_filename = f"{simplified_name}_{simplified_color}.jpg"
                        
                        # Add to simplified metadata
                        simplified_metadata.append({
                            'original_filename': item['original_filename'],
                            'new_filename': new_filename,
                            'index': item.get('index', 0),
                            'model_number': model_key
                        })
                    else:
                        # If not found in naming data, create a basic simplified name
                        brand_short = item['brand'].split()[0]
                        product_short = '_'.join(item['product'].split()[:2])
                        
                        # Add model number if available
                        model_suffix = f"_{model_key}" if model_key != 'Unknown' else ""
                        
                        if item.get('color', 'default') == 'default':
                            new_filename = f"{brand_short}_{product_short}{model_suffix}.jpg"
                        else:
                            color = item.get('color', 'default')
                            new_filename = f"{brand_short}_{product_short}{model_suffix}_{color}.jpg"
                        
                        # Add to simplified metadata
                        simplified_metadata.append({
                            'original_filename': item['original_filename'],
                            'new_filename': new_filename,
                            'index': item.get('index', 0),
                            'model_number': model_key
                        })
                
                logging.info(f"Generated simplified names for {len(simplified_metadata)} images")
                return simplified_metadata
                
            except json.JSONDecodeError:
                logging.error("Failed to parse JSON from DeepSeek response")
        else:
            logging.error("No JSON found in DeepSeek response")
        
        # Fallback if DeepSeek fails
        logging.info("Using fallback naming convention")
        for item in metadata:
            brand_short = item['brand'].split()[0]
            
            # Extract type from product description
            product_words = item['product'].split()
            product_type = next((word for word in product_words if word in ['Laminate', 'Architectural', 'Duration', 'HDZ', 'Natural', 'Storm']), 'Shingle')
            
            # Get a distinctive feature
            distinctive = next((word for word in product_words if word not in ['Laminate', 'Architectural', 'Roofing', 'Shingles', 'Bundle', 'per', 'sq', 'ft']), product_words[0])
            
            # Add model number if available
            model_key = item.get('model_number', 'Unknown')
            model_suffix = f"_{model_key}" if model_key != 'Unknown' else ""
            
            if item.get('color', 'default') == 'default':
                new_filename = f"{brand_short}_{product_type}_{distinctive}{model_suffix}.jpg"
            else:
                color = item.get('color', 'default')
                new_filename = f"{brand_short}_{product_type}_{distinctive}{model_suffix}_{color}.jpg"
            
            # Add to simplified metadata
            simplified_metadata.append({
                'original_filename': item['original_filename'],
                'new_filename': new_filename,
                'index': item.get('index', 0),
                'model_number': model_key
            })
        
        logging.info(f"Generated fallback simplified names for {len(simplified_metadata)} images")
        return simplified_metadata
        
    except Exception as e:
        logging.error(f"Error generating simplified names: {str(e)}")
        return None

def rename_images(simplified_metadata):
    """Rename the shingle images based on the simplified metadata"""
    try:
        if not simplified_metadata:
            logging.error("No simplified metadata provided")
            return False
        
        # Define image directory
        image_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'raw_data', 'shingles')
        if not os.path.exists(image_dir):
            logging.error(f"Image directory not found: {image_dir}")
            return False
        
        # Create a backup directory
        backup_dir = os.path.join(image_dir, 'original')
        os.makedirs(backup_dir, exist_ok=True)
        
        # Track successful renames
        successful_renames = 0
        
        # Create a clean mapping dictionary for old to new filenames
        filename_mapping = {}
        
        # First, make a backup of all original files
        for filename in os.listdir(image_dir):
            if filename.endswith('.jpg') and 'original' not in filename:
                shutil.copy2(os.path.join(image_dir, filename), os.path.join(backup_dir, filename))
        
        # Now rename the files
        for item in simplified_metadata:
            original_file = os.path.join(image_dir, item['original_filename'])
            new_file = os.path.join(image_dir, item['new_filename'])
            final_new_filename = item['new_filename']
            
            if os.path.exists(original_file):
                try:
                    # Check if the destination exists, use a numbered variant if needed
                    if os.path.exists(new_file):
                        name, ext = os.path.splitext(item['new_filename'])
                        counter = 1
                        while os.path.exists(os.path.join(image_dir, f"{name}_{counter}{ext}")):
                            counter += 1
                        new_file = os.path.join(image_dir, f"{name}_{counter}{ext}")
                        final_new_filename = f"{name}_{counter}{ext}"
                    
                    shutil.copy2(original_file, new_file)
                    os.remove(original_file)
                    successful_renames += 1
                    
                    # Add to mapping dictionary
                    filename_mapping[item['original_filename']] = final_new_filename
                    
                except Exception as e:
                    logging.error(f"Error renaming {item['original_filename']}: {str(e)}")
            else:
                logging.warning(f"Original file not found: {item['original_filename']}")
        
        logging.info(f"Successfully renamed {successful_renames} out of {len(simplified_metadata)} images")
        
        # Save the renaming mapping to JSON
        mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shingle_images_renaming_map.json')
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(simplified_metadata, f, indent=2)
        logging.info(f"Saved renaming map to {mapping_file}")
        
        # Save the clean filename mapping to JSON
        clean_mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'filename_mapping.json')
        with open(clean_mapping_file, 'w', encoding='utf-8') as f:
            json.dump(filename_mapping, f, indent=2)
        logging.info(f"Saved clean filename mapping to {clean_mapping_file}")
        
        return successful_renames > 0
        
    except Exception as e:
        logging.error(f"Error renaming images: {str(e)}")
        return False

def create_comprehensive_mapping(filename_mapping, metadata):
    """Create a comprehensive mapping that links old names to new names with additional metadata"""
    try:
        # Create mapping dictionary with more details
        comprehensive_mapping = {}
        
        # First pass: build basic mapping
        for old_filename, new_filename in filename_mapping.items():
            comprehensive_mapping[old_filename] = {
                'new_filename': new_filename,
                'metadata': {}
            }
        
        # Second pass: add metadata
        for item in metadata:
            if item['original_filename'] in comprehensive_mapping:
                orig_file = item['original_filename']
                comprehensive_mapping[orig_file]['metadata'] = {
                    'brand': item.get('brand', 'Unknown'),
                    'product': item.get('product', 'Unknown'),
                    'type': item.get('type', 'main'),
                    'color': item.get('color', 'default'),
                    'model_number': item.get('model_number', 'Unknown')
                }
                
                # If this is a variant, try to link it to its parent
                if 'parent_filename' in item:
                    comprehensive_mapping[orig_file]['parent_filename'] = item['parent_filename']
        
        # Save the comprehensive mapping to JSON
        mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'comprehensive_filename_mapping.json')
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(comprehensive_mapping, f, indent=2)
        logging.info(f"Saved comprehensive filename mapping to {mapping_file}")
        
        return True
    
    except Exception as e:
        logging.error(f"Error creating comprehensive mapping: {str(e)}")
        return False

def update_metadata_with_new_names(filename_mapping):
    """Update the metadata file with the new filenames"""
    try:
        metadata_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shingle_images_metadata.json')
        if not os.path.exists(metadata_file):
            logging.error(f"Metadata file not found: {metadata_file}")
            return False
        
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        # Create a new metadata list with updated filenames
        updated_metadata = []
        for item in metadata:
            if item['original_filename'] in filename_mapping:
                new_item = item.copy()
                new_item['new_filename'] = filename_mapping[item['original_filename']]
                updated_metadata.append(new_item)
            else:
                updated_metadata.append(item)
        
        # Save the updated metadata
        updated_metadata_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'updated_shingle_images_metadata.json')
        with open(updated_metadata_file, 'w', encoding='utf-8') as f:
            json.dump(updated_metadata, f, indent=2)
        
        logging.info(f"Updated metadata with new filenames and saved to {updated_metadata_file}")
        
        # Create comprehensive mapping
        create_comprehensive_mapping(filename_mapping, updated_metadata)
        
        return True
    
    except Exception as e:
        logging.error(f"Error updating metadata: {str(e)}")
        return False

def main():
    """Main function"""
    logging.info("Starting shingle image renaming process")
    
    # Load metadata
    metadata = load_metadata()
    if not metadata:
        logging.error("Failed to load metadata")
        return
    
    # Remove duplicate model numbers
    cleaned_metadata = remove_duplicate_models(metadata)
    if not cleaned_metadata:
        logging.error("Failed to clean metadata")
        return
        
    # Generate simplified names
    simplified_metadata = generate_simplified_names(cleaned_metadata)
    if not simplified_metadata:
        logging.error("Failed to generate simplified names")
        return
    
    # Rename images
    success = rename_images(simplified_metadata)
    if success:
        logging.info("Shingle image renaming process completed successfully")
        
        # Load the filename mapping
        mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'filename_mapping.json')
        if os.path.exists(mapping_file):
            with open(mapping_file, 'r', encoding='utf-8') as f:
                filename_mapping = json.load(f)
            
            # Update metadata with new filenames
            update_metadata_with_new_names(filename_mapping)
    else:
        logging.error("Shingle image renaming process failed")

if __name__ == "__main__":
    main() 