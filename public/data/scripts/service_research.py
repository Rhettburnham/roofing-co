#!/usr/bin/env python3
import json
import os
import requests
import time
import sys
import dotenv
from typing import Dict, List, Any

# Load DeepSeek API Key from .env.deepseek file
dotenv.load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env.deepseek'))
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    print("Error: DeepSeek API key not found in .env.deepseek file.")
    sys.exit(1)

API_ENDPOINT = "https://api.deepseek.com/v1/chat/completions"

# Default services to use if BBB data is not available or has fewer than 3 services
DEFAULT_SERVICES = {
    "residential": [
        {"id": "r1", "name": "Roof Shingling"},
        {"id": "r2", "name": "Roof Repair"},
        {"id": "r3", "name": "Siding Installation"},
        {"id": "r4", "name": "Gutter Installation"}
    ],
    "commercial": [
        {"id": "c1", "name": "Metal Roofing"},
        {"id": "c2", "name": "Roof Coating"},
        {"id": "c3", "name": "Ventilation Systems"},
        {"id": "c4", "name": "Flat Roof Installation"}
    ]
}

# Ensure we always have these services as fallback options
MUST_HAVE_RESIDENTIAL = ["Roof Shingling", "Roof Repair", "Siding Installation"]
MUST_HAVE_COMMERCIAL = ["Metal Roofing", "Roof Coating", "Ventilation Systems"]

def get_bbb_services() -> Dict[str, List[Dict[str, str]]]:
    """Extract services from BBB profile data and ensure required services are included."""
    try:
        # Try to load BBB profile data
        with open("public/data/bbb_profile_data.json", "r") as f:
            bbb_data = json.load(f)
        
        if not bbb_data or "services" not in bbb_data:
            print("BBB data exists but doesn't contain services info. Using default services.")
            return DEFAULT_SERVICES
        
        # Extract services and categorize them
        services = bbb_data.get("services", [])
        
        # Filter and categorize services
        residential_services = []
        commercial_services = []
        
        # Keep track of which must-have services we've found
        found_residential = set()
        found_commercial = set()
        
        # Simple heuristic: if service mentions 'commercial', categorize as commercial
        for i, service in enumerate(services):
            service_name = service.strip()
            if not service_name:
                continue
                
            # Skip generic entries like "and more"
            if service_name.lower() in ["and more", "other", "etc", "etc."]:
                continue
                
            # Check if this is one of our must-have services
            service_lower = service_name.lower()
            is_commercial = "commercial" in service_lower
            
            # Check if it's one of our must-have services
            if any(must_have.lower() in service_lower for must_have in MUST_HAVE_RESIDENTIAL):
                for must_have in MUST_HAVE_RESIDENTIAL:
                    if must_have.lower() in service_lower:
                        found_residential.add(must_have)
                        # Use the exact must_have name for consistency
                        service_name = must_have
                        is_commercial = False
                        break
            
            if any(must_have.lower() in service_lower for must_have in MUST_HAVE_COMMERCIAL):
                for must_have in MUST_HAVE_COMMERCIAL:
                    if must_have.lower() in service_lower:
                        found_commercial.add(must_have)
                        # Use the exact must_have name for consistency
                        service_name = must_have
                        is_commercial = True
                        break
            
            service_id = f"c{len(commercial_services)+1}" if is_commercial else f"r{len(residential_services)+1}"
            service_entry = {"id": service_id, "name": service_name}
            
            if is_commercial:
                commercial_services.append(service_entry)
            else:
                residential_services.append(service_entry)
        
        # Add any missing must-have services
        for must_have in MUST_HAVE_RESIDENTIAL:
            if must_have not in found_residential:
                service_id = f"r{len(residential_services)+1}"
                residential_services.append({"id": service_id, "name": must_have})
        
        for must_have in MUST_HAVE_COMMERCIAL:
            if must_have not in found_commercial:
                service_id = f"c{len(commercial_services)+1}"
                commercial_services.append({"id": service_id, "name": must_have})
        
        # If either category has no services, use defaults instead
        if not residential_services:
            print("No residential services found in BBB data. Using defaults.")
            residential_services = DEFAULT_SERVICES["residential"]
        
        if not commercial_services:
            print("No commercial services found in BBB data. Using defaults.")
            commercial_services = DEFAULT_SERVICES["commercial"]
        
        # Ensure IDs are properly sequenced
        for i, service in enumerate(residential_services):
            service["id"] = f"r{i+1}"
        
        for i, service in enumerate(commercial_services):
            service["id"] = f"c{i+1}"

        print(f"Using {len(residential_services)} residential and {len(commercial_services)} commercial services")
        
        return {
            "residential": residential_services,
            "commercial": commercial_services
        }
        
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading BBB data: {e}. Using default services.")
        return DEFAULT_SERVICES

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
       - What maintenance is required?
       - What is the expected lifespan?
    
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

def research_service(service: Dict[str, str], category: str) -> Dict[str, Any]:
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
            "sales_supply": extract_section(research_results, "Sales and Supply Chain"),
            "advantages": extract_section(research_results, "Advantages and Benefits"),
            "marketing": extract_section(research_results, "Marketing Considerations"),
            "warranty_maintenance": extract_section(research_results, "Warranty and Maintenance")
        },
        "blocks": []  # This will be filled by the next script
    }
    
    return enriched_service

def extract_section(text: str, section_name: str) -> str:
    """Extract a section from the research results."""
    try:
        start = text.find(section_name)
        if start == -1:
            return "Section not found"
        
        # Find the next section
        next_sections = ["General Construction Process", "Product/Service Variants", 
                        "Sales and Supply Chain", "Advantages and Benefits", 
                        "Marketing Considerations", "Warranty and Maintenance"]
        
        # Remove the current section from the list
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

def main():
    """Main function to research all services and generate the JSON file."""
    # Get services from BBB data or use defaults
    services = get_bbb_services()
    
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
    
    # Save to JSON file
    with open("public/data/services_research.json", "w") as f:
        json.dump(all_services, f, indent=2)
    
    print("Research completed and saved to public/data/services_research.json")

if __name__ == "__main__":
    # Make sure output directory exists
    os.makedirs("public/data", exist_ok=True)
    main() 