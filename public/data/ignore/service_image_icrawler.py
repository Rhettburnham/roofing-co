#!/usr/bin/env python3
import json
import os
import requests
import time
import re
from urllib.parse import quote_plus
from typing import Dict, List, Any
from icrawler.builtin import GoogleImageCrawler
from PIL import Image
import hashlib

# We no longer need selenium imports as we're switching to icrawler
# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC

def verify_image_quality(image_path: str) -> bool:
    """
    Verify image quality using PIL.
    Returns True if image meets quality criteria, False otherwise.
    """
    try:
        with Image.open(image_path) as img:
            # Check resolution
            width, height = img.size
            if width < 800 or height < 600:
                print(f"Image resolution too low: {width}x{height}")
                return False

            # Check aspect ratio (avoid extreme ratios)
            aspect_ratio = width / height
            if aspect_ratio < 0.5 or aspect_ratio > 2.0:
                print(f"Image aspect ratio unsuitable: {aspect_ratio:.2f}")
                return False

            # Check if image is too dark or too bright
            if img.mode == 'RGB':
                # Convert to grayscale for brightness check
                gray = img.convert('L')
                avg_brightness = sum(gray.getdata()) / (width * height)
                if avg_brightness < 30 or avg_brightness > 225:
                    print(f"Image brightness unsuitable: {avg_brightness:.2f}")
                    return False

            return True
    except Exception as e:
        print(f"Error verifying image quality: {e}")
        return False

def optimize_image(image_path: str) -> bool:
    """
    Optimize image for web use.
    Returns True if optimization successful, False otherwise.
    """
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if needed
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize if too large (max 2000px on longest side)
            max_size = 2000
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = tuple(int(dim * ratio) for dim in img.size)
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            img.save(image_path, 'JPEG', quality=85, optimize=True)
            return True
    except Exception as e:
        print(f"Error optimizing image: {e}")
        return False

def get_image_hash(image_path: str) -> str:
    """
    Generate a hash of the image for duplicate detection.
    """
    try:
        with Image.open(image_path) as img:
            # Convert to grayscale and resize to 8x8 for faster hashing
            img = img.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
            # Get pixel values
            pixels = list(img.getdata())
            # Calculate average
            avg = sum(pixels) / len(pixels)
            # Create hash
            bits = ''.join('1' if pixel > avg else '0' for pixel in pixels)
            return hashlib.md5(bits.encode()).hexdigest()
    except Exception as e:
        print(f"Error generating image hash: {e}")
        return ""

def get_google_images_icrawler(search_term: str, num_images: int = 3, image_dir: str = "temp_images", seen_hashes: set = None) -> List[str]:
    """
    Scrape Google Images for a given search term using icrawler,
    focusing on higher quality and relevance.
    """
    if seen_hashes is None:
        seen_hashes = set()

    os.makedirs(image_dir, exist_ok=True)

    google_crawler = GoogleImageCrawler(
        parser_threads=2,
        downloader_threads=4,
        storage={'root_dir': image_dir}
    )

    filters = {
        'min_resolution': (800, 600),
        'type': 'photo'
    }

    image_paths = []
    try:
        google_crawler.crawl(
            keyword=search_term,
            max_num=num_images * 2,
            min_size=None,
            max_size=None,
            feeder_depth=3,
            filters=filters
        )

        downloaded_files = sorted([f for f in os.listdir(image_dir) if f.endswith(('.jpg', '.jpeg', '.png', '.gif'))])

        for filename in downloaded_files:
            file_path = os.path.join(image_dir, filename)
            
            # Basic file size check
            if os.path.getsize(file_path) <= 10 * 1024:
                continue

            # Verify image quality
            if not verify_image_quality(file_path):
                continue

            # Check for duplicates
            image_hash = get_image_hash(file_path)
            if image_hash in seen_hashes:
                continue
            seen_hashes.add(image_hash)

            # Optimize image
            if not optimize_image(file_path):
                continue

            image_paths.append(file_path)
            if len(image_paths) >= num_images:
                break
        
    except Exception as e:
        print(f"Error scraping Google Images with icrawler for '{search_term}': {e}")
    finally:
        # Clean up the temporary directory
        for f in os.listdir(image_dir):
            os.remove(os.path.join(image_dir, f))
        os.rmdir(image_dir)
        
    return image_paths[:num_images]

def download_image(image_source_path: str, save_path: str) -> bool:
    """
    Move the image from icrawler's temporary download location to the final save_path.
    """
    try:
        if os.path.exists(image_source_path) and os.path.getsize(image_source_path) > 0:
            os.rename(image_source_path, save_path)
            return True
        else:
            print(f"Source image not found or is empty: {image_source_path}")
            return False
    except Exception as e:
        print(f"Error moving image from {image_source_path} to {save_path}: {e}")
        return False

def process_service_images(service: Dict[str, Any], temp_image_base_dir: str) -> None:
    """
    Process and update images for a service and its blocks using icrawler.
    
    Args:
        service: The service data to process
        temp_image_base_dir: Base directory for icrawler's temporary downloads
    """
    service_name = service.get('name', '')
    print(f"\nProcessing service: {service_name}")
    
    if 'blocks' not in service or not isinstance(service['blocks'], list):
        print(f"No blocks found for service {service_name}, skipping")
        return
    
    # Set for tracking seen image hashes
    seen_hashes = set()
    
    for i, block in enumerate(service['blocks']):
        if 'image' in block and block['image'] and not block['image'].startswith("http"):
            print(f"  Block {i+1} already has image: {block['image']}")
            continue
        
        # Form search term based on block content and service name
        # First try to use searchTerms from block
        search_term = block.get('searchTerms', '')
        if not search_term:
            # Fall back to title-based search
            if 'title' in block:
                search_term = f"{block['title']} roofing"
            else:
                search_term = f"{service_name} roofing"
        
        print(f"  Searching for images for block {i+1}: {search_term}")
        
        temp_image_dir = os.path.join(temp_image_base_dir, f"icrawler_temp_{int(time.time())}_{i}")
        
        image_paths = get_google_images_icrawler(
            search_term, 
            num_images=1, 
            image_dir=temp_image_dir,
            seen_hashes=seen_hashes
        )
        
        if not image_paths:
            print(f"  No suitable images found for '{search_term}'")
            continue
        
        source_image_path = image_paths[0]
        
        safe_service_name = re.sub(r'[^a-zA-Z0-9]', '_', service_name.lower())
        image_filename = f"{safe_service_name}_block_{i+1}.jpg"
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.dirname(script_dir)
        image_dest_dir = os.path.join(data_dir, "service_images")
        os.makedirs(image_dest_dir, exist_ok=True)
        
        destination_image_path = os.path.join(image_dest_dir, image_filename)
        
        success = download_image(source_image_path, destination_image_path)
        
        if success:
            block['image'] = f"/assets/images/services/{image_filename}"
            print(f"  ✓ Image downloaded and saved as: {image_filename}")
        else:
            print(f"  ✗ Failed to download or move image for block {i+1}")
        
        # Match the delay time from the original scraper
        time.sleep(2)

def main():
    """Main entry point for the script"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    raw_data_dir = os.path.join(data_dir, "raw_data")
    
    input_file = os.path.join(raw_data_dir, "step_3", "services_search_term.json")
    
    output_dir = os.path.join(raw_data_dir, "step_4")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "services.json")
    
    image_final_dest_dir = os.path.join(data_dir, "service_images")
    os.makedirs(image_final_dest_dir, exist_ok=True)

    # Temporary directory for icrawler downloads
    temp_icrawler_downloads_base_dir = os.path.join(data_dir, "icrawler_temp_downloads")
    os.makedirs(temp_icrawler_downloads_base_dir, exist_ok=True)
    
    print(f"Reading services from: {input_file}")
    print(f"Saving final images to: {image_final_dest_dir}")
    print(f"Writing output to: {output_file}")
    print(f"Using temporary directory for icrawler: {temp_icrawler_downloads_base_dir}")
    
    try:
        with open(input_file, 'r') as f:
            services_data = json.load(f)
        
        try:
            for service in services_data:
                process_service_images(service, temp_icrawler_downloads_base_dir)
                
            with open(output_file, 'w') as f:
                json.dump(services_data, f, indent=2)
                
            print("Image scraping completed successfully!")
            
        finally:
            # Clean up the base temporary directory for icrawler downloads
            if os.path.exists(temp_icrawler_downloads_base_dir):
                import shutil
                shutil.rmtree(temp_icrawler_downloads_base_dir)
                print(f"Cleaned up temporary icrawler directory: {temp_icrawler_downloads_base_dir}")

    except FileNotFoundError:
        print(f"Error: {input_file} not found. Run step_3 scripts first.")
    except Exception as e:
        print(f"Error during image scraping: {e}")

if __name__ == "__main__":
    main()