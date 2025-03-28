# Service Generation Scripts

This set of scripts automates the process of creating comprehensive service pages for your roofing website. The scripts handle research, content generation, and image acquisition to create professional service pages with minimal manual effort.

## Quick Start

The easiest way to run all scripts is with the included shell script:

```bash
# Make sure the script is executable
chmod +x run_service_scripts.sh

# Run it
./run_service_scripts.sh
```

## Individual Scripts

The service generation process happens in three main steps:

### 1. Research (service_research.py)

This script uses DeepSeek AI to research each roofing service in-depth:

```bash
python3 service_research.py
```

Features:

- Extracts services from BBB profile data when available
- Uses specified fallback services when needed
- Ensures key services are always included (shingling, roof repair, siding for residential; metal roof, coating, ventilation for commercial)
- Creates detailed research for each service covering: construction process, variants, sales approach, advantages, marketing, and warranties

Output: `public/data/services_research.json`

### 2. Content Generation (service_generator.py)

This script generates structured content blocks for each service:

```bash
python3 service_generator.py
```

Features:

- Creates appropriate block types based on the content (lists, grids, images, CTAs)
- Ensures proper HeroBlock components with clear titles
- Generates SEO-friendly slugs for each service
- Adds search terms for each block to help find relevant images
- Sets up image paths for consistency

Output: `public/data/services.json`

### 3. Image Acquisition (service_image_scraper.py)

This script finds and downloads images for each content block:

```bash
python3 service_image_scraper.py
```

Features:

- Uses a single browser session for all image searches
- Searches Google Images for professional roofing images
- Downloads images to the correct paths for each service
- Handles failures gracefully with retries and fallbacks

Output: Images saved to `public/assets/images/services/{category}/{id}/`

### 4. All-Blocks Page Generator (generate_all_blocks_page.py)

This special script creates a page that combines all blocks from all services for easy editing:

```bash
python3 generate_all_blocks_page.py
```

Features:

- Creates a special JSON file with all blocks from all services
- Organizes blocks by service with clear headers
- Provides a complete view of all content in one place

Output: `public/data/all_blocks_service.json`

## Integration with the Website

These scripts are fully integrated with the website's components:

1. **Main Page HeroBlock**: Shows residential and commercial services from services.json
2. **CombinedPageBlock**: Displays and links to services from services.json
3. **ServicePage**: Renders individual service pages from the blocks in services.json
4. **All-Blocks Page**: Special route at `/all-service-blocks` to view all blocks in one place

## Configuration

- **DeepSeek API Key**: Set in `.env.deepseek` file in the same directory
- **Required Dependencies**: Listed in `requirements.txt`
- **Default Services**: Configured in `service_research.py`
- **Available Block Types**: Listed in `service_generator.py`

## Customization

You can customize various aspects of the generation process:

1. **Block Types**: Edit the `AVAILABLE_BLOCKS` list in `service_generator.py`
2. **Default Services**: Modify the `DEFAULT_SERVICES` and `MUST_HAVE_*` lists in `service_research.py`
3. **Image Search Terms**: The search terms are generated automatically but can be customized in the JSON if needed

## Troubleshooting

- **API Key Issues**: Make sure your DeepSeek API key is valid and set in `.env.deepseek`
- **Dependency Problems**: Run `pip install -r requirements.txt` to install all dependencies
- **Missing Images**: If image scraping fails, you can manually add images to the correct paths
- **Selenium Issues**: Make sure Chrome or Chromium is installed for Selenium WebDriver

## Workflow Tips

1. Run the scripts in order: research → generate → scrape
2. Review the generated content in `public/data/services.json`
3. View the all-blocks page at `/all-service-blocks` to see everything in one place
4. Make manual adjustments to the JSON files as needed
5. Images are saved to the correct paths automatically
