# Website Content Generation Scripts

This directory contains scripts for generating website content automatically using data from BBB profiles and reviews.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

## Running the Pipeline

The main script to run is `generate_website_content.py`, which orchestrates the entire process:

```bash
python generate_website_content.py
```

This will:
1. Check dependencies
2. Verify environment setup
3. Validate input files
4. Back up existing files
5. Generate all content
6. Copy files to the correct locations

## Individual Scripts

- `content_generator.py`: Core content generation script
- `bus_filter.py`: Filters businesses based on BBB profiles and websites
- `list_data_files.py`: Lists all data files in the directory structure

## Data Flow

1. BBB profile data (`bbb_profile_data.json`) and reviews (`sentiment_reviews.json`) are inputs
2. Content generator creates:
   - Main page content (`combined_data.json`)
   - Service page content
   - Services index (`services.json`)
3. Files are copied to the appropriate locations

## Customizing Content

You can adjust the content generation by modifying:
- Prompt templates in `content_generator.py`
- Environment variables in `.env` (model, temperature, etc.)
- Service variant classification rules 