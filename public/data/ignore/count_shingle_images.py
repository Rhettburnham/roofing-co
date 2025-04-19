import os
import re
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

def count_shingle_images():
    """Count the shingle images in the raw_data/shingles directory"""
    # Determine the output directory
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'raw_data', 'shingles')
    
    try:
        # Get all jpg files in the directory
        image_files = [f for f in os.listdir(output_dir) if f.endswith('.jpg')]
        
        # Count total images
        total_images = len(image_files)
        
        # Count main products (not color variants)
        main_products = len([f for f in image_files if not any(c in f for c in ['_color_variant_', '_Amber', '_Sand_Castle', '_Desert_Tan', '_Brownwood', '_Shasta_White'])])
        
        # Count color variants
        color_variants = total_images - main_products
        
        # List page numbers based on file naming pattern
        page_numbers = set()
        for file in image_files:
            match = re.match(r'^(\d+)_', file)
            if match:
                product_number = int(match.group(1))
                if product_number <= 24:
                    page_numbers.add(1)
                elif product_number <= 48:
                    page_numbers.add(2)
                elif product_number <= 72:
                    page_numbers.add(3)
                elif product_number <= 96:
                    page_numbers.add(4)
        
        # Get unique product brands
        brands = set()
        for file in image_files:
            parts = file.split('_')
            if len(parts) > 1:
                potential_brand = parts[1]
                if potential_brand in ['Owens', 'GAF']:
                    brands.add(potential_brand)
        
        logging.info(f"Shingle Image Statistics:")
        logging.info(f"Total images: {total_images}")
        logging.info(f"Main product images: {main_products}")
        logging.info(f"Color variant images: {color_variants}")
        logging.info(f"Pages scraped: {sorted(list(page_numbers))}")
        logging.info(f"Unique brands: {', '.join(brands) if brands else 'None found'}")
        
        return total_images, main_products, color_variants, page_numbers, brands
        
    except Exception as e:
        logging.error(f"Error counting images: {str(e)}")
        return 0, 0, 0, set(), set()

if __name__ == "__main__":
    count_shingle_images() 