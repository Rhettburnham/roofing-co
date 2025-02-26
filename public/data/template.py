#!/usr/bin/env python3
import json
import re
import openai

# Set your OpenAI API key here (use secure key management in production)
openai.api_key = "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"  # Replace with your test API key

def generate_with_gpt(prompt):
    """
    Sends a prompt to GPT-4 and returns the model's response text.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=5000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error in GPT call: {e}")
        return ""

def main():
    # Load BBB profile and review data from JSON files
    with open('bbb_profile_data.json', 'r') as f:
        bbb_data = json.load(f)
    with open('sentiment_reviews.json', 'r') as f:
        reviews = json.load(f)
    
    # -----------------------
    # HERO SECTION
    # -----------------------
    # Use the full business name as mainTitle and any extra words as subTitle.
    business_name = bbb_data.get("business_name", "Default Business")
    name_parts = business_name.split()
    if len(name_parts) > 1:
        mainTitle = name_parts[0].upper()
        subTitle = " ".join(name_parts[1:]).upper()
    else:
        mainTitle = business_name.upper()
        subTitle = ""
    
    # Generate residential subServices using BBB services and defaults.
    # Defaults: "Shingling" (always), "Guttering" (always), "Ventilation", "Siding".
    bbb_services_raw = bbb_data.get("services", [""])[0]
    bbb_services_list = [s.strip() for s in bbb_services_raw.split(".") if s.strip()]
    res_prompt = (
        f"Using the following BBB services: {bbb_services_list}, and the default residential services "
        f"['Shingling', 'Guttering', 'Ventilation', 'Siding'], generate a JSON array (maximum 4 items) "
        f"for residential sub-services. Ensure that 'Shingling' and 'Guttering' are always included. "
        f"Output only a JSON array where each element is an object with a key 'title'."
    )
    res_response = generate_with_gpt(res_prompt)
    try:
        residential_subServices = json.loads(res_response)
    except Exception as e:
        print("Using default residential services due to error:", e)
        residential_subServices = [
            {"title": "Shingling"},
            {"title": "Guttering"},
            {"title": "Ventilation"},
            {"title": "Siding"}
        ]
    
    # Generate commercial subServices using BBB services and defaults.
    # Defaults: "Metal Roof" (replace with BBB info), "Coating" (default), "Single Ply" (from BBB), "Built Up" (from BBB).
    comm_prompt = (
        f"Using the following BBB services: {bbb_services_list}, and the default commercial services "
        f"['Metal Roof', 'Coating', 'Single Ply', 'Built Up'], generate a JSON array (maximum 4 items) "
        f"for commercial sub-services. Ensure that 'Coating' is always included. Output only a JSON array "
        f"where each element is an object with a key 'title'."
    )
    comm_response = generate_with_gpt(comm_prompt)
    try:
        commercial_subServices = json.loads(comm_response)
    except Exception as e:
        print("Using default commercial services due to error:", e)
        commercial_subServices = [
            {"title": "Metal Roof"},
            {"title": "Coating"},
            {"title": "Single Ply"},
            {"title": "Built Up"}
        ]
    
    hero = {
        "mainTitle": business_name.upper(),
        "subTitle": subTitle,
        "residential": {
            "subServices": residential_subServices
        },
        "commercial": {
            "subServices": commercial_subServices
        }
    }
    
    # -----------------------
    # BOOKING SECTION
    # -----------------------
    logo = bbb_data.get("logo_url") or "/assets/images/logo.svg"
    booking = {
        "logo": logo,
        "headerText": "Contact Us!",
        "phone": bbb_data.get("telephone", "(770) 880-1319")
    }
    
    # -----------------------
    # RICHTEXT SECTION
    # -----------------------
    # Generate a hero text based on the business overview.
    overview = bbb_data.get("description", "") + " " + ", ".join(bbb_services_list)
    heroText_prompt = (
        f"Based on the following business overview: '{overview}', generate a catchy hero text for a roofing "
        f"services company."
    )
    heroText = generate_with_gpt(heroText_prompt)
    if not heroText:
        heroText = "We Provide Quality Roofing Services"
    
    # Extract numeric years from years_in_business string
    years_match = re.search(r'\d+', bbb_data.get("years_in_business", "14"))
    years_in_business = f"{years_match.group()} Years in Business" if years_match else "14 Years in Business"
    
    # Generate a business description using BBB profile info.
    desc_prompt = (
        f"Using the following BBB profile information: {bbb_data}, write a compelling business description "
        f"that highlights years of experience and reliability in roofing services."
    )
    bus_description = generate_with_gpt(desc_prompt)
    if not bus_description:
        bus_description = "Reliable roofing services with extensive experience and commitment to quality."
    
    # For now, use default cards. (Later these can be generated via GPT using reviews and profile info.)
    cards = [
        {
            "title": "Rhett ",
            "desc": "Our friendly, knowledgeable staff ensures a seamless experience from start to finish.",
            "icon": "Shield"
        },
        {
            "title": "Quality Craftsmanship",
            "desc": "We deliver top-tier roofing solutions using premium materials for long-lasting results.",
            "icon": "Award"
        },
        {
            "title": "Timely Delivery",
            "desc": "Count on us to complete your project efficiently without compromising on quality.",
            "icon": "Clock"
        },
        {
            "title": "Customer Satisfaction",
            "desc": "Our goal is to exceed your expectations and leave you fully satisfied with our work.",
            "icon": "Heart"
        }
    ]
    
    richText = {
        "heroText": heroText,
        "accredited": bbb_data.get("accredited", True),
        "years_in_business": years_in_business,
        "bus_description": bus_description,
        "cards": cards,
        "images": [
            "/assets/images/Richtext/roof_workers.jpg",
            "/assets/images/Richtext/roof_workers2.jpg",
            "/assets/images/Richtext/roof_workers3.webp"
        ],
        "imageUploads": [
            {"file": None, "fileName": ""},
            {"file": None, "fileName": ""},
            {"file": None, "fileName": ""}
        ]
    }
    
    # -----------------------
    # ABOUT SECTION (DEFAULT)
    # -----------------------
    about = {
        "text": "About Us",
        "buttonLink": "/about",
        "images": [
            "assets/images/roof_slideshow/i1.jpeg",
            "assets/images/roof_slideshow/i2.jpeg",
            "assets/images/roof_slideshow/i3.jpeg",
            "assets/images/roof_slideshow/i4.jpeg",
            "assets/images/roof_slideshow/i5.jpeg",
            "assets/images/roof_slideshow/i6.jpeg",
            "assets/images/roof_slideshow/i7.webp",
            "assets/images/roof_slideshow/i8.webp",
            "assets/images/roof_slideshow/i9.jpeg",
            "assets/images/roof_slideshow/i10.webp",
            "assets/images/roof_slideshow/i11.jpeg",
            "assets/images/roof_slideshow/i12.webp"
        ]
    }
    
    # -----------------------
    # MAP SECTION
    # -----------------------
    # Use GPT to generate lat/lng from the BBB address.
    address = bbb_data.get("address", "40 Tipperary Trail, Sharpsburg, GA 30277").replace("-3502", "").strip()
    latlng_prompt = (
        f"Provide the latitude and longitude for the following address in JSON format as "
        f'{{"lat": <value>, "lng": <value>}}: {address}'
    )
    latlng_response = generate_with_gpt(latlng_prompt)
    try:
        center = json.loads(latlng_response)
    except Exception as e:
        print("Using default lat/lng due to error:", e)
        center = {"lat": 33.422676, "lng": -84.640974}
    
    map_section = {
        "center": center,
        "zoomLevel": 11,
        "circleRadius": 6047,
        "address": address,
        "telephone": bbb_data.get("telephone", "(770) 880-1319"),
        "serviceHours": [
            {"day": "Mon", "time": "08:00 AM - 6:00 PM"},
            {"day": "Tue", "time": "08:00 AM - 6:00 PM"},
            {"day": "Wed", "time": "08:00 AM - 6:00 PM"},
            {"day": "Thu", "time": "08:00 AM - 6:00 PM"},
            {"day": "Fri", "time": "08:00 AM - 6:00 PM"},
            {"day": "Sat", "time": "08:00 AM - 6:00 PM"},
            {"day": "Sun", "time": "CLOSED"}
        ],
        "stats": [
            {"title": "Employees", "value": int(bbb_data.get("number_of_employees", "5")), "icon": "FaUsers"},
            {"title": "Years of Service", "value": int(years_match.group()) if years_match else 10, "icon": "FaCalendarAlt"},
            {"title": "Customers Served", "value": 500, "icon": "FaHandshake"},
            {"title": "Roofs Repaired", "value": 300, "icon": "FaHome"}
        ]
    }
    
    # -----------------------
    # COMBINED PAGE SECTION
    # -----------------------
    # Select the 6 best (highest polarity) positive reviews from the reviews data.
    positive_reviews = [r for r in reviews if r.get("sentiment") == "positive"]
    sorted_reviews = sorted(positive_reviews, key=lambda x: x.get("polarity", 0), reverse=True)
    selected_reviews = sorted_reviews[:6]
    googleReviews = []
    for idx, review in enumerate(selected_reviews):
        review_obj = {
            "name": review.get("name", ""),
            "stars": int(review.get("rating", "5")),
            "date": review.get("date", ""),
            "text": review.get("review_text", "")[:200] + ("..." if len(review.get("review_text", "")) > 200 else ""),
            "logo": "/assets/images/googleimage.png" if idx == 0 else "/assets/images/yelp.png"
        }
        if idx != 0:
            review_obj["link"] = bbb_data.get("website", "https://www.yelp.com")
        googleReviews.append(review_obj)
    
    # For residentialServices, mirror the hero residential subServices with default icons and links.
    icon_map_res = {
        "Shingling": "FaTools",
        "Guttering": "FaTint",
        "Ventilation": "FaFan",
        "Siding": "FaPaintRoller"
    }
    residentialServices = []
    for i, service in enumerate(residential_subServices):
        title = service.get("title", "")
        icon = icon_map_res.get(title, "FaTools")
        residentialServices.append({
            "icon": icon,
            "title": title,
            "link": f"/Residential_service_{i+1}"
        })
    
    # For commercialServices, mirror the hero commercial subServices with default icons and links.
    icon_map_comm = {
        "Metal Roof": "FaTools",
        "Coating": "FaPaintRoller",
        "Single Ply": "FaTools",
        "Built Up": "FaTools"
    }
    commercialServices = []
    for i, service in enumerate(commercial_subServices):
        title = service.get("title", "")
        icon = icon_map_comm.get(title, "FaTools")
        commercialServices.append({
            "icon": icon,
            "title": title,
            "link": f"/CommercialService{i+1}"
        })
    
    combinedPage = {
        "isCommercial": False,
        "title": "Services",
        "googleReviews": googleReviews,
        "residentialServices": residentialServices,
        "commercialServices": commercialServices,
        "largeResidentialImg": "/assets/images/main_image_expanded.jpg",
        "largeCommercialImg": "/assets/images/commercialservices.jpg"
    }
    
    # -----------------------
    # BEFORE AFTER SECTION (DEFAULT)
    # -----------------------
    beforeAfter = {
        "sectionTitle": "GALLERY",
        "items": [
            {
                "before": "/assets/images/beforeafter/a1.jpeg",
                "after": "/assets/images/beforeafter/b1.JPG",
                "shingle": "Asphalt Shingle",
                "sqft": "2000 sqft"
            },
            {
                "before": "./assets/images/beforeafter/b2.jpeg",
                "after": "./assets/images/beforeafter/a2.jpeg",
                "shingle": "Metal Roofing",
                "sqft": "1800 sqft"
            },
            {
                "before": "./assets/images/beforeafter/b3.jpeg",
                "after": "./assets/images/beforeafter/a3.jpeg",
                "shingle": "Composite Shingle",
                "sqft": "2200 sqft"
            }
        ]
    }
    
    # -----------------------
    # EMPLOYEES SECTION
    # -----------------------
    # Update default employee names/roles using bbb profile employee_names.
    default_employees = [
        {"name": "Rob", "role": "Roofer", "image": "/assets/images/roofer.png"},
        {"name": "Alice", "role": "Foreman", "image": "/assets/images/foreman.png"},
        {"name": "Frank", "role": "Estimator", "image": "/assets/images/estimator.png"},
        {"name": "Diana", "role": "Sales Rep", "image": "/assets/images/salesrep.png"},
        {"name": "Garret", "role": "Manager", "image": "/assets/images/manager.png"},
        {"name": "Drew", "role": "Inspector", "image": "/assets/images/inspector.png"}
    ]
    employee_names = bbb_data.get("employee_names", [])
    employees = {"sectionTitle": "OUR TEAM", "employee": []}
    for i, emp_str in enumerate(employee_names):
        parts = emp_str.split(",")
        name = parts[0].strip() if parts else ""
        role = parts[1].strip() if len(parts) > 1 else "Specialist"
        # Use the default image if available
        img = default_employees[i]["image"] if i < len(default_employees) else "/assets/images/employee.png"
        employees["employee"].append({"name": name, "role": role, "image": img})
    # If fewer than 6 employees from BBB, add the remaining default employees.
    while len(employees["employee"]) < 6:
        employees["employee"].append(default_employees[len(employees["employee"])])
    
    # -----------------------
    # FINAL COMPILE
    # -----------------------
    final_json = {
        "hero": hero,
        "booking": booking,
        "richText": richText,
        "about": about,
        "map": map_section,
        "combinedPage": combinedPage,
        "beforeAfter": beforeAfter,
        "employees": employees
    }
    
    with open("combinedData.json", "w") as outfile:
        json.dump(final_json, outfile, indent=2)
    
    print("combinedData.json has been generated successfully.")

if __name__ == "__main__":
    main()
