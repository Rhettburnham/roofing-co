#!/usr/bin/env python3
import os
import time
import logging
import shutil
from datetime import datetime
from pathlib import Path
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from chromedriver_py import binary_path
import requests
from io import BytesIO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("enhance_logo.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Original convert_to_png function from convert_logo.py
def convert_to_png(input_path, output_path):
    """
    Convert an image to proper PNG format with transparency.
    
    Args:
        input_path: Path to the input image
        output_path: Path to save the converted PNG
    """
    try:
        # Open the image
        img = Image.open(input_path)
        
        # Convert to RGBA mode for transparency
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Save as PNG with maximum quality
        img.save(output_path, 'PNG', optimize=False, quality=100)
        
        logger.info(f"Image converted to PNG and saved to {output_path}")
        return True
    except Exception as e:
        logger.error(f"Error converting image: {e}")
        return False

def setup_web_driver():
    """Initialize and configure Chrome WebDriver with stealth options."""
    options = Options()
    
    # Enable downloads in headless mode
    prefs = {
        "download.default_directory": str(Path.home() / "Downloads"),
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True
    }
    options.add_experimental_option("prefs", prefs)
    
    # User agent to mimic a real browser
    user_agent = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/113.0.5672.63 Safari/537.36"
    )
    options.add_argument(f"user-agent={user_agent}")
    
    # Additional stealth options
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Initialize WebDriver
    driver = webdriver.Chrome(
        service=Service(binary_path),
        options=options
    )
    
    # Additional stealth measures
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver

def enhance_logo_with_chatgpt(input_path):
    """
    Enhance the logo quality using ChatGPT.
    
    Args:
        input_path: Path to the input logo
    
    Returns:
        Path to the enhanced logo or None if the process failed
    """
    logger.info("Starting logo enhancement process with ChatGPT")
    
    driver = setup_web_driver()
    enhanced_logo_path = None
    
    try:
        # Navigate to ChatGPT
        logger.info("Navigating to ChatGPT")
        driver.get("https://chatgpt.com/?model=gpt-4o")
        
        # Wait for the page to load
        logger.info("Waiting for page to load")
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "button[aria-label='Upload']"))
        )
        
        # Click on the Upload button
        logger.info("Clicking upload button")
        upload_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Upload']")
        upload_button.click()
        
        # Wait for the file upload option to appear
        logger.info("Waiting for file upload dialog")
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Choose file']"))
        )
        
        # Find the file input and upload the logo
        logger.info(f"Uploading logo from {input_path}")
        file_input = driver.find_element(By.CSS_SELECTOR, "input[type='file']")
        file_input.send_keys(os.path.abspath(input_path))
        
        # Wait for the file to be uploaded
        logger.info("Waiting for file to be uploaded")
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[data-testid='uploaded-image']"))
        )
        
        # Enter the prompt in the textarea
        logger.info("Entering prompt")
        prompt_textarea = driver.find_element(By.CSS_SELECTOR, "#prompt-textarea")
        prompt_textarea.clear()
        prompt_textarea.send_keys("Please recreate the logo, make a new image enhance the quality of the logo. Make the colors more vibrant and improve the resolution. Maintain the original design and style but make it look more professional.")
        
        # Submit the prompt
        logger.info("Submitting prompt")
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[data-testid='send-button']")
        submit_button.click()
        
        # Wait for the response with image
        logger.info("Waiting for ChatGPT to generate enhanced logo (60 seconds)")
        time.sleep(60)  # Give ChatGPT time to generate the image
        
        # Look for the generated image
        logger.info("Looking for generated image")
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "img[alt='Generated image']"))
        )
        
        # Find the download button and click it
        logger.info("Clicking download button")
        download_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Download image']")
        download_button.click()
        
        # Wait for the download to complete
        logger.info("Waiting for download to complete")
        time.sleep(5)
        
        # Look for the downloaded file in the Downloads folder
        downloads_folder = Path.home() / "Downloads"
        # Find the most recent ChatGPT image file
        chatgpt_image_files = list(downloads_folder.glob("ChatGPT Image*.png"))
        if chatgpt_image_files:
            # Sort by creation time and get the most recent one
            most_recent_file = max(chatgpt_image_files, key=lambda x: x.stat().st_ctime)
            enhanced_logo_path = str(most_recent_file)
            logger.info(f"Enhanced logo downloaded to: {enhanced_logo_path}")
        else:
            logger.error("Could not find downloaded image in Downloads folder")
        
    except Exception as e:
        logger.error(f"Error during ChatGPT enhancement: {e}")
    
    finally:
        # Close the browser
        logger.info("Closing the browser")
        driver.quit()
    
    return enhanced_logo_path

def main():
    """Main function to enhance and convert the logo."""
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    
    input_path = os.path.join(data_dir, "raw_data", "step_1", "logo.png")
    output_dir = os.path.join(data_dir, "raw_data", "step_3")
    enhanced_logo_path = os.path.join(output_dir, "enhanced_logo.png")
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Check if the original logo exists
    if not os.path.exists(input_path):
        logger.error(f"Original logo not found at {input_path}")
        return False
    
    # First, backup the original logo
    backup_path = input_path + '.backup'
    shutil.copy2(input_path, backup_path)
    logger.info(f"Original logo backed up to: {backup_path}")
    
    # Enhance logo with ChatGPT
    downloaded_logo = enhance_logo_with_chatgpt(input_path)
    
    if downloaded_logo:
        # Convert the enhanced image to proper PNG format
        logger.info("Converting enhanced logo to proper PNG format")
        if convert_to_png(downloaded_logo, enhanced_logo_path):
            logger.info(f"Enhanced logo saved to {enhanced_logo_path}")
            
            # Compare file sizes
            original_size = os.path.getsize(input_path)
            enhanced_size = os.path.getsize(enhanced_logo_path)
            logger.info(f"Original file size: {original_size / 1024:.2f} KB")
            logger.info(f"Enhanced file size: {enhanced_size / 1024:.2f} KB")
            
            # Replace the original logo
            shutil.copy2(enhanced_logo_path, input_path)
            logger.info("Original logo replaced with enhanced version")
            
            # Also copy to root raw_data for other scripts
            root_logo_path = os.path.join(data_dir, "raw_data", "logo.png")
            shutil.copy2(enhanced_logo_path, root_logo_path)
            logger.info(f"Also copied to {root_logo_path} for other scripts")
            
            return True
    else:
        logger.warning("Logo enhancement failed, falling back to basic conversion")
        # Fall back to basic conversion if enhancement fails
        temp_output_path = os.path.join(output_dir, "temp_logo.png")
        if convert_to_png(input_path, temp_output_path):
            logger.info(f"Logo converted to proper PNG format and saved to {temp_output_path}")
            
            # Compare file sizes
            original_size = os.path.getsize(input_path)
            converted_size = os.path.getsize(temp_output_path)
            logger.info(f"Original file size: {original_size / 1024:.2f} KB")
            logger.info(f"Converted file size: {converted_size / 1024:.2f} KB")
            
            # Replace the original with the converted version
            shutil.move(temp_output_path, input_path)
            logger.info("Original file replaced with proper PNG version")
            return True
    
    return False

if __name__ == "__main__":
    if main():
        print("Logo enhancement completed successfully!")
    else:
        print("Logo enhancement failed. Please check the logs for details.") 