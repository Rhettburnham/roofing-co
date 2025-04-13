#!/usr/bin/env python3
import json
import os
import re
import random
import requests
import time
import dotenv
from pathlib import Path
from typing import Dict, List, Any

# Load the DeepSeek API key from .env.deepseek file
env_path = Path(__file__).parent.parent / ".env.deepseek"
dotenv.load_dotenv(env_path)

# Get API key from environment variable
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions"

if not DEEPSEEK_API_KEY:
    print("WARNING: DeepSeek API key not found. Please set it in the .env.deepseek file in the public/data directory.")
    print(f"Looking for .env.deepseek at: {env_path}")

# These are shorter service options matching the combined_data.json format
# Services are 1-3 words max as required
ROOFING_SERVICE_OPTIONS = {
    "residential": [
        "Shingling",
        "Guttering",
        "Chimney",
        "Skylights",
        "Siding",
        "Ventilation",
        "Insulation",
        "Waterproofing",
        "Repairs",
        "Inspection",
        "Metal Roof",
        "Ridge Vents",
        "Attic Fans",
        "Fascia",
        "Flashing",
        "Soffits"
    ],
    "commercial": [
        "Coatings",
        "Built-Up",
        "Metal Roof",
        "Drainage",
        "TPO Systems",
        "EPDM",
        "PVC Membrane",
        "Modified Bitumen",
        "Restoration",
        "Maintenance",
        "Flat Roof",
        "Roof Deck",
        "Green Roof",
        "Solar Panels",
        "Sheet Metal",
        "Ventilation"
    ]
}

# Default services from combined_data.json to use as fallbacks
DEFAULT_SERVICES = {
    "residential": [
        {"id": 1, "name": "Shingling"},
        {"id": 2, "name": "Guttering"},
        {"id": 3, "name": "Chimney"},
        {"id": 4, "name": "Skylights"}
    ],
    "commercial": [
        {"id": 1, "name": "Coatings"},
        {"id": 2, "name": "Built-Up"},
        {"id": 3, "name": "Metal Roof"},
        {"id": 4, "name": "Drainage"}
    ]
}

def export_services_list(services=None):
    """Export the defined services to a shared JSON file.
    
    Args:
        services: The services to export. If None, exports ROOFING_SERVICES.
    """
    services_to_export = services if services is not None else {}
    
    # Save to the raw_data/step_2 directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    raw_data_dir = os.path.join(os.path.dirname(script_dir), "raw_data", "step_2")
    os.makedirs(raw_data_dir, exist_ok=True)
    
    services_path = os.path.join(raw_data_dir, "roofing_services.json")
    with open(services_path, 'w') as f:
        json.dump(services_to_export, f, indent=2)
    print(f"Exported services list to {services_path}")
    
    return services_path

def load_combined_data():
    """Attempt to load combined_data.json to extract current services."""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.dirname(script_dir)
        
        # Try the step_4 directory first
        combined_data_path = os.path.join(data_dir, "raw_data", "step_4", "combined_data.json")
        if not os.path.exists(combined_data_path):
            # Fallback to root data directory
            combined_data_path = os.path.join(data_dir, "combined_data.json")
        
        if os.path.exists(combined_data_path):
            with open(combined_data_path, 'r') as f:
                data = json.load(f)
                
            # Extract services
            residential_services = []
            commercial_services = []
            
            # Extract from hero section if it exists
            if 'hero' in data:
                if 'residential' in data['hero'] and 'subServices' in data['hero']['residential']:
                    residential_services = [
                        {"id": i+1, "name": service.get('title', f"Service {i+1}")}
                        for i, service in enumerate(data['hero']['residential']['subServices'])
                    ]
                
                if 'commercial' in data['hero'] and 'subServices' in data['hero']['commercial']:
                    commercial_services = [
                        {"id": i+1, "name": service.get('title', f"Service {i+1}")}
                        for i, service in enumerate(data['hero']['commercial']['subServices'])
                    ]
            
            # If we got any services, return them
            if residential_services and commercial_services:
                return {
                    "residential": residential_services,
                    "commercial": commercial_services
                }
    except Exception as e:
        print(f"Error loading combined data: {e}")
    
    # Return default services if loading fails
    return DEFAULT_SERVICES

def get_bbb_services() -> Dict[str, List[Dict[str, Any]]]:
    """Extract services from BBB profile data if available, otherwise use fallbacks."""
    try:
        # Try to load the combined_data.json first to get current services
        current_services = load_combined_data()
        
        # Fix the path to look in raw_data/step_1 for BBB profile data
        bbb_data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "raw_data", "bbb_profile_data.json")
        
        print(f"Looking for BBB data at: {bbb_data_path}")
        
        # Try to load BBB profile data
        with open(bbb_data_path, "r") as f:
            bbb_data = json.load(f)
        
        if not bbb_data:
            print("BBB data exists but is empty. Using current services.")
            return current_services
        
        # Generate appropriate services using AI if DeepSeek key is available
        if DEEPSEEK_API_KEY:
            print("Using DeepSeek API to generate services based on BBB profile data...")
            generated_services = generate_services_from_bbb(bbb_data, current_services)
            if generated_services:
                return generated_services
            else:
                print("Failed to generate services with DeepSeek. Using current services.")
        else:
            print("DeepSeek API key not available. Using current services.")
            
        # If no services generated, use current ones
        return current_services
        
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading BBB data: {e}. Using current services.")
        return load_combined_data()

def generate_services_from_bbb(bbb_data: Dict[str, Any], current_services: Dict[str, List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
    """Generate specific, realistic services based on BBB profile data."""
    business_name = bbb_data.get('business_name', 'Roofing Company')
    additional_services = bbb_data.get('additional_services', [])
    service_hints = ', '.join(additional_services) if additional_services else "Roofing Services, Construction Services"
    
    print(f"Generating services for {business_name} based on: {service_hints}")
    
    # Format the current services for reference in the prompt
    current_residential = ", ".join([s["name"] for s in current_services["residential"]])
    current_commercial = ", ".join([s["name"] for s in current_services["commercial"]])
    
    # Convert the options to JSON string
    residential_options = json.dumps(ROOFING_SERVICE_OPTIONS["residential"])
    commercial_options = json.dumps(ROOFING_SERVICE_OPTIONS["commercial"])
    
    prompt = f"""
    You are a professional roofing consultant. Select 8 specific roofing services for a company named "{business_name}".
    
    Additional info about the company: {service_hints}
    
    Current residential services: {current_residential}
    Current commercial services: {current_commercial}
    
    Here are the available service options:
    
    RESIDENTIAL OPTIONS:
    {residential_options}
    
    COMMERCIAL OPTIONS:
    {commercial_options}
    
    Rules:
    1. Select 4 residential services from the residential options
    2. Select 4 commercial services from the commercial options
    3. Try to keep the current services if they make sense for this company
    4. All service names must be 1-3 words maximum
    5. Choose services that would be realistic for a company named "{business_name}"
    6. Consider the additional company info when making your selection: {service_hints}
    
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
    
    The service names must be exactly as they appear in the options lists above or match the current services.
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
                
                # Validate the structure 
                if ('residential' in services and 'commercial' in services and
                        len(services['residential']) == 4 and len(services['commercial']) == 4):
                    
                    # Verify all selected residential services are in the options list or current services
                    valid_residential = ROOFING_SERVICE_OPTIONS['residential'] + [s["name"] for s in current_services["residential"]]
                    valid_commercial = ROOFING_SERVICE_OPTIONS['commercial'] + [s["name"] for s in current_services["commercial"]]
                    
                    for service in services['residential']:
                        if service['name'] not in valid_residential:
                            print(f"Warning: '{service['name']}' is not in the valid residential options. Replacing with a current service.")
                            service['name'] = current_services["residential"][service['id'] - 1]["name"]
                    
                    # Verify all selected commercial services are in the options list
                    for service in services['commercial']:
                        if service['name'] not in valid_commercial:
                            print(f"Warning: '{service['name']}' is not in the valid commercial options. Replacing with a current service.")
                            service['name'] = current_services["commercial"][service['id'] - 1]["name"]
                    
                    print("Successfully selected services:")
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
        
        print("Failed to generate services with DeepSeek. Using current services.")
        return current_services
    except Exception as e:
        print(f"Error generating services: {e}. Using current services.")
        return current_services

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

def generate_research_prompt(service_name: str, service_type: str) -> str:
    """Generate a comprehensive research prompt for DeepSeek about a roofing service."""
    return f"""
    Research the following roofing service thoroughly: {service_name} ({service_type})
    
    I need detailed information from the perspective of a professional roofing contractor. Please address these topics:
    
    1. Construction Process:
       - Detailed step-by-step process for installing/implementing this service
       - Materials required and their specifications
       - Safety considerations and building code requirements
       - Timeline estimates for completion
    
    2. Variants:
       - What are the different types/styles/materials available for this service?
       - How do these variants differ in terms of durability, appearance, and cost?
       - What are the premium vs. budget options?
    
    3. Sales and Supply Chain:
       - How do roofers typically procure materials for this service?
       - Do they usually have inventory or order per project?
       - What's the typical markup or profit margin for this service?
       - How are these services typically quoted or estimated?
    
    4. Advantages and Benefits:
       - What are the main selling points for this service?
       - How does it compare to alternative solutions?
       - What long-term benefits should be highlighted to customers?
       - Any energy efficiency or insurance benefits?
    
    5. Marketing Considerations:
       - What aspects of this service do roofers typically emphasize in marketing?
       - What visuals or demonstrations are most effective in selling this service?
       - Do roofers typically show pricing publicly for this service? Why or why not?
       - What customer concerns or questions typically arise?
    
    6. Warranty and Maintenance:
       - What warranties are typically offered?
       - What maintenance requirements exist for this service?
       - What is the expected lifespan of this roof/service?
       - What factors can extend or reduce the lifespan?
    
    Format your response with section markers like this:
    
    ## **1. Construction Process**
    [Your detailed content here]
    
    ## **2. Variants**
    [Your detailed content here]
    
    And so on for each section. Provide comprehensive information a roofing website could use to create authoritative service pages.
    """

def extract_section(text: str, section_name: str) -> str:
    """Extract a section from the research results."""
    try:
        section_markers = {
            "construction_process": ["## **1. Construction Process**", "## **2"],
            "variants": ["## **2. Variants**", "## **3"],
            "sales_supply": ["## **3. Sales and Supply Chain**", "## **4"],
            "advantages": ["## **4. Advantages and Benefits**", "## **5"],
            "marketing": ["## **5. Marketing Considerations**", "## **6"],
            "warranty_maintenance": ["## **6. Warranty and Maintenance**", "##"]
        }
        
        markers = section_markers.get(section_name)
        if not markers:
            return "Section not found"
        
        start_marker, end_marker = markers
        
        start = text.find(start_marker)
        if start == -1:
            return f"**  \n\nSection placeholder for {section_name}"
        
        start += len(start_marker)
        
        end = text.find(end_marker, start)
        if end == -1:
            end = len(text)
        
        content = text[start:end].strip()
        return f"**  \n\n{content}"
    except Exception as e:
        print(f"Error extracting section {section_name}: {e}")
        return f"**  \n\nError extracting {section_name}"

def create_slug(category, service_id, service_name):
    """Create a proper slug for service URLs that works with App.jsx routes."""
    # Clean service name: lowercase, replace spaces with dashes
    cleaned_name = service_name.lower().replace(' ', '-')
    # Format: residential-r1-service-name or commercial-c1-service-name
    prefix = 'r' if category == 'residential' else 'c'
    return f"{category}-{prefix}{service_id}-{cleaned_name}"

def research_service(service: Dict[str, Any], category: str) -> Dict[str, Any]:
    """Research a service and return structured research data using DeepSeek."""
    print(f"Researching {service['name']} ({category})...")
    
    if not DEEPSEEK_API_KEY:
        print("No DeepSeek API key found, using placeholder research data")
        return create_placeholder_research(service['name'])
    
    # Generate the research prompt
    research_prompt = generate_research_prompt(service['name'], category)
    
    try:
        # Call DeepSeek API
        research_results = call_deepseek_api(research_prompt)
        
        # Extract each section from the research results
        research_data = {
            "construction_process": extract_section(research_results, "construction_process"),
            "variants": extract_section(research_results, "variants"),
            "sales_supply": extract_section(research_results, "sales_supply"),
            "advantages": extract_section(research_results, "advantages"),
            "marketing": extract_section(research_results, "marketing"),
            "warranty_maintenance": extract_section(research_results, "warranty_maintenance")
        }
        
        # Sleep to avoid rate limits
        time.sleep(2)
        
        return research_data
    except Exception as e:
        print(f"Error researching service {service['name']}: {e}")
        return create_placeholder_research(service['name'])

def create_placeholder_research(service_name):
    """Create placeholder research data when DeepSeek is not available"""
    return {
        "construction_process": f"**  \n\n### **Step-by-Step {service_name} Process**  \n1. **Initial Assessment** – Professional inspection and planning.  \n2. **Material Selection** – High-quality materials suited to your property.  \n3. **Preparation** – Proper preparation of the work area.  \n4. **Installation** – Expert application by trained technicians.  \n5. **Cleanup & Inspection** – Thorough site cleanup and final quality check.\n\n### **Materials & Specifications**  \nIndustry-leading materials with manufacturer warranties.\n\n### **Timeline Estimates**  \nTypical projects completed in 1-3 days depending on scope.",
        "variants": f"**  \n\n### **Types of {service_name} Options**  \n**Standard:** Cost-effective solution for most properties.  \n**Premium:** Enhanced durability and appearance.  \n**Deluxe:** Maximum protection and aesthetic appeal.\n\n### **Durability & Cost Comparison**  \n| Type | Durability | Cost (per sq. ft.) |  \n|------|------------|-------------------|  \n| Standard | 15-20 years | $8-$12 |  \n| Premium | 25-30 years | $12-$18 |  \n| Deluxe | 30+ years | $18-$25 |",
        "sales_supply": f"**  \n\n### **Material Procurement**  \nContractors typically order materials per project from suppliers or distributors.  \n\n### **Pricing & Profit Margins**  \nTypical markup: 30-50% for materials, 50-100% for labor.  \n\n### **Quoting Process**  \nBased on square footage, material quality, and labor complexity.",
        "advantages": f"**  \n\n### **Key Benefits**  \n**Protection:** Shields your property from weather damage.  \n**Energy Efficiency:** Properly installed systems can reduce energy costs.  \n**Property Value:** Enhances curb appeal and resale value.  \n**Durability:** Long-lasting performance with minimal maintenance.",
        "marketing": f"**  \n\n### **Effective Marketing Strategies**  \n**Visual Content:** Before/after photos and project videos.  \n**Customer Testimonials:** Highlighting successful installations.  \n\n### **Common Customer Questions**  \n\"How long will it last?\"  \n\"What maintenance is required?\"",
        "warranty_maintenance": f"**  \n\n### **Warranty Coverage**  \n**Materials:** Manufacturer warranties on all products.  \n**Workmanship:** Our labor warranty covers installation quality.\n\n### **Maintenance Requirements**  \nAnnual inspections recommended for optimal performance.\n\n### **Lifespan**  \nWith proper care, 20+ years of reliable service."
    }

def load_research_data():
    """Load the research data from services_research.json"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    research_path = os.path.join(script_dir, "..", "step_2", "services_research.json")
    
    with open(research_path, 'r') as f:
        return json.load(f)

def create_block(block_name: str, config: dict, search_terms: str = "", image_path: str = None) -> dict:
    """Create a standardized block structure matching ServicePage.jsx requirements"""
    block = {
        "blockName": block_name,
        "config": config,
        "searchTerms": search_terms
    }
    if image_path:
        block["imagePath"] = image_path
    return block

def generate_service_blocks(service: dict, category: str) -> List[dict]:
    """Generate blocks for a service using available block components"""
    blocks = []
    service_id = service['id']
    service_name = service['name']
    
    # 1. HeroBlock - Main service banner
    blocks.append(create_block(
        "HeroBlock",
        {
            "title": f"{service_name}",
            "subtitle": f"Professional {category.capitalize()} Roofing Services",
            "backgroundOpacity": 0.6,
            "buttonText": "Get Free Quote",
            "buttonUrl": "/contact"
        },
        f"{service_name} hero banner",
        f"/assets/images/services/{category}/{service_id}/hero.jpg"
    ))

    # 2. HeaderBannerBlock - Service Overview
    blocks.append(create_block(
        "HeaderBannerBlock",
        {
            "title": "Professional Service",
            "subtitle": f"Expert {service_name} Solutions for Your Property"
        },
        f"{service_name} overview"
    ))

    # 3. GeneralList - Installation Steps
    installation_steps = [step.strip() for step in service['installation'].split('\n') if step.strip()]
    blocks.append(create_block(
        "GeneralList",
        {
            "title": "Installation Process",
            "items": installation_steps[:5],
            "listStyle": "numbered"
        },
        f"{service_name} installation steps"
    ))

    # 4. ListDropdown - Maintenance Information
    maintenance_items = [item.strip() for item in service['maintenance'].split('\n') if item.strip()]
    blocks.append(create_block(
        "ListDropdown",
        {
            "title": "Maintenance Guide",
            "items": [
                {"title": f"Maintenance Step {i+1}", "content": item}
                for i, item in enumerate(maintenance_items[:4])
            ]
        },
        f"{service_name} maintenance"
    ))

    # 5. GridImageTextBlock - Repair Services
    repair_points = [point.strip() for point in service['repair'].split('\n') if point.strip()]
    blocks.append(create_block(
        "GridImageTextBlock",
        {
            "title": "Repair Services",
            "items": [
                {
                    "title": "Professional Repairs",
                    "content": "\n".join(repair_points[:3]),
                    "imagePath": f"/assets/images/services/{category}/{service_id}/repairs.jpg"
                }
            ]
        },
        f"{service_name} repairs"
    ))

    # 6. PricingGrid - Service Variants
    variants = [var.strip() for var in service['variants'].split('\n') if var.strip()]
    blocks.append(create_block(
        "PricingGrid",
        {
            "title": "Service Options",
            "subtitle": "Choose the Right Solution for Your Needs",
            "items": [
                {
                    "title": variant,
                    "price": "Contact for Quote",
                    "features": ["Professional Installation", "Quality Materials", "Expert Service"]
                }
                for variant in variants[:3]
            ]
        },
        f"{service_name} pricing"
    ))

    # 7. ActionButtonBlock - Call to Action
    blocks.append(create_block(
        "ActionButtonBlock",
        {
            "title": "Ready to Get Started?",
            "subtitle": "Contact us for a free consultation",
            "buttonText": "Schedule Now",
            "buttonUrl": "/contact"
        },
        f"{service_name} cta"
    ))

    return blocks

def main():
    """Generate services.json for ServicePage.jsx using research data"""
    print("Starting service JSON generation...")
    
    try:
        # Load research data
        research_data = load_research_data()
        
        # Transform into services with blocks
        output_services = {
            "residential": [],
            "commercial": []
        }
        
        for category in ['residential', 'commercial']:
            print(f"\nProcessing {category} services:")
            for service in research_data[category]:
                print(f"  - Generating blocks for {service['name']}")
                
                # Create service entry with blocks
                service_entry = {
                    "id": service["id"],
                    "name": service["name"],
                    "category": category,
                    "slug": f"{category}-{service['id']}-{service['name'].lower().replace(' ', '-')}",
                    "blocks": generate_service_blocks(service, category)
                }
                
                output_services[category].append(service_entry)
        
        # Save to services.json
        output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                  "raw_data", "step_4", "services.json")
        
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_services, f, indent=2)
        
        print(f"\nSuccessfully generated services.json at {output_path}")
        
    except Exception as e:
        print(f"Error generating services.json: {e}")
        raise

if __name__ == "__main__":
    main()
