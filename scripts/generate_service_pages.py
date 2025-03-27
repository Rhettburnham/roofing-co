#!/usr/bin/env python3
import json
import os
import requests
import time
import re
from typing import Dict, List, Any

# Replace with your actual DeepSeek API key
DEEPSEEK_API_KEY = "YOUR_DEEPSEEK_API_KEY"
API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions"

# Define the available block types
AVAILABLE_BLOCKS = [
    "HeroBlock",
    "HeaderBannerBlock",
    "ThreeGridWithRichTextBlock",
    "GridImageTextBlock",
    "GeneralList",
    "OverviewAndAdvantagesBlock",
    "GeneralListVariant2",
    "ListImageVerticalBlock",
    "ShingleSelectorBlock",
    "ImageWrapBlock",
    "ListDropdown",
    "PricingGrid",
    "ActionButtonBlock",
    "VideoCTA"
]

def generate_blocks_prompt(service: Dict[str, Any]) -> str:
    """Generate a prompt for DeepSeek to create blocks for a service page."""
    service_name = service["name"]
    category = service["category"]
    research = service["research"]
    
    # Format the research data for the prompt
    research_text = f"""
    # {service_name} ({category.capitalize()})
    
    ## Construction Process
    {research["construction_process"]}
    
    ## Product/Service Variants
    {research["variants"]}
    
    ## Sales and Supply Chain
    {research["sales_supply"]}
    
    ## Advantages and Benefits
    {research["advantages"]}
    
    ## Marketing Considerations
    {research["marketing"]}
    
    ## Warranty and Maintenance
    {research["warranty_maintenance"]}
    """
    
    # Create the prompt
    return f"""
    You are tasked with designing a comprehensive service page for a roofing contractor's website 
    for the following service: {service_name} ({category}).
    
    Below is detailed research about this service. Use this information to create a well-structured 
    service page by selecting appropriate content blocks.
    
    {research_text}
    
    AVAILABLE BLOCK TYPES:
    {', '.join(AVAILABLE_BLOCKS)}
    
    For each block, provide:
    1. blockName: The type of block (from the list above)
    2. config: Configuration data specific to that block
    3. searchTerms: Keywords for finding appropriate images
    
    Your response MUST be valid JSON and follow this structure:
    {{
        "blocks": [
            {{
                "blockName": "HeroBlock",
                "config": {{
                    "title": "Example Title",
                    "subtitle": "Example subtitle text",
                    "buttonText": "Call to Action",
                    "buttonUrl": "#contact"
                }},
                "searchTerms": "relevant image search terms for this block"
            }},
            // Additional blocks...
        ]
    }}
    
    GUIDELINES:
    - IMPORTANT: The first block MUST be a HeroBlock with a title that clearly describes the service
    - The HeroBlock config MUST include: title, subtitle, backgroundOpacity (0.4-0.7), buttonText, and buttonUrl
    - Use HeaderBannerBlock for section headings
    - Include at least 5-7 blocks total for a comprehensive page
    - Match block types to the content they best present:
      * Use list blocks for processes or comparisons
      * Use grid blocks for showing variants or options
      * Use image blocks to showcase visual aspects
      * Use action blocks for calls to action
    - Tailor image search terms to find professional, relevant images
    - Include pricing information only if the research suggests it's appropriate
    - Ensure content flows logically from introduction to call-to-action
    
    Return ONLY valid JSON with no additional explanations.
    """

def call_deepseek_api(prompt: str) -> str:
    """Call the DeepSeek API with a given prompt and return the response."""
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "deepseek-chat",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7,
        "max_tokens": 4000
    }
    
    response = requests.post(API_ENDPOINT, headers=headers, json=data)
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return f"Error: {response.status_code} - {response.text}"

def extract_json_from_response(response: str) -> Dict:
    """Extract and parse JSON from the response."""
    try:
        # Find the first { and the last }
        start = response.find('{')
        end = response.rfind('}') + 1
        
        if start == -1 or end == 0:
            print("Could not find JSON in response")
            return {"blocks": []}
        
        json_str = response[start:end]
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        print(f"Response: {response}")
        return {"blocks": []}

def generate_service_page(service: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a service page with blocks based on the research."""
    print(f"Generating service page for {service['name']} ({service['category']})...")
    
    # Call DeepSeek API
    blocks_prompt = generate_blocks_prompt(service)
    blocks_response = call_deepseek_api(blocks_prompt)
    
    # Parse the response
    blocks_data = extract_json_from_response(blocks_response)
    
    # Add the blocks to the service
    service["blocks"] = blocks_data.get("blocks", [])
    
    # Ensure image paths are correctly structured
    for i, block in enumerate(service["blocks"]):
        # Add image path information for future processing
        if "searchTerms" in block:
            image_dir = f"public/assets/images/services/{service['category']}/{service['id']}"
            block["imagePath"] = f"/assets/images/services/{service['category']}/{service['id']}/block_{i+1}.jpg"
            
            # Ensure the directory exists
            os.makedirs(image_dir, exist_ok=True)
    
    # Generate slug from hero block title for URL routing
    hero_block = next((block for block in service["blocks"] if block["blockName"] == "HeroBlock"), None)
    if hero_block and "title" in hero_block.get("config", {}):
        title = hero_block["config"]["title"]
        slug = re.sub(r'[^\w\s-]', '', title.lower())  # Remove special chars
        slug = re.sub(r'[\s_-]+', '-', slug)           # Replace spaces with hyphens
        service["slug"] = f"{service['category']}-{service['id']}-{slug}"
    else:
        service["slug"] = f"{service['category']}-{service['id']}"
    
    return service

def convert_service_id(service_id):
    """Convert service ID to integer for compatibility with existing code."""
    if isinstance(service_id, str) and service_id.startswith(('r', 'c')):
        return int(service_id[1:])
    return service_id

def main():
    """Main function to generate service pages from research."""
    try:
        # Load the research data
        with open("public/data/services_research.json", "r") as f:
            services_data = json.load(f)
        
        # Prepare the output structure
        output_data = {
            "residential": [],
            "commercial": []
        }
        
        # Create service pages for residential services
        for i, service in enumerate(services_data["residential"]):
            enriched_service = generate_service_page(service)
            # Convert ID format for compatibility (from "r1" to 1)
            enriched_service["id"] = convert_service_id(enriched_service["id"])
            output_data["residential"].append(enriched_service)
            time.sleep(2)  # Avoid rate limiting
        
        # Create service pages for commercial services
        for i, service in enumerate(services_data["commercial"]):
            enriched_service = generate_service_page(service)
            # Convert ID format for compatibility (from "c1" to 1)
            enriched_service["id"] = convert_service_id(enriched_service["id"])
            output_data["commercial"].append(enriched_service)
            time.sleep(2)  # Avoid rate limiting
        
        # Save the final services.json
        with open("public/data/services.json", "w") as f:
            json.dump(output_data, f, indent=2)
        
        print("Service pages generated and saved to public/data/services.json")
    
    except FileNotFoundError:
        print("Error: services_research.json not found. Run research_services.py first.")
    except Exception as e:
        print(f"Error generating service pages: {e}")

if __name__ == "__main__":
    main() 