import logging
import time
import random
import json
import pandas as pd

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

##############################################################################
# 1) WEB DRIVER INIT
##############################################################################
def web_driver(headless=False):
    """
    Initializes and returns a Selenium WebDriver with specified options.
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
    
    # Additional stealth options
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    # Additional stealth measure
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver

##############################################################################
# 2) SCRAPE GOOGLE MAPS LISTINGS
##############################################################################
def scrape_google_maps_listings(driver, search_term="", max_listings=50):
    """
    Performs a search in the already-open Google Maps tab and scrapes listings.
    Ensures no listing is skipped, even if some fields are missing.
    """
    businesses_data = []

    # 1) WAIT FOR PAGE BODY
    try:
        WebDriverWait(driver, 3).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "body.LoJzbe"))
        )
        logging.info("Main Maps page body detected (body.LoJzbe).")
    except Exception as e:
        logging.error(f"Main page did not load properly or class changed: {e}")
        return businesses_data  # Return empty if main body never appears

    time.sleep(1)  # Reduced pause

    ########################################################################
    # 2) USE STICKY SEARCH BAR & ENTER SEARCH TERM
    ########################################################################
    try:
        logging.info(f"Attempting to find the search bar and enter: '{search_term}'")

        search_input = driver.find_element(By.CSS_SELECTOR, "input.searchboxinput.xiQnY")
        search_input.clear()
        search_input.send_keys(search_term)
        logging.info(f"Search term entered: {search_term}")

        search_button = driver.find_element(By.CSS_SELECTOR, "button#mL3xi, button#searchbox-searchbutton")
        search_button.click()
        logging.info("Clicked the search button.")
        
        # Wait for the search results to load
        WebDriverWait(driver, 4).until(
            EC.presence_of_element_located((By.XPATH, '//div[@role="feed"]'))
        )
        logging.info("Search results loaded.")
        
        # Allow additional time for listings to fully render
        time.sleep(2)  # Reduced pause
    except Exception as e:
        logging.warning(f"Could not locate the sticky search bar or button. Error: {e}")
        return businesses_data  # Return whatever is collected if search fails

    ########################################################################
    # 3) LOCATE THE LISTINGS CONTAINER
    ########################################################################
    try:
        logging.info("Locating the business listings container.")
        listings_container = WebDriverWait(driver, 3).until(
            EC.presence_of_element_located(
                (By.XPATH, '//div[@role="feed"]')
            )
        )
        logging.info("Business listings container found.")
    except Exception as e:
        logging.error(f"Could not locate the business listings container: {e}")
        return businesses_data

    ########################################################################
    # 4) SCROLL TO LOAD ALL LISTINGS
    ########################################################################
    logging.info("Starting to scroll through the listings container...")
    last_height = driver.execute_script("return arguments[0].scrollHeight;", listings_container)
    scroll_attempts = 0
    max_scroll_attempts = 10  # Prevent infinite scrolling

    while True:
        driver.execute_script("arguments[0].scrollTo(0, arguments[0].scrollHeight);", listings_container)
        logging.info("Scrolled to bottom of listings container.")
        time.sleep(1)  # Reduced pause for faster scrolling

        new_height = driver.execute_script("return arguments[0].scrollHeight;", listings_container)
        if new_height == last_height:
            scroll_attempts += 1
            if scroll_attempts >= max_scroll_attempts:
                logging.info("No more new listings loaded after multiple attempts; stopping scroll.")
                break
        else:
            last_height = new_height
            scroll_attempts = 0  # Reset attempts if new content is loaded

    # Slight pause
    time.sleep(1)  # Reduced pause

    ########################################################################
    # 5) GET FINAL PAGE SOURCE AND PARSE WITH BEAUTIFULSOUP
    ########################################################################
    logging.info("Parsing final HTML after scroll.")
    page_source = driver.page_source
    soup = BeautifulSoup(page_source, "html.parser")

    ########################################################################
    # 6) FIND ALL BUSINESS LISTINGS
    ########################################################################
    try:
        div_reviews = soup.find('div', role='feed')
        if not div_reviews:
            logging.error("Div with role='feed' containing all reviews not found.")
            return businesses_data
        logging.info("Div with role='feed' containing all reviews found.")
    except Exception as e:
        logging.error(f"Error finding div with role='feed': {e}")
        return businesses_data

    ########################################################################
    # 7) FIND ALL DIRECT CHILD DIVS THAT REPRESENT BUSINESSES
    ########################################################################
    child_divs = div_reviews.find_all("div", recursive=False)
    logging.info(f"Found {len(child_divs)} direct child divs in the listing container.")

    for idx, listing_div in enumerate(child_divs, start=1):
        # Initialize a dictionary to store all possible fields with defaults
        data = {
            "BusinessName": "N/A",
            "Rating": "N/A",
            "NumberOfReviews": "N/A",
            "Category": "N/A",
            "Address": "N/A",
            "Phone": "N/A",
            "Close": "N/A",
            "Website": "N/A",
            "GoogleReviewsLink": "N/A"
        }

        logging.info(f"Processing listing index {idx}")

        # --------------------------------------------------------------------
        # If it has "TFQHme", it's often non-business or ad-like, but we won't skip
        # We'll just log a warning and continue extracting what we can.
        # --------------------------------------------------------------------
        if listing_div.has_attr("class") and "TFQHme" in listing_div["class"]:
            logging.warning(f"Listing {idx} has class 'TFQHme' - may not be a standard business, but we'll record it anyway.")

        # Attempt to locate the main business block
        business_block = listing_div.find("div")
        if not business_block:
            logging.warning(f"Listing {idx}: 'Nv2PK tH5CWc THOPZb' not found; data may be incomplete.")
            # We do NOT skip; we simply fill what we can and append.
            businesses_data.append(data)
            logging.info(f"Added partial data for listing {idx}: {data}")
            # Check if we've reached the max listings
            if len(businesses_data) >= max_listings:
                logging.info(f"Reached max desired listings: {max_listings}")
                break
            continue

        try:
            # Attempt to find bfd_div
            bfd_div = business_block.find("div", class_="bfdHYd Ppzolf OFBs3e")
            if not bfd_div:
                logging.warning(f"Listing {idx}: 'bfdHYd Ppzolf OFBs3e' not found; data may be incomplete.")
            else:
                # Attempt to find li9_div
                li9_div = bfd_div.find("div", class_="lI9IFe")
                if not li9_div:
                    logging.warning(f"Listing {idx}: 'lI9IFe' not found; data may be incomplete.")
                # Attempt to locate nrDZNb_div
                nrDZNb_div = bfd_div.find("div", class_="NrDZNb")
                if not nrDZNb_div:
                    logging.warning(f"Listing {idx}: 'NrDZNb' not found; data may be incomplete.")
                else:
                    # Extract business name
                    name_div = nrDZNb_div.find("div", class_="qBF1Pd fontHeadlineSmall")
                    if name_div:
                        data["BusinessName"] = name_div.get_text(strip=True)
                    else:
                        logging.warning(f"Listing {idx}: 'qBF1Pd fontHeadlineSmall' not found; using 'N/A' for BusinessName.")

                # Extract rating and #reviews
                uaQhfb_div = bfd_div.find("div", class_="UaQhfb fontBodyMedium")
                if uaQhfb_div:
                    w4efsd_blocks = uaQhfb_div.find_all("div", class_="W4Efsd", recursive=False)
                    if len(w4efsd_blocks) > 0:
                        first_w4 = w4efsd_blocks[0]
                        # rating => span.MW4etd
                        span_stars = first_w4.find("span", class_="MW4etd")
                        if span_stars:
                            data["Rating"] = span_stars.get_text(strip=True)
                        else:
                            logging.warning(f"Listing {idx}: Rating span (MW4etd) not found; using 'N/A'.")

                        # #reviews => inside span.e4rVHe.fontBodyMedium => subspan.UY7F9
                        span_e4r = first_w4.find("span", class_="e4rVHe fontBodyMedium")
                        if span_e4r:
                            span_rev = span_e4r.find("span", class_="UY7F9")
                            if span_rev:
                                data["NumberOfReviews"] = span_rev.get_text(strip=True)
                            else:
                                logging.warning(f"Listing {idx}: Subspan UY7F9 for #reviews not found; using 'N/A'.")
                        else:
                            logging.warning(f"Listing {idx}: Span e4rVHe fontBodyMedium for #reviews not found; using 'N/A'.")
                    
                    # Extract Category, Address, Phone, Close
                    if len(w4efsd_blocks) > 1:
                        second_head = w4efsd_blocks[1]
                        nested_w4_list = second_head.find_all("div", class_="W4Efsd", recursive=False)

                        # Category & Address
                        if len(nested_w4_list) > 0:
                            cat_div = nested_w4_list[0]
                            spans_second = cat_div.find_all("span", recursive=False)
                            if len(spans_second) > 0:
                                cat_outer = spans_second[0].find("span")
                                if cat_outer:
                                    data["Category"] = cat_outer.get_text(strip=True)
                                else:
                                    logging.warning(f"Listing {idx}: Unable to find category span.")
                            if len(spans_second) > 2:
                                data["Address"] = spans_second[2].get_text(strip=True)

                        # Phone & Close status
                        if len(nested_w4_list) > 1:
                            phone_div = nested_w4_list[1]
                            phone_spans = phone_div.find_all("span", recursive=False)
                            if len(phone_spans) > 0:
                                data["Close"] = phone_spans[0].get_text(strip=True)
                            if len(phone_spans) > 1:
                                data["Phone"] = phone_spans[1].get_text(strip=True)
                else:
                    logging.warning(f"Listing {idx}: 'UaQhfb fontBodyMedium' div not found; rating/reviews data incomplete.")

                # Extract website
                if li9_div:
                    rwjeuc_div = li9_div.find("div", class_="Rwjeuc")
                    if rwjeuc_div:
                        nested_divs = rwjeuc_div.find_all("div", class_="etWJQ jym1ob kdfrQc bWQG4d NUqjXc")
                        if len(nested_divs) > 1:
                            a_site = rwjeuc_div.find("a", class_="lcr4fd S9kvJb")
                            if a_site and a_site.has_attr("href"):
                                data["Website"] = a_site["href"]
                            else:
                                logging.warning(f"Listing {idx}: Website link not found or missing href.")
                        else:
                            logging.warning(f"Listing {idx}: 'etWJQ jym1ob...' structure for website not found.")
                    else:
                        logging.warning(f"Listing {idx}: 'Rwjeuc' div not found; website may be 'N/A'.")

                # Extract Google reviews link
                a_reviews = business_block.find("a", class_="hfpxzc")
                if a_reviews and a_reviews.has_attr("href"):
                    data["GoogleReviewsLink"] = a_reviews["href"]
                else:
                    logging.warning(f"Listing {idx}: Google reviews link 'hfpxzc' not found; using 'N/A'.")

            # End of bfd_div presence check

        except Exception as e:
            logging.error(f"Error processing listing {idx}: {e}")

        # Finally, add this data to the list (no matter how incomplete)
        businesses_data.append(data)
        logging.info(f"Added listing {idx} data: {data}")

        # Check if we've reached max desired listings
        if len(businesses_data) >= max_listings:
            logging.info(f"Reached max desired listings: {max_listings}")
            break

    return businesses_data

##############################################################################
# 3) MAIN EXECUTION: MULTIPLE SEARCHES WITHOUT RELOADING BASE URL EACH TIME
##############################################################################
if __name__ == "__main__":
    # -----------------------------------------------------------------------
    # LOGGING SETUP
    # -----------------------------------------------------------------------
    logging.basicConfig(
        level=logging.INFO,
        filename='scraper.log',  # Creates or appends to 'scraper.log' in the same folder
        format='%(asctime)s - %(levelname)s - %(message)s',
        filemode='a'  # Use 'a' to append or 'w' to overwrite each run
    )
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    console_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console.setFormatter(console_formatter)
    
    # Avoid adding multiple console handlers
    if not any(isinstance(handler, logging.StreamHandler) for handler in logging.getLogger('').handlers):
        logging.getLogger('').addHandler(console)

    # 1) START DRIVER (Set headless=False if you want to watch)
    driver = web_driver(headless=True)

    try:
        # 2) LOAD GOOGLE MAPS ONCE (KEEPING EXISTING PATH)
        base_maps_url = (
            "https://www.bbb.org/search?find_country=USA&find_text=Atlanta%20Expert%20Roofing%20Solutions&page=1&sort=Relevance"
        )
        logging.info(f"Navigating to Google Maps once: {base_maps_url}")
        driver.get(base_maps_url)

        # 3) Define industries and locations, then build search terms
        industries = ["Roofing"]  # You can add more
        locations = [
            "30002", "30003", "30004", "30005", "30006", "30007", "30009", "30010", "30011", "30012",
            "30013", "30014", "30015", "30016", "30017", "30018", "30019", "30020", "30021", "30022",
            "30023", "30024", "30025", "30026", "30027", "30028", "30030", "30031", "30032", "30033",
            "30034", "30035", "30036", "30037", "30038", "30039", "30040", "30041", "30042", "30043",
            "30044", "30045", "30046", "30047", "30048", "30049", "30052", "30054", "30055", "30056",
            "30058", "30060", "30062", "30064", "30066", "30068", "30069", "30070", "30071", "30072",
            "30073", "30074", "30075", "30076", "30077", "30078", "30079", "30080", "30081", "30082",
            "30083", "30084", "30085", "30086", "30087", "30088", "30089", "30090", "30091", "30092",
            "30093", "30094", "30095", "30096", "30097", "30098", "30101", "30102", "30103", "30104",
            "30105", "30106", "30107", "30108", "30109", "30110", "30111", "30112", "30113", "30114"
        ]

        all_results = []

        # 4) Iterate over industries and locations in the same browser session
        for ind in industries:
            for loc in locations:
                term = f"{ind} {loc}, GA"
                print(f"\n=== Searching for: {term} ===")
                logging.info(f"=== Searching for: {term} ===")

                listings = scrape_google_maps_listings(
                    driver=driver,
                    search_term=term,
                    max_listings=50  # Adjust max if desired
                )
                # Tag them with the separate Industry and Location
                for biz in listings:
                    biz["Industry"] = ind
                    biz["Location"] = loc
                    # Optionally, remove "SearchTerm" if it exists
                    biz.pop("SearchTerm", None)

                all_results.extend(listings)
                logging.info(f"Completed search for: {term} with {len(listings)} listings.")
                time.sleep(1)  # Reduced break between searches

    except Exception as e:
        logging.error(f"An unexpected error occurred during scraping: {e}")

    finally:
        # 5) Done searching: close the browser
        driver.quit()
        logging.info("Closed the browser.")

    # 6) Convert results to DataFrame
    df = pd.DataFrame(all_results)
    print("\n=== FINAL RESULTS DATAFRAME ===")
    print(df)

    # 7) Save to CSV
    csv_filename = "google_maps_business_listings_multi_search.csv"
    df.to_csv(csv_filename, index=False, encoding="utf-8")
    logging.info(f"Saved listings to '{csv_filename}'")

    # 8) Optionally save JSON
    json_filename = "business_listings_multi_search.json"
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=4)
    logging.info(f"Saved listings to '{json_filename}'")

    logging.info("Done with multi-search on the same page (sticky search bar).")
    print("\nDone with multi-search on the same page (sticky search bar).")
