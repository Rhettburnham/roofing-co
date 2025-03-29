import logging
import time
import random
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from chromedriver_py import binary_path  # this will get you the path to the binary
from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def web_driver(headless=True):
    """
    Initializes and returns a Selenium WebDriver with specified options.
    
    Parameters:
    ----------
    headless : bool
        Whether to run Chrome in headless mode (no visible browser).
    
    Returns:
    -------
    driver : selenium.webdriver.Chrome
        Configured Selenium WebDriver instance.
    """
    options = Options()
    
    if headless:
        options.add_argument("--headless=new")  # Use headless mode
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--incognito")  # Private mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    # Disable images for faster loading
    prefs = {"profile.managed_default_content_settings.images": 2}
    options.add_experimental_option("prefs", prefs)
    
    # Set user agent to mimic a real browser
    user_agent = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/113.0.5672.63 Safari/537.36"
    )
    options.add_argument(f"user-agent={user_agent}")
    
    # Additional stealth options to make headless Chrome less detectable
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Initialize WebDriver using chromedriver-py instead of webdriver-manager
    driver = webdriver.Chrome(
        service=Service(binary_path),
        options=options
    )
    
    # Additional stealth measures
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver

def scrape_google_maps_reviews(url, headless=True, max_reviews=50):
    """
    Scrapes reviews from a Google Maps business page.
    
    Parameters:
    ----------
    url : str
        The Google Maps URL of the place.
    headless : bool
        Whether to run Chrome in headless mode (no visible browser).
    max_reviews : int
        The maximum number of reviews to scrape.
    
    Returns:
    -------
    reviews_data : list of dict
        A list of dictionaries containing 'name', 'rating', 'date', and 'review_text'.
    """
    
    # Setup logging
    logging.basicConfig(level=logging.INFO, filename='scraper.log',
                        format='%(asctime)s - %(levelname)s - %(message)s')
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console.setFormatter(formatter)
    logging.getLogger('').addHandler(console)
    
    # Initialize the WebDriver
    driver = web_driver(headless=headless)
    
    reviews_data = []
    
    try:
        logging.info(f"Navigating to URL: {url}")
        driver.get(url)
        
        # Wait for the main content to load
        try:
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.m6QErb"))
            )
            logging.info("Main page loaded successfully.")
        except Exception as e:
            logging.error(f"Main page did not load properly: {e}")
            return []
        
        time.sleep(3)  # Additional wait to ensure complete load
        
        # Locate the reviews container - using the updated class structure
        try:
            logging.info("Locating the reviews container.")
            reviews_container = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'div.m6QErb.DxyBCb.kA9KIf.dS8AEf.XiKgde'))
            )
            logging.info("Reviews container found.")
        except Exception as e:
            logging.error(f"Could not locate the reviews container: {e}")
            return []
        
        # Scroll to load reviews
        logging.info("Starting to scroll to load reviews.")
        last_height = driver.execute_script("return arguments[0].scrollHeight;", reviews_container)
        
        while len(reviews_data) < max_reviews:
            # Scroll down
            driver.execute_script("arguments[0].scrollTo(0, arguments[0].scrollHeight);", reviews_container)
            logging.info("Scrolled to the bottom of the reviews container.")
            time.sleep(random.uniform(2, 3))  # Randomized delay
            
            # Calculate new scroll height and compare with last scroll height
            new_height = driver.execute_script("return arguments[0].scrollHeight;", reviews_container)
            if new_height == last_height:
                # No more new reviews loaded
                logging.info("No more reviews loaded upon scrolling.")
                break
            last_height = new_height
            logging.info(f"New scroll height: {new_height}")
        
        logging.info("Finished scrolling. Parsing the page.")
        
        # Now use BeautifulSoup to extract the reviews with the new HTML structure
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
        # Direct approach - find all review divs with the class "jftiEf fontBodyMedium"
        review_divs = soup.find_all("div", class_="jftiEf fontBodyMedium")
        logging.info(f"Found {len(review_divs)} review divs.")
        
        if not review_divs:
            logging.warning("No reviews found with class 'jftiEf fontBodyMedium'.")
            return []
        
        for idx, review_div in enumerate(review_divs, start=1):
            try:
                # Extract name from the d4r55 class
                name_div = review_div.find("div", class_="d4r55")
                name = name_div.text.strip() if name_div else "N/A"
                logging.info(f"Review {idx}: Extracted name - {name}")
                
                # Extract rating from kvMYJc span with aria-label
                rating_span = review_div.find("span", class_="kvMYJc")
                if rating_span and rating_span.has_attr("aria-label"):
                    rating_text = rating_span["aria-label"]  # e.g., "5 stars"
                    rating = rating_text.split(" ")[0]
                    logging.info(f"Review {idx}: Extracted rating - {rating}")
                else:
                    rating = "N/A"
                    logging.warning(f"Review {idx}: span with class 'kvMYJc' or 'aria-label' not found.")
                
                # Extract date from rsqaWe span
                date_span = review_div.find("span", class_="rsqaWe")
                date = date_span.text.strip() if date_span else "N/A"
                logging.info(f"Review {idx}: Extracted date - {date}")
                
                # Extract review text from wiI7pd span
                text_span = review_div.find("span", class_="wiI7pd")
                review_text = text_span.text.strip() if text_span else "N/A"
                logging.info(f"Review {idx}: Extracted review text - {review_text}")
                
                # Append to the list
                reviews_data.append({
                    "name": name,
                    "rating": rating,
                    "date": date,
                    "review_text": review_text
                })
                
                logging.info(f"Review {idx} scraped successfully.")
                
                # Break if we've reached the maximum number of reviews
                if len(reviews_data) >= max_reviews:
                    logging.info(f"Reached the maximum desired reviews: {max_reviews}")
                    break
                
            except Exception as e:
                logging.error(f"Error scraping review {idx}: {e}")
                continue
    
    finally:
        # Close the browser
        logging.info("Closing the browser.")
        driver.quit()
    
    return reviews_data

# this is the portion tht is good for the formatting data=!4m8!3m7!1s0x88f4c38a8b36c047:0xce9384a70f8a8f54!8m2!3d33.422357!4d-84.640692!9m1!1b1!16s%2Fg%2F11jnxrwqxz? ..enr
# example complete code "https://www.google.com/maps/place/Su's+Chinese+Cuisine/@33.7965679,-84.3735687,17z/data=!3m1!5s0x88f50436a5b9d505:0xebc3274b663fcac7!4m18!1m9!3m8!1s0x88f505e262e394d5:0xba8cbf84b539def8!2sSu's+Chinese+Cuisine!8m2!3d33.7965679!4d-84.3709938!9m1!1b1!16s%2Fg%2F11mtfm60_1!3m7!1s0x88f505e262e394d5:0xba8cbf84b539def8!8m2!3d33.7965679!4d-84.3709938!9m1!1b1!16s%2Fg%2F11mtfm60_1?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D"
if __name__ == "__main__":
    TARGET_URL = (
        "https://www.google.com/maps/place/Craft+Roofing+Company/@34.1702728,-84.5808208,17z/data=!4m8!3m7!1s0x88f5684c5c01aaab:0x4ebec0a0e6c12ea7!8m2!3d34.1702728!4d-84.5782459!9m1!1b1!16s%2Fg%2F11fk0bhkdq?entry=ttu&g_ep=EgoyMDI1MDMyNS4xIKXMDSoASAFQAw%3D%3D"
    )
    
    # Scrape reviews
    scraped_reviews = scrape_google_maps_reviews(
        url=TARGET_URL,
        headless=False,        # Set to False to see the browser actions for debugging
        max_reviews=50         # Adjust as needed
    )
    
    # Convert to DataFrame
    df = pd.DataFrame(scraped_reviews)
    print(df)
    
    # Save to CSV
    df.to_csv("google_maps_reviews.csv", index=False)
    
    import json

    # Save scraped reviews to a JSON file
    with open("reviews.json", "w", encoding="utf-8") as json_file:
        json.dump(scraped_reviews, json_file, ensure_ascii=False, indent=4)

    print("Reviews saved to reviews.json")

