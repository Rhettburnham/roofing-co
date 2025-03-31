# Roofing Business Data Pipeline

## Overview

This project implements a comprehensive data pipeline for roofing businesses, starting from lead generation through to final website content generation. The pipeline consists of initial lead generation followed by four main processing steps.

## Background: Lead Generation

Located in `/public/data/leads/`

### Google Maps Scraper (`Leads.py`)

- Scrapes roofing business data from Google Maps
- Covers multiple GA zip codes (30002-30114)
- Collects:
  - Business Names
  - Ratings
  - Number of Reviews
  - Categories
  - Addresses
  - Phone Numbers
  - Business Hours
  - Websites
  - Google Reviews Links
- Outputs:
  - `google_maps_business_listings_multi_search.csv`
  - `business_listings_multi_search.json`

### BBB Scraper (`bbb_bus.py`)

- Scrapes Better Business Bureau data for each business
- Enhances lead data with:
  - BBB Business Names
  - BBB URLs
  - BBB Phone Numbers
  - BBB Addresses
- Updates existing CSV with BBB data
- Creates `call_list.json` with combined information

## Processing Pipeline

### Step 1: Initial Data Collection

Located in `/public/data/step_1/`

- **BBB Data Collection** (`ScrapeBBB.py`)

  - Detailed BBB profile scraping
  - Business verification
  - Accreditation status

- **Review Collection** (`ScrapeReviews.py`)

  - Aggregates customer reviews
  - Sentiment analysis preparation

- **Logo Processing** (`enhance_logo.py`, `convert_logo.py`)
  - Logo enhancement and standardization
  - Format conversion for web use

### Step 2: Analysis & Brand Elements

Located in `/public/data/step_2/`

- **Review Analysis** (`AnalyzeReviews.py`)

  - Sentiment analysis
  - Key theme extraction
  - Customer satisfaction metrics

- **Color Analysis** (`color_extractor.py`)

  - Brand color extraction from logos
  - Color scheme generation
  - Tailwind CSS integration (`copy_colors_for_tailwind.py`)

- **Service Research** (`research_services.py`)
  - Service offering analysis
  - Market positioning
  - Competitive analysis

### Step 3: Content Generation

Located in `/public/data/step_3/`

- **Service Content** (`generate_service_jsons.py`)

  - Service descriptions
  - Feature lists
  - Pricing structures

- **About Page Generation** (`generate_about_page.py`)

  - Company narratives
  - Mission statements
  - Value propositions

- **Image Processing** (`clipimage.py`)
  - Image optimization
  - Aspect ratio standardization
  - Web performance optimization

### Step 4: Final Integration

Located in `/public/data/step_4/`

- **Service Imagery** (`service_image_scraper.py`)

  - Service-specific image collection
  - Visual content curation

- **Data Integration** (`generate_combined_data.py`)

  - Combines all processed data
  - Creates final website content structure
  - Generates complete business profiles

- **AI Enhancement** (`deepseek_utils.py`)
  - AI-powered content refinement
  - Natural language processing
  - Content optimization

## Output Files

- `combined_data.json`: Final processed dataset
- `roofing_services.json`: Detailed service information
- Various intermediate CSVs and JSONs for each processing stage

## Dependencies

- Python 3.x
- Selenium WebDriver
- BeautifulSoup4
- Pandas
- Additional requirements in `requirements.txt`

## Usage

1. Run lead generation scripts to collect initial business data
2. Execute each step in sequence (1-4)
3. Final output will be available in combined_data.json

## Notes

- Ensure proper API keys and credentials are set up
- Some processes may require manual verification
- Rate limiting and ethical scraping practices are implemented
- Regular maintenance of scrapers may be needed due to website changes
