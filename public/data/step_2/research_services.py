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


def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text.strip())
    return text


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


def create_block(block_name, config, search_terms="", image_path=None):
    """Create a properly structured block for a service page"""
    block = {
        "blockName": block_name,
        "config": config,
        "searchTerms": search_terms
    }
    
    if image_path:
        block["imagePath"] = image_path
        
    return block


def generate_hero_block(service_name, category, service_id):
    """Generate a HeroBlock configuration"""
    prefix = "r" if category == "residential" else "c"
    return create_block(
        "HeroBlock",
        {
            "title": f"{category.capitalize()} {service_name}",
            "subtitle": f"Expert {service_name.lower()} services for your property",
            "backgroundOpacity": 0.6,
            "buttonText": "Get a Free Estimate",
            "buttonUrl": "#contact"
        },
        f"{service_name.lower()} {category}",
        f"/assets/images/services/{category}/{prefix}{service_id}/block_1.jpg"
    )


def generate_header_banner_block(title, subtitle, service_id, category, block_num):
    """Generate a HeaderBannerBlock configuration"""
    prefix = "r" if category == "residential" else "c"
    return create_block(
        "HeaderBannerBlock",
        {
            "title": title,
            "subtitle": subtitle
        },
        f"{title.lower()}",
        f"/assets/images/services/{category}/{prefix}{service_id}/block_{block_num}.jpg"
    )


def generate_general_list(title, items, service_id, category, block_num):
    """Generate a GeneralList block"""
    prefix = "r" if category == "residential" else "c"
    return create_block(
        "GeneralList",
        {
            "title": title,
            "items": items
        },
        f"{title.lower()} steps process",
        f"/assets/images/services/{category}/{prefix}{service_id}/block_{block_num}.jpg"
    )


def generate_overview_advantages(title, items, service_id, category, block_num):
    """Generate an OverviewAndAdvantagesBlock"""
    prefix = "r" if category == "residential" else "c"
    return create_block(
        "OverviewAndAdvantagesBlock",
        {
            "title": title,
            "advantages": items if isinstance(items[0], str) else [item["title"] for item in items],
            "items": items if not isinstance(items[0], str) else [{"title": item, "description": ""} for item in items]
        },
        f"{title.lower()} benefits advantages",
        f"/assets/images/services/{category}/{prefix}{service_id}/block_{block_num}.jpg"
    )


def extract_construction_steps(construction_text):
    """Extract steps from construction process text"""
    steps = []
    if "**Step-by-Step" in construction_text or "**Installation Process" in construction_text:
        # Try to extract steps by finding numbers followed by text
        step_matches = re.findall(r'\d+\.\s\*\*([^*]+)\*\*\s[–\-]\s([^\n\.]+)', construction_text)
        if step_matches:
            for step_title, step_desc in step_matches:
                steps.append(f"{step_title.strip()} – {step_desc.strip()}")
        
        # Fallback: look for lines with numbers at the beginning
        if not steps:
            step_matches = re.findall(r'\d+\.\s+\*\*([^*]+)\*\*([^\n\.]+)', construction_text)
            if step_matches:
                for step_title, step_desc in step_matches:
                    steps.append(f"{step_title.strip()} {step_desc.strip()}")
    
    # If we couldn't extract structured steps, create some generic ones
    if not steps:
        steps = [
            "Initial Assessment – Professional inspection and planning",
            "Material Selection – High-quality materials suited to your property",
            "Preparation – Proper preparation of the work area",
            "Installation – Expert application by trained technicians",
            "Cleanup & Inspection – Thorough site cleanup and final quality check"
        ]
    
    return steps


def extract_advantages(advantages_text):
    """Extract advantages from advantages text"""
    advantages = []
    if "**Key" in advantages_text or "**Selling" in advantages_text:
        # Try to find advantages with bullet points
        adv_matches = re.findall(r'\*\*([^:*]+):\*\*\s([^\n\.]+)', advantages_text)
        if adv_matches:
            for adv_title, adv_desc in adv_matches:
                advantages.append({
                    "title": adv_title.strip(),
                    "description": adv_desc.strip()
                })
    
    # If no structured advantages found, create some based on the text
    if not advantages:
        # Look for any phrases that might be advantages
        potential_advantages = re.findall(r'\*\*([^*\n]+)\*\*', advantages_text)
        for i, adv in enumerate(potential_advantages[:4]):
            advantages.append({
                "title": adv.strip(),
                "description": f"Professional {adv.lower()} for optimal performance and durability."
            })
    
    # If still no advantages, use generic ones
    if not advantages:
        advantages = [
            {"title": "Long-lasting Protection", "description": "Our services provide durable protection against the elements."},
            {"title": "Energy Efficiency", "description": "Properly installed systems can reduce energy costs."},
            {"title": "Enhanced Property Value", "description": "Quality workmanship improves curb appeal and value."},
            {"title": "Peace of Mind", "description": "Professional installation backed by comprehensive warranties."}
        ]
    
    return advantages


def extract_variants(variants_text):
    """Extract different product/service variants from the text"""
    variants = []
    
    # Try to find tables with options
    table_match = re.search(r'\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|', variants_text)
    if table_match:
        # Try to extract table rows
        rows = re.findall(r'\|\s*\*\*([^*|]+)\*\*\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|', variants_text)
        if rows:
            for name, durability, cost in rows:
                variants.append({
                    "title": name.strip(),
                    "description": f"Durability: {durability.strip()}",
                    "price": cost.strip()
                })
    
    # If no table found, try to extract product types
    if not variants:
        type_sections = re.findall(r'\*\*([^*:]+):\*\*\s+([^\n]+)', variants_text)
        for type_name, type_desc in type_sections:
            if "budget" not in type_name.lower() and "premium" not in type_name.lower():
                variants.append({
                    "title": type_name.strip(),
                    "description": type_desc.strip(),
                    "price": f"${random.randint(5, 15)}/sq. ft."
                })
    
    # If still no variants, create generic ones
    if not variants:
        variants = [
            {"title": "Standard Option", "description": "Good quality, budget-friendly solution", "price": "$8-$12/sq. ft."},
            {"title": "Premium Option", "description": "Enhanced durability and appearance", "price": "$12-$18/sq. ft."},
            {"title": "Professional Grade", "description": "Maximum protection and aesthetic appeal", "price": "$18-$25/sq. ft."}
        ]
    
    return variants


def research_service(service: Dict[str, Any], category: str) -> Dict[str, Any]:
    """Research a specific service using DeepSeek API."""
    print(f"Researching {service['name']} ({category})...")
    
    research_prompt = f"""
    As a roofing expert, provide detailed information about {service['name']} for {category} buildings.
    Focus on these four specific aspects:

    1. Installation Process:
    - Step by step installation process
    - Required materials and tools
    - Safety considerations
    - Typical timeline

    2. Repair Procedures:
    - Common repair scenarios
    - Repair techniques
    - Required tools and materials
    - Emergency repair procedures

    3. Maintenance Requirements:
    - Regular maintenance schedule
    - Preventive maintenance steps
    - Inspection checklist
    - Common maintenance issues

    4. Available Variants:
    - Different material options
    - Style variations
    - Price ranges
    - Pros and cons of each variant

    Format your response as four distinct sections with clear headings:
    INSTALLATION:
    [Installation details]

    REPAIR:
    [Repair details]

    MAINTENANCE:
    [Maintenance details]

    VARIANTS:
    [Variants details]
    """
    
    try:
        response = call_deepseek_api(research_prompt)
        
        # Extract each section
        sections = {
            "installation": "",
            "repair": "",
            "maintenance": "",
            "variants": ""
        }
        
        for section in sections.keys():
            section_start = response.find(f"{section.upper()}:")
            if section_start != -1:
                next_section = float('inf')
                for other_section in sections.keys():
                    if other_section != section:
                        pos = response.find(f"{other_section.upper()}:", section_start + 1)
                        if pos != -1 and pos < next_section:
                            next_section = pos
                
                if next_section == float('inf'):
                    sections[section] = response[section_start:].strip()
                else:
                    sections[section] = response[section_start:next_section].strip()
                
                # Remove the section header
                sections[section] = sections[section].replace(f"{section.upper()}:", "").strip()
        
        return sections
        
    except Exception as e:
        print(f"Error researching {service['name']}: {e}")
        return {
            "installation": f"Default installation process for {service['name']}",
            "repair": f"Standard repair procedures for {service['name']}",
            "maintenance": f"Regular maintenance requirements for {service['name']}",
            "variants": f"Available variants of {service['name']}"
        }


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


def get_bbb_services() -> Dict[str, List[Dict[str, Any]]]:
    """Get services from BBB profile data or use defaults."""
    # Default services to use if no BBB data is found
    default_services = {
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
    
    try:
        # Try to load BBB profile data
        bbb_data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                    "raw_data", "step_1", "bbb_profile_data.json")
        
        print(f"Looking for BBB data at: {bbb_data_path}")
        
        if os.path.exists(bbb_data_path):
            with open(bbb_data_path, "r") as f:
                bbb_data = json.load(f)
                if bbb_data:
                    print("Found BBB data, generating services...")
                    # Here you could analyze BBB data to suggest services
                    # For now, we'll use defaults
                    return default_services
        
        print("No BBB data found, using default services")
        return default_services
        
    except Exception as e:
        print(f"Error loading BBB data: {e}")
        print("Using default services")
        return default_services


def main():
    """Generate service list and research data."""
    print("Starting research_services.py script...")
    
    try:
        # First, determine services using BBB data
        bbb_data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                    "raw_data", "bbb_profile_data.json")
        
        with open(bbb_data_path, 'r') as f:
            bbb_data = json.load(f)
            
        business_name = bbb_data.get('business_name', 'Default Business Name')
        print(f"Generating services for: {business_name}")
        
        # Get services list from DeepSeek
        services = get_bbb_services()  # This function remains unchanged
        
        # Save basic services list
        services_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                                          "roofing_services.json")
        with open(services_output_path, 'w') as f:
            json.dump(services, f, indent=2)
        print(f"\nSaved services list to {services_output_path}")
        
        # Research each service
        research_data = {
            "residential": [],
            "commercial": []
        }
        
        for category in ['residential', 'commercial']:
            print(f"\nResearching {category} services:")
            for service in services[category]:
                print(f"  - {service['name']}")
                
                # Get research data
                service_research = research_service(service, category)
                
                # Add to research data
                research_data[category].append({
                    "id": service["id"],
                    "name": service["name"],
                    "installation": service_research["installation"],
                    "repair": service_research["repair"],
                    "maintenance": service_research["maintenance"],
                    "variants": service_research["variants"]
                })
                
                time.sleep(2)  # Rate limiting
        
        # Save research data
        research_output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                                          "services_research.json")
        with open(research_output_path, 'w') as f:
            json.dump(research_data, f, indent=2)
        print(f"\nSaved research data to {research_output_path}")
        
        print("\nScript completed successfully!")
        
    except Exception as e:
        print(f"Error running script: {e}")
        raise

if __name__ == "__main__":
    main()