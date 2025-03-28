#!/usr/bin/env python3
import json
import os
import requests
import time
import random
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
    """Process all blocks in a service and download images for them."""
    service_name = service["name"]
    category = service["category"]
    service_id = service["id"]
    
    print(f"Processing images for {service_name} ({category})...")
    
    # Create directories if they don't exist
    base_dir = f"public/assets/images/services/{category}/{service_id}"
    os.makedirs(base_dir, exist_ok=True)
    
    # Process each block
    for i, block in enumerate(service["blocks"]):
        if "searchTerms" not in block:
            continue
        
        # Enhanced search term with roofing context
        search_term = f"professional roofing {block['searchTerms']} high quality"
        
        # Save path for the image
        save_path = f"{base_dir}/block_{i+1}.jpg"
        
        # Skip if the image already exists and is not empty
        if os.path.exists(save_path) and os.path.getsize(save_path) > 0:
            print(f"  Image for block {i+1} already exists, skipping...")
            continue
        
        print(f"  Searching for images for block {i+1}: {search_term}")
        
        # Get image URLs
        image_urls = get_google_images(driver, search_term, num_images=3)
        
        # Try to download each image until one succeeds
        success = False
        for url in image_urls:
            success = download_image(url, save_path)
            if success:
                print(f"  Successfully downloaded image for block {i+1}")
                break
            time.sleep(1)  # Small delay between attempts
        
        if not success:
            print(f"  Failed to download any images for block {i+1}")
        
        # Delay to avoid rate limiting
        time.sleep(random.uniform(1.5, 3.0))

def main():
    """Main function to scrape images for all services."""
    try:
        # Load the services data
        with open("public/data/services.json", "r") as f:
            services_data = json.load(f)
        
        # Initialize the WebDriver once for all searches
        print("Initializing browser for image searches...")
        driver = setup_driver()
        
        try:
            # Process residential services
            for service in services_data["residential"]:
                process_service_images(driver, service)
            
            # Process commercial services
            for service in services_data["commercial"]:
                process_service_images(driver, service)
                
            print("Image scraping completed successfully!")
            
        finally:
            # Always close the driver when done
            print("Closing browser...")
            driver.quit()
    
    except FileNotFoundError:
        print("Error: services.json not found. Run service_generator.py first.")
    except Exception as e:
        print(f"Error during image scraping: {e}")

if __name__ == "__main__":
    main() 