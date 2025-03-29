# Service Page Generation Scripts

This directory contains scripts to automatically generate comprehensive service pages for a roofing contractor website using AI research and content generation.

## Scripts Overview

1. `research_services.py` - Uses DeepSeek AI to research roofing services in-depth. Extracts services from BBB profile data if available.
2. `generate_service_pages.py` - Creates structured content blocks for each service, ensuring compatibility with the website components.
3. `scrape_service_images.py` - Finds and downloads relevant images for each content block using a single browser session.
4. `generate_all.py` - Runs all scripts in sequence for complete generation.
5. `example_services.json` - Shows the expected output format from the scripts.

## Prerequisites

1. Python 3.6+
2. Required Python packages (install with `pip install -r requirements.txt`):
   - requests
   - beautifulsoup4
   - selenium
   - webdriver-manager
3. A DeepSeek API key (replace `YOUR_DEEPSEEK_API_KEY` in scripts)
4. Chrome browser (for Selenium WebDriver)

## Integration with Website

The scripts generate content that integrates with three key components of the website:

1. **Main Page Hero Block** - Displays residential and commercial services with links to service pages
2. **Combined Page Block** - Shows service categories with descriptions and links
3. **Service Pages** - Detailed pages for each service built from content blocks

The JSON structure is designed to match the existing website components' expectations, including:

- Proper service IDs and slugs for consistent routing
- HeroBlock components with required fields
- Image paths following the website's conventions

## Usage

### Option 1: Run Complete Process

```bash
python scripts/generate_all.py
```

This will:

1. Research all roofing services (using BBB data if available)
2. Generate service pages with appropriate content blocks
3. Find and download images for each content block

### Option 2: Run Individual Steps

Research phase:

```bash
python scripts/research_services.py
```

Generate content blocks:

```bash
python scripts/generate_service_pages.py
```

Find and download images:

```bash
python scripts/scrape_service_images.py
```

## Customization

### Using BBB Profile Data

The system automatically extracts services from `public/data/bbb_profile_data.json` if available. The BBB data should have a `services` array with service names.

### Modifying Available Block Types

The `AVAILABLE_BLOCKS` list in `generate_service_pages.py` controls which block types can be used in service pages. Add or remove block types as needed.

## Output Files

The scripts generate:

1. `public/data/services_research.json` - Raw research data about each service
2. `public/data/services.json` - Structured service pages with content blocks compatible with the website
3. Images in `public/assets/images/services/[residential|commercial]/[id]/`

## Notes

- The system ensures consistency between the main page, combined page, and service pages
- Service slugs are generated based on the HeroBlock title for each service
- The images are downloaded using Selenium to handle dynamic content loading
- Always verify and potentially modify AI-generated content before publishing
- You may need to manually adjust some content blocks for the best appearance
