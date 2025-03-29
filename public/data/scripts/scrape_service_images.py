#!/usr/bin/env python3
import json
import os
import requests
import time
import random
from urllib.parse import quote_plus
from typing import Dict, List, Any
import argparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def get_pexels_images(search_term: str, num_images: int = 3) -> List[str]:
    """Get images from Pexels for a given search term"""
    # Pexels search URL pattern
    images = []
    search_term = search_term.strip()
    
    # List of common roofing-related search terms for fallback
    roofing_terms = [
        "roof", "roofing", "shingles", "metal roof", "residential roof", 
        "commercial roof", "roof repair", "gutter installation", "siding"
    ]
    
    # Add the specific search term
    search_terms = [search_term] + roofing_terms
    
    # Try each search term until we get enough images
    for term in search_terms:
        if len(images) >= num_images:
            break
            
        # Format: random image from Pexels matching the search term
        image_url = f"https://source.pexels.com/photos/{quote_plus(term)}/1600x900"
        images.append(image_url)
    
    return images[:num_images]

def get_unsplash_direct_images(search_term: str, num_images: int = 3) -> List[str]:
    """Get images directly from Unsplash using the source.unsplash.com service"""
    images = []
    search_term = search_term.strip()
    
    # Try with full search term first
    images.append(f"https://source.unsplash.com/1600x900/?{quote_plus(search_term)}")
    
    # Add some variations with individual keywords to increase chances of success
    keywords = search_term.split()
    for keyword in keywords:
        if len(keyword) > 3 and keyword.lower() not in ("the", "and", "for"):
            images.append(f"https://source.unsplash.com/1600x900/?{quote_plus(keyword)}")
    
    # Add some roofing-specific terms
    if "roof" not in search_term.lower():
        images.append("https://source.unsplash.com/1600x900/?roof")
    if "house" not in search_term.lower() and "home" not in search_term.lower():
        images.append("https://source.unsplash.com/1600x900/?house")
        
    # Add random parameter to avoid duplicates
    return [f"{url}&sig={random.randint(1, 10000)}" for url in images[:num_images]]

def get_google_images(search_term: str, save_path: str) -> bool:
    """Get images from Google Search for a given search term"""
    # Prepare the search term
    search_term = search_term.strip()
    print(f"[LOG] Using search term: '{search_term}'")
    
    # Use the exact URL format specified
    search_url = "https://www.google.com/search?sca_esv=aec9fa9ef099d999&rlz=1C1ONGR_enUS1154US1154"
    search_url += f"&q={quote_plus(search_term)}"
    search_url += "&udm=2&fbs=ABzOT_CWdhQLP1FcmU5B0fn3xuWpA-dk4wpBWOGsoR7DG5zJBsxayPSIAqObp_AgjkUGqengxVrJ7hrmYmz7X2OZp_NIYfhIAjPnSJLO3GH6L0gKvuUU9jOm91_NGkSK1WJYVWjjHf1cMeOfIs5S2VkHB51zdvs5rEFgawK72NTjOMMeP0ZkzDJsLwBUA55RuQQ6_IgnTa_0Sg-ZSjc8BLe0lulqWQaGgA"
    search_url += "&sa=X&ved=2ahUKEwjjxaeD8a2MAxVWTDABHT1IJX0QtKgLegQIFhAB&biw=1440&bih=1201&dpr=3"
    
    print(f"[LOG] Opening Google search URL: '{search_url}'")
    
    # Set up Chrome options
    chrome_options = Options()
    # Remove headless mode to show the browser
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        # Initialize the Chrome driver
        driver = webdriver.Chrome(options=chrome_options)
        driver.get(search_url)
        
        print("[LOG] Page loaded, following DOM path to search elements...")
        
        # Follow the exact DOM path specified for search
        wait = WebDriverWait(driver, 10)
        
        try:
            # From body to header
            header = wait.until(EC.presence_of_element_located((By.TAG_NAME, "header")))
            print("[LOG] Found header element")
            
            # Find div with class card TshKde
            card = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div.card.TshKde")))
            print("[LOG] Found card element")
            
            # Find div jsname="oXkruf"
            div_oxkruf = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[jsname="oXkruf"]')))
            print("[LOG] Found div with jsname=oXkruf")
            
            # Find div jsname="P9ya7d"
            div_p9ya7d = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[jsname="P9ya7d"]')))
            print("[LOG] Found div with jsname=P9ya7d")
            
            # Find div jsname="esdwVc"
            div_esdwvc = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[jsname="esdwVc"]')))
            print("[LOG] Found div with jsname=esdwVc")
            
            # Find form with class="tsf"
            form_tsf = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'form.tsf')))
            print("[LOG] Found form with class=tsf")
            
            # In form find jsmodel="b5W85 vNzKHd"
            jsmodel_div = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[jsmodel="b5W85 vNzKHd"]')))
            print("[LOG] Found div with jsmodel=b5W85 vNzKHd")
            
            # Find jscontroller="v6cJEc"
            jscontroller_div = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[jscontroller="v6cJEc"]')))
            print("[LOG] Found div with jscontroller=v6cJEc")
            
            # Find div with class="zGVn2e"
            div_zgvn2e = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.zGVn2e')))
            print("[LOG] Found div with class=zGVn2e")
            
            # Input the search term into div class="SDkEP"
            search_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.SDkEP input')))
            search_input.clear()
            search_input.send_keys(search_term)
            print(f"[LOG] Entered search term in input: '{search_term}'")
            
            # Execute search with button class="Tg7LZd search_button_suggest"
            search_button = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'button.Tg7LZd.search_button_suggest')))
            search_button.click()
            print("[LOG] Clicked search button")
        except Exception as e:
            print(f"[LOG] Error during search interface navigation: {e}")
            print("[LOG] Taking screenshot of current state...")
            screenshot_path = os.path.join(os.path.dirname(save_path), "search_error.png")
            driver.save_screenshot(screenshot_path)
            print(f"[LOG] Screenshot saved to {screenshot_path}")
            driver.quit()
            return False
        
        # Wait for search results to load
        time.sleep(3)
        print("[LOG] Search results loaded, following DOM path to find image...")
        
        try:
            # Now find the first image following the specified DOM path
            # Find div jscontroller="uivUtf"
            div_uivutf = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[jscontroller="uivUtf"]')))
            print("[LOG] Found div with jscontroller=uivUtf")
            
            # Find div class="main"
            div_main = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.main')))
            print("[LOG] Found div with class=main")
            
            # Find jsmodel="ROaKxe"
            div_roakxe = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[jsmodel="ROaKxe"]')))
            print("[LOG] Found div with jsmodel=ROaKxe")
            
            # Find class="center_col s6JM6d"
            div_center_col = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.center_col.s6JM6d')))
            print("[LOG] Found div with class=center_col s6JM6d")
            
            # Find the 4th div under center_col
            child_divs = div_center_col.find_elements(By.XPATH, './div')
            if len(child_divs) < 4:
                print(f"[LOG] Warning: Only found {len(child_divs)} child divs under center_col, expected at least 4")
                screenshot_path = os.path.join(os.path.dirname(save_path), "center_col_error.png")
                driver.save_screenshot(screenshot_path)
                print(f"[LOG] Screenshot saved to {screenshot_path}")
                div_fourth = child_divs[-1] if child_divs else None
            else:
                div_fourth = child_divs[3]  # 4th div (0-indexed)
            
            if div_fourth:
                print("[LOG] Found 4th div under center_col")
                
                # Find data-hveid="CAEQAw"
                div_hveid = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[data-hveid="CAEQAw"]')))
                print("[LOG] Found div with data-hveid=CAEQAw")
                
                # Find div id="rso"
                div_rso = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div#rso')))
                print("[LOG] Found div with id=rso")
                
                # Find class="MjjYud"
                div_mjjyud = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.MjjYud')))
                print("[LOG] Found div with class=MjjYud")
                
                # Find jscontroller="gOTY1"
                div_goty1 = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div[jscontroller="gOTY1"]')))
                print("[LOG] Found div with jscontroller=gOTY1")
                
                # Find class="VKHL9c"
                div_vkhl9c = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.VKHL9c')))
                print("[LOG] Found div with class=VKHL9c")
                
                # Find class="srKDX cvP2Ce"
                div_srkdx = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.srKDX.cvP2Ce')))
                print("[LOG] Found div with class=srKDX cvP2Ce")
                
                # Download the image within div class="kb0PBd cvP2Ce"
                div_kb0pbd = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.kb0PBd.cvP2Ce')))
                print("[LOG] Found div with class=kb0PBd cvP2Ce")
                
                # Get the image inside this div
                img_element = div_kb0pbd.find_element(By.TAG_NAME, 'img')
                img_url = img_element.get_attribute('src')
                
                print(f"[LOG] Found image URL: {img_url}")
                
                if img_url and img_url.startswith('http'):
                    # Download the image
                    if download_image(img_url, save_path):
                        print(f"[LOG] Successfully downloaded image to {save_path}")
                        driver.quit()
                        return True
                    else:
                        print("[LOG] Failed to download image")
                else:
                    print(f"[LOG] Invalid image URL: {img_url}")
            else:
                print("[LOG] Could not find the 4th div under center_col")
        except Exception as e:
            print(f"[LOG] Error during image finding: {e}")
            print("[LOG] Taking screenshot of current state...")
            screenshot_path = os.path.join(os.path.dirname(save_path), "image_error.png")
            driver.save_screenshot(screenshot_path)
            print(f"[LOG] Screenshot saved to {screenshot_path}")
        
        driver.quit()
        return False
    
    except Exception as e:
        print(f"[LOG] Error during Google search: {e}")
        try:
            driver.quit()
        except:
            pass
        return False

def download_image(image_url: str, save_path: str) -> bool:
    """Download an image from a URL and save it to the specified path."""
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # Make the request
        response = requests.get(image_url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Check if the response is an image or a redirect
        if response.history:
            print(f"Following redirect: {image_url} -> {response.url}")
        
        content_type = response.headers.get("Content-Type", "")
        if not content_type.startswith("image/"):
            print(f"URL does not point to an image: {image_url}, Content-Type: {content_type}")
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

def get_random_roofing_image(save_path: str) -> bool:
    """Fallback function to get a random roofing-related image as a last resort"""
    roofing_fallback_urls = [
        "https://images.unsplash.com/photo-1632759145351-1d212863c9ae",  # Roof
        "https://images.unsplash.com/photo-1605808393295-df66339c74f6",  # House with roof
        "https://images.unsplash.com/photo-1605808515447-2e8d3df493f2",  # Residential roof
        "https://images.unsplash.com/photo-1620552698060-84c71cb40b86",  # Metal roof
        "https://images.unsplash.com/photo-1600585152220-90363fe7e115",  # Modern house
    ]
    
    # Try each fallback URL until one works
    for url in roofing_fallback_urls:
        if download_image(url, save_path):
            return True
    return False

def process_service_images(service: Dict[str, Any], service_type: str) -> None:
    """Process all blocks in a service and download images for them."""
    service_name = service["name"]
    category = service["category"]
    service_id = service["id"]
    
    print(f"Processing images for {service_name} ({category})...")
    
    # Create directories if they don't exist
    base_dir = os.path.join("public", "assets", "images", "services", category, f"{service_type}{service_id}")
    os.makedirs(base_dir, exist_ok=True)
    
    # Process each block
    for i, block in enumerate(service["blocks"]):
        # Use a reasonable default if no search terms are provided
        if "searchTerms" not in block or not block["searchTerms"]:
            print(f"  Block {i+1} has no search terms, using default...")
            search_term = f"{category} roofing {service_name}".strip()
        else:
            # Use the full search term as provided in the JSON
            search_term = block["searchTerms"].strip()
            print(f"  Block {i+1} search term: '{search_term}'")
        
        # Save path for the image
        save_path = os.path.join(base_dir, f"block_{i+1}.jpg")
        
        # Skip if the image already exists and is not empty
        if os.path.exists(save_path) and os.path.getsize(save_path) > 0:
            print(f"  Image for block {i+1} already exists, skipping...")
            continue
        
        print(f"  Searching for images for block {i+1}: {search_term}")
        
        # Try Google Search first
        success = False
        print("  Trying Google Search...")
        if get_google_images(search_term, save_path):
            print(f"  Successfully downloaded image for block {i+1} from Google")
            success = True
        
        # Last resort: use a known working image
        if not success:
            print("  Using fallback roofing image...")
            if get_random_roofing_image(save_path):
                print(f"  Successfully used fallback image for block {i+1}")
                success = True
        
        if not success:
            print(f"  Failed to download any images for block {i+1}")
        
        # Delay to avoid rate limiting
        time.sleep(random.uniform(2.0, 4.0))

def main():
    """Main function to scrape images for all services."""
    parser = argparse.ArgumentParser(description='Scrape images for services')
    parser.add_argument('--service_type', type=str, choices=['r', 'c', 'all'], default='all',
                        help='Type of service to process (r=residential, c=commercial, all=both)')
    args = parser.parse_args()

    try:
        # Look for services.json in the raw_data folder first
        script_dir = os.path.dirname(os.path.abspath(__file__))
        raw_data_dir = os.path.join(os.path.dirname(script_dir), "raw_data")
        services_json_path = os.path.join(raw_data_dir, "services.json")
        
        if not os.path.exists(services_json_path):
            # Try other possible locations
            possible_paths = [
                os.path.join(script_dir, "services.json"),
                "services.json",
                os.path.join(os.getcwd(), "public", "data", "raw_data", "services.json"),
                os.path.join(os.getcwd(), "scripts", "services.json"),
                os.path.join(os.getcwd(), "services.json"),
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    services_json_path = path
                    break
            else:
                raise FileNotFoundError(f"services.json not found in any expected location: {raw_data_dir}, {script_dir}, {os.getcwd()}")
        
        print(f"Using services.json from: {services_json_path}")
        with open(services_json_path, "r") as f:
            services_data = json.load(f)
        
        # Validate JSON structure
        if not isinstance(services_data, dict):
            raise ValueError(f"Expected services_data to be a dictionary, got {type(services_data)}")
        
        # Validate the required fields
        required_keys = ["residential", "commercial"]
        missing_keys = [key for key in required_keys if key not in services_data]
        if missing_keys:
            raise ValueError(f"Missing required keys in services.json: {missing_keys}")
            
        # Print some info about the data
        print(f"Found {len(services_data.get('residential', []))} residential services and {len(services_data.get('commercial', []))} commercial services")
        
        # Process residential services if requested
        if args.service_type in ['r', 'all']:
            for i, service in enumerate(services_data.get("residential", [])):
                if not isinstance(service, dict):
                    print(f"Warning: Residential service at index {i} is not a dictionary. Skipping.")
                    continue
                    
                # Check for required keys
                if "name" not in service:
                    print(f"Warning: Residential service at index {i} has no 'name' key. Using default.")
                    service["name"] = f"Residential Service {i+1}"
                    
                if "category" not in service:
                    print(f"Warning: Residential service at index {i} has no 'category' key. Using 'residential'.")
                    service["category"] = "residential"
                    
                if "id" not in service:
                    print(f"Warning: Residential service at index {i} has no 'id' key. Using {i+1}.")
                    service["id"] = i+1
                    
                if "blocks" not in service or not isinstance(service["blocks"], list):
                    print(f"Warning: Residential service at index {i} has no valid 'blocks' list. Skipping.")
                    continue
                
                process_service_images(service, "r")
        
        # Process commercial services if requested
        if args.service_type in ['c', 'all']:
            for i, service in enumerate(services_data.get("commercial", [])):
                if not isinstance(service, dict):
                    print(f"Warning: Commercial service at index {i} is not a dictionary. Skipping.")
                    continue
                    
                # Check for required keys
                if "name" not in service:
                    print(f"Warning: Commercial service at index {i} has no 'name' key. Using default.")
                    service["name"] = f"Commercial Service {i+1}"
                    
                if "category" not in service:
                    print(f"Warning: Commercial service at index {i} has no 'category' key. Using 'commercial'.")
                    service["category"] = "commercial"
                    
                if "id" not in service:
                    print(f"Warning: Commercial service at index {i} has no 'id' key. Using {i+1}.")
                    service["id"] = i+1
                    
                if "blocks" not in service or not isinstance(service["blocks"], list):
                    print(f"Warning: Commercial service at index {i} has no valid 'blocks' list. Skipping.")
                    continue
                
                process_service_images(service, "c")
            
        print("Image scraping completed successfully!")
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format in services.json: {e}")
    except Exception as e:
        import traceback
        print(f"Error during image scraping: {e}")
        print(traceback.format_exc())

if __name__ == "__main__":
    main() 