#!/usr/bin/env python3

import os
import json
import shutil
import logging
from typing import Dict, Any, List, Set

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AssetReorganizer:
    """Reorganizes assets to match the structure used in combined_data.json."""
    
    def __init__(self):
        """Initialize with paths to the various directories."""
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.dirname(self.script_dir)
        self.project_root = os.path.dirname(self.data_dir)
        self.assets_dir = os.path.join(self.project_root, "assets")
        self.images_dir = os.path.join(self.assets_dir, "images")
        
        # Required subfolder structure 
        self.required_structure = {
            "logo": [],
            "team": ["roofer.png", "foreman.png", "estimator.png", "salesrep.png", "manager.png", "inspector.png"],
            "richtext": ["roof_workers.jpg", "roof_workers2.jpg", "roof_workers3.webp"],
            "roof_slideshow": [f"i{i}.jpeg" for i in range(1, 13)],
            "beforeafter": ["a1.jpeg", "b1.JPG", "a2.jpeg", "b2.jpeg", "a3.jpeg", "b3.jpeg"],
            "builtup": ["builtupdemo.avif", "builtuproofing2.jpg", "modified1.jpg", "modified2.avif"],
            "coating": ["acrylic.webp", "silicone.jpg", "polyurethane.jpg", "elastomeric.jpg", "spf.jpg"]
        }
        
        # Files at the root level
        self.root_files = ["googleimage.png", "clipped.png", "main_image_expanded.jpg", "commercialservices.jpg"]
    
    def ensure_directories_exist(self):
        """Create the required directory structure."""
        logger.info("Creating required directory structure")
        
        # Ensure the images directory exists
        os.makedirs(self.images_dir, exist_ok=True)
        
        # Create each required subdirectory
        for subfolder in self.required_structure.keys():
            dir_path = os.path.join(self.images_dir, subfolder)
            os.makedirs(dir_path, exist_ok=True)
            logger.info(f"Created directory: {dir_path}")
    
    def find_and_copy_files(self):
        """Scan for required files and copy them to their correct locations."""
        logger.info("Scanning for and copying required files")
        
        # First, let's scan the current image directory for matches
        current_files = {}
        for root, _, files in os.walk(self.assets_dir):
            for file in files:
                current_files[file] = os.path.join(root, file)
        
        # Copy files to the appropriate subfolders
        for subfolder, required_files in self.required_structure.items():
            target_dir = os.path.join(self.images_dir, subfolder)
            for filename in required_files:
                if filename in current_files:
                    source_path = current_files[filename]
                    target_path = os.path.join(target_dir, filename)
                    
                    # Copy the file
                    self._copy_file(source_path, target_path)
                else:
                    logger.warning(f"Missing required file: {filename} for {subfolder}")
        
        # Handle root-level files
        for filename in self.root_files:
            if filename in current_files:
                source_path = current_files[filename]
                target_path = os.path.join(self.images_dir, filename)
                
                # Copy the file
                self._copy_file(source_path, target_path)
            else:
                logger.warning(f"Missing required root file: {filename}")
    
    def _copy_file(self, source: str, target: str):
        """Copy a file from source to target, creating parent directories as needed."""
        try:
            # Create parent directory if it doesn't exist
            os.makedirs(os.path.dirname(target), exist_ok=True)
            
            # Copy the file
            shutil.copy2(source, target)
            logger.info(f"Copied {source} to {target}")
        except Exception as e:
            logger.error(f"Error copying {source} to {target}: {str(e)}")
    
    def update_combined_data_paths(self):
        """Update the combined_data.json file to ensure all paths match the new structure."""
        combined_data_path = os.path.join(self.data_dir, "combined_data.json")
        
        # Check if the file exists
        if not os.path.exists(combined_data_path):
            logger.warning(f"combined_data.json not found at {combined_data_path}")
            return
        
        # Load the combined data
        try:
            with open(combined_data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Update booking logo path
            if 'booking' in data and 'logo' in data['booking']:
                data['booking']['logo'] = "/assets/images/logo/clipped.png"
            
            # Update richText images
            if 'richText' in data and 'images' in data['richText']:
                data['richText']['images'] = [
                    "/assets/images/richtext/roof_workers.jpg",
                    "/assets/images/richtext/roof_workers2.jpg",
                    "/assets/images/richtext/roof_workers3.webp"
                ]
            
            # Update button images
            if 'button' in data and 'images' in data['button']:
                data['button']['images'] = [f"/assets/images/roof_slideshow/i{i}.jpeg" for i in range(1, 13)]
            
            # Update beforeAfter paths
            if 'beforeAfter' in data and 'items' in data['beforeAfter']:
                for item in data['beforeAfter']['items']:
                    if 'before' in item:
                        item['before'] = item['before'].replace('./assets', '/assets')
                    if 'after' in item:
                        item['after'] = item['after'].replace('./assets', '/assets')
            
            # Update employee images
            if 'employees' in data and 'employee' in data['employees']:
                for employee in data['employees']['employee']:
                    if 'image' in employee:
                        # Extract the filename
                        filename = os.path.basename(employee['image'])
                        # Update to the new path format
                        employee['image'] = f"/assets/images/team/{filename}"
            
            # Update combinedPage images
            if 'combinedPage' in data:
                if 'googleReviews' in data['combinedPage']:
                    for review in data['combinedPage']['googleReviews']:
                        if 'logo' in review:
                            review['logo'] = "/assets/images/googleimage.png"
                
                if 'largeResidentialImg' in data['combinedPage']:
                    data['combinedPage']['largeResidentialImg'] = "/assets/images/main_image_expanded.jpg"
                
                if 'largeCommercialImg' in data['combinedPage']:
                    data['combinedPage']['largeCommercialImg'] = "/assets/images/commercialservices.jpg"
            
            # Save the updated combined data
            with open(combined_data_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            
            logger.info(f"Updated paths in {combined_data_path}")
        
        except Exception as e:
            logger.error(f"Error updating combined_data.json: {str(e)}")
    
    def organize(self):
        """Run the complete organization process."""
        try:
            logger.info("Starting asset reorganization")
            
            # 1. Create the required directory structure
            self.ensure_directories_exist()
            
            # 2. Find and copy files
            self.find_and_copy_files()
            
            # 3. Update combined_data.json paths if needed
            self.update_combined_data_paths()
            
            logger.info("Asset reorganization completed successfully")
        
        except Exception as e:
            logger.error(f"Error during asset reorganization: {str(e)}")
            raise

def main():
    """Main entry point for the script."""
    reorganizer = AssetReorganizer()
    reorganizer.organize()

if __name__ == "__main__":
    main() 