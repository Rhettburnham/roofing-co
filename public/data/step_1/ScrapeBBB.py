import logging
import time
import random
import os
import json
import requests
import shutil
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from chromedriver_py import binary_path  # this will get you the path to the binary
from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Create raw_data/step_1 directory if it doesn't exist
RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "raw_data", "step_1")
os.makedirs(RAW_DATA_DIR, exist_ok=True)

def web_driver(headless=True):
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
   options.add_argument("--disable-dev-shm-usage")
  
   # Disable images for faster loading (except for logo)
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
  
   # Initialize WebDriver using chromedriver_py
   driver = webdriver.Chrome(
       service=Service(binary_path),
       options=options
   )
  
   # Additional stealth measures
   driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
  
   return driver


def download_image(url, save_path):
   """
   Downloads an image from the specified URL and saves it to the given path.
   """
   try:
       response = requests.get(url, stream=True)
       if response.status_code == 200:
           with open(save_path, 'wb') as file:
               for chunk in response.iter_content(1024):
                   file.write(chunk)
           logging.info(f"Image downloaded successfully and saved to {save_path}")
           return True
       else:
           logging.error(f"Failed to download image. Status code: {response.status_code}")
           return False
   except Exception as e:
       logging.error(f"Exception occurred while downloading image: {e}")
       return False


def scrape_bbb_profile(url, headless=True):
   """
   Scrapes the BBB profile page for the specified business URL.
  
   Parameters:
   ----------
   url : str
       The BBB profile URL of the business.
   headless : bool
       Whether to run Chrome in headless mode (no visible browser).
  
   Returns:
   -------
   bbb_data : dict
       A dictionary containing the scraped BBB data.
   """
  
   # Setup logging
   logging.basicConfig(level=logging.INFO, filename='bbb_scraper.log',
                       format='%(asctime)s - %(levelname)s - %(message)s')
   console = logging.StreamHandler()
   console.setLevel(logging.INFO)
   formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
   console.setFormatter(formatter)
   logging.getLogger('').addHandler(console)
  
   # Initialize the WebDriver
   driver = web_driver(headless=headless)
  
   bbb_data = {}
  
   try:
       logging.info(f"Navigating to URL: {url}")
       driver.get(url)
      
       # Wait for the main content to load
       try:
           WebDriverWait(driver, 20).until(
               EC.presence_of_element_located((By.ID, "root"))
           )
           logging.info("Main page loaded successfully.")
       except Exception as e:
           logging.error(f"Main page did not load properly: {e}")
           return {}
      
       time.sleep(3)  # Additional wait to ensure complete load
      
       # Parse the page source with BeautifulSoup
       soup = BeautifulSoup(driver.page_source, "html.parser")
      
       # Navigate through the pathing logic
       body = soup.find("body")
       if not body:
           logging.error("Body tag not found.")
           return {}
       logging.info("Body tag found.")
      
       root_div = body.find("div", id="root")
       if not root_div:
           logging.error('Div with id="root" not found.')
           return {}
       logging.info('Div with id="root" found.')
      
       about_page_div = root_div.find("div", class_="bpr-about-page")
       if not about_page_div:
           logging.error('Div with class="bpr-about-page" not found.')
           return {}
       logging.info('Div with class="bpr-about-page" found.')
      
       flex_page_container = about_page_div.find("div", class_="flex-page-container")
       if not flex_page_container:
           logging.error('Div with class="flex-page-container" not found.')
           return {}
       logging.info('Div with class="flex-page-container" found.')
      
       page_content = flex_page_container.find("main", class_="page-content")
       if not page_content:
           logging.error('Main tag with class="page-content" not found.')
           return {}
       logging.info('Main tag with class="page-content" found.')
      
       page_center_bpr_header = page_content.find("div", class_="page-center bpr-header")
       if not page_center_bpr_header:
           logging.error('Div with class="page-center bpr-header" not found.')
           return {}
       logging.info('Div with class="page-center bpr-header" found.')
      
       # Div 8: bpr-header-business-info stack
       bpr_header_business_info = page_center_bpr_header.find("div", class_="bpr-header-business-info stack")
       if not bpr_header_business_info:
           logging.error('Div with class="bpr-header-business-info stack" not found.')
           return {}
       logging.info('Div with class="bpr-header-business-info stack" found.')
      
       # Div 9: bpr-header-accreditation-rating
       accreditation_div = bpr_header_business_info.find("div", class_="bpr-header-accreditation-rating")
       if accreditation_div:
           # Adjusted: Check for text content instead of attribute
           accreditation_text = accreditation_div.text.strip().lower()
           if "accredited" in accreditation_text:
               bbb_data["accredited"] = True
           else:
               bbb_data["accredited"] = False
           logging.info(f"Accredited: {bbb_data['accredited']}")
       else:
           bbb_data["accredited"] = False
           logging.warning('Div with class="bpr-header-accreditation-rating" not found. Defaulting accredited to False.')
      
       # Div 10: bpr-logo-contact
       bpr_logo_contact = page_center_bpr_header.find("div", class_="bpr-logo-contact")
       if not bpr_logo_contact:
           logging.error('Div with class="bpr-logo-contact" not found.')
           return {}
       logging.info('Div with class="bpr-logo-contact" found.')
      
       # Div 11: img with class="bpr-logo"
       logo_img = bpr_logo_contact.find("img", class_="bpr-logo")
       if logo_img and logo_img.has_attr("src"):
           logo_url = logo_img["src"]
           bbb_data["logo_url"] = logo_url
           logging.info(f"Logo URL: {logo_url}")
          
           # Download the logo image to raw_data/step_1 directory
           logo_filename = os.path.join(RAW_DATA_DIR, "logo.png")
           success = download_image(logo_url, logo_filename)
           if success:
               bbb_data["logo_filename"] = "logo.png"
               logging.info(f"Logo downloaded to {logo_filename}")
               
               # Copy to raw_data root for backward compatibility
               raw_data_root = os.path.dirname(RAW_DATA_DIR)
               shutil.copy2(logo_filename, os.path.join(raw_data_root, "logo.png"))
               logging.info(f"Logo copied to {raw_data_root}/logo.png for compatibility")
           else:
               bbb_data["logo_filename"] = "N/A"
               logging.error("Failed to download logo")
       else:
           bbb_data["logo_url"] = "N/A"
           bbb_data["logo_filename"] = "N/A"
           logging.warning('Logo image with class="bpr-logo" not found or src attribute missing.')
      
       # Div 12: bpr-header-contact
       bpr_header_contact = bpr_logo_contact.find("div", class_="bpr-header-contact")
       if bpr_header_contact:
           contact_links = bpr_header_contact.find_all("a")
           if contact_links:
               # First <a>: URL
               if len(contact_links) >= 1:
                   website_url = contact_links[0].get("href", "N/A")
                   bbb_data["website"] = website_url
                   logging.info(f"Website URL: {website_url}")
               else:
                   bbb_data["website"] = "N/A"
                   logging.warning("Website URL <a> tag not found.")
              
               # Second <a>: Telephone
               if len(contact_links) >= 2:
                   telephone = contact_links[1].text.strip()
                   bbb_data["telephone"] = telephone
                   logging.info(f"Telephone: {telephone}")
               else:
                   bbb_data["telephone"] = "N/A"
                   logging.warning("Telephone <a> tag not found.")
              
               # Third <a>: Email
               if len(contact_links) >= 3:
                   email = contact_links[2].text.strip()
                   bbb_data["email"] = email
                   logging.info(f"Email: {email}")
               else:
                   bbb_data["email"] = "N/A"
                   logging.warning("Email <a> tag not found.")
           else:
               logging.warning("No <a> tags found within bpr-header-contact.")
               bbb_data["website"] = "N/A"
               bbb_data["telephone"] = "N/A"
               bbb_data["email"] = "N/A"
       else:
           logging.warning('Div with class="bpr-header-contact" not found.')
           bbb_data["website"] = "N/A"
           bbb_data["telephone"] = "N/A"
           bbb_data["email"] = "N/A"
      
       # Navigate to div class="page-content"
       bpr_about_body = page_content.find("div", class_="page-vertical-padding bpr-about-body")
       if not bpr_about_body:
           logging.error('Div with class="page-vertical-padding bpr-about-body" not found.')
           return {}
       logging.info('Div with class="page-vertical-padding bpr-about-body" found.')
      
       page_center_stack = bpr_about_body.find("div", class_="page-center stack")
       if not page_center_stack:
           logging.error('Div with class="page-center stack" not found.')
           return {}
       logging.info('Div with class="page-center stack" found.')
      
       with_sidebar = page_center_stack.find("div", class_="with-sidebar")
       if not with_sidebar:
           logging.error('Div with class="with-sidebar" not found.')
           return {}
       logging.info('Div with class="with-sidebar" found.')
      
       sidebar_stack = with_sidebar.find("div", class_="sidebar stack")
       if not sidebar_stack:
           logging.error('Div with class="sidebar stack" not found.')
           return {}
       logging.info('Div with class="sidebar stack" found.')
      
       # Extract Business Name and Address
       overview_card = sidebar_stack.find("div", class_="bpr-overview-card container")
       if overview_card:
           card_stack = overview_card.find("div", class_="card stack")
           if card_stack:
               # **Updated Business Name Extraction**
               business_name_tag = card_stack.find("p", class_="bds-body bpr-overview-business-name")
               if business_name_tag:
                   business_name = business_name_tag.text.strip()
                   bbb_data["business_name"] = business_name
                   logging.info(f"Business Name: {business_name}")
               else:
                   bbb_data["business_name"] = "N/A"
                   logging.warning('P tag with class="bds-body bpr-overview-business-name" not found.')
              
               # **Updated Address Extraction with Spaces**
               address_tags = card_stack.find_all("div", class_="bpr-overview-address bds-body")
               if not address_tags:
                   address_tags = card_stack.find_all("div", class_="bpr-overview-address")  # Fallback
               if address_tags:
                   # Introduce spaces between address parts
                   address = " ".join([tag.text.strip() for tag in address_tags])
                   bbb_data["address"] = address
                   logging.info(f"Address: {address}")
               else:
                   bbb_data["address"] = "N/A"
                   logging.warning('Divs with class="bpr-overview-address bds-body" not found.')
           else:
               logging.warning('Div with class="card stack" not found within bpr-overview-card.')
               bbb_data["business_name"] = "N/A"
               bbb_data["address"] = "N/A"
       else:
           logging.warning('Div with class="bpr-overview-card container" not found.')
           bbb_data["business_name"] = "N/A"
           bbb_data["address"] = "N/A"
      
       # Extract Dates: Date of Accreditation and Years in Business
       overview_dates = sidebar_stack.find("div", class_="bpr-overview-dates stack")
       if overview_dates:
           p_tags = overview_dates.find_all("p")
           if len(p_tags) >= 2:
               date_of_accreditation = p_tags[0].text.strip()
               years_in_business = p_tags[1].text.strip()
               bbb_data["date_of_accreditation"] = date_of_accreditation
               bbb_data["years_in_business"] = years_in_business
               logging.info(f"Date of Accreditation: {date_of_accreditation}")
               logging.info(f"Years in Business: {years_in_business}")
           else:
               bbb_data["date_of_accreditation"] = "N/A"
               bbb_data["years_in_business"] = "N/A"
               logging.warning("Not enough <p> tags found in bpr-overview-dates.")
       else:
           logging.warning('Div with class="bpr-overview-dates stack" not found.')
           bbb_data["date_of_accreditation"] = "N/A"
           bbb_data["years_in_business"] = "N/A"
      
       # Extract Payment Methods
       payment_methods_div = sidebar_stack.find("div", class_="bpr-payment-methods-custom stack")
       if payment_methods_div:
           p_tag = payment_methods_div.find("p", class_="bds-body")
           if p_tag:
               payment_methods = p_tag.text.strip()
               bbb_data["payment_methods"] = payment_methods
               logging.info(f"Payment Methods: {payment_methods}")
           else:
               bbb_data["payment_methods"] = "N/A"
               logging.warning('P tag with class="bds-body" not found in bpr-payment-methods-custom.')
       else:
           logging.warning('Div with class="bpr-payment-methods-custom stack" not found.')
           bbb_data["payment_methods"] = "N/A"
      
       # Extract BBB Rating
       rating_container = sidebar_stack.find("div", style="--stack-space:1.25rem")
       if rating_container:
           rating_card = rating_container.find("div", class_="bpr-rating-card stack")
           if rating_card:
               span_grade = rating_card.find("span", class_="bpr-letter-grade")
               if span_grade:
                   bbb_rating = span_grade.text.strip()
                   bbb_data["bbb_rating"] = bbb_rating
                   logging.info(f"BBB Rating: {bbb_rating}")
               else:
                   bbb_data["bbb_rating"] = "N/A"
                   logging.warning('Span with class="bpr-letter-grade" not found in bpr-rating-card.')
           else:
               bbb_data["bbb_rating"] = "N/A"
               logging.warning('Div with class="bpr-rating-card stack" not found in rating container.')
       else:
           logging.warning('Div with style="--stack-space:1.25rem" not found.')
           bbb_data["bbb_rating"] = "N/A"
      
       # Extract Additional Business Details and Services
       not_sidebar = with_sidebar.find("div", class_="not-sidebar stack")
       if not_sidebar:
           # Extract Description and Services
           bds_body_divs = not_sidebar.find_all("div", class_="bds-body")
           if bds_body_divs:
               # **First bds-body div contains description and services within <p> tags**
               if len(bds_body_divs) >= 1:
                   first_bds_div = bds_body_divs[0]
                   p_tags = first_bds_div.find_all("p")
                   if len(p_tags) >= 2:
                       description = p_tags[0].text.strip()
                       services_list = p_tags[1].text.strip()
                       bbb_data["description"] = description
                       bbb_data["services"] = [service.strip() for service in services_list.split(',')]
                       logging.info(f"Description: {description}")
                       logging.info(f"Services: {bbb_data['services']}")
                   else:
                       logging.warning("Not enough <p> tags found in the first bds-body div.")
              
               # **Second bds-body div contains additional services without <p> tags**
               if len(bds_body_divs) >= 2:
                   second_bds_div = bds_body_divs[1]
                   # Assuming services are listed as text separated by commas
                   additional_services_text = second_bds_div.text.strip()
                   additional_services = [service.strip() for service in additional_services_text.split(',')]
                   bbb_data["additional_services"] = additional_services
                   logging.info(f"Additional Services: {bbb_data['additional_services']}")
               else:
                   logging.warning("Second bds-body div for additional services not found.")
           else:
               logging.warning('No divs with class="bds-body" found in not-sidebar stack.')
          
          
           # Extract Employee Details
           bpr_details = not_sidebar.find("div", class_="bpr-details")
           if bpr_details:
               bpr_details_section = bpr_details.find("div", class_="bpr-details-section")
               if bpr_details_section:
                   # **Select the first div with class="bpr-details-dl stack"**
                   first_bpr_details_dl = bpr_details_section.find("dl", class_="bpr-details-dl stack")
                   if first_bpr_details_dl:
                       details_dl_data = first_bpr_details_dl.find_all("div", class_="bpr-details-dl-data")
                       if len(details_dl_data) >= 2:
                           # **Assuming the first div contains employee names and the second contains the number**
                           employee_names_div = details_dl_data[-2]
                           employee_number_div = details_dl_data[-1]
                          
                           # Extract employee names
                           dd_names = employee_names_div.find_all("dd")
                           if dd_names:
                               employee_names = [dd.text.strip() for dd in dd_names]
                               bbb_data["employee_names"] = employee_names
                               logging.info(f"Employee Names: {employee_names}")
                           else:
                               bbb_data["employee_names"] = []
                               logging.warning("No <dd> tags found for employee names.")
                          
                           # Extract number of employees
                           dd_number = employee_number_div.find("dd")
                           if dd_number:
                               number_of_employees = dd_number.text.strip()
                               bbb_data["number_of_employees"] = number_of_employees
                               logging.info(f"Number of Employees: {number_of_employees}")
                           else:
                               bbb_data["number_of_employees"] = "N/A"
                               logging.warning("No <dd> tag found for number of employees.")
                       else:
                           logging.warning("Not enough divs with class='bpr-details-dl-data' found in the first bpr-details-dl stack.")
                   else:
                       logging.warning('Div with class="bpr-details-dl stack" not found within bpr-details-section.')
               else:
                   logging.warning('Div with class="bpr-details-section" not found within bpr-details.')
           else:
               logging.warning('Div with class="bpr-details" not found within not-sidebar stack.')
       else:
           logging.warning('Div with class="not-sidebar stack" not found.')
      
       # Extract Overview
       bpr_details = not_sidebar.find("div", class_="bpr-details")
       if bpr_details:
           # Step 1: Find 'bpr-details-section stack'
           bpr_details_section = bpr_details.find("div", class_="bpr-details-section stack")
          
           if bpr_details_section:
               # Step 2: Find the 'dl' with class 'bpr-details-dl stack'
               bpr_details_dl = bpr_details_section.find("dl", class_="bpr-details-dl stack")
              
               if bpr_details_dl:
                   # Step 3: Find all 'bpr-details-dl-data' divs
                   details_dl_data = bpr_details_dl.find_all("div", class_="bpr-details-dl-data")
                  
                   if len(details_dl_data) >= 2:
                       # Step 4: Second-to-last div -> Extract href from <span> with id=":Rpkl9riq:"
                       second_last_dl_data = details_dl_data[-2]
                       dd_tag_last = second_last_dl_data.find("dd")
                      
                       if dd_tag_last:
                           a_tag_in_span = dd_tag_last.find("a")
                           if a_tag_in_span and a_tag_in_span.has_attr("href"):
                               business_email = a_tag_in_span["href"]
                               bbb_data["business_email"] = business_email
                               logging.info(f"business_email href extracted: {business_email}")
                           else:
                               bbb_data["business_email"] = "N/A"
                               logging.warning("No <a> tag with href found in the second-to-last 'bpr-details-dl-data'.")
                       else:
                           bbb_data["business_email"] = "N/A"
                           logging.warning("No <span> with id=':Rpkl9riq:' found in the second-to-last 'bpr-details-dl-data'.")


                       # Step 5: Last div -> Extract href from <dd> > <a>
                       last_dl_data = details_dl_data[-1]
                       dd_tag = last_dl_data.find("dd")
                      
                       if dd_tag:
                           a_tag_in_dd = dd_tag.find("a")
                           if a_tag_in_dd and a_tag_in_dd.has_attr("href"):
                               website = a_tag_in_dd["href"]
                               bbb_data["website"] = website
                               logging.info(f"Last href extracted: {website}")
                           else:
                               bbb_data["website"] = "N/A"
                               logging.warning("No <a> tag with href found in the last 'bpr-details-dl-data'.")
                       else:
                           bbb_data["last_href"] = "N/A"
                           logging.warning("No <dd> tag found in the last 'bpr-details-dl-data'.")
                   else:
                       logging.warning("Less than 2 'bpr-details-dl-data' divs found in 'bpr-details-dl stack'.")
               else:
                   logging.warning("No 'dl' with class 'bpr-details-dl stack' found in 'bpr-details-section stack'.")
           else:
               logging.warning("No 'bpr-details-section stack' found within 'bpr-details'.")
       else:
           logging.warning("Div with class='bpr-details' not found within 'not-sidebar stack'.")


      
       # Optionally, you can extract more details as needed based on the pathing logic
      
   except Exception as e:
       logging.error(f"An error occurred during scraping: {e}")
  
   finally:
       # Close the browser
       logging.info("Closing the browser.")
       driver.quit()
  
   return bbb_data


if __name__ == "__main__":
   TARGET_URL = (
       "https://www.bbb.org/us/ga/sharpsburg/profile/roofing-contractors/cowboys-vaqueros-construction-0443-28157863"
   )
  
   # Scrape BBB profile
   scraped_data = scrape_bbb_profile(
       url=TARGET_URL,
       headless=False,  # Set to False to see the browser actions for debugging
   )
  
   # Display the scraped data
   print(json.dumps(scraped_data, indent=4))
  
   # Save to JSON file in raw_data/step_1 directory
   output_file = os.path.join(RAW_DATA_DIR, "bbb_profile_data.json")
   with open(output_file, "w", encoding="utf-8") as json_file:
       json.dump(scraped_data, json_file, ensure_ascii=False, indent=4)
  
   print(f"BBB profile data saved to {output_file}")




