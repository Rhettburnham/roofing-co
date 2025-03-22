import logging
import time
import random
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
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
    
    # Initialize WebDriver using webdriver-manager
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
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
                EC.presence_of_element_located((By.CSS_SELECTOR, "body.LoJzbe"))
            )
            logging.info("Main page loaded successfully.")
        except Exception as e:
            logging.error(f"Main page did not load properly: {e}")
            return []
        
        time.sleep(3)  # Additional wait to ensure complete load
        
        # Locate the reviews container
        try:
            logging.info("Locating the reviews container.")
            reviews_container = WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.XPATH, '//div[@class="m6QErb DxyBCb kA9KIf dS8AEf XiKgde "]'))
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
        
        # Parse the page source with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
        # Navigate through the nested divs as per the provided path
        # Starting from body
        body = soup.find("body", class_="LoJzbe keynav-mode-off highres IIZecd TbqDH")
        if not body:
            logging.error("Body with specified classes not found.")
            return []
        logging.info("Body element found.")
        
        div_jstcache_0 = body.find("div", {"jstcache": "0"})
        if not div_jstcache_0:
            logging.error("Div with jstcache='0' not found.")
            return []
        logging.info("Div with jstcache='0' found.")
        
        div_pane_open_mode = div_jstcache_0.find("div", id="app-container")
        if not div_pane_open_mode:
            logging.error("Div with class 'vasquette id-app-container y2iKwd cSgCkb xcUKcd pane-open-mode eZfyae' not found.")
            return []
        logging.info("Div with class 'vasquette id-app-container y2iKwd cSgCkb xcUKcd pane-open-mode eZfyae' found.")
        
        div_id_content_container = div_pane_open_mode.find("div", class_="id-content-container")
        if not div_id_content_container:
            logging.error("Div with class 'id-content-container' not found.")
            return []
        logging.info("Div with class 'id-content-container' found.")
        
        div_QA0Szd = div_id_content_container.find("div", id="QA0Szd")
        if not div_QA0Szd:
            logging.error("Div with id 'QA0Szd' not found.")
            return []
        logging.info("Div with id 'QA0Szd' found.")
        
        div_jstcache_0_inner = div_QA0Szd.find("div", {"jstcache": "0"})
        if not div_jstcache_0_inner:
            logging.error("Inner div with jstcache='0' not found.")
            return []
        logging.info("Inner div with jstcache='0' found.")
        
        div_XltNde_tTVLSc = div_jstcache_0_inner.find("div", class_="XltNde tTVLSc")
        if not div_XltNde_tTVLSc:
            logging.error("Div with class 'XltNde tTVLSc' not found.")
            return []
        logging.info("Div with class 'XltNde tTVLSc' found.")
        
        div_w6VYqd = div_XltNde_tTVLSc.find("div", class_="w6VYqd")
        if not div_w6VYqd:
            logging.error("Div with class 'w6VYqd' not found.")
            return []
        logging.info("Div with class 'w6VYqd' found.")
        
        div_bJzME_tTVLSc = div_w6VYqd.find("div", jstcache="3")
        if not div_bJzME_tTVLSc:
            logging.error("jstcache=3")
            return []
        logging.info("jstcache=3")
        
        div_k7jAl_miFGmb_lJ3Kh_PLbyfe = div_bJzME_tTVLSc.find("div", class_="k7jAl miFGmb lJ3Kh PLbyfe")
        if not div_k7jAl_miFGmb_lJ3Kh_PLbyfe:
            logging.error("Div with class 'k7jAl miFGmb lJ3Kh PLbyfe' not found.")
            return []
        logging.info("Div with class 'k7jAl miFGmb lJ3Kh PLbyfe' found.")
        
        div_e07Vkf_kA9KIf = div_k7jAl_miFGmb_lJ3Kh_PLbyfe.find("div", class_="e07Vkf kA9KIf")
        if not div_e07Vkf_kA9KIf:
            logging.error("Div with class 'e07Vkf kA9KIf' not found.")
            return []
        logging.info("Div with class 'e07Vkf kA9KIf' found.")
        
        div_aIFcqe = div_e07Vkf_kA9KIf.find("div", class_="aIFcqe")
        if not div_aIFcqe:
            logging.error("Div with class 'aIFcqe' not found.")
            return []
        logging.info("Div with class 'aIFcqe' found.")
        
        div_m6QErb_WNBkOb_XiKgde = div_aIFcqe.find("div", class_="m6QErb WNBkOb XiKgde")
        if not div_m6QErb_WNBkOb_XiKgde:
            logging.error("Div with class 'm6QErb WNBkOb XiKgde' not found.")
            return []
        logging.info("Div with class 'm6QErb WNBkOb XiKgde' found.")
        
        div_m6QErb_DxyBCb_kA9KIf_dS8AEf_XiKgde = div_m6QErb_WNBkOb_XiKgde.find("div", class_="m6QErb DxyBCb kA9KIf dS8AEf XiKgde")
        if not div_m6QErb_DxyBCb_kA9KIf_dS8AEf_XiKgde:
            logging.error("Div with class 'm6QErb DxyBCb kA9KIf dS8AEf XiKgde' not found.")
            return []
        logging.info("Div with class 'm6QErb DxyBCb kA9KIf dS8AEf XiKgde' found.")
        
        div_reviews = div_m6QErb_DxyBCb_kA9KIf_dS8AEf_XiKgde.find("div", class_="m6QErb XiKgde")
        if not div_reviews:
            logging.error("Div with class 'm6QErb XiKgde' containing all reviews not found.")
            return []
        logging.info("Div with class 'm6QErb XiKgde' containing all reviews found.")
        
        # Each review is in a div with class "jftiEf fontBodyMedium"
        review_divs = div_reviews.find_all("div", class_="jftiEf fontBodyMedium")
        logging.info(f"Found {len(review_divs)} review divs.")
        
        if not review_divs:
            logging.warning("No reviews found with class 'jftiEf fontBodyMedium'.")
        
        for idx, review_div in enumerate(review_divs, start=1):
            try:
                # Navigate to the div with data-review-id
                review_id_div = review_div.find("div", attrs={"data-review-id": True})
                if not review_id_div:
                    logging.warning(f"Review {idx}: div with data-review-id not found.")
                    continue
                logging.info(f"Review {idx}: div with data-review-id found.")
                
                # Within review_id_div, find div class="jJc9Ad"
                div_jJc9Ad = review_id_div.find("div", class_="jJc9Ad")
                if not div_jJc9Ad:
                    logging.warning(f"Review {idx}: div with class 'jJc9Ad' not found.")
                    continue
                logging.info(f"Review {idx}: div with class 'jJc9Ad' found.")
                
                # Within div_jJc9Ad, find div class="GHT2ce NsCY4"
                div_GHT2ce_NsCY4 = div_jJc9Ad.find("div", class_="GHT2ce NsCY4")
                if not div_GHT2ce_NsCY4:
                    logging.warning(f"Review {idx}: div with class 'GHT2ce NsCY4' not found.")
                    continue
                logging.info(f"Review {idx}: div with class 'GHT2ce NsCY4' found.")
                
                # div from GHT2ce NsCY4 to style="position: relative;"
                div_relative = div_GHT2ce_NsCY4.find("div", style="position: relative;")
                if not div_relative:
                    logging.warning(f"Review {idx}: div with class ' div_relative' not found.")
                    continue
                logging.info(f"Review {idx}: div with class 'div_relative' found.")
                
                # then from div relative to class="WNxzHc qLhwHc"
                div_WNxzHc_qLhwHc = div_relative.find("div", class_="WNxzHc qLhwHc")
                if not div_WNxzHc_qLhwHc:
                    logging.warning(f"Review {idx}: div with class ' div_WNxzHc qLhwHc' not found.")
                    continue
                logging.info(f"Review {idx}: div with class 'div_WNxzHc qLhwHc' found.")
                # then div class="WNxzHc qLhwHc" to button class="al6Kxe"
                div_al6Kxe = div_relative.find("button", class_="al6Kxe")
                if not div_al6Kxe:
                    logging.warning(f"Review {idx}: div with class ' div_al6Kxe' not found.")
                    continue
                logging.info(f"Review {idx}: div with class 'div_al6Kxe' found.")
                
                # Within class="al6Kxe" extract class="d4r55 "
                div_m44Iib = div_al6Kxe.find("div", class_="d4r55")
                if not div_m44Iib:
                    logging.warning(f"Review {idx}: div with class 'd4r55' not found.")
                    name = "N/A"
                else:
                    name = div_m44Iib.text.strip()
                    logging.info(f"Review {idx}: Extracted name - {name}")
                
                #i dont know why this cant be found the class is class="DU9Pgb"
                # Within div_jJc9Ad, find div class="GHT2ce" and then div class="DU9Pgb"
                # Find the direct child div with class 'GHT2ce' within div_jJc9Ad
                # Find all divs with class 'GHT2ce' within div_jJc9Ad
                divs_GHT2ce = div_jJc9Ad.find_all("div", class_="GHT2ce")

                # Filter divs to include only those with a single class
                exact_divs_GHT2ce = [div for div in divs_GHT2ce if len(div.get('class', [])) == 1]

                if not exact_divs_GHT2ce:
                    logging.warning(f"Review {idx}: divs with exact class 'GHT2ce' not found.")
                    rating = "N/A"
                    date = "N/A"
                else:
                    # Assuming you want the first matching div
                    div_GHT2ce_inner = exact_divs_GHT2ce[0]
                    # Proceed with further processing using div_GHT2ce_inner
                    div_DU9Pgb = div_GHT2ce_inner.find("div", class_="DU9Pgb")
                    if not div_DU9Pgb:
                        logging.warning(f"Review {idx}: div with class 'DU9Pgb' not found.")
                        rating = "N/A"
                        date = "N/A"
                    else:
                        # Extract stars from span class="kvMYJc"
                        span_kvMYJc = div_DU9Pgb.find("span", class_="kvMYJc")
                        if span_kvMYJc and span_kvMYJc.has_attr("aria-label"):
                            rating_text = span_kvMYJc["aria-label"]  # e.g., "5.0 stars"
                            rating = rating_text.split(" ")[0]
                            logging.info(f"Review {idx}: Extracted rating - {rating}")
                        else:
                            rating = "N/A"
                            logging.warning(f"Review {idx}: span with class 'kvMYJc' or 'aria-label' not found.")
                        
                        # Extract date from span class="rsqaWe"
                        span_rsqaWe = div_DU9Pgb.find("span", class_="rsqaWe")
                        if span_rsqaWe:
                            date = span_rsqaWe.text.strip()
                            logging.info(f"Review {idx}: Extracted date - {date}")
                        else:
                            date = "N/A"
                            logging.warning(f"Review {idx}: span with class 'rsqaWe' not found.")

                    # Find div with an id attribute within div_GHT2ce_inner
                    div_with_id = div_GHT2ce_inner.find("div", id=True)
                    if not div_with_id:
                        logging.warning(f"Review {idx}: div with id not found.")
                        review_text = "N/A"
                    else:
                        # Extract review text from span class="wiI7pd"
                        span_wiI7pd = div_with_id.find("span", class_="wiI7pd")
                        if span_wiI7pd:
                            review_text = span_wiI7pd.text.strip()
                            logging.info(f"Review {idx}: Extracted review text - {review_text}")
                        else:
                            review_text = "N/A"
                            logging.warning(f"Review {idx}: span with class 'wiI7pd' not found.")

                
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
        "https://www.google.com/maps/place/Su's+Chinese+Cuisine/@33.7965679,-84.3735687,17z/data=!3m1!5s0x88f50436a5b9d505:0xebc3274b663fcac7!4m18!1m9!3m8!1s0x88f505e262e394d5:0xba8cbf84b539def8!2sSu's+Chinese+Cuisine!8m2!3d33.7965679!4d-84.3709938!9m1!1b1!16s%2Fg%2F11mtfm60_1!3m7!1s0x88f505e262e394d5:0xba8cbf84b539def8!8m2!3d33.7965679!4d-84.3709938!9m1!1b1!16s%2Fg%2F11mtfm60_1?entry=ttu&g_ep=EgoyMDI1MDEwOC4wIKXMDSoASAFQAw%3D%3D"
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

