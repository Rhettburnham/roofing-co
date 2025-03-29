#!/usr/bin/env python3

import os
import json
import re
import openai
from geopy.geocoders import Nominatim
from datetime import datetime
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import shutil

# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables. Create a .env file based on .env.example")

# Get configuration from environment variables or use defaults
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "150"))


def geocode_address(address: str) -> tuple:
    """
    Geocodes the given address and returns its latitude and longitude.
    
    Args:
        address: The address to geocode
        
    Returns:
        tuple: (latitude, longitude) or (None, None) if geocoding failed
    """
    geolocator = Nominatim(user_agent="business_mapper")
    try:
        location = geolocator.geocode(address)
        if location:
            return (location.latitude, location.longitude)
    except Exception as e:
        print(f"Error geocoding address: {e}")
    return (None, None)


def generate_with_gpt(prompt: str, model: str = None, temp: float = None, max_tokens: int = None) -> str:
    """
    Sends a prompt to GPT via OpenAI API and returns the model's response text.
    
    Args:
        prompt: The prompt to send to GPT
        model: Optional model override
        temp: Optional temperature override
        max_tokens: Optional max tokens override
        
    Returns:
        str: The generated text from GPT
    """
    # Use provided parameters or defaults from environment
    model = model or OPENAI_MODEL
    temp = temp if temp is not None else TEMPERATURE
    max_tokens = max_tokens or MAX_TOKENS
    
    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant specializing in creating engaging, professional content for roofing company websites."},
                {"role": "user", "content": prompt}
            ],
            temperature=temp,
            max_tokens=max_tokens
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating GPT response: {e}")
        return f"[Content generation failed: {str(e)[:50]}...]"


def generate_main_page_content(bbb_data: Dict[str, Any], reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generates content for the main page of the website.
    
    Args:
        bbb_data: BBB profile data
        reviews: List of review data
        
    Returns:
        Dict: The generated content for the main page
    """
    try:
        # Extract business info
        years_in_business = int(re.search(r'\d+', bbb_data.get('years_in_business', '0')).group())
    except (AttributeError, ValueError):
        years_in_business = 1
        
    try:
        employee_count = int(bbb_data.get('number_of_employees', '1'))
    except ValueError:
        employee_count = 1

    # Generate Hero section
    hero_section = {
        "Logo": bbb_data.get('logo_filename', '/assets/images/logo.svg'),
        "bus_name": bbb_data.get('business_name', 'Roofing Company'),
        "Rich_text": {
            "Header": generate_with_gpt(
                f"Create a catchy 8-10 word slogan for {bbb_data.get('business_name', 'a roofing company')} "
                f"specializing in {bbb_data.get('services', ['roofing'])[0] if bbb_data.get('services') else 'roofing services'}"
            ),
            "Description": generate_with_gpt(
                f"Create a 40-word description for {bbb_data.get('business_name', 'a roofing company')} with "
                f"{years_in_business} years experience in {bbb_data.get('services', ['roofing'])[0] if bbb_data.get('services') else 'roofing'}. "
                f"Include key strengths from these reviews: {reviews[:3] if reviews else []}"
            )
        },
        "Images": [
            "/assets/images/Richtext/roof_workers.jpg",
            "/assets/images/Richtext/roof_workers2.jpg",
            "/assets/images/Richtext/roof_workers3.webp"
        ]
    }

    # Process Accreditation
    accreditation_section = {
        "Accredited": bbb_data.get('accredited', False),
        "BBB_rating": bbb_data.get('bbb_rating', 'N/A')
    }

    # Generate Cards
    icon_mapping = {
        'roof': 'roof-icon.png',
        'siding': 'siding-icon.png',
        'repair': 'tools-icon.png',
        'construction': 'hammer-icon.png',
        'leak': 'leak-icon.png',
        'chimney': 'chimney-icon.png',
        'replacement': 'replacement-icon.png',
        'gutter': 'gutter-icon.png'
    }

    cards_section = []
    services = bbb_data.get('services', [])
    if not services:
        services = ["Roof Repair", "Roof Replacement", "Leak Repair", "Roof Inspection"]
        
    for service in services[:4]:
        service_key = next((k for k in icon_mapping if k in service.lower()), 'default')
        cards_section.append({
            "Icon": f"/assets/icons/{icon_mapping.get(service_key, 'default-icon.png')}",
            "Title": generate_with_gpt(f"Create a catchy 3-5 word title for {service} service"),
            "Description": generate_with_gpt(f"Create a compelling 15-20 word description for {service} that highlights benefits to homeowners"),
            "About_button": {
                "Text": "Learn More",
                "Image": "/assets/images/roof_slideshow/i1.jpeg"
            }
        })

    # Process Map
    lat, lng = geocode_address(bbb_data.get('address', ''))
    map_section = {
        "Text": "Are We in Your Area?",
        "Lat": lat,
        "Lng": lng,
        "Address": bbb_data.get('address', ''),
        "Phone": bbb_data.get('telephone', ''),
        "circleRadius": "6047"  # ~3.75 miles
    }

    # Generate Stats
    stats_section = [
        {"Icon": "FaUsers", "value": employee_count, "title": "Expert Team Members"},
        {"Icon": "FaCalendarAlt", "value": years_in_business, "title": "Years Experience"},
        {"Icon": "FaHome", "value": 2500, "title": "Projects Completed"},
        {"Icon": "FaStar", "value": len(reviews) if reviews else 100, "title": "Satisfied Customers"}
    ]

    # Service Hours
    service_hours = [
        {"day": "Monday", "time": "9:00 AM - 5:00 PM"},
        {"day": "Tuesday", "time": "9:00 AM - 5:00 PM"},
        {"day": "Wednesday", "time": "9:00 AM - 5:00 PM"},
        {"day": "Thursday", "time": "9:00 AM - 5:00 PM"},
        {"day": "Friday", "time": "9:00 AM - 5:00 PM"},
        {"day": "Saturday", "time": "By Appointment"},
        {"day": "Sunday", "time": "Closed"}
    ]

    # Process Employees
    employees_section = {
        "Header": "Our Team",
        "Team": []
    }
    
    for emp in bbb_data.get('employee_names', []):
        name = re.sub(r',.*', '', emp)
        role_match = re.search(r',\s*(.*)', emp)
        role = role_match.group(1) if role_match else "Specialist"
        employees_section["Team"].append({
            "Name": name,
            "Role": role,
            "Position": "Field Operations"
        })

    # Process Testimonials
    testimonials_section = []
    
    positive_reviews = [r for r in reviews if r.get('sentiment') == 'positive'] if reviews else []
    for r in sorted(positive_reviews, key=lambda x: x.get('polarity', 0), reverse=True)[:6]:
        review_text = r.get('review_text', '')
        testimonials_section.append({
            "Name": r.get('name', 'Customer'),
            "Date": r.get('date', datetime.now().strftime("%B %Y")),
            "Stars": int(r.get('rating', 5)),
            "text": review_text[:200] + "..." if len(review_text) > 200 else review_text
        })

    # Compile final JSON
    combined_data = {
        "Hero": hero_section,
        "Accreditation": accreditation_section,
        "Cards": cards_section,
        "Map": map_section,
        "Stats": stats_section,
        "Service_hours": service_hours,
        "Booking": {
            "Header": "Contact Us",
            "Logo": "/assets/images/logo.svg",
            "phone": bbb_data.get('telephone', '')
        },
        "Combined_page": {
            "Residential": [
                {
                    "Title": s,
                    "icon": f"/assets/icons/{next((k for k in icon_mapping if k in s.lower()), 'default')}-icon.png"
                }
                for s in (bbb_data.get('services', [])[:2] if bbb_data.get('services') else ["Residential Roofing", "Roof Repair"])
            ],
            "Commercial": [
                {
                    "Title": s,
                    "icon": f"/assets/icons/{next((k for k in icon_mapping if k in s.lower()), 'default')}-icon.png"
                }
                for s in (bbb_data.get('services', [])[2:4] if len(bbb_data.get('services', [])) > 2 else ["Commercial Roofing", "Roof Inspection"])
            ]
        },
        "Testimonials": testimonials_section,
        "Employees": employees_section
    }
    
    return combined_data


def classify_service_variant(service_name: str) -> str:
    """
    Classify a service name into one of three layout variants.
    
    Args:
        service_name: The name of the service
        
    Returns:
        str: The variant type ("pricing", "showcase", or "coating")
    """
    name_lower = service_name.lower()

    if any(kw in name_lower for kw in ["gutter", "downspout", "foundation", "foot", "price", "sq ft", "siding"]):
        return "pricing"
    elif any(kw in name_lower for kw in ["shingle", "metal", "tile", "slate", "asphalt", "showcase", "roof replacement", "cedar"]):
        return "showcase"
    elif "repair" in name_lower or "leak" in name_lower or "emergency" in name_lower:
        return "repair"  # New variant for repair services
    elif any(kw in name_lower for kw in ["flat", "tpo", "epdm", "pvc", "commercial", "industrial"]):
        return "commercial"  # New variant for commercial/flat roofing
    else:
        # Default to "coating"
        return "coating"


def enhanced_service_page_content(service_name: str, variant_type: str = None, include_pricing: bool = True) -> Dict[str, Any]:
    """
    Generate comprehensive service page content with better visuals and optional pricing
    
    Args:
        service_name: Name of the service
        variant_type: Optional variant type override (pricing, showcase, coating, repair, commercial)
        include_pricing: Whether to include specific prices in pricing blocks
        
    Returns:
        Dict: The generated content for the service page with enhanced blocks
    """
    # Determine proper variant type based on service name
    if not variant_type:
        variant_type = classify_service_variant(service_name)
    
    # Base hero block (common to all pages)
    blocks = {
        "hero": {
            "type": "hero",
            "config": {
                "title": service_name,
                "backgroundImage": match_service_to_background_image(service_name),
                "shrinkAfterMs": 1000,
                "initialHeight": "40vh",
                "finalHeight": "20vh"
            }
        }
    }
    
    # Add service intro text section
    blocks["serviceIntro"] = {
        "type": "text-section",
        "config": {
            "title": generate_with_gpt(f"Write a catchy 5-7 word title introducing {service_name}"),
            "content": generate_with_gpt(
                f"Write a 100-150 word informative introduction about {service_name} that explains what it is, " 
                f"why it's important, and what homeowners should know about it. Include key benefits."
            )
        }
    }
    
    # Add variant-specific main content
    if variant_type == "showcase":
        blocks["materialShowcase"] = create_material_showcase_block(service_name)
    elif variant_type == "pricing":
        if include_pricing:
            blocks["pricingGrid"] = create_pricing_grid_block(service_name)
        else:
            blocks["pricingOptions"] = create_pricing_options_block(service_name, hide_prices=True)
    elif variant_type == "repair":
        blocks["repairOptions"] = create_service_options_block(service_name)
    elif variant_type == "commercial":
        blocks["commercialOptions"] = create_material_showcase_block(service_name)
    else:  # coating or default
        blocks["serviceOptions"] = create_service_options_block(service_name)
    
    # Add comparison table for materials/methods when relevant for certain variants
    if variant_type in ["showcase", "coating", "commercial"]:
        blocks["comparisonTable"] = create_comparison_table_block(service_name)
    
    # Add process explanation
    blocks["processSteps"] = {
        "type": "process-steps",
        "config": {
            "title": generate_with_gpt(f"Create a 5-7 word title for the {service_name} process section"),
            "steps": generate_service_process_steps(service_name)
        }
    }
    
    # Add CTA block to all pages
    blocks["videoCTA"] = {
        "type": "video-cta",
        "config": {
            "videoSrc": match_service_to_video(service_name),
            "title": generate_with_gpt(f"Create a compelling 6-8 word call-to-action title for {service_name}"),
            "description": generate_with_gpt(
                f"Create a persuasive 20-30 word description encouraging potential customers to take action regarding {service_name}"
            ),
            "buttonText": "Get a Free Estimate",
            "buttonLink": "/#contact",
            "textColor": "1",
            "textAlignment": "center",
            "overlayOpacity": 0.7
        }
    }
    
    # Add FAQ section
    blocks["faq"] = {
        "type": "faq-section",
        "config": {
            "title": f"Frequently Asked Questions About {service_name}",
            "questions": generate_service_faqs(service_name)
        }
    }
    
    return blocks


def parse_services(bbb_data: Dict[str, Any], max_count: int = 4) -> tuple:
    """
    Parse services from BBB data into residential and commercial categories.
    Use intelligent categorization when available, fall back to standard services if needed.
    
    Args:
        bbb_data: BBB profile data
        max_count: Maximum number of services per category
        
    Returns:
        tuple: (residential_services, commercial_services)
    """
    main_services = bbb_data.get('services', [])
    additional_services = bbb_data.get('additional_services', [])

    # Combine services
    combined_services = []
    for s in main_services:
        # Parse services that are separated by periods
        parts = s.replace("\n", " ").split(".")
        combined_services.extend([p.strip() for p in parts if p.strip()])
        
    for a in additional_services:
        combined_services.append(a.strip())

    # Remove duplicates while preserving order
    unique_services = []
    seen = set()
    for service in combined_services:
        if service and service.lower() not in seen and service.strip():
            unique_services.append(service)
            seen.add(service.lower())
    
    # If we have enough services, use intelligent categorization
    if len(unique_services) >= 4:
        residential_services, commercial_services = detect_service_categories(unique_services)
    else:
        # Not enough services found, use standard services
        print("Not enough services found in BBB data, using standard roofing services")
        standard_services = get_standard_roofing_services()
        residential_services = standard_services["residential"]
        commercial_services = standard_services["commercial"]

    # Ensure we have exactly max_count items in each list
    while len(residential_services) < max_count:
        residential_services.append(f"Residential Service {len(residential_services)+1}")
    
    while len(commercial_services) < max_count:
        commercial_services.append(f"Commercial Service {len(commercial_services)+1}")
    
    # Trim lists to max_count
    residential_services = residential_services[:max_count]
    commercial_services = commercial_services[:max_count]
        
    return residential_services, commercial_services


def create_material_showcase_block(service_name: str) -> Dict[str, Any]:
    """
    Create a showcase of material options with visuals
    
    Args:
        service_name: Name of the service
        
    Returns:
        Dict: Material showcase block configuration
    """
    
    # Generate material options based on service type
    material_options = []
    service_lower = service_name.lower()
    
    if "shingle" in service_lower:
        # Shingle-specific options
        material_options = [
            {
                "id": 1,
                "name": "3-Tab Asphalt Shingles",
                "description": generate_with_gpt("Write a 50-word description of 3-tab asphalt shingles highlighting their cost-effectiveness"),
                "features": generate_with_gpt("List 4 key features of 3-tab asphalt shingles, separated by commas").split(","),
                "lifespan": "15-20 years",
                "priceRange": "$ (Most Affordable)",
                "imageUrl": "/assets/images/shingles/3tab.jpg",
                "colors": ["Black", "Gray", "Brown", "Green"]
            },
            {
                "id": 2,
                "name": "Architectural Shingles",
                "description": generate_with_gpt("Write a 50-word description of architectural shingles highlighting their dimensional appearance and durability"),
                "features": generate_with_gpt("List 4 key features of architectural shingles, separated by commas").split(","),
                "lifespan": "25-30 years",
                "priceRange": "$$ (Mid-Range)",
                "imageUrl": "/assets/images/shingles/architectural.jpg",
                "colors": ["Black", "Gray", "Brown", "Blue", "Green", "Red"]
            },
            {
                "id": 3,
                "name": "Premium Designer Shingles",
                "description": generate_with_gpt("Write a 50-word description of premium designer shingles highlighting their luxury appearance and maximum protection"),
                "features": generate_with_gpt("List 4 key features of premium designer shingles, separated by commas").split(","),
                "lifespan": "30-50 years",
                "priceRange": "$$$ (Premium)",
                "imageUrl": "/assets/images/shingles/designer.jpg",
                "colors": ["Custom Blends", "Slate-look", "Wood-look"]
            }
        ]
    elif "metal" in service_lower or "steel" in service_lower:
        # Metal roofing options
        material_options = [
            {
                "id": 1,
                "name": "Standing Seam Metal Roof",
                "description": generate_with_gpt("Write a 50-word description of standing seam metal roofing highlighting its durability and clean aesthetic"),
                "features": generate_with_gpt("List 4 key features of standing seam metal roofing, separated by commas").split(","),
                "lifespan": "30-50 years",
                "priceRange": "$$-$$$ (Premium)",
                "imageUrl": "/assets/images/metal/standing_seam.jpg",
                "colors": ["Various color options available"]
            },
            {
                "id": 2,
                "name": "Metal Shingles",
                "description": generate_with_gpt("Write a 50-word description of metal shingles highlighting how they combine traditional looks with metal durability"),
                "features": generate_with_gpt("List 4 key features of metal shingles, separated by commas").split(","),
                "lifespan": "30-50 years",
                "priceRange": "$$ (Mid-Range)",
                "imageUrl": "/assets/images/metal/metal_shingles.jpg",
                "colors": ["Various color options available"]
            },
            {
                "id": 3,
                "name": "Corrugated Metal Panels",
                "description": generate_with_gpt("Write a 50-word description of corrugated metal roofing highlighting its affordability and traditional agricultural look"),
                "features": generate_with_gpt("List 4 key features of corrugated metal roofing, separated by commas").split(","),
                "lifespan": "20-30 years",
                "priceRange": "$ (Most Affordable)",
                "imageUrl": "/assets/images/metal/corrugated.jpg",
                "colors": ["Various color options available"]
            }
        ]
    elif "gutter" in service_lower:
        # Gutter-specific options
        material_options = [
            {
                "id": 1,
                "name": "Aluminum Gutters",
                "description": generate_with_gpt("Write a 50-word description of aluminum gutters highlighting their rust resistance and lightweight properties"),
                "features": generate_with_gpt("List 4 key features of aluminum gutters, separated by commas").split(","),
                "lifespan": "20 years",
                "priceRange": "$ to $$ (Affordable)",
                "imageUrl": "/assets/images/gutters/aluminum.jpg",
                "styles": ["K-style", "Half-round"]
            },
            {
                "id": 2,
                "name": "Copper Gutters",
                "description": generate_with_gpt("Write a 50-word description of copper gutters highlighting their elegant appearance and extreme durability"),
                "features": generate_with_gpt("List 4 key features of copper gutters, separated by commas").split(","),
                "lifespan": "50+ years",
                "priceRange": "$$$ (Premium)",
                "imageUrl": "/assets/images/gutters/copper.jpg",
                "styles": ["Half-round", "Custom designs"]
            },
            {
                "id": 3,
                "name": "Steel Gutters",
                "description": generate_with_gpt("Write a 50-word description of steel gutters highlighting their strength and durability"),
                "features": generate_with_gpt("List 4 key features of steel gutters, separated by commas").split(","),
                "lifespan": "20-30 years",
                "priceRange": "$$ (Mid-Range)",
                "imageUrl": "/assets/images/gutters/steel.jpg",
                "styles": ["K-style", "Half-round"]
            }
        ]
    elif "flat" in service_lower or "commercial" in service_lower:
        # Flat roof options
        material_options = [
            {
                "id": 1,
                "name": "EPDM (Rubber) Roofing",
                "description": generate_with_gpt("Write a 50-word description of EPDM rubber roofing highlighting its flexibility and waterproofing properties"),
                "features": generate_with_gpt("List 4 key features of EPDM roofing, separated by commas").split(","),
                "lifespan": "20-30 years",
                "priceRange": "$ (Affordable)",
                "imageUrl": "/assets/images/flat/epdm.jpg"
            },
            {
                "id": 2,
                "name": "TPO Membrane",
                "description": generate_with_gpt("Write a 50-word description of TPO roofing highlighting its energy efficiency and durability"),
                "features": generate_with_gpt("List 4 key features of TPO membrane roofing, separated by commas").split(","),
                "lifespan": "20-30 years",
                "priceRange": "$$ (Mid-Range)",
                "imageUrl": "/assets/images/flat/tpo.jpg"
            },
            {
                "id": 3,
                "name": "PVC Membrane",
                "description": generate_with_gpt("Write a 50-word description of PVC roofing highlighting its superior durability and resistance to chemicals"),
                "features": generate_with_gpt("List 4 key features of PVC membrane roofing, separated by commas").split(","),
                "lifespan": "20-30 years",
                "priceRange": "$$ (Mid-Range)",
                "imageUrl": "/assets/images/flat/pvc.jpg"
            },
            {
                "id": 4,
                "name": "Modified Bitumen",
                "description": generate_with_gpt("Write a 50-word description of modified bitumen roofing highlighting its multi-ply protection"),
                "features": generate_with_gpt("List 4 key features of modified bitumen roofing, separated by commas").split(","),
                "lifespan": "15-20 years",
                "priceRange": "$$ (Mid-Range)",
                "imageUrl": "/assets/images/flat/modified.jpg"
            }
        ]
    else:
        # Generic material options for other services
        material_options = [
            {
                "id": 1,
                "name": f"Standard {service_name}",
                "description": generate_with_gpt(f"Write a 50-word description of standard {service_name} highlighting core benefits"),
                "features": generate_with_gpt(f"List 4 key features of standard {service_name}, separated by commas").split(","),
                "bestFor": generate_with_gpt(f"Write a 15-word description of when standard {service_name} is most appropriate"),
                "imageUrl": match_service_to_images(service_name)[0] if match_service_to_images(service_name) else ""
            },
            {
                "id": 2,
                "name": f"Premium {service_name}",
                "description": generate_with_gpt(f"Write a 50-word description of premium {service_name} highlighting advanced benefits"),
                "features": generate_with_gpt(f"List 4 key features of premium {service_name}, separated by commas").split(","),
                "bestFor": generate_with_gpt(f"Write a 15-word description of when premium {service_name} is most appropriate"),
                "imageUrl": match_service_to_images(service_name)[1] if len(match_service_to_images(service_name)) > 1 else ""
            }
        ]
    
    return {
        "type": "material-showcase",
        "config": {
            "title": generate_with_gpt(f"Create a 5-7 word title for showcasing {service_name} options"),
            "description": generate_with_gpt(f"Write a 30-40 word introduction about the importance of choosing the right materials for {service_name}"),
            "items": material_options,
            "showPricing": "priceRange" in material_options[0]
        }
    }


def create_pricing_grid_block(service_name: str) -> Dict[str, Any]:
    """
    Create a pricing grid block for services with linear foot or area-based pricing
    
    Args:
        service_name: Name of the service
        
    Returns:
        Dict: Pricing grid block configuration
    """
    service_lower = service_name.lower()
    
    # Default pricing items
    pricing_items = [
        {
            "title": f"Standard {service_name}",
            "image": match_service_to_images(service_name)[0] if match_service_to_images(service_name) else "",
            "alt": f"Standard {service_name} Option",
            "description": generate_with_gpt(f"Write a 30-40 word description of a standard {service_name} service that highlights its benefits"),
            "rate": "$5 - $8 per linear foot"
        },
        {
            "title": f"Premium {service_name}",
            "image": match_service_to_images(service_name)[1] if len(match_service_to_images(service_name)) > 1 else "",
            "alt": f"Premium {service_name} Option",
            "description": generate_with_gpt(f"Write a 30-40 word description of a premium {service_name} service that justifies its higher price point"),
            "rate": "$8 - $12 per linear foot"
        }
    ]
    
    # Customize pricing for specific service types
    if "gutter" in service_lower:
        pricing_items = [
            {
                "title": "Aluminum K-Style Gutters",
                "image": "/assets/images/gutters/aluminum_k_style.jpg",
                "alt": "Aluminum K-Style Gutters",
                "description": generate_with_gpt("Write a 30-40 word description of aluminum k-style gutters highlighting their popularity and efficiency"),
                "rate": "$5 - $8 per linear foot"
            },
            {
                "title": "Copper Half-Round Gutters",
                "image": "/assets/images/gutters/copper_half_round.jpg",
                "alt": "Copper Half-Round Gutters",
                "description": generate_with_gpt("Write a 30-40 word description of copper half-round gutters highlighting their elegance and longevity"),
                "rate": "$15 - $25 per linear foot"
            },
            {
                "title": "Gutter Guards",
                "image": "/assets/images/gutters/gutter_guards.jpg",
                "alt": "Gutter Guard System",
                "description": generate_with_gpt("Write a 30-40 word description of gutter guards highlighting how they prevent clogs and reduce maintenance"),
                "rate": "$3 - $6 per linear foot (additional)"
            }
        ]
    elif "repair" in service_lower:
        pricing_items = [
            {
                "title": "Minor Roof Repair",
                "image": "/assets/images/repair/minor_repair.jpg",
                "alt": "Minor Roof Repair",
                "description": generate_with_gpt("Write a 30-40 word description of minor roof repairs for small leaks or damaged shingles"),
                "rate": "$300 - $600 (flat rate)"
            },
            {
                "title": "Medium Roof Repair",
                "image": "/assets/images/repair/medium_repair.jpg",
                "alt": "Medium Roof Repair",
                "description": generate_with_gpt("Write a 30-40 word description of medium roof repairs for multiple issues or larger damaged areas"),
                "rate": "$600 - $1,200 (flat rate)"
            },
            {
                "title": "Major Roof Repair",
                "image": "/assets/images/repair/major_repair.jpg",
                "alt": "Major Roof Repair",
                "description": generate_with_gpt("Write a 30-40 word description of major roof repairs for structural issues or extensive damage"),
                "rate": "$1,200 - $3,000 (varies by scope)"
            }
        ]
    
    return {
        "type": "pricing-grid",
        "config": {
            "title": generate_with_gpt(f"Create a 5-7 word title for {service_name} pricing options"),
            "description": generate_with_gpt(f"Write a 30-40 word introduction about {service_name} pricing factors and what affects costs"),
            "showPrice": True,
            "items": pricing_items
        }
    }


def create_pricing_options_block(service_name: str, hide_prices: bool = True) -> Dict[str, Any]:
    """
    Create a pricing options block for roofers who prefer not to show explicit prices
    
    Args:
        service_name: Name of the service
        hide_prices: Whether to hide specific prices
        
    Returns:
        Dict: Pricing options block configuration
    """
    service_lower = service_name.lower()
    
    # Default pricing items with no specific rates
    pricing_items = [
        {
            "title": f"Basic {service_name}",
            "image": match_service_to_images(service_name)[0] if match_service_to_images(service_name) else "",
            "alt": f"Basic {service_name} Option",
            "description": generate_with_gpt(f"Write a 40-50 word description of a basic {service_name} option, highlighting value and quality"),
            "rate": "Contact for Quote" if hide_prices else "Starting at $X per square foot"
        },
        {
            "title": f"Standard {service_name}",
            "image": match_service_to_images(service_name)[1] if len(match_service_to_images(service_name)) > 1 else "",
            "alt": f"Standard {service_name} Option",
            "description": generate_with_gpt(f"Write a 40-50 word description of a standard {service_name} option, highlighting balanced quality and features"),
            "rate": "Contact for Quote" if hide_prices else "Starting at $X per square foot"
        },
        {
            "title": f"Premium {service_name}",
            "image": match_service_to_images(service_name)[2] if len(match_service_to_images(service_name)) > 2 else "",
            "alt": f"Premium {service_name} Option",
            "description": generate_with_gpt(f"Write a 40-50 word description of a premium {service_name} option, highlighting superior quality and features"),
            "rate": "Contact for Quote" if hide_prices else "Starting at $X per square foot"
        }
    ]
    
    return {
        "type": "pricing-options",
        "config": {
            "title": generate_with_gpt(f"Create a 5-7 word title for {service_name} service options"),
            "description": generate_with_gpt(f"Write a 40-50 word introduction about choosing the right {service_name} option based on needs and budget"),
            "showPrice": not hide_prices,
            "contactText": "Contact us for a personalized quote based on your specific requirements.",
            "items": pricing_items
        }
    }


def create_service_options_block(service_name: str) -> Dict[str, Any]:
    """
    Create a service options block for coating-type services
    
    Args:
        service_name: Name of the service
        
    Returns:
        Dict: Service options block configuration
    """
    service_lower = service_name.lower()
    
    # Default options
    service_items = [
        {
            "id": 1,
            "name": f"{service_name} - Type A",
            "description": generate_with_gpt(f"Write a 40-50 word description of a standard {service_name} solution"),
            "features": generate_with_gpt(f"List 4 key features of this {service_name} solution, separated by commas").split(","),
            "uses": generate_with_gpt(f"Write a 15-20 word description of when to use this {service_name} solution"),
            "limitations": generate_with_gpt(f"Write a 15-20 word description of limitations of this {service_name} solution"),
            "imageUrl": match_service_to_images(service_name)[0] if match_service_to_images(service_name) else ""
        },
        {
            "id": 2,
            "name": f"{service_name} - Type B",
            "description": generate_with_gpt(f"Write a 40-50 word description of a premium {service_name} solution"),
            "features": generate_with_gpt(f"List 4 key features of this premium {service_name} solution, separated by commas").split(","),
            "uses": generate_with_gpt(f"Write a 15-20 word description of when to use this premium {service_name} solution"),
            "limitations": generate_with_gpt(f"Write a 15-20 word description of limitations of this premium {service_name} solution"),
            "imageUrl": match_service_to_images(service_name)[1] if len(match_service_to_images(service_name)) > 1 else ""
        }
    ]
    
    # Specific coating options
    if "coat" in service_lower:
        service_items = [
            {
                "id": 1,
                "name": "Acrylic Roof Coating",
                "description": generate_with_gpt("Write a 40-50 word description of acrylic roof coating highlighting its reflectivity and affordable price point"),
                "features": generate_with_gpt("List 4 key features of acrylic roof coating, separated by commas").split(","),
                "uses": generate_with_gpt("Write a 15-20 word description of when to use acrylic roof coating"),
                "limitations": generate_with_gpt("Write a 15-20 word description of limitations of acrylic roof coating"),
                "imageUrl": "/assets/images/coating/acrylic.jpg"
            },
            {
                "id": 2,
                "name": "Silicone Roof Coating",
                "description": generate_with_gpt("Write a 40-50 word description of silicone roof coating highlighting its waterproofing and UV resistance"),
                "features": generate_with_gpt("List 4 key features of silicone roof coating, separated by commas").split(","),
                "uses": generate_with_gpt("Write a 15-20 word description of when to use silicone roof coating"),
                "limitations": generate_with_gpt("Write a 15-20 word description of limitations of silicone roof coating"),
                "imageUrl": "/assets/images/coating/silicone.jpg"
            },
            {
                "id": 3,
                "name": "Polyurethane Roof Coating",
                "description": generate_with_gpt("Write a 40-50 word description of polyurethane roof coating highlighting its durability and impact resistance"),
                "features": generate_with_gpt("List 4 key features of polyurethane roof coating, separated by commas").split(","),
                "uses": generate_with_gpt("Write a 15-20 word description of when to use polyurethane roof coating"),
                "limitations": generate_with_gpt("Write a 15-20 word description of limitations of polyurethane roof coating"),
                "imageUrl": "/assets/images/coating/polyurethane.jpg"
            }
        ]
    elif "repair" in service_lower:
        service_items = [
            {
                "id": 1,
                "name": "Leak Repair",
                "description": generate_with_gpt("Write a 40-50 word description of roof leak repair services highlighting rapid response and thorough solutions"),
                "features": generate_with_gpt("List 4 key features of professional roof leak repair, separated by commas").split(","),
                "uses": generate_with_gpt("Write a 15-20 word description of when roof leak repair is necessary"),
                "limitations": generate_with_gpt("Write a 15-20 word description of limitations of roof leak repairs"),
                "imageUrl": "/assets/images/repair/leak_repair.jpg"
            },
            {
                "id": 2,
                "name": "Shingle Replacement",
                "description": generate_with_gpt("Write a 40-50 word description of shingle replacement services highlighting targeted repair for damaged areas"),
                "features": generate_with_gpt("List 4 key features of professional shingle replacement, separated by commas").split(","),
                "uses": generate_with_gpt("Write a 15-20 word description of when shingle replacement is appropriate"),
                "limitations": generate_with_gpt("Write a 15-20 word description of limitations of partial shingle replacement"),
                "imageUrl": "/assets/images/repair/shingle_replacement.jpg"
            },
            {
                "id": 3,
                "name": "Structural Repair",
                "description": generate_with_gpt("Write a 40-50 word description of roof structural repair services addressing underlying damage"),
                "features": generate_with_gpt("List 4 key features of professional structural roof repair, separated by commas").split(","),
                "uses": generate_with_gpt("Write a 15-20 word description of when structural roof repair is necessary"),
                "limitations": generate_with_gpt("Write a 15-20 word description of what to consider with structural repairs"),
                "imageUrl": "/assets/images/repair/structural_repair.jpg"
            }
        ]
    
    return {
        "type": "general-list-variant2",
        "config": {
            "title": generate_with_gpt(f"Create a 5-7 word title for types of {service_name} options"),
            "items": service_items
        }
    }


def create_comparison_table_block(service_name: str) -> Dict[str, Any]:
    """
    Create a comparison table for different materials or methods
    
    Args:
        service_name: Name of the service
        
    Returns:
        Dict: Comparison table block configuration
    """
    service_lower = service_name.lower()
    
    # Generate comparison criteria based on service type
    comparison_criteria = ["Durability", "Cost", "Appearance", "Maintenance"]
    
    if "roof" in service_lower or "shingle" in service_lower:
        comparison_criteria = ["Lifespan", "Cost", "Appearance", "Wind Resistance", "Fire Rating", "Weight"]
    elif "gutter" in service_lower:
        comparison_criteria = ["Durability", "Cost", "Appearance", "Maintenance", "Capacity"]
    elif "repair" in service_lower:
        comparison_criteria = ["Longevity", "Cost", "Time to Complete", "When to Choose"]
    elif "coat" in service_lower:
        comparison_criteria = ["Durability", "Cost", "UV Resistance", "Application Method", "VOC Content"]
    
    # Generate options to compare based on service type
    options_to_compare = []
    
    if "shingle" in service_lower:
        options_to_compare = ["3-Tab Asphalt", "Architectural Shingles", "Premium Designer Shingles"]
    elif "metal" in service_lower:
        options_to_compare = ["Standing Seam", "Metal Shingles", "Corrugated Metal"]
    elif "gutter" in service_lower:
        options_to_compare = ["Aluminum", "Copper", "Steel", "Vinyl"]
    elif "flat" in service_lower or "commercial" in service_lower:
        options_to_compare = ["EPDM (Rubber)", "TPO", "PVC", "Modified Bitumen"]
    elif "coat" in service_lower:
        options_to_compare = ["Acrylic", "Silicone", "Polyurethane"]
    elif "repair" in service_lower:
        options_to_compare = ["Spot Repair", "Partial Re-Roofing", "Complete Replacement"]
    else:
        # Generic options for any service
        options_to_compare = [f"Standard {service_name}", f"Premium {service_name}", f"Economy {service_name}"]
    
    # Generate comparison table content
    comparison_data = []
    
    for option in options_to_compare:
        option_data = {
            "name": option,
            "values": {}
        }
        
        for criterion in comparison_criteria:
            # Generate a brief comparison value for each criterion
            prompt = f"Write a brief 5-10 word assessment of {option} for the criterion '{criterion}' in {service_name}"
            option_data["values"][criterion] = generate_with_gpt(prompt, max_tokens=30)
        
        comparison_data.append(option_data)
    
    return {
        "type": "comparison-table",
        "config": {
            "title": generate_with_gpt(f"Create a 5-7 word title for comparing {service_name} options"),
            "description": generate_with_gpt(f"Write a 30-40 word introduction about comparing different {service_name} options to make an informed decision"),
            "criteria": comparison_criteria,
            "options": comparison_data
        }
    }


def main():
    """Main function to generate all website content"""
    # Initialize paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    processed_data_dir = os.path.join(data_dir, "processed_data")
    output_dir = os.path.join(data_dir, "processed_data")
    service_output_dir = os.path.join(output_dir, "service_pages")
    
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(service_output_dir, exist_ok=True)
    
    # Input files
    bbb_file = os.path.join(processed_data_dir, "bbb_profile_data.json")
    reviews_file = os.path.join(processed_data_dir, "sentiment_reviews.json")
    
    # Load data
    try:
        with open(bbb_file, "r", encoding="utf-8") as f:
            bbb_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading BBB data: {e}")
        bbb_data = {}
        
    try:
        with open(reviews_file, "r", encoding="utf-8") as f:
            reviews_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading reviews data: {e}")
        reviews_data = []
    
    # 1. Generate main page content
    print("Generating main page content...")
    main_page_data = generate_main_page_content(bbb_data, reviews_data)
    
    # Save main page data
    combined_data_path = os.path.join(output_dir, "combined_data.json")
    with open(combined_data_path, "w", encoding="utf-8") as f:
        json.dump(main_page_data, f, indent=2)
    print(f"Main page content saved to {combined_data_path}")
    
    # 2. Generate service pages
    print("Generating service pages...")
    residential_services, commercial_services = parse_services(bbb_data)
    
    # Determine if we should show prices based on settings or service type
    show_prices = True  # Default value, could be loaded from a config
    
    # Generate residential service pages
    residential_service_blocks = []
    for i, service in enumerate(residential_services):
        print(f"Generating residential service page {i+1}: {service}")
        variant_type = classify_service_variant(service)
        
        # For residential services, we'll generate enhanced content
        service_data = enhanced_service_page_content(
            service, 
            variant_type=variant_type,
            include_pricing=show_prices
        )
        
        # Convert the blocks to the format expected by ServicePage.jsx
        formatted_blocks = []
        for block_key, block_data in service_data.items():
            formatted_blocks.append({
                "blockName": block_data["type"].replace("-", "").capitalize(),
                "config": block_data["config"]
            })
        
        residential_service_blocks.append({
            "id": i+1,
            "title": service,
            "blocks": formatted_blocks
        })
        
        # Also save individual block files for reference/editing
        filename = f"residential_service_{i+1}.json"
        output_path = os.path.join(service_output_dir, filename)
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(service_data, f, indent=2)
        print(f"Saved individual blocks to {output_path}")
    
    # Generate commercial service pages
    commercial_service_blocks = []
    for i, service in enumerate(commercial_services):
        print(f"Generating commercial service page {i+1}: {service}")
        variant_type = classify_service_variant(service)
        
        # For commercial services, we'll generate enhanced content
        service_data = enhanced_service_page_content(
            service, 
            variant_type=variant_type,
            include_pricing=show_prices
        )
        
        # Convert the blocks to the format expected by ServicePage.jsx
        formatted_blocks = []
        for block_key, block_data in service_data.items():
            formatted_blocks.append({
                "blockName": block_data["type"].replace("-", "").capitalize(),
                "config": block_data["config"]
            })
        
        commercial_service_blocks.append({
            "id": i+1,
            "title": service,
            "blocks": formatted_blocks
        })
        
        # Also save individual block files for reference/editing
        filename = f"commercial_service_{i+1}.json"
        output_path = os.path.join(service_output_dir, filename)
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(service_data, f, indent=2)
        print(f"Saved individual blocks to {output_path}")
    
    # 3. Generate services.json for the frontend
    services_json = {
        "commercial": commercial_service_blocks,
        "residential": residential_service_blocks
    }
    
    services_json_path = os.path.join(output_dir, "services.json")
    with open(services_json_path, "w", encoding="utf-8") as f:
        json.dump(services_json, f, indent=2)
    print(f"Services index saved to {services_json_path}")
    
    # 4. Copy files to main data directory for immediate use
    main_services_json_path = os.path.join(data_dir, "services.json")
    with open(main_services_json_path, "w", encoding="utf-8") as f:
        json.dump(services_json, f, indent=2)
    print(f"Services index copied to {main_services_json_path}")
    
    main_combined_data_path = os.path.join(data_dir, "combined_data.json")
    shutil.copy2(combined_data_path, main_combined_data_path)
    print(f"Combined data copied to {main_combined_data_path}")
    
    print("Content generation complete!")


if __name__ == "__main__":
    main() 