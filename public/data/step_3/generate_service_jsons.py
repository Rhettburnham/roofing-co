#!/usr/bin/env python3
import json
import os

def classify_service_variant(service_name):
    """
    Classify a service name into one of three layout variants:
      1) "pricing" if related to gutters, downspouts, etc.
      2) "showcase" if related to shingles, metal roofs, tile, etc.
      3) "coating" otherwise (default fallback).
    Customize these rules as you see fit.
    """
    # Lowercase for easy matching
    name_lower = service_name.lower()

    # Basic keyword detection (expand as desired)
    if any(kw in name_lower for kw in ["gutter", "downspout", "foundation", "foot", "price", "sq ft"]):
        return "pricing"
    elif any(kw in name_lower for kw in ["shingle", "metal", "tile", "slate", "asphalt", "showcase", "roof replacement"]):
        return "showcase"
    else:
        # Default to "coating"
        return "coating"

def create_pricing_variant_data(service_name):
    """
    Create JSON blocks for the "pricing" style page,
    e.g. guttering with cost-per-foot or similar approach.
    """
    return {
        "hero": {
            "type": "hero",
            "config": {
                "title": service_name,
                "backgroundImage": "",
                "shrinkAfterMs": 1000,
                "initialHeight": "40vh",
                "finalHeight": "20vh"
            }
        },
        "pricingGrid": {
            "type": "pricing-grid",
            "config": {
                "showPrice": True,
                "items": [
                    {
                        "title": f"{service_name} Basic",
                        "image": "",
                        "alt": f"{service_name} Basic Option",
                        "description": "Placeholder description of the basic tier.",
                        "rate": "$5 - $8 per linear foot"
                    },
                    {
                        "title": f"{service_name} Premium",
                        "image": "",
                        "alt": f"{service_name} Premium Option",
                        "description": "Placeholder description of the premium tier.",
                        "rate": "$8 - $12 per linear foot"
                    }
                ]
            }
        },
        "videoCTA": {
            "type": "video-cta",
            "config": {
                "videoSrc": "",
                "title": f"Ready to Upgrade Your {service_name}?",
                "description": "Contact us today for a free consultation on the best cost-effective approach.",
                "buttonText": "Schedule a Consultation",
                "buttonLink": "/#contact",
                "textColor": "1",
                "textAlignment": "center",
                "overlayOpacity": 0.7
            }
        }
    }

def create_showcase_variant_data(service_name):
    """
    Create JSON blocks for a "showcase" style page (like shingling).
    """
    return {
        "hero": {
            "type": "hero",
            "config": {
                "title": service_name,
                "backgroundImage": "",
                "shrinkAfterMs": 1000,
                "initialHeight": "40vh",
                "finalHeight": "20vh"
            }
        },
        "generalListVariant2": {
            "type": "general-list-variant-2",
            "config": {
                "title": f"Explore Our {service_name} Options",
                "items": [
                    {
                        "id": 1,
                        "name": f"{service_name} - Variation A",
                        "description": f"Placeholder for Variation A of {service_name}.",
                        "features": ["Feature A1", "Feature A2", "Feature A3"],
                        "uses": "Placeholder uses",
                        "limitations": "Placeholder limitations",
                        "imageUrl": ""
                    },
                    {
                        "id": 2,
                        "name": f"{service_name} - Variation B",
                        "description": f"Placeholder for Variation B of {service_name}.",
                        "features": ["Feature B1", "Feature B2", "Feature B3"],
                        "uses": "Placeholder uses",
                        "limitations": "Placeholder limitations",
                        "imageUrl": ""
                    }
                ]
            }
        },
        "videoCTA": {
            "type": "video-cta",
            "config": {
                "videoSrc": "",
                "title": f"Ready to Explore {service_name} Showcase?",
                "description": "Contact us today for a free consultation on the best roofing showcase.",
                "buttonText": "Schedule a Consultation",
                "buttonLink": "/#contact",
                "textColor": "1",
                "textAlignment": "center",
                "overlayOpacity": 0.7
            }
        }
    }

def create_coating_variant_data(service_name):
    """
    Create JSON blocks for a "coating" style page, like roof coating with multiple sub-variants.
    """
    return {
        "hero": {
            "type": "hero",
            "config": {
                "title": service_name,
                "backgroundImage": "",
                "shrinkAfterMs": 1000,
                "initialHeight": "40vh",
                "finalHeight": "20vh"
            }
        },
        "generalListVariant2": {
            "type": "general-list-variant-2",
            "config": {
                "title": f"Types of {service_name} Solutions",
                "items": [
                    {
                        "id": 1,
                        "name": f"{service_name} - Basic Coating",
                        "description": "Placeholder for a basic coating approach.",
                        "features": ["Water-based", "Affordable", "Quick drying"],
                        "uses": "General roofs that need reflectivity",
                        "limitations": "Not ideal for heavy ponding",
                        "imageUrl": ""
                    },
                    {
                        "id": 2,
                        "name": f"{service_name} - Premium Coating",
                        "description": "Placeholder for a premium coating approach.",
                        "features": ["High durability", "UV stable", "Ponding safe"],
                        "uses": "Flat roofs with standing water potential",
                        "limitations": "Higher cost, specialized prep",
                        "imageUrl": ""
                    }
                ]
            }
        },
        "videoCTA": {
            "type": "video-cta",
            "config": {
                "videoSrc": "",
                "title": f"Ready to Upgrade with {service_name}?",
                "description": "Contact us today for a free roof inspection and personalized plan.",
                "buttonText": "Schedule a Consultation",
                "buttonLink": "/#contact",
                "textColor": "1",
                "textAlignment": "center",
                "overlayOpacity": 0.7
            }
        }
    }

def create_variant_blocks(service_name):
    """
    Chooses which variant to produce based on the classification of the service_name.
    """
    variant = classify_service_variant(service_name)
    if variant == "pricing":
        return create_pricing_variant_data(service_name)
    elif variant == "showcase":
        return create_showcase_variant_data(service_name)
    else:
        # default = "coating"
        return create_coating_variant_data(service_name)

def parse_services_for_res_and_comm(all_services, max_count=4):
    """
    Parse services from the roofing_services.json structure.
    
    Args:
        all_services: Dictionary with 'residential' and 'commercial' keys
        max_count: Maximum number of services to return for each category
        
    Returns:
        Tuple of (residential_services, commercial_services) lists
    """
    residential_services = []
    commercial_services = []
    
    # Extract services from the residential category
    if 'residential' in all_services and isinstance(all_services['residential'], list):
        for service in all_services['residential'][:max_count]:
            if isinstance(service, dict) and 'name' in service:
                residential_services.append(service['name'])
    
    # Extract services from the commercial category
    if 'commercial' in all_services and isinstance(all_services['commercial'], list):
        for service in all_services['commercial'][:max_count]:
            if isinstance(service, dict) and 'name' in service:
                commercial_services.append(service['name'])
    
    # Fill in placeholders if we don't have enough services
    while len(residential_services) < max_count:
        residential_services.append(f"Residential Roofing Service {len(residential_services)+1}")
    
    while len(commercial_services) < max_count:
        commercial_services.append(f"Commercial Roofing Service {len(commercial_services)+1}")
    
    return residential_services, commercial_services

def main():
    """
    Main function to generate service JSON files
    """
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    
    # Input path from step 2
    input_path = os.path.join(data_dir, "raw_data", "step_2", "roofing_services.json")
    
    # Output directory in step 3
    output_dir = os.path.join(data_dir, "raw_data", "step_3")
    os.makedirs(output_dir, exist_ok=True)
    
    # Main output file
    services_output_path = os.path.join(output_dir, "services_search_term.json")
    
    # Load services data
    try:
        with open(input_path, "r", encoding="utf-8") as f_in:
            all_services = json.load(f_in)
    except FileNotFoundError:
        print(f"Error: {input_path} not found. Please run step_2 scripts first.")
        return
    
    # Parse services into residential and commercial lists
    residential_list, commercial_list = parse_services_for_res_and_comm(all_services)
    
    # Create combined data structure for all services
    all_services_data = []
    
    # Generate 4 Residential JSON
    for i in range(4):
        service_name = residential_list[i]
        blocks_data = create_variant_blocks(service_name)
        
        # Add to the combined data
        all_services_data.append({
            "id": i + 1,
            "name": service_name,
            "type": "residential",
            "blocks": blocks_data
        })
        
        # Also save individual JSON files if needed
        out_filename = f"residential_service_{i+1}.json"
        out_path = os.path.join(output_dir, out_filename)
        
        with open(out_path, "w", encoding="utf-8") as f_out:
            json.dump(blocks_data, f_out, indent=2)
        
        print(f"Created {out_path} for {service_name}")

    # Generate 4 Commercial JSON
    for i in range(4):
        service_name = commercial_list[i]
        blocks_data = create_variant_blocks(service_name)
        
        # Add to the combined data
        all_services_data.append({
            "id": i + 5,  # Continue from residential IDs
            "name": service_name,
            "type": "commercial",
            "blocks": blocks_data
        })
        
        # Also save individual JSON files if needed
        out_filename = f"commercial_service_{i+1}.json"
        out_path = os.path.join(output_dir, out_filename)
        
        with open(out_path, "w", encoding="utf-8") as f_out:
            json.dump(blocks_data, f_out, indent=2)
        
        print(f"Created {out_path} for {service_name}")
    
    # Save the combined services data
    with open(services_output_path, "w", encoding="utf-8") as f_out:
        json.dump(all_services_data, f_out, indent=2)
    
    print(f"Created combined services data at {services_output_path}")

if __name__ == "__main__":
    main()
