# Roofing Website Generator

This system automates the process of generating website content for roofing companies by scraping and analyzing data from BBB profiles and Google reviews.

## Setup

1. Install Python 3.8 or higher
2. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up environment variables in `.env`:
   ```
   DEEPSEEK_API_KEY=your_api_key_here
   ```

## Usage

1. Run the website generator GUI:
   ```bash
   python website_generator.py
   ```

2. In the GUI:
   - Enter the BBB profile URL
   - Enter the Google Reviews URL
   - Click "Start Generation"

## Process Steps

1. **BBB Profile Scraping**
   - Scrapes business information from BBB profile
   - Saves to `bbb_profile_data.json`

2. **Google Reviews Scraping**
   - Scrapes customer reviews from Google
   - Saves to `raw_reviews.json`

3. **Review Analysis**
   - Processes and analyzes reviews for sentiment
   - Saves to `sentiment_reviews.json`

4. **Research Generation**
   - Generates business research and insights
   - Saves to `roofing_business_insights.json`

5. **Website Data Generation**
   - Combines all data into final website content
   - Saves to `combined_data.json`

## Output Files

All output files are saved in the `public/data` directory:
- `bbb_profile_data.json`: Business profile information
- `raw_reviews.json`: Raw scraped reviews
- `sentiment_reviews.json`: Processed reviews with sentiment
- `roofing_business_insights.json`: Business research and insights
- `combined_data.json`: Final website content

## Logs

Logs are saved in the `logs` directory with timestamps for debugging.

## Error Handling

- The system includes comprehensive error handling and logging
- Progress and status are shown in the GUI
- Each step can be retried if needed

## Requirements

See `requirements.txt` for a complete list of dependencies 