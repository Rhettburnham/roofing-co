#!/usr/bin/env python3
import json
import os
import requests
import time
import random
import re
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import quote_plus
from typing import Dict, List, Any

def setup_driver() -> webdriver.Chrome:
    """Set up and return a Chrome WebDriver instance."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def get_google_images(driver: webdriver.Chrome, search_term: str, num_images: int = 3) -> List[str]:
    """Scrape Google Images for a given search term using Selenium."""
    # Format the search term for URL
    search_url = f"https://www.google.com/search?q={quote_plus(search_term)}&tbm=isch"
    
    try:
        # Navigate to the search page
        driver.get(search_url)
        
        # Wait for images to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "img.rg_i"))
        )
        
        # Find all image elements
        image_elements = driver.find_elements(By.CSS_SELECTOR, "img.rg_i")
        
        # Extract image URLs
        image_urls = []
        for img in image_elements[:num_images + 5]:  # Get a few extra in case some fail
            if img.get_attribute("src") and img.get_attribute("src").startswith("http"):
                image_urls.append(img.get_attribute("src"))
            elif img.get_attribute("data-src") and img.get_attribute("data-src").startswith("http"):
                image_urls.append(img.get_attribute("data-src"))
                
            if len(image_urls) >= num_images:
                break
        
        # If we couldn't find enough images, try to click on "More results" button
        if len(image_urls) < num_images and len(image_elements) < 10:
            try:
                more_button = driver.find_element(By.XPATH, "//input[@value='Show more results']")
                driver.execute_script("arguments[0].click();", more_button)
                time.sleep(2)
                
                # Get more images
                image_elements = driver.find_elements(By.CSS_SELECTOR, "img.rg_i")
                for img in image_elements[len(image_urls):]:
                    if img.get_attribute("src") and img.get_attribute("src").startswith("http"):
                        image_urls.append(img.get_attribute("src"))
                    elif img.get_attribute("data-src") and img.get_attribute("data-src").startswith("http"):
                        image_urls.append(img.get_attribute("data-src"))
                        
                    if len(image_urls) >= num_images:
                        break
            except:
                pass  # No more results button or failed to click
        
        return image_urls[:num_images]
    
    except Exception as e:
        print(f"Error scraping Google Images for '{search_term}': {e}")
        return []

def download_image(image_url: str, save_path: str) -> bool:
    """Download an image from a URL and save it to the specified path."""
    try:
        # Make the request
        response = requests.get(image_url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Check if the response is an image
        content_type = response.headers.get("Content-Type", "")
        if not content_type.startswith("image/"):
            print(f"URL does not point to an image: {image_url}")
            return False
        
        # Save the image
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        # Verify the file was created and has content
        if os.path.exists(save_path) and os.path.getsize(save_path) > 0:
            return True
        else:
            print(f"Failed to save image: {save_path}")
            return False
    
    except Exception as e:
        print(f"Error downloading image from {image_url}: {e}")
        return False

def process_service_images(driver: webdriver.Chrome, service: Dict[str, Any]) -> None:
    """
    Process and update images for a service and its blocks.
    
    Args:
        driver: The WebDriver instance
        service: The service data to process
    """
    service_name = service.get('name', '')
    print(f"\nProcessing service: {service_name}")
    
    # Check if this service has blocks
    if 'blocks' not in service or not isinstance(service['blocks'], list):
        print(f"No blocks found for service {service_name}, skipping")
        return
    
    # Process each block
    for i, block in enumerate(service['blocks']):
        # Skip blocks that already have images
        if 'image' in block and block['image'] and not block['image'].startswith("http"):
            print(f"  Block {i+1} already has image: {block['image']}")
            continue
        
        # Form search term based on block content and service name
        search_term = f"{service_name} roofing"
        if 'title' in block:
            search_term = f"{block['title']} roofing"
        
        print(f"  Searching for images for block {i+1}: {search_term}")
        
        # Get image URLs
        image_urls = get_google_images(driver, search_term, num_images=1)
        
        if not image_urls:
            print(f"  No images found for '{search_term}'")
            continue
        
        # Download the first image
        image_url = image_urls[0]
        
        # Create a safe filename based on service name and block index
        safe_service_name = re.sub(r'[^a-zA-Z0-9]', '_', service_name.lower())
        image_filename = f"{safe_service_name}_block_{i+1}.jpg"
        
        # Set up the image directory in the workspace
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.dirname(script_dir)
        image_dir = os.path.join(data_dir, "service_images")
        os.makedirs(image_dir, exist_ok=True)
        
        image_path = os.path.join(image_dir, image_filename)
        
        # Download the image
        success = download_image(image_url, image_path)
        
        if success:
            # Update the block with the new image path
            # Use relative path for storing in JSON
            block['image'] = f"/assets/images/services/{image_filename}"
            print(f"  ✓ Image downloaded and saved as: {image_filename}")
        else:
            print(f"  ✗ Failed to download image for block {i+1}")
        
        # Add a short delay to avoid overloading the server
        time.sleep(2)

def main():
    """Main entry point for the script"""
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    raw_data_dir = os.path.join(data_dir, "raw_data")
    
    # Input file from step_3
    input_file = os.path.join(raw_data_dir, "step_3", "services_search_term.json")
    
    # Output directory and file in step_4
    output_dir = os.path.join(raw_data_dir, "step_4")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "services.json")
    
    # Image directory
    image_dir = os.path.join(data_dir, "service_images")
    os.makedirs(image_dir, exist_ok=True)
    
    print(f"Reading services from: {input_file}")
    print(f"Saving images to: {image_dir}")
    print(f"Writing output to: {output_file}")
    
    try:
        # Read the services data
        with open(input_file, 'r') as f:
            services_data = json.load(f)

        # Initialize Chrome WebDriver
        driver = setup_driver()
        
        try:
            # Process all services
            for service in services_data:
                process_service_images(driver, service)
                
            # Write the updated services data
            with open(output_file, 'w') as f:
                json.dump(services_data, f, indent=2)
                
            print("Image scraping completed successfully!")
            
        finally:
            # Always close the driver when done
            print("Closing browser...")
            driver.quit()
    
    except FileNotFoundError:
        print(f"Error: {input_file} not found. Run step_3 scripts first.")
    except Exception as e:
        print(f"Error during image scraping: {e}")

if __name__ == "__main__":
    main() 