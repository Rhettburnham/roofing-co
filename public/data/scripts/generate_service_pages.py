#!/usr/bin/env python3
import json
import os
import requests
import time
import re
import dotenv
from pathlib import Path
from typing import Dict, List, Any

# Load the DeepSeek API key from .env.deepseek file
env_path = Path(__file__).parent / ".env.deepseek"
dotenv.load_dotenv(env_path)

# Get API key from environment variable
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions"

if not DEEPSEEK_API_KEY:
    print("WARNING: DeepSeek API key not found. Please set it in the .env.deepseek file.")

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

def load_json_file(file_path: str) -> Dict:
    """Load a JSON file."""
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading JSON file: {e}")
        return {}

def create_hero_block(service_name: str, category: str) -> Dict[str, Any]:
    """Create a HeroBlock for a service."""
    return {
        "blockName": "HeroBlock",
        "config": {
            "backgroundImage": "",
            "title": service_name,
            "shrinkAfterMs": 1500,
            "initialHeight": "40vh",
            "finalHeight": "20vh"
        }
    }

def create_action_button_block() -> Dict[str, Any]:
    """Create an ActionButtonBlock."""
    return {
        "blockName": "ActionButtonBlock",
        "config": {
            "buttonText": "Schedule an Inspection",
            "buttonLink": "/#book",
            "buttonColor": "1"
        }
    }

def create_header_banner_block(title: str) -> Dict[str, Any]:
    """Create a HeaderBannerBlock."""
    return {
        "blockName": "HeaderBannerBlock",
        "config": {
            "title": title,
            "textAlign": "center",
            "fontSize": "text-2xl",
            "textColor": "#ffffff",
            "bannerHeight": "h-16",
            "paddingY": "",
            "backgroundImage": "/assets/images/growth/hero_growth.jpg"
        }
    }

def create_video_cta_block() -> Dict[str, Any]:
    """Create a VideoCTA block."""
    return {
        "blockName": "VideoCTA",
        "config": {
            "videoSrc": "",
            "title": "Ready to Upgrade Your Roof?",
            "description": "Contact us today for a free consultation and estimate.",
            "buttonText": "Schedule a Consultation",
            "buttonLink": "/#contact",
            "textColor": "1",
            "textAlignment": "center",
            "overlayOpacity": 0.7
        }
    }

def extract_advantages(research: Dict[str, str]) -> List[str]:
    """Extract advantages from research data."""
    advantages = []
    if 'advantages' in research:
        # Try to extract bullet points
        bullet_pattern = r"([\*\-•] .*?)(?=[\*\-•]|$)"
        matches = re.findall(bullet_pattern, research['advantages'])
        if matches:
            advantages = [match.strip().lstrip('*-• ') for match in matches if match.strip()]
    
    # If no advantages found, add some generic ones
    if not advantages:
        advantages = [
            "High-quality materials and expert installation",
            "Comprehensive warranty coverage",
            "Energy-efficient solutions",
            "Protect your property from the elements"
        ]
    
    return advantages[:4]  # Limit to 4 advantages

def create_service_blocks(service: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Create a set of blocks for a service based on its research data."""
    service_name = service["name"]
    category = service["category"]
    research = service.get("research", {})
    
    blocks = []
    
    # 1. Hero Block
    blocks.append(create_hero_block(service_name, category))
    
    # 2. Action Button
    blocks.append(create_action_button_block())
    
    # 3. Header Banner for Overview
    blocks.append(create_header_banner_block("Overview & Benefits"))
    
    # 4. Advantages Block
    advantages = extract_advantages(research)
    blocks.append({
        "blockName": "OverviewAndAdvantagesBlock",
        "config": {
            "title": f"Benefits of Our {service_name} Services",
            "advantages": advantages
        }
    })
    
    # 5. Video CTA
    blocks.append(create_video_cta_block())
    
    return blocks

def transform_services(input_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
    """Transform research services data to frontend format."""
    output_data = {
        "residential": [],
        "commercial": []
    }
    
    # Process residential services
    for service in input_data.get("residential", []):
        transformed_service = {
            "id": service["id"],
            "blocks": create_service_blocks(service)
        }
        output_data["residential"].append(transformed_service)
    
    # Process commercial services
    for service in input_data.get("commercial", []):
        transformed_service = {
            "id": service["id"],
            "blocks": create_service_blocks(service)
        }
        output_data["commercial"].append(transformed_service)
    
    return output_data

def main():
    """Main function to generate service pages."""
    # Load the research data
    raw_data_path = os.path.join("public", "data", "raw_data", "services.json")
    research_data = load_json_file(raw_data_path)
    
    if not research_data:
        print("No research data found. Please run research_services.py first.")
        return
    
    # Transform the data
    frontend_data = transform_services(research_data)
    
    # Save the frontend format
    output_path = os.path.join("public", "data", "scripts", "services.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(frontend_data, f, indent=2)
    
    print(f"Service pages generated and saved to {output_path}")

if __name__ == "__main__":
    main() 