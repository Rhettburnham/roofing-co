# Step 1: Data Collection Scripts

This folder contains Python scripts used to scrape business data from two primary sources: Google Maps reviews and Better Business Bureau (BBB) profiles. The scripts are designed to collect structured data about a roofing company and save it in JSON format for further processing.

## Files Overview

### 1. `ScrapeReviews.py`

This script uses Selenium WebDriver and BeautifulSoup to scrape customer reviews from Google Maps.

**Functionality:**
- Uses headless Chrome browser (configurable) to navigate to a Google Maps business page
- Scrolls through reviews to load a specified maximum number
- Extracts review data including reviewer name, rating, date, and review text
- Saves the collected data as both CSV and JSON files

**Output JSON:** `raw_data/step_1/reviews.json`
- Structure:
  ```json
  [
    {
      "name": "Reviewer Name",
      "rating": "5",
      "date": "2 months ago",
      "review_text": "The full review content..."
    },
    ...
  ]
  ```

### 2. `ScrapeBBB.py`

This script scrapes business profile information from the Better Business Bureau (BBB) website.

**Functionality:**
- Uses headless Chrome browser (configurable) to navigate to a BBB business profile
- Navigates through the DOM structure to extract comprehensive business information
- Downloads the business logo and saves it to the file system
- Collects detailed information about the business including contact info, services, and BBB rating

**Output JSON:** `raw_data/step_1/bbb_profile_data.json`
- Structure:
  ```json
  {
    "accredited": true,
    "logo_url": "https://example.com/logo.png",
    "logo_filename": "logo.png",
    "website": "https://example.com",
    "telephone": "(123) 456-7890",
    "email": "Email Business",
    "business_name": "Company Name, LLC",
    "address": "123 Main Street, Suite 123, City, State ZIP",
    "date_of_accreditation": "BBB Accredited Since: MM/DD/YYYY",
    "years_in_business": "Years in Business: N",
    "payment_methods": "Company accepts most major credit cards.",
    "bbb_rating": "A+",
    "additional_services": [
      "Roofing Services",
      "Construction Services"
    ],
    "employee_names": [
      "Mr. John Doe, President",
      "Mr. John Doe, President/Owner"
    ],
    "number_of_employees": "N",
    "business_email": "/us/state/city/profile/category/company-name-id"
  }
  ```

### 3. Log Files

- `scraper.log`: Contains detailed logs from the Google Maps review scraper execution, including information about each step of the scraping process, any errors encountered, and the number of reviews collected.
- `bbb_scraper.log`: Contains detailed logs from the BBB profile scraper execution, including the DOM navigation process, extraction of various data points, and any issues encountered.

## Data Flow

1. **Data Collection** (Step 1 - Current Stage):
   - Google Maps reviews are scraped and saved to `raw_data/step_1/reviews.json`
   - BBB profile data is scraped and saved to `raw_data/step_1/bbb_profile_data.json`
   - Business logo is downloaded and saved to `raw_data/step_1/logo.png` (and copied to `raw_data/logo.png`)

2. **Data Processing** (Step 2, not in this folder):
   - The data collected in this step becomes input for subsequent processing steps
   - Reviews might be analyzed for sentiment or grouped by rating
   - BBB profile data might be formatted for display on a website template

## Common Functionality

Both scripts share similar components:
- Custom `web_driver()` function that configures a Selenium Chrome driver with anti-detection measures
- Detailed logging to track the scraping process
- Standardized error handling and data validation
- Creation of output directories if they don't exist
- Saving data in well-structured JSON files

## Usage Examples

### Scraping Google Maps Reviews
```python
python ScrapeReviews.py
```
This will:
1. Open a Chrome browser (headless by default)
2. Navigate to the configured Google Maps page for Craft Roofing Company
3. Scroll through and collect up to 50 reviews
4. Save the data to `raw_data/step_1/reviews.json` and `raw_data/step_1/google_maps_reviews.csv`

### Scraping BBB Profile
```python
python ScrapeBBB.py
```
This will:
1. Open a Chrome browser (headless by default)
2. Navigate to the configured BBB profile page for Craft Roofing Company
3. Extract comprehensive business information
4. Download the business logo
5. Save the data to `raw_data/step_1/bbb_profile_data.json`

## Target Business

The scripts are pre-configured to scrape data for "Craft Roofing Company" but can be modified to target other businesses by changing the `TARGET_URL` variable in each script.

- Google Maps URL in `ScrapeReviews.py`: 
  ```
  https://www.google.com/maps/place/Craft+Roofing+Company/@34.1702728,-84.5808208,17z/data=!4m8!3m7!1s0x88f5684c5c01aaab:0x4ebec0a0e6c12ea7!8m2!3d34.1702728!4d-84.5782459!9m1!1b1!16s%2Fg%2F11fk0bhkdq
  ```

- BBB profile URL in `ScrapeBBB.py`:
  ```
  https://www.bbb.org/us/ga/atlanta/profile/roofing-contractors/craft-roofing-company-llc-0443-27604141
  ```

## Dependencies

The scripts require these Python packages:
- selenium
- beautifulsoup4
- pandas
- chromedriver_py
- requests
- logging

These can be installed via pip:
```
pip install selenium beautifulsoup4 pandas chromedriver_py requests
``` 