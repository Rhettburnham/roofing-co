# Step 2: Data Processing and Analysis Scripts

This folder contains Python scripts used to process, analyze, and enhance the data collected in Step 1. These scripts transform raw business data into structured content suitable for website presentation.

## Files Overview

### 1. `AnalyzeReviews.py`

This script performs sentiment analysis on the customer reviews collected in Step 1.

**Functionality:**
- Uses TextBlob library to analyze the sentiment of each review text
- Calculates polarity scores (-1.0 for negative to +1.0 for positive)
- Categorizes reviews as positive, negative, or neutral based on polarity
- Preserves the original review data (name, rating, date, review text)
- Adds sentiment analysis results to each review

**Input:** `raw_data/step_1/reviews.json`  
**Output:** `raw_data/step_2/sentiment_reviews.json`

```json
[
  {
    "name": "Reviewer Name",
    "rating": "5",
    "date": "2 months ago",
    "review_text": "The full review content...",
    "sentiment": "positive",
    "polarity": 0.75
  },
  ...
]
```

### 2. `color_extractor.py`

This script analyzes the business logo to extract a cohesive color scheme for the website.

**Functionality:**
- Loads the logo image from `raw_data/logo.png` (collected in Step 1)
- Uses ColorThief to extract dominant colors and a color palette
- Generates various color combinations based on color theory
- Applies adjustments for contrast, readability, and aesthetic appeal
- Selects the best color combination for the business
- Falls back to default professional colors if no logo is available

**Input:** `raw_data/logo.png`  
**Output:** 
- `raw_data/colors_output.json`
- `step_2/colors_output.json` (local copy)

```json
{
  "accent": "#1d5a88",
  "banner": "#143e5f",
  "faint-color": "#2574b0",
  "second-accent": "#c8c0c7"
}
```

### 3. `research_services.py`

This script generates comprehensive research and content about roofing services for the website.

**Functionality:**
- Identifies the roofing services from Step 1 BBB data or uses defaults
- For each service (residential and commercial), it:
  - Calls DeepSeek API to research detailed information about each service
  - Structures the data into sections: installation, repair, maintenance, variants
  - Extracts specific content elements like construction steps and advantages
  - Creates structured content ready for website display
- Falls back to placeholder content if API access is unavailable

**Input:** `raw_data/step_1/bbb_profile_data.json` (for service identification)  
**Output:** `step_2/services_research.json`

The output JSON provides rich content for each service, organized by category (residential/commercial) with details like:
- Installation procedures
- Repair techniques
- Maintenance requirements
- Available variants with pros/cons
- Price ranges
- Material options

## Data Flow

1. **Input Data** (from Step 1):
   - `raw_data/step_1/reviews.json` - Customer reviews from Google Maps
   - `raw_data/step_1/bbb_profile_data.json` - Business profile from BBB
   - `raw_data/logo.png` - Business logo

2. **Processing** (Step 2 - Current Stage):
   - Sentiment analysis of reviews
   - Color extraction from logo
   - Service research and content generation

3. **Output Data** (for Step 3):
   - `raw_data/step_2/sentiment_reviews.json` - Reviews with sentiment
   - `raw_data/colors_output.json` - Website color scheme
   - `step_2/services_research.json` - Rich roofing service content

## Usage Examples

### Analyzing Reviews Sentiment
```python
python AnalyzeReviews.py
```

### Extracting Website Colors from Logo
```python
python color_extractor.py
```

### Generating Roofing Service Content
```python
python research_services.py
```
This requires a DeepSeek API key in a `.env.deepseek` file in the `public/data` directory.

## Dependencies

The scripts require these Python packages:
- textblob (for sentiment analysis)
- pillow (for image processing)
- colorthief (for color extraction)
- requests (for API calls)
- python-dotenv (for loading environment variables)

Install dependencies with:
```
pip install textblob pillow colorthief requests python-dotenv
``` 