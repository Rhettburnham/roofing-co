#!/usr/bin/env python3
import json
import os
import requests
import time
import dotenv
from typing import Dict, List, Any
from pathlib import Path

# Load the DeepSeek API key from .env.deepseek file
env_path = Path(__file__).parent.parent / ".env.deepseek"
dotenv.load_dotenv(env_path)

# Get API key from environment variable
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions"

if not DEEPSEEK_API_KEY:
    print("WARNING: DeepSeek API key not found. Please set it in the .env.deepseek file in the public/data directory.")
    print(f"Looking for .env.deepseek at: {env_path}")

# Define specific, well-defined services for both residential and commercial
# These will be used across the application for consistency
ROOFING_SERVICES = {
    "residential": [
        {"id": 1, "name": "Shingling"},
        {"id": 2, "name": "Metal Roofing"},
        {"id": 3, "name": "Chimney"},
        {"id": 4, "name": "Guttering"}
    ],
    "commercial": [
        {"id": 1, "name": "Built-up Roofing"},
        {"id": 2, "name": "TPO Membrane"},
        {"id": 3, "name": "Roof Coating"},
        {"id": 4, "name": "Metal Roofing"}
    ]
}

# Comprehensive list of simple roofing and home maintenance services
# Each service is two words or less
ROOFING_SERVICE_OPTIONS = {
    "residential": [
        "Asphalt Shingles",
        "Metal Roofing",
        "Slate Roofing",
        "Tile Roofing",
        "Wood Shakes",
        "Clay Tiles",
        "Roof Repair",
        "Roof Replacement",
        "Roof Inspection",
        "Gutter Installation",
        "Gutter Cleaning",
        "Gutter Guards",
        "Downspouts",
        "Fascia",
        "Soffit",
        "Chimney Repair",
        "Skylights",
        "Attic Ventilation",
        "Roof Ventilation",
        "Roof Insulation",
        "Waterproofing",
        "Leak Detection",
        "Storm Damage",
        "Roof Coating",
        "Roof Cleaning",
        "Moss Removal",
        "Ice Dams",
        "Roof Flashing",
        "Ridge Vents",
        "Siding",
        "Vinyl Siding",
        "Wood Siding",
        "Fiber Cement"
    ],
    "commercial": [
        "Flat Roofing",
        "BUR",
        "Built-up Roofing",
        "TPO Membrane",
        "EPDM Roofing",
        "PVC Roofing",
        "Modified Bitumen",
        "Roof Coating",
        "Roof Restoration",
        "Roof Maintenance",
        "Preventive Maintenance",
        "Roof Inspection",
        "Drainage Systems",
        "Roof Drains",
        "Tapered Insulation",
        "Roof Decking",
        "Metal Roofing",
        "Standing Seam",
        "Green Roofing",
        "Solar Panels",
        "Reflective Coating",
        "Elastomeric Coating",
        "Silicone Coating",
        "Acrylic Coating",
        "Thermal Scanning",
        "Moisture Testing",
        "Leak Detection",
        "Emergency Repairs",
        "Roof Ventilation",
        "Skylights",
        "Smoke Vents",
        "Sheet Metal",
        "Roof Consulting"
    ]
}

# Export these services to a shared JSON that other scripts can import
def export_services_list(services=None):
    """Export the defined services to a shared JSON file.
    
    Args:
        services: The services to export. If None, exports ROOFING_SERVICES.
    """
    services_to_export = services if services is not None else ROOFING_SERVICES
    
    # Save to the raw_data/step_2 directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    raw_data_dir = os.path.join(os.path.dirname(script_dir), "raw_data", "step_2")
    os.makedirs(raw_data_dir, exist_ok=True)
    
    services_path = os.path.join(raw_data_dir, "roofing_services.json")
    with open(services_path, 'w') as f:
        json.dump(services_to_export, f, indent=2)
    print(f"Exported services list to {services_path}")
    
    return services_path

def get_bbb_services() -> Dict[str, List[Dict[str, Any]]]:
    """Extract services from BBB profile data if available, otherwise use ROOFING_SERVICES."""
    try:
        # Fix the path to look in raw_data/step_1 for BBB profile data
        bbb_data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "raw_data", "step_1", "bbb_profile_data.json")
        
        print(f"Looking for BBB data at: {bbb_data_path}")
        
        # Try to load BBB profile data
        with open(bbb_data_path, "r") as f:
            bbb_data = json.load(f)
        
        if not bbb_data:
            print("BBB data exists but is empty. Using predefined services.")
            return ROOFING_SERVICES
        
        # Generate appropriate services using AI if DeepSeek key is available
        if DEEPSEEK_API_KEY:
            print("Using DeepSeek API to generate services based on BBB profile data...")
            generated_services = generate_services_from_bbb(bbb_data)
            if generated_services:
                return generated_services
            else:
                print("Failed to generate services with DeepSeek. Using predefined services.")
        else:
            print("DeepSeek API key not available. Using predefined services.")
            
        # If no services generated, use predefined ones
        return ROOFING_SERVICES
        
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading BBB data: {e}. Using predefined services.")
        return ROOFING_SERVICES

def generate_services_from_bbb(bbb_data: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
    """Generate specific, realistic services based on BBB profile data."""
    business_name = bbb_data.get('business_name', 'Roofing Company')
    additional_services = bbb_data.get('additional_services', [])
    service_hints = ', '.join(additional_services) if additional_services else "Roofing Services, Construction Services"
    
    print(f"Generating services for {business_name} based on: {service_hints}")
    
    # Convert the options to JSON string
    residential_options = json.dumps(ROOFING_SERVICE_OPTIONS["residential"])
    commercial_options = json.dumps(ROOFING_SERVICE_OPTIONS["commercial"])
    
    prompt = f"""
    You are a professional roofing consultant. Select 8 specific roofing services for a company named "{business_name}".
    
    Additional info about the company: {service_hints}
    
    Here are the available service options:
    
    RESIDENTIAL OPTIONS:
    {residential_options}
    
    COMMERCIAL OPTIONS:
    {commercial_options}
    
    Rules:
    1. Select 4 residential services from the residential options
    2. Select 4 commercial services from the commercial options
    3. Choose services that would be realistic for a company named "{business_name}"
    4. Consider the additional company info when making your selection: {service_hints}
    5. Include a mix of installation, repair, and maintenance services
    6. Choose services that are distinct from each other (not too similar)
    
    Return JSON only in this format with no additional text:
    {{
      "residential": [
        {{"id": 1, "name": "Service 1"}},
        {{"id": 2, "name": "Service 2"}},
        {{"id": 3, "name": "Service 3"}},
        {{"id": 4, "name": "Service 4"}}
      ],
      "commercial": [
        {{"id": 1, "name": "Service 1"}},
        {{"id": 2, "name": "Service 2"}},
        {{"id": 3, "name": "Service 3"}},
        {{"id": 4, "name": "Service 4"}}
      ]
    }}
    
    The service names must be exactly as they appear in the options lists above.
    """
    
    try:
        print("Calling DeepSeek API to select services from predefined options...")
        response = call_deepseek_api(prompt)
        
        # Extract JSON from response
        json_start = response.find('{')
        json_end = response.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = response[json_start:json_end]
            try:
                services = json.loads(json_str)
                
                # Validate the structure and service names
                if ('residential' in services and 'commercial' in services and
                        len(services['residential']) == 4 and len(services['commercial']) == 4):
                    
                    # Verify all selected residential services are in the options list
                    for service in services['residential']:
                        if service['name'] not in ROOFING_SERVICE_OPTIONS['residential']:
                            print(f"Warning: '{service['name']}' is not in the predefined residential options. Replacing with a valid option.")
                            service['name'] = ROOFING_SERVICE_OPTIONS['residential'][service['id'] - 1]
                    
                    # Verify all selected commercial services are in the options list
                    for service in services['commercial']:
                        if service['name'] not in ROOFING_SERVICE_OPTIONS['commercial']:
                            print(f"Warning: '{service['name']}' is not in the predefined commercial options. Replacing with a valid option.")
                            service['name'] = ROOFING_SERVICE_OPTIONS['commercial'][service['id'] - 1]
                    
                    print("Successfully selected services from predefined options:")
                    for category, service_list in services.items():
                        print(f"\n{category.upper()} SERVICES:")
                        for service in service_list:
                            print(f"  - {service['name']}")
                    return services
                else:
                    print("Generated services have incorrect structure.")
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON from DeepSeek API response: {e}")
        else:
            print("Could not find valid JSON in DeepSeek API response.")
        
        print("Failed to generate services with DeepSeek. Using predefined services.")
        return ROOFING_SERVICES
    except Exception as e:
        print(f"Error generating services: {e}. Using predefined services.")
        return ROOFING_SERVICES

def generate_research_prompt(service_name: str, service_type: str) -> str:
    """Generate a comprehensive research prompt for DeepSeek about a roofing service."""
    return f"""
    Research the following roofing service thoroughly: {service_name} ({service_type})
    
    I need detailed information from the perspective of a professional roofing contractor. Please address these topics:
    
    1. General Construction Process:
       - Detailed step-by-step process for installing/implementing this service
       - Materials required and their specifications
       - Safety considerations and building code requirements
       - Timeline estimates for completion
    
    2. Product/Service Variants:
       - What are the different types/styles/materials available for this service?
       - How do these variants differ in terms of durability, appearance, and cost?
       - What are the premium vs. budget options?
    
    3. Repair and Maintenance:
       - What are common issues that require repair for this type of roof/service?
       - What regular maintenance is required to maximize lifespan?
       - How often should maintenance be performed?
       - What are the signs that repair or replacement is needed?
    
    4. Sales and Supply Chain:
       - How do roofers typically procure materials for this service?
       - Do they usually have inventory or order per project?
       - What's the typical markup or profit margin for this service?
       - How are these services typically quoted or estimated?
    
    5. Advantages and Benefits:
       - What are the main selling points for this service?
       - How does it compare to alternative solutions?
       - What long-term benefits should be highlighted to customers?
       - Any energy efficiency or insurance benefits?
    
    6. Marketing Considerations:
       - What aspects of this service do roofers typically emphasize in marketing?
       - What visuals or demonstrations are most effective in selling this service?
       - Do roofers typically show pricing publicly for this service? Why or why not?
       - What customer concerns or questions typically arise?
    
    7. Warranty and Lifespan:
       - What warranties are typically offered?
       - What is the expected lifespan of this roof/service?
       - What factors can extend or reduce the lifespan?
       - How do warranties compare to industry standards?
    
    Format your response as detailed paragraphs under each section heading. Provide comprehensive information a roofing website could use to create authoritative service pages.
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

def extract_section(text: str, section_name: str) -> str:
    """Extract a section from the research results."""
    try:
        start = text.find(section_name)
        if start == -1:
            return "Section not found"
        
        # Find the next section
        next_sections = ["General Construction Process", "Product/Service Variants", 
                         "Repair and Maintenance", "Sales and Supply Chain", 
                         "Advantages and Benefits", "Marketing Considerations", 
                         "Warranty and Lifespan"]
        
        # Remove the current section from the list
        if section_name in next_sections:
            next_sections.remove(section_name)
        
        # Find the next section after the current one
        end = len(text)
        for next_section in next_sections:
            pos = text.find(next_section, start + len(section_name))
            if pos != -1 and pos < end:
                end = pos
        
        # Extract the content between start and end
        content = text[start + len(section_name):end].strip()
        
        # Clean up any bullet points or numbering
        content = content.replace("- ", "")
        
        return content
    except Exception as e:
        print(f"Error extracting section {section_name}: {e}")
        return "Error extracting section"

def research_service(service: Dict[str, Any], category: str) -> Dict[str, Any]:
    """Research a service and return structured data."""
    print(f"Researching {service['name']} ({category})...")
    
    # Call DeepSeek API
    research_prompt = generate_research_prompt(service['name'], category)
    research_results = call_deepseek_api(research_prompt)
    
    # Structure the results
    enriched_service = {
        "id": service['id'],
        "name": service['name'],
        "category": category,
        "research": {
            "construction_process": extract_section(research_results, "General Construction Process"),
            "variants": extract_section(research_results, "Product/Service Variants"),
            "repair_maintenance": extract_section(research_results, "Repair and Maintenance"),
            "sales_supply": extract_section(research_results, "Sales and Supply Chain"),
            "advantages": extract_section(research_results, "Advantages and Benefits"),
            "marketing": extract_section(research_results, "Marketing Considerations"),
            "warranty_lifespan": extract_section(research_results, "Warranty and Lifespan")
        },
        "blocks": create_default_blocks(service['name'], category)
    }
    
    # Generate a slug for the service
    enriched_service["slug"] = f"{category}-{service['name'].lower().replace(' ', '-')}"
    
    return enriched_service

def create_default_blocks(service_name: str, category: str) -> List[Dict[str, Any]]:
    """Create default blocks structure similar to the original services.json"""
    # This is a placeholder function to create a basic blocks structure
    # You would customize this based on the specific service and category
    
    blocks = [
        {
            "blockName": "HeroBlock",
            "config": {
                "title": f"{service_name}",
                "subtitle": f"Expert {service_name.lower()} services for your {category} property",
                "backgroundOpacity": 0.6,
                "buttonText": "Get a Free Quote",
                "buttonUrl": "#contact"
            },
            "searchTerms": f"{category} {service_name.lower()}",
            "imagePath": f"/assets/images/services/{category.lower()}/hero.jpg"
        }
    ]
    
    return blocks

def main():
    """Main function to research all services and generate the JSON file."""
    # Make sure output directory exists
    script_dir = os.path.dirname(os.path.abspath(__file__))
    raw_data_dir = os.path.join(os.path.dirname(script_dir), "raw_data", "step_2")
    os.makedirs(raw_data_dir, exist_ok=True)
    
    # Get services from BBB data or use defaults
    services = get_bbb_services()
    
    # Export the basic services list to raw_data/step_2
    export_services_list(services)
    
    # Copy the services to the root data directory for tailwind.config.js
    try:
        import copy_for_tailwind
        copy_for_tailwind.copy_services_for_tailwind()
    except Exception as e:
        print(f"Warning: Failed to copy services for tailwind: {e}")
    
    print(f"Processing {len(services['residential'])} residential services and {len(services['commercial'])} commercial services")
    
    all_services = {
        "residential": [],
        "commercial": []
    }
    
    # Research residential services
    for service in services["residential"]:
        enriched_service = research_service(service, "residential")
        all_services["residential"].append(enriched_service)
        time.sleep(2)  # Avoid rate limiting
    
    # Research commercial services
    for service in services["commercial"]:
        enriched_service = research_service(service, "commercial")
        all_services["commercial"].append(enriched_service)
        time.sleep(2)  # Avoid rate limiting
    
    # Save detailed services to JSON file in raw_data/step_2 directory
    services_json_path = os.path.join(raw_data_dir, "roofing_services_detailed.json")
    with open(services_json_path, "w") as f:
        json.dump(all_services, f, indent=2)
    
    print(f"Research completed and saved to {services_json_path}")
    print(f"Basic services list was saved to {os.path.join(raw_data_dir, 'roofing_services.json')}")

if __name__ == "__main__":
    main()