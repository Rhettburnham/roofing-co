from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager
import requests
import os
import time
import re
from bs4 import BeautifulSoup
import urllib.parse
import logging
import traceback
import random
import json
import argparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Create output directory
def ensure_dir_exists(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)
        logging.info(f"Created directory: {directory}")

def clean_filename(name):
    """Clean the filename by removing invalid characters"""
    # Replace any character that isn't alphanumeric, space, or underscore with an underscore
    clean_name = re.sub(r'[^\w\s]', '_', name)
    # Replace multiple spaces with a single underscore
    clean_name = re.sub(r'\s+', '_', clean_name)
    return clean_name

def download_image(url, save_path):
    """Download image from URL and save to specified path"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(save_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logging.info(f"Successfully downloaded: {save_path}")
        return True
    except Exception as e:
        logging.error(f"Failed to download {url}: {str(e)}")
        return False

def scroll_to_element(driver, element):
    """Scroll to make an element visible"""
    try:
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
        time.sleep(0.5)  # Give time for scroll to complete
    except Exception as e:
        logging.error(f"Error scrolling to element: {str(e)}")

def scroll_page(driver, scroll_amount=300, num_scrolls=10, delay=0.5):
    """Scroll down the page gradually to load content"""
    logging.info(f"Scrolling page to load content...")
    
    for i in range(num_scrolls):
        driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
        time.sleep(delay)
        
    # Scroll back to top
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(delay)

def get_updated_product_title(card):
    """Get the updated product title after color selection"""
    try:
        # First try to get the product and brand together
        title_element = card.find_element(By.CSS_SELECTOR, "span[data-testid='attribute-product-label']")
        title_text = title_element.text.strip()
        
        try:
            brand_element = card.find_element(By.CSS_SELECTOR, "p[data-testid='attribute-brandname-above']")
            brand_text = brand_element.text.strip()
            full_title = f"{brand_text}_{title_text}"
        except NoSuchElementException:
            full_title = title_text
            
        return full_title
    except Exception as e:
        logging.error(f"Error getting updated title: {str(e)}")
        return None

def extract_model_number(card):
    """Extract model number from a product card if available"""
    try:
        # Try to find the model number using the selector pattern
        model_div = card.find_elements(By.CSS_SELECTOR, "div.sui-flex.sui-text-xs.sui-text-subtle.sui-font-normal")
        if model_div:
            for div in model_div:
                text = div.text.strip()
                if text.startswith("Model#"):
                    # Extract the model number
                    model_number = text.replace("Model#", "").strip()
                    return model_number
        
        # Alternative selector
        model_div = card.find_elements(By.XPATH, ".//div[contains(text(), 'Model#')]")
        if model_div:
            for div in model_div:
                text = div.text.strip()
                model_number = text.replace("Model#", "").strip()
                return model_number
                
        return None
    except Exception as e:
        logging.error(f"Error extracting model number: {str(e)}")
        return None

def process_color_options(driver, card, output_dir, index, base_title, total_count):
    """Process color option buttons if they exist"""
    try:
        # Check if color options exist
        color_buttons_container = card.find_elements(By.CSS_SELECTOR, "div.sui-inline-flex.sui-flex-wrap.sui-items-center")
        
        if not color_buttons_container:
            return 0
        
        color_buttons = color_buttons_container[0].find_elements(By.CSS_SELECTOR, "button[aria-pressed]")
        
        if not color_buttons or len(color_buttons) <= 1:
            return 0
            
        # Skip the first button as it's already selected and processed
        successful_downloads = 0
        
        for i, button in enumerate(color_buttons[1:], 1):
            try:
                # Skip if it's a "more" button
                button_text = button.text.strip().lower()
                if "more" in button_text or "+more" in button_text:
                    logging.info("Found 'more' button, skipping")
                    continue
                
                # Get the color name
                color_value = button.get_attribute('value')
                if not color_value:
                    # Try to get the color from the image alt text or src
                    img_in_button = button.find_elements(By.TAG_NAME, "img")
                    if img_in_button:
                        alt_text = img_in_button[0].get_attribute('alt')
                        if alt_text:
                            color_value = alt_text
                        else:
                            # Extract from image URL if all else fails
                            src = img_in_button[0].get_attribute('src')
                            if src:
                                color_value = os.path.basename(src).split('.')[0]
                
                if not color_value:
                    color_value = f"color_variant_{i}"
                
                # Scroll to the button to ensure it's visible
                scroll_to_element(driver, button)
                
                # Click on the color button with random delay
                driver.execute_script("arguments[0].click();", button)
                time.sleep(random.uniform(0.7, 1.5))  # Random wait for image to update
                
                # Get updated title if possible
                updated_title = get_updated_product_title(card)
                if updated_title:
                    clean_updated_title = clean_filename(updated_title)
                else:
                    clean_updated_title = base_title
                
                # Find the updated image
                img_element = WebDriverWait(card, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='product-image__wrapper'] img"))
                )
                
                # Get the updated image URL
                img_url = img_element.get_attribute('src')
                
                # Create filename with color
                clean_color = clean_filename(color_value)
                variant_count = total_count * 1000 + i  # Use a numbering scheme that keeps variants with their parent
                filename = f"{variant_count}_{clean_updated_title}_{clean_color}.jpg"
                save_path = os.path.join(output_dir, filename)
                
                # Download the image
                if download_image(img_url, save_path):
                    logging.info(f"Downloaded color variant: {clean_color} for product {total_count}")
                    successful_downloads += 1
                    
            except Exception as e:
                logging.error(f"Error processing color option {i+1}: {str(e)}")
                continue
                
        return successful_downloads
        
    except Exception as e:
        logging.error(f"Error finding color options: {str(e)}")
        return 0

def process_product_card(driver, card, output_dir, index, total_count):
    """Extract image and title from a product card and download the image"""
    try:
        # Scroll to the card to ensure it's in view
        scroll_to_element(driver, card)
        
        # Find the product image
        img_element = WebDriverWait(card, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='product-image__wrapper'] img"))
        )
        
        # Get image URL
        img_url = img_element.get_attribute('src')
        
        # Find the product title
        title_element = WebDriverWait(card, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "span[data-testid='attribute-product-label']"))
        )
        
        title_text = title_element.text.strip()
        
        # Also get the brand if available
        try:
            brand_element = card.find_element(By.CSS_SELECTOR, "p[data-testid='attribute-brandname-above']")
            brand_text = brand_element.text.strip()
            full_title = f"{brand_text}_{title_text}"
        except NoSuchElementException:
            full_title = title_text
        
        # Clean the title to use as a filename
        clean_title = clean_filename(full_title)
        
        # Add an index to prevent filename collisions
        filename = f"{total_count}_{clean_title}.jpg"
        save_path = os.path.join(output_dir, filename)
        
        # Download the image
        if download_image(img_url, save_path):
            logging.info(f"Product {total_count}: {full_title}")
            return True, clean_title
        
        return False, None
    
    except Exception as e:
        logging.error(f"Error processing product card {index}: {str(e)}")
        return False, None

def wait_for_model_number_change(driver, card, original_model):
    """Wait for model number to change after clicking a color variant button"""
    try:
        start_time = time.time()
        max_wait_time = 3  # Maximum time to wait in seconds
        
        while time.time() - start_time < max_wait_time:
            # Check if model number has changed
            current_model = extract_model_number(card)
            
            # If we have a new valid model number that's different from the original
            if current_model and current_model != original_model:
                logging.info(f"Model number changed from {original_model} to {current_model}")
                return current_model
                
            # Short wait before checking again
            time.sleep(0.2)
        
        # If we get here, the model number hasn't changed
        logging.info(f"Model number did not change from {original_model}")
        return None
    except Exception as e:
        logging.error(f"Error waiting for model number change: {str(e)}")
        return None

def process_row_of_cards(driver, cards_in_row, output_dir, row_index, base_count):
    """Process a row of product cards simultaneously"""
    successful_products = 0
    image_metadata = []
    card_data = []
    
    # First pass: process main images from each card
    for i, card in enumerate(cards_in_row):
        try:
            overall_index = base_count + i
            success, base_title = process_product_card(driver, card, output_dir, i, overall_index)
            
            if success:
                successful_products += 1
                
                # Get brand and product info for metadata
                try:
                    brand_element = card.find_element(By.CSS_SELECTOR, "p[data-testid='attribute-brandname-above']")
                    brand_text = brand_element.text.strip()
                except NoSuchElementException:
                    brand_text = "Unknown"
                
                # Get product title
                try:
                    title_element = card.find_element(By.CSS_SELECTOR, "span[data-testid='attribute-product-label']")
                    title_text = title_element.text.strip()
                except NoSuchElementException:
                    title_text = "Unknown Product"
                
                # Extract model number
                model_number = extract_model_number(card)
                
                # Add metadata for main image
                filename = f"{overall_index}_{clean_filename(brand_text)}_{clean_filename(title_text)}.jpg"
                image_metadata.append({
                    'original_filename': filename,
                    'brand': brand_text,
                    'product': title_text,
                    'type': 'main',
                    'color': 'default',
                    'index': overall_index,
                    'model_number': model_number
                })
                
                # Find color option buttons for this card (to process later)
                color_buttons_container = card.find_elements(By.CSS_SELECTOR, "div.sui-inline-flex.sui-flex-wrap.sui-items-center")
                
                if color_buttons_container:
                    color_buttons = color_buttons_container[0].find_elements(By.CSS_SELECTOR, "button[aria-pressed]")
                    
                    # Skip cards without color options or with only one option
                    if color_buttons and len(color_buttons) > 1:
                        # Store for later processing (skip first button which is already selected)
                        variant_buttons = [btn for j, btn in enumerate(color_buttons) if j > 0 and "more" not in btn.text.strip().lower()]
                        if variant_buttons:
                            card_data.append({
                                'card': card,
                                'buttons': variant_buttons,
                                'index': overall_index,
                                'base_title': base_title,
                                'brand': brand_text,
                                'product': title_text,
                                'original_filename': filename,  # Store the original filename for reference
                                'model_number': model_number
                            })
            
            # Random short delay between processing cards (reduced)
            time.sleep(random.uniform(0.1, 0.3))
                
        except Exception as e:
            logging.error(f"Error during main image processing for card {i+1} in row {row_index}: {str(e)}")
            traceback.print_exc()
    
    # Second pass: process color variants by selecting one button from each card in sequence
    total_color_variants = 0
    
    # Continue as long as at least one card has unprocessed buttons
    while any(len(data['buttons']) > 0 for data in card_data):
        for data in card_data:
            if not data['buttons']:
                continue
                
            try:
                # Take the first button
                button = data['buttons'].pop(0)
                card = data['card']
                index = data['index']
                base_title = data['base_title']
                brand = data.get('brand', 'Unknown')
                product = data.get('product', 'Unknown Product')
                original_filename = data.get('original_filename', '')
                original_model_number = data.get('model_number')
                
                # Capture the original product title before clicking
                original_title = None
                try:
                    title_element = card.find_element(By.CSS_SELECTOR, "span[data-testid='attribute-product-label']")
                    original_title = title_element.text.strip()
                except NoSuchElementException:
                    original_title = product
                
                # Process this color variant
                scroll_to_element(driver, button)
                
                # Get the color name before clicking
                color_value = button.get_attribute('value')
                if not color_value:
                    # Try to get the color from the image
                    img_in_button = button.find_elements(By.TAG_NAME, "img")
                    if img_in_button:
                        alt_text = img_in_button[0].get_attribute('alt')
                        if alt_text:
                            color_value = alt_text
                        else:
                            src = img_in_button[0].get_attribute('src')
                            if src:
                                color_value = os.path.basename(src).split('.')[0]
                
                if not color_value:
                    color_value = f"variant_{len(data['buttons'])}"
                
                # Click the button
                driver.execute_script("arguments[0].click();", button)
                
                # Wait for the model number to potentially change - this indicates the page has updated
                updated_model_number = wait_for_model_number_change(driver, card, original_model_number)
                
                # If model didn't change, still wait a bit for image to update
                if not updated_model_number:
                    time.sleep(random.uniform(0.5, 0.8))
                    updated_model_number = extract_model_number(card)
                    
                if not updated_model_number:
                    updated_model_number = original_model_number
                
                # Get updated title after clicking
                updated_title = None
                try:
                    title_element = WebDriverWait(card, 3).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "span[data-testid='attribute-product-label']"))
                    )
                    updated_title = title_element.text.strip()
                except:
                    logging.info(f"Could not find updated title after clicking color variant, using original title")
                    updated_title = original_title
                
                # If the title didn't change but the model did, use the model in the title
                if (not updated_title or updated_title == original_title) and updated_model_number != original_model_number:
                    updated_title = f"{original_title} - {updated_model_number}"
                # If neither changed, use the color
                elif not updated_title or updated_title == original_title:
                    updated_title = f"{original_title} - {color_value}"
                
                clean_updated_title = clean_filename(updated_title)
                
                # Find the updated image
                img_element = WebDriverWait(card, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='product-image__wrapper'] img"))
                )
                
                img_url = img_element.get_attribute('src')
                
                # Create filename with color and model information
                clean_color = clean_filename(color_value)
                variant_count = index * 1000 + (len(data['buttons']) + 1)
                
                # Include model number in filename if available and different
                if updated_model_number and updated_model_number != original_model_number:
                    filename = f"{variant_count}_{clean_updated_title}_{clean_color}_model_{updated_model_number}.jpg"
                else:
                    filename = f"{variant_count}_{clean_updated_title}_{clean_color}.jpg"
                    
                save_path = os.path.join(output_dir, filename)
                
                # Store metadata for variant image
                image_metadata.append({
                    'original_filename': filename,
                    'brand': brand,
                    'product': updated_title,  # Use the updated title
                    'type': 'variant',
                    'color': color_value,
                    'index': variant_count,
                    'parent_filename': original_filename,  # Link to the parent image
                    'model_number': updated_model_number,
                    'original_model_number': original_model_number
                })
                
                # Download the image
                if download_image(img_url, save_path):
                    logging.info(f"Downloaded color variant: {clean_color} for product {index}")
                    total_color_variants += 1
                
                # Random delay between processing buttons - REDUCED
                time.sleep(random.uniform(0.1, 0.2))
                
            except Exception as e:
                logging.error(f"Error processing color variant for product {index}: {str(e)}")
    
    return successful_products, total_color_variants, image_metadata

def group_cards_by_rows(driver, product_cards, cards_per_row=3):
    """Group product cards into rows for parallel processing"""
    rows = []
    current_row = []
    
    for i, card in enumerate(product_cards):
        current_row.append(card)
        
        # If we've reached the desired cards per row or it's the last card
        if len(current_row) == cards_per_row or i == len(product_cards) - 1:
            rows.append(current_row)
            current_row = []
    
    return rows

def get_pagination_links(driver):
    """Find pagination links to navigate through all pages"""
    try:
        pagination = driver.find_element(By.CSS_SELECTOR, "nav[aria-label='Pagination Navigation']")
        # Get all number buttons/links - exclude arrows
        page_links = pagination.find_elements(By.CSS_SELECTOR, "li a[aria-label^='Go to Page'], li a[aria-current='true'], li button[aria-label^='Go to Page']")
        
        # Extract max page number
        max_page = 1
        for link in page_links:
            try:
                page_text = link.text.strip()
                if page_text and page_text.isdigit():
                    page_num = int(page_text)
                    if page_num > max_page:
                        max_page = page_num
            except Exception:
                continue
                
        logging.info(f"Found {max_page} pages of results")
        return max_page
    except Exception as e:
        logging.error(f"Error finding pagination: {str(e)}")
        return 1  # Default to 1 page if pagination not found

def navigate_to_page(driver, page_num):
    """Navigate to a specific page"""
    try:
        logging.info(f"Navigating to page {page_num}")
        
        # Find pagination
        pagination = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "nav[aria-label='Pagination Navigation']"))
        )
        
        # Scroll to pagination
        scroll_to_element(driver, pagination)
        
        # Find the specific page link
        if page_num == 1:
            # First page might be specially marked
            page_link = pagination.find_element(By.CSS_SELECTOR, "li a[aria-current='true']")
        else:
            page_link = pagination.find_element(By.CSS_SELECTOR, f"li a[aria-label='Go to Page {page_num}'], li button[aria-label='Go to Page {page_num}']")
        
        # Click on the page link
        driver.execute_script("arguments[0].click();", page_link)
        
        # Wait for the page to load
        time.sleep(5)
        
        # Scroll the page to load all content
        scroll_page(driver)
        
        return True
    except NoSuchElementException:
        # Try using next button repeatedly if exact page link not found
        try:
            for _ in range(page_num - 1):
                next_button = pagination.find_element(By.CSS_SELECTOR, "li a[aria-label='Skip to Next Page']")
                driver.execute_script("arguments[0].click();", next_button)
                time.sleep(5)
                scroll_page(driver)
            return True
        except Exception as e:
            logging.error(f"Error navigating with next button: {str(e)}")
            return False
    except Exception as e:
        logging.error(f"Error navigating to page {page_num}: {str(e)}")
        return False

def scrape_from_live_site(max_pages=None, max_images=None):
    """
    Scrape images from the live Home Depot website
    
    Args:
        max_pages (int, optional): Maximum number of pages to scrape. Default is all pages.
        max_images (int, optional): Maximum number of images to download. Default is all images.
    """
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'raw_data', 'shingles')
    ensure_dir_exists(output_dir)
    
    # Set up Selenium WebDriver
    options = Options()
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    
    # Uncomment to run headless (no browser window)
    # options.add_argument("--headless")
    
    logging.info("Setting up Chrome WebDriver...")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    # Initialize list to store image metadata
    all_image_metadata = []
    
    try:
        # Navigate to the Home Depot shingles page
        url = 'https://www.homedepot.com/b/Building-Materials-Roofing/N-5yc1vZaq7m?NCNI-5&searchRedirect=roof&semanticToken=k27r10r10f22040000000e_202504010433278121042422963_us-east1-zxwv%20k27r10r10f22040000000e%20%3E%20st%3A%7Broof%7D%3Ast%20ml%3A%7B24%7D%3Aml%20nr%3A%7Broof%7D%3Anr%20nf%3A%7Bn%2Fa%7D%3Anf%20qu%3A%7Broof%7D%3Aqu%20ie%3A%7B0%7D%3Aie%20qr%3A%7Broof%7D%3Aqr'
        logging.info(f"Navigating to URL: {url}")
        driver.get(url)
        
        # Wait for the page to load
        time.sleep(5)
        
        # Initial scroll to load content
        scroll_page(driver)
        
        # Get total number of pages
        total_pages = get_pagination_links(driver)
        
        # Apply max_pages limit if specified
        if max_pages and max_pages > 0 and max_pages < total_pages:
            logging.info(f"Limiting scraping to {max_pages} pages (out of {total_pages})")
            total_pages = max_pages
        else:
            logging.info(f"Scraping all {total_pages} pages")
        
        # Initialize counters
        total_products_count = 0
        total_color_variants = 0
        
        # Process each page
        for current_page in range(1, total_pages + 1):
            # Check if we've reached the max images limit
            if max_images and (total_products_count + total_color_variants) >= max_images:
                logging.info(f"Reached maximum image limit of {max_images}. Stopping.")
                break
                
            if current_page > 1:
                # Navigate to next page
                if not navigate_to_page(driver, current_page):
                    logging.error(f"Failed to navigate to page {current_page}, skipping")
                    continue
            
            # Find all product cards on current page
            logging.info(f"Looking for product cards on page {current_page}...")
            
            # Wait for product cards to be visible after page navigation
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#browse-search-pods-1 > div, div.results-wrapped div.sui-relative.sui-flex.sui-flex-col.sui-h-full"))
            )
            
            product_cards = driver.find_elements(By.CSS_SELECTOR, "#browse-search-pods-1 > div > div > div")
            
            if not product_cards:
                logging.info("No product cards found with primary selector. Trying alternate selector...")
                product_cards = driver.find_elements(By.CSS_SELECTOR, "div.results-wrapped div.sui-relative.sui-flex.sui-flex-col.sui-h-full")
            
            logging.info(f"Found {len(product_cards)} product cards on page {current_page}")
            
            # Group cards into rows (typically 3 cards per row)
            card_rows = group_cards_by_rows(driver, product_cards, cards_per_row=3)
            logging.info(f"Grouped cards into {len(card_rows)} rows")
            
            # Process each row of cards
            page_products_count = 0
            page_color_variants = 0
            page_metadata = []
            
            for row_idx, row_cards in enumerate(card_rows):
                try:
                    # Check if we're approaching the max images limit
                    images_so_far = total_products_count + total_color_variants + page_products_count + page_color_variants
                    if max_images and images_so_far >= max_images:
                        logging.info(f"Reached maximum image limit of {max_images}. Stopping processing rows.")
                        break
                        
                    # Calculate base index for this row
                    row_base_index = total_products_count + page_products_count + 1
                    
                    # Process this row of cards
                    products, variants, row_metadata = process_row_of_cards(
                        driver, row_cards, output_dir, row_idx + 1, row_base_index
                    )
                    
                    page_products_count += products
                    page_color_variants += variants
                    page_metadata.extend(row_metadata)
                    
                    # Give the page a moment to recover between rows - REDUCED
                    time.sleep(random.uniform(0.8, 1.5))
                    
                except Exception as e:
                    logging.error(f"Error processing row {row_idx + 1} on page {current_page}: {str(e)}")
                    traceback.print_exc()
            
            # Update total counters
            total_products_count += page_products_count
            total_color_variants += page_color_variants
            all_image_metadata.extend(page_metadata)
            
            logging.info(f"Page {current_page} complete: {page_products_count} products, {page_color_variants} color variants")
            logging.info(f"Running total: {total_products_count} products, {total_color_variants} variants")
        
        logging.info(f"Scraping complete! Downloaded {total_products_count} main product images")
        logging.info(f"Downloaded {total_color_variants} color variant images")
        logging.info(f"Total images: {total_products_count + total_color_variants}")
        
        # Save metadata to JSON file
        metadata_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'step_4', 'shingle_images_metadata.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(all_image_metadata, f, indent=2)
        logging.info(f"Saved metadata for {len(all_image_metadata)} images to {metadata_file}")
        
    except Exception as e:
        logging.error(f"Error during scraping: {str(e)}")
        traceback.print_exc()
        
        # Save metadata even if there was an error
        if all_image_metadata:
            metadata_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'step_4', 'shingle_images_metadata.json')
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(all_image_metadata, f, indent=2)
            logging.info(f"Saved metadata for {len(all_image_metadata)} images to {metadata_file}")
    finally:
        driver.quit()
        logging.info("WebDriver closed")

def extract_model_number_bs(card):
    """Extract model number from a BeautifulSoup card element if available"""
    try:
        # Try to find the model number using the CSS selector
        model_div = card.select("div.sui-flex.sui-text-xs.sui-text-subtle.sui-font-normal")
        if model_div:
            for div in model_div:
                text = div.text.strip()
                if text.startswith("Model#"):
                    # Extract the model number
                    model_number = text.replace("Model#", "").strip()
                    return model_number
        
        # Alternative selector
        model_div = card.select("div:-soup-contains('Model#')")
        if model_div:
            for div in model_div:
                text = div.text.strip()
                if "Model#" in text:
                    model_number = text.replace("Model#", "").strip()
                    return model_number
                
        return None
    except Exception as e:
        logging.error(f"Error extracting model number with BeautifulSoup: {str(e)}")
        return None

def scrape_from_local_html(max_images=None):
    """
    Scrape images from the locally stored HTML file
    
    Args:
        max_images (int, optional): Maximum number of images to download. Default is all images.
    """
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'raw_data', 'shingles')
    ensure_dir_exists(output_dir)
    
    html_file = os.path.join(output_dir, 'shingles_body.html')
    logging.info(f"Reading local HTML file: {html_file}")
    
    # Initialize list to store image metadata
    all_image_metadata = []
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find all product cards
        product_cards = soup.select("#browse-search-pods-1 > div > div > div")
        
        if not product_cards:
            logging.info("No product cards found. Trying alternate selector...")
            product_cards = soup.select("div.results-wrapped div.sui-relative.sui-flex.sui-flex-col.sui-h-full")
        
        logging.info(f"Found {len(product_cards)} product cards")
        
        # We need to set up a WebDriver for JS interactions with color options
        options = Options()
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-extensions")
        
        # Since we're using local HTML, run in headless mode
        options.add_argument("--headless")
        
        logging.info("Setting up Chrome WebDriver for local HTML processing...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        try:
            # Load local HTML into the WebDriver
            temp_html_path = "file://" + os.path.abspath(html_file)
            driver.get(temp_html_path)
            logging.info(f"Loaded local HTML into WebDriver: {temp_html_path}")
            time.sleep(2)
            
            # Attempt to process with WebDriver for better interactivity
            # Find all product cards
            web_product_cards = driver.find_elements(By.CSS_SELECTOR, "#browse-search-pods-1 > div > div > div")
            
            if not web_product_cards:
                logging.info("No product cards found in WebDriver. Trying alternate selector...")
                web_product_cards = driver.find_elements(By.CSS_SELECTOR, "div.results-wrapped div.sui-relative.sui-flex.sui-flex-col.sui-h-full")
            
            if web_product_cards:
                logging.info(f"Found {len(web_product_cards)} product cards in WebDriver")
                
                # Group cards into rows (typically 3 cards per row)
                card_rows = group_cards_by_rows(driver, web_product_cards, cards_per_row=3)
                logging.info(f"Grouped cards into {len(card_rows)} rows")
                
                total_products = 0
                total_variants = 0
                
                # Process each row of cards
                for row_idx, row_cards in enumerate(card_rows):
                    try:
                        # Process this row of cards
                        products, variants, row_metadata = process_row_of_cards(
                            driver, row_cards, output_dir, row_idx + 1, total_products + 1
                        )
                        
                        total_products += products
                        total_variants += variants
                        all_image_metadata.extend(row_metadata)
                        
                        # Give the page a moment to recover between rows - REDUCED
                        time.sleep(random.uniform(0.8, 1.5))
                        
                    except Exception as e:
                        logging.error(f"Error processing row {row_idx + 1}: {str(e)}")
                        traceback.print_exc()
                
                logging.info(f"WebDriver processing complete! Downloaded {total_products} product images and {total_variants} variants")
                
                # Save metadata to JSON file
                metadata_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'step_4', 'shingle_images_metadata.json')
                with open(metadata_file, 'w', encoding='utf-8') as f:
                    json.dump(all_image_metadata, f, indent=2)
                logging.info(f"Saved metadata for {len(all_image_metadata)} images to {metadata_file}")
                
                return
            else:
                logging.warning("Failed to find product cards with WebDriver, falling back to basic BeautifulSoup extraction")
                
        except Exception as e:
            logging.error(f"Error during WebDriver processing: {str(e)}")
            logging.info("Falling back to basic BeautifulSoup extraction")
            traceback.print_exc()
        finally:
            driver.quit()
            logging.info("WebDriver closed")
        
        # Fallback to basic BeautifulSoup extraction if WebDriver method fails
        successful_downloads = 0
        
        # Limit product cards if max_images is specified
        if max_images and max_images < len(product_cards):
            logging.info(f"Limiting to first {max_images} product cards due to max_images setting")
            product_cards = product_cards[:max_images]
        
        for i, card in enumerate(product_cards, 1):
            try:
                logging.info(f"Processing product card {i}...")
                
                # Check if we've reached the max images limit
                if max_images and successful_downloads >= max_images:
                    logging.info(f"Reached maximum image limit of {max_images}. Stopping.")
                    break
                
                # Find the product image
                img_element = card.select_one("div[data-testid='product-image__wrapper'] img")
                
                if not img_element:
                    logging.warning(f"No image found for product card {i}, skipping")
                    continue
                
                # Get image URL
                img_url = img_element.get('src')
                
                if not img_url:
                    logging.warning(f"No image URL found for product card {i}, skipping")
                    continue
                
                # Find the product title
                title_element = card.select_one("span[data-testid='attribute-product-label']")
                
                if not title_element:
                    logging.warning(f"No title found for product card {i}, skipping")
                    title_text = f"unknown_product_{i}"
                else:
                    title_text = title_element.text.strip()
                
                # Try to get the brand if available
                brand_element = card.select_one("p[data-testid='attribute-brandname-above']")
                if brand_element:
                    brand_text = brand_element.text.strip()
                    full_title = f"{brand_text}_{title_text}"
                else:
                    brand_text = "Unknown"
                    full_title = title_text
                
                # Extract model number
                model_number = extract_model_number_bs(card)
                
                # Clean the title to use as a filename
                clean_title = clean_filename(full_title)
                
                # Add an index to prevent filename collisions
                filename = f"{i}_{clean_title}.jpg"
                save_path = os.path.join(output_dir, filename)
                
                # Download the image
                if download_image(img_url, save_path):
                    logging.info(f"Product {i}: {full_title}")
                    successful_downloads += 1
                    
                    # Add metadata for this image
                    all_image_metadata.append({
                        'original_filename': filename,
                        'brand': brand_text,
                        'product': title_text,
                        'type': 'main',
                        'color': 'default',
                        'index': i,
                        'model_number': model_number
                    })
                
            except Exception as e:
                logging.error(f"Error processing product card {i}: {str(e)}")
                traceback.print_exc()
                continue
        
        logging.info(f"Scraping complete! Downloaded {successful_downloads} product images")
        
        # Save metadata to JSON file
        if all_image_metadata:
            metadata_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'step_4', 'shingle_images_metadata.json')
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(all_image_metadata, f, indent=2)
            logging.info(f"Saved metadata for {len(all_image_metadata)} images to {metadata_file}")
        
    except Exception as e:
        logging.error(f"Error reading or parsing HTML file: {str(e)}")
        traceback.print_exc()

def count_max_images():
    """Count the maximum number of shingle images that were downloaded"""
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'raw_data', 'shingles')
    
    try:
        # Get all jpg files in the directory
        image_files = [f for f in os.listdir(output_dir) if f.endswith('.jpg')]
        
        # Count total images
        total_images = len(image_files)
        
        # Count main products (not color variants)
        main_products = len([f for f in image_files if '_color_variant_' not in f and re.match(r'^\d+_', f)])
        
        # Count color variants
        color_variants = total_images - main_products
        
        # Get unique product brands
        brands = set()
        for file in image_files:
            parts = file.split('_')
            if len(parts) > 1:
                potential_brand = parts[1]
                if potential_brand in ['Owens', 'GAF']:
                    brands.add(potential_brand)
        
        logging.info(f"Image Statistics:")
        logging.info(f"Total images: {total_images}")
        logging.info(f"Main product images: {main_products}")
        logging.info(f"Color variant images: {color_variants}")
        logging.info(f"Unique brands: {', '.join(brands)}")
        
        return total_images, main_products, color_variants, brands
        
    except Exception as e:
        logging.error(f"Error counting images: {str(e)}")
        return 0, 0, 0, set()

if __name__ == "__main__":
    logging.info("Starting Home Depot shingle image scraper")
    
    try:
        # Try to scrape from the live site first
        logging.info("Attempting to scrape from live Home Depot website...")
        scrape_from_live_site()
    except Exception as e:
        logging.error(f"Failed to scrape from live site: {str(e)}")
        logging.info("Falling back to local HTML file...")
        scrape_from_local_html()
    
    # Count the images downloaded
    count_max_images()
    
    logging.info("Script completed") 