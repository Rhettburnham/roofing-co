import logging
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

def initialize_selenium_driver(headless=True):
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
    chrome_options = Options()
    
    if headless:
        chrome_options.add_argument("--headless=new")  # Use headless mode
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--incognito")  # Private mode
    chrome_options.add_argument("--no-sandbox")
    
    # Disable images for faster loading
    prefs = {"profile.managed_default_content_settings.images": 2}
    chrome_options.add_experimental_option("prefs", prefs)
    
    # Set user agent to mimic a real browser
    user_agent_str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/113.0.5672.63 Safari/537.36"
    )
    chrome_options.add_argument(f"user-agent={user_agent_str}")
    
    # Additional stealth options to make headless Chrome less detectable
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # Initialize WebDriver using webdriver-manager
    selenium_driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    # Additional stealth measures
    selenium_driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return selenium_driver

def save_html_content(driver, filename="yelp_page.html"):
    """
    Saves the current page's HTML content to a file.
    
    Parameters:
    ----------
    driver : selenium.webdriver.Chrome
        The Selenium WebDriver instance.
    filename : str
        The name of the file to save the HTML content.
    """
    try:
        page_source = driver.page_source
        with open(filename, "w", encoding="utf-8") as file:
            file.write(page_source)
        logging.info(f"Page HTML successfully saved to {filename}")
    except Exception as e:
        logging.error(f"Failed to save page HTML: {e}")

def configure_logging(log_filename="yelp_page_save.log"):
    """
    Configures the logging settings.
    
    Parameters:
    ----------
    log_filename : str
        The name of the log file.
    """
    logging.basicConfig(level=logging.INFO, filename=log_filename,
                        format='%(asctime)s - %(levelname)s - %(message)s')
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)
    logging.getLogger('').addHandler(console_handler)

def navigate_and_save_yelp_page(yelp_url, headless=True, html_filename="yelp_page.html"):
    """
    Navigates to the Yelp URL and saves the page's HTML content.
    
    Parameters:
    ----------
    yelp_url : str
        The Yelp URL of the business.
    headless : bool
        Whether to run Chrome in headless mode.
    html_filename : str
        The filename to save the HTML content.
    
    Returns:
    -------
    None
    """
    configure_logging()
    logging.info("Starting Yelp page HTML saver script.")
    
    # Initialize the WebDriver
    driver = initialize_selenium_driver(headless=headless)
    
    try:
        logging.info(f"Navigating to Yelp URL: {yelp_url}")
        driver.get(yelp_url)
        
        # Wait for the main content to load by waiting for a key element
        try:
            # Adjust the selector based on Yelp's page structure
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='main-content']"))
            )
            logging.info("Yelp main page loaded successfully.")
        except Exception as e:
            logging.error(f"Yelp main page did not load properly: {e}")
            return
        
        time.sleep(5)  # Additional wait to ensure complete load
        
        # Save the HTML content
        save_html_content(driver, filename=html_filename)
        
    finally:
        # Close the browser
        logging.info("Closing the browser.")
        driver.quit()
        logging.info("Browser closed.")

if __name__ == "__main__":
    TARGET_YELP_URL = "https://www.yelp.com/biz/cowboys-vaqueros-construction-sharpsburg-7"
    
    # Navigate to the Yelp page and save its HTML
    navigate_and_save_yelp_page(
        yelp_url=TARGET_YELP_URL,
        headless=False,          # Set to True to run in headless mode
        html_filename="yelp_page.html"  # Name of the file to save HTML
    )
    
    print("Yelp page HTML has been saved to 'yelp_page.html'.")
