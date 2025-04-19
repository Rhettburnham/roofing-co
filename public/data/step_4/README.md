# Step 4: Website Data Integration and AI Enhancement

This folder contains Python scripts that integrate all previously collected and generated data into a comprehensive JSON structure that powers the roofing company website. The scripts combine data from multiple sources and use AI to enhance content where needed.

## Files Overview

### 1. `generate_combined_data.py`

The main script that orchestrates the creation of the complete website data structure.

**Functionality:**
- Combines data from multiple sources:
  - BBB profile data (Step 1)
  - Reviews and sentiment analysis (Step 2)
  - Service descriptions (Step 3)
  - About page content (Step 3)
- Uses AI to enhance and generate missing content
- Creates a unified data structure following `template_data.json`
- Handles data validation and fallbacks
- Generates SEO-friendly content

**Input Sources:**
- `raw_data/step_1/bbb_profile_data.json`
- `raw_data/step_2/sentiment_reviews.json`
- `raw_data/step_3/about_page.json`
- `raw_data/step_3/services/*.json`

**Output:** `raw_data/combined_data.json`

### 2. `deepseek_utils.py`

A utility module that handles AI-powered content generation using the DeepSeek API.

**Functionality:**
- Manages API communication with DeepSeek
- Provides fallback content when API is unavailable
- Handles various content generation tasks:
  - Business name formatting
  - Rich text content
  - Service categorization
  - Geographic coordinate estimation
- Includes robust error handling and logging

**Dependencies:**
- DeepSeek API key (in `.env.deepseek` file)
- `requests` library for API calls
- `python-dotenv` for environment management

### 3. `template_data.json`

The template file that defines the structure of the final website data.

**Structure:**
- Navigation configuration
- Hero section layout
- Booking section
- Rich text content
- Service descriptions
- Map and contact information
- Team member profiles
- Gallery and before/after images
- Reviews section

**Template Variables:**
- `{{BUSINESS_NAME_MAIN}}` - Primary business name
- `{{BUSINESS_NAME_SUB}}` - Business subtitle
- `{{BOOKING_HEADER_TEXT}}` - Booking section header
- `{{PHONE_NUMBER}}` - Business phone number
- `{{RICH_TEXT_*}}` - Various rich text content
- `{{MAP_LAT}}`, `{{MAP_LNG}}` - Map coordinates
- And more...

### 4. `test.py`

A comprehensive test suite for the data generation process.

**Functionality:**
- Unit tests for data integration
- Validation of JSON structure
- API response testing
- Fallback behavior verification
- Template variable replacement testing

## Data Flow

1. **Input Collection:**
   - Load BBB profile data
   - Load processed reviews
   - Load service descriptions
   - Load about page content

2. **Content Enhancement:**
   - AI-powered content generation
   - Business name formatting
   - Geographic data processing
   - Review selection and formatting

3. **Template Integration:**
   - Variable replacement
   - Structure validation
   - Content organization
   - Image path verification

4. **Output Generation:**
   - Combined JSON file creation
   - Logging and verification
   - Fallback handling

## Dependencies

The scripts require these Python packages:
```
requests
python-dotenv
logging
json
```

Install dependencies with:
```bash
pip install requests python-dotenv
```

## Environment Setup

1. Create a `.env.deepseek` file in the `public/data` directory:
```
DEEPSEEK_API_KEY=your_api_key_here
```

2. Ensure all input data from previous steps is available in the correct locations.

## Usage

1. **Generate Combined Data:**
```bash
python generate_combined_data.py
```

2. **Run Tests:**
```bash
python test.py
```

## Error Handling

The scripts include comprehensive error handling:
- Graceful fallbacks when API is unavailable
- Logging of all operations
- Validation of input/output data
- Automatic creation of missing directories

## Output Validation

The generated `combined_data.json` should be validated against these criteria:
- All required fields are present
- Image paths are valid
- URLs are properly formatted
- Content is properly escaped
- Template variables are all replaced

Note: The scripts will automatically create necessary directories and handle missing data gracefully. However, for optimal results, ensure all input data from previous steps is available. 