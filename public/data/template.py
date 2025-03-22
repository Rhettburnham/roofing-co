#!/usr/bin/env python3

import json
import re
import openai
from geopy.geocoders import Nominatim
from datetime import datetime

# 1. Set up your OpenAI API key (manually for testing purposes)
# IMPORTANT: For production, avoid hardcoding keys; use environment variables or secure key management.
openai.api_key = "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"  # Replace with your test API key


def geocode_address(address):
    """Geocodes the given address and returns its latitude and longitude."""
    geolocator = Nominatim(user_agent="business_mapper")
    location = geolocator.geocode(address)
    if location:
        return (location.latitude, location.longitude)
    return (None, None)


def generate_with_gpt(prompt):
    """
    Sends a prompt to GPT-4 via openai.ChatCompletion.create and 
    returns the model's response text.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,    # Adjust as needed
            max_tokens=150      # Adjust as needed
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating GPT response: {e}")
        return "Fallback content if error occurs."


def main():
    # Load data sources
    with open('bbb_profile_data.json') as f:
        bbb_data = json.load(f)
    with open('sentiment_reviews.json') as f:
        reviews = json.load(f)

    # Extract business info
    years_in_business = int(re.search(r'\d+', bbb_data['years_in_business']).group())
    employee_count = int(bbb_data['number_of_employees'])

    # Generate Hero section
    hero_section = {
        "Logo": bbb_data.get('logo_filename', '/assets/images/logo.svg'),
        "bus_name": bbb_data['business_name'],
        "Rich_text": {
            "Header": generate_with_gpt(
                f"Create a catchy 8-10 word slogan for {bbb_data['business_name']} "
                f"specializing in {bbb_data['services'][0]}"
            ),
            "Description": generate_with_gpt(
                f"Create a 40-word description for {bbb_data['business_name']} with "
                f"{years_in_business} years experience in {bbb_data['services'][0]}. "
                f"Include key strengths from these reviews: {reviews[:3]}"
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
        "Accredited": bbb_data['accredited'],
        "BBB_rating": bbb_data['bbb_rating']
    }

    # Generate Cards
    icon_mapping = {
        'roof': 'roof-icon.png',
        'siding': 'siding-icon.png',
        'repair': 'tools-icon.png',
        'construction': 'hammer-icon.png'
    }

    cards_section = []
    for service in bbb_data['services'][:4]:
        service_key = next((k for k in icon_mapping if k in service.lower()), 'default')
        cards_section.append({
            "Icon": f"/assets/icons/{icon_mapping.get(service_key, 'default-icon.png')}",
            "Title": generate_with_gpt(f"Create a 3-5 word title for {service} service"),
            "Description": generate_with_gpt(f"Create a 15-word description for {service}"),
            "About_button": {
                "Text": "About Us",
                "Image": "/assets/images/roof_slideshow/i1.jpeg"
            }
        })

    # Process Map
    lat, lng = geocode_address(bbb_data['address'])
    map_section = {
        "Text": "Are We in your area?",
        "Lat": lat,
        "Lng": lng,
        "Address": bbb_data['address'],
        "Phone": bbb_data['telephone'],
        "circleRadius": "6047"
    }

    # Generate Stats
    stats_section = [
        {"Icon": "employee-icon.png", "Number": employee_count, "Text": "Expert Team Members"},
        {"Icon": "calendar-icon.png", "Number": years_in_business, "Text": "Years Experience"},
        {"Icon": "customer-icon.png", "Number": 2500, "Text": "Customers Served"},
        {"Icon": "review-icon.png", "Number": len(reviews), "Text": "5-Star Reviews"}
    ]

    # Service Hours
    service_hours = {
        "Mon": "9:00 AM - 5:00 PM",
        "Tue": "9:00 AM - 5:00 PM",
        "Wed": "9:00 AM - 5:00 PM",
        "Thu": "9:00 AM - 5:00 PM",
        "Fri": "9:00 AM - 5:00 PM",
        "Sat": "Closed",
        "Sun": "Closed"
    }

    # Process Employees
    employees_section = {
        "Header": "Our Team",
        "Team": [
            {
                "Name": re.sub(r',.*', '', emp),
                "Role": re.search(r',\s*(.*)', emp).group(1) if ',' in emp else "Specialist",
                "Position": "Field Operations"
            }
            for emp in bbb_data['employee_names']
        ]
    }

    # Process Testimonials
    # Only keep positive reviews, sort by polarity descending, then limit to 6
    positive_reviews = [r for r in reviews if r['sentiment'] == 'positive']
    testimonials_section = [
        {
            "Name": r['name'],
            "Date": r['date'],
            "Stars": int(r['rating']),
            "text": r['review_text'][:200] + "..." if len(r['review_text']) > 200 else r['review_text']
        }
        for r in sorted(positive_reviews, key=lambda x: x['polarity'], reverse=True)[:6]
    ]

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
            "phone": bbb_data['telephone']
        },
        "Combined_page": {
            "Residential": [
                {
                    "Title": s,
                    "icon": f"/assets/icons/{icon_mapping.get(s.lower(), 'default-icon.png')}"
                }
                for s in bbb_data['services'][:2]
            ],
            "Commercial": [
                {
                    "Title": s,
                    "icon": f"/assets/icons/{icon_mapping.get(s.lower(), 'default-icon.png')}"
                }
                for s in bbb_data['services'][2:4]
            ]
        },
        "Testimonials": testimonials_section,
        "Employees": employees_section
    }

    # Save to file
    with open('combinedData.json', 'w') as f:
        json.dump(combined_data, f, indent=2)

    print("combined_data.json has been generated successfully.")


if __name__ == "__main__":
    main()
