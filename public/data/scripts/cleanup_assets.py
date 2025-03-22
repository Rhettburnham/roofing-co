#!/usr/bin/env python3

import os
import shutil
import logging
from typing import List, Set

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AssetCleanup:
    def __init__(self):
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.dirname(self.script_dir)
        self.assets_dir = os.path.join(os.path.dirname(self.data_dir), "assets")
        self.images_dir = os.path.join(self.assets_dir, "images")
        
        # Define which assets are currently used
        self.used_assets = {
            "logo": [
                "clipped.png"
            ],
            "richtext": [
                "roof_workers.jpg",
                "roof_workers2.jpg",
                "roof_workers3.webp"
            ],
            "reviews": [
                "googleimage.png"
            ],
            "team": [
                "roofer.png",
                "foreman.png",
                "estimator.png",
                "salesrep.png",
                "manager.png",
                "inspector.png"
            ],
            "services": {
                "builtup": [
                    "builtupdemo.avif",
                    "builtuproofing2.jpg",
                    "modified1.jpg",
                    "modified2.avif"
                ],
                "coating": [
                    "acrylic.webp",
                    "silicone.jpg",
                    "polyurethane.jpg",
                    "elastomeric.jpg",
                    "spf.jpg"
                ]
            }
        }
    
    def create_directory_structure(self):
        """Create organized directory structure for assets."""
        logger.info("Creating organized directory structure...")
        
        # Create main category directories
        for category in self.used_assets.keys():
            if category == "services":
                # Create service-specific directories
                for service in self.used_assets["services"].keys():
                    service_dir = os.path.join(self.images_dir, service)
                    os.makedirs(service_dir, exist_ok=True)
            else:
                category_dir = os.path.join(self.images_dir, category)
                os.makedirs(category_dir, exist_ok=True)
    
    def move_used_assets(self):
        """Move used assets to their appropriate directories."""
        logger.info("Moving used assets to organized directories...")
        
        for category, assets in self.used_assets.items():
            if category == "services":
                for service, files in assets.items():
                    service_dir = os.path.join(self.images_dir, service)
                    for file in files:
                        src = os.path.join(self.images_dir, file)
                        dst = os.path.join(service_dir, file)
                        if os.path.exists(src):
                            shutil.move(src, dst)
                            logger.info(f"Moved {file} to {service_dir}")
            else:
                category_dir = os.path.join(self.images_dir, category)
                for file in assets:
                    src = os.path.join(self.images_dir, file)
                    dst = os.path.join(category_dir, file)
                    if os.path.exists(src):
                        shutil.move(src, dst)
                        logger.info(f"Moved {file} to {category_dir}")
    
    def get_all_used_files(self) -> Set[str]:
        """Get a set of all used file names."""
        used_files = set()
        
        for category, assets in self.used_assets.items():
            if category == "services":
                for service, files in assets.items():
                    used_files.update(files)
            else:
                used_files.update(assets)
        
        return used_files
    
    def remove_unused_assets(self):
        """Remove all unused assets."""
        logger.info("Removing unused assets...")
        
        used_files = self.get_all_used_files()
        
        # Walk through all directories in images_dir
        for root, dirs, files in os.walk(self.images_dir):
            for file in files:
                if file not in used_files:
                    file_path = os.path.join(root, file)
                    try:
                        os.remove(file_path)
                        logger.info(f"Removed unused file: {file_path}")
                    except Exception as e:
                        logger.error(f"Error removing {file_path}: {str(e)}")
    
    def cleanup(self):
        """Run the complete cleanup process."""
        logger.info("Starting asset cleanup...")
        
        try:
            # Create new directory structure
            self.create_directory_structure()
            
            # Move used assets to their new locations
            self.move_used_assets()
            
            # Remove unused assets
            self.remove_unused_assets()
            
            logger.info("Asset cleanup completed successfully!")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
            raise

def main():
    cleanup = AssetCleanup()
    cleanup.cleanup()

if __name__ == "__main__":
    main() 