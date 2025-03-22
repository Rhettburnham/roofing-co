# Data Processing Pipeline

This directory contains scripts and data files used to identify potential roofing companies for website templates.

## Directory Structure

- `/raw_data`: Contains raw input data like CSV files with business listings
- `/processed_data`: Contains processed data like BBB profiles and review sentiment data
- `/scripts`: Contains Python scripts for data processing
- `/filtered`: Contains output files from filtering businesses

## Workflow

1. **Lead Generation**: 
   - `leads.py` (not included in this repo yet) identifies potential businesses

2. **BBB Profile Matching**:
   - Match leads to BBB profiles
   - Filter for businesses with BBB profiles but no website

3. **Data Processing**:
   - `ScrapeReviews.py`: Scrapes Google reviews for businesses
   - `bus_filter.py`: Filters businesses based on BBB profiles and website status
   - `combine_json.py`: Combines multiple JSON files into a single file for the website template
   - `template.py`: Generates website template data from BBB and review data
   - `visual.py`: Creates visualizations from the data

## Required Output Files

The website template expects the following files:
- `colors_output.json`: Color scheme information for the website
- `combined_data.json`: Combined business data, including BBB profile and review info

## Usage

1. Place raw CSV data in the `raw_data` directory
2. Run the necessary scripts from the `scripts` directory
3. Access the filtered results in the `filtered` directory
4. Use the processed data in the `processed_data` directory for the website template

## Example Command

```bash
cd public/data/scripts
python bus_filter.py
``` 