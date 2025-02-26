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
    Example logic to parse services into up to 4 residential
    and up to 4 commercial. You can customize as needed.
    """
    cleaned = [s.strip() for s in all_services if s.strip()]
    cleaned = list(dict.fromkeys(cleaned))  # remove duplicates, keep order

    half = len(cleaned) // 2
    residential_candidates = cleaned[:half]
    commercial_candidates = cleaned[half:]

    residential_services = residential_candidates[:max_count]
    commercial_services = commercial_candidates[:max_count]

    return residential_services, commercial_services

def main():
    input_file = "bbb_profile_data.json"
    output_dir = "service_jsons"
    os.makedirs(output_dir, exist_ok=True)

    # Load the BBB data
    with open(input_file, "r", encoding="utf-8") as f:
        bbb_data = json.load(f)

    main_services = bbb_data.get("services", [])
    additional_services = bbb_data.get("additional_services", [])

    # Combine them for a naive approach
    combined_services = []
    for s in main_services:
        # If the "services" array is a single string with multiple items separated by a period, parse them
        parts = s.replace("\n", " ").split(".")
        combined_services.extend(parts)
    for a in additional_services:
        combined_services.append(a)

    # Split into up to 4 residential, 4 commercial
    residential_list, commercial_list = parse_services_for_res_and_comm(combined_services, max_count=4)

    # Fill placeholders if fewer than 4
    while len(residential_list) < 4:
        residential_list.append(f"Residential Placeholder {len(residential_list)+1}")
    while len(commercial_list) < 4:
        commercial_list.append(f"Commercial Placeholder {len(commercial_list)+1}")

    # Generate 4 Residential JSON
    for i in range(4):
        service_name = residential_list[i]
        blocks_data = create_variant_blocks(service_name)
        
        out_filename = f"residential_service_{i+1}.json"
        out_path = os.path.join(output_dir, out_filename)
        
        with open(out_path, "w", encoding="utf-8") as f_out:
            json.dump(blocks_data, f_out, indent=2)
        
        print(f"Created {out_path} for {service_name}")

    # Generate 4 Commercial JSON
    for i in range(4):
        service_name = commercial_list[i]
        blocks_data = create_variant_blocks(service_name)
        
        out_filename = f"commercial_service_{i+1}.json"
        out_path = os.path.join(output_dir, out_filename)
        
        with open(out_path, "w", encoding="utf-8") as f_out:
            json.dump(blocks_data, f_out, indent=2)
        
        print(f"Created {out_path} for {service_name}")

if __name__ == "__main__":
    main()
