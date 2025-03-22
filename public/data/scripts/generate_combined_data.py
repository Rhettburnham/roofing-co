#!/usr/bin/env python3

import os
import json
import logging
import time
import random
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
from deepseek_utils import query_deepseek_api

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv('.env')

class CombinedDataGenerator:
    """
    Class to generate comprehensive combined_data.json that powers the roofing website.
    Uses BBB profile data, sentiment reviews, and DeepSeek AI to create comprehensive content.
    """
    
    def __init__(self, bbb_profile_path: str, reviews_path: str, insights_path: str = None):
        """Initialize with paths to various data sources."""
        logger.info("Initializing CombinedDataGenerator")
        
        self.api_key = os.getenv('DEEPSEEK_API_KEY')
        if not self.api_key:
            logger.warning("DeepSeek API key not found in environment variables. Using fallback content.")
        
        logger.info(f"Loading BBB profile from: {bbb_profile_path}")
        self.bbb_profile = self._load_json(bbb_profile_path)
        if not self.bbb_profile:
            logger.warning("BBB profile data is empty or failed to load")
        
        logger.info(f"Loading reviews from: {reviews_path}")
        self.reviews = self._load_json(reviews_path)
        if not self.reviews:
            logger.warning("Reviews data is empty or failed to load")
        
        if insights_path:
            logger.info(f"Loading research insights from: {insights_path}")
            self.insights = self._load_json(insights_path)
            if not self.insights:
                logger.warning("Research insights data is empty or failed to load")
        else:
            logger.info("No insights path provided, skipping insights loading")
            self.insights = {}
        
        # Set output file path relative to project root
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.dirname(script_dir)
        self.output_file = os.path.join(data_dir, "combined_data.json")
        logger.info(f"Output file will be saved to: {self.output_file}")
    
    def _load_json(self, filepath: str) -> Dict[str, Any]:
        """Load and return JSON data from file."""
        logger.debug(f"Attempting to load JSON from: {filepath}")
        try:
            if not os.path.exists(filepath):
                logger.error(f"File does not exist: {filepath}")
                return {}
                
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                logger.debug(f"Successfully loaded JSON data from {filepath}")
                return data
        except FileNotFoundError:
            logger.error(f"File not found: {filepath}")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in file {filepath}: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error loading {filepath}: {str(e)}")
            return {}
    
    def _save_combined_data(self, data: Dict[str, Any]):
        """Save combined data to JSON file."""
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        logger.info(f"Combined data saved to {self.output_file}")
    
    def _extract_business_name(self) -> tuple:
        """
        Extract business name and intelligently split it into main title and subtitle based on DeepSeek analysis.
        If the name is short, don't use a subtitle.
        """
        if not self.bbb_profile:
            return "ROOFING COMPANY", ""
            
        business_name = self.bbb_profile.get('business_name', 'Roofing Company')
        
        # Ask DeepSeek if/how the name should be split
        prompt = f"""
        I have a roofing business name: "{business_name}"
        
        Should this name be split into a main title and subtitle for a website header? If yes, how would you split it?
        
        Some guidelines:
        1. If the name is very short (1-2 words), don't split it and just leave the subtitle empty
        2. If the name contains words like "Construction", "Roofing", "Contractors", "Company", etc., these are good candidates for the subtitle
        3. If the name has a clear brand name followed by a descriptor, split between those
        
        Return your answer as a JSON with two keys:
        - "shouldSplit": boolean (true or false)
        - "mainTitle": string (the main title portion or the entire name if not splitting)
        - "subTitle": string (the subtitle portion, or empty string if not splitting)
        """
        
        response = query_deepseek_api(prompt)
        
        try:
            # Extract JSON from response
            if '{' in response and '}' in response:
                json_str = response[response.find('{'):response.rfind('}')+1]
                result = json.loads(json_str)
                
                should_split = result.get('shouldSplit', False)
                main_title = result.get('mainTitle', business_name)
                sub_title = result.get('subTitle', "")
                
                if should_split:
                    return main_title, sub_title
                else:
                    return business_name, ""
            else:
                # Fallback to simple logic if JSON parsing fails
                return self._simple_business_name_split(business_name)
        except:
            # Fallback to simple logic if JSON parsing fails
            return self._simple_business_name_split(business_name)
            
    def _simple_business_name_split(self, business_name: str) -> tuple:
        """Simple fallback method to split business name."""
        parts = business_name.split()
        if len(parts) <= 2:
            return business_name, ""
        
        # Look for common business suffixes to determine where to split
        suffixes = ["Construction", "Roofing", "Contractors", "Company", "Services", "Inc", "LLC"]
        for i, word in enumerate(parts):
            if any(suffix.lower() in word.lower() for suffix in suffixes) and i > 0:
                return " ".join(parts[:i]), " ".join(parts[i:])
        
        # Default split halfway if no better option is found
        midpoint = len(parts) // 2
        return " ".join(parts[:midpoint]), " ".join(parts[midpoint:])
    
    def _extract_best_reviews(self, count: int = 6) -> List[Dict[str, Any]]:
        """Extract the best reviews based on sentiment and rating."""
        if not self.reviews:
            return []
            
        # Sort reviews by rating and sentiment polarity
        sorted_reviews = sorted(
            self.reviews,
            key=lambda x: (float(x.get('rating', 0)), float(x.get('polarity', 0))),
            reverse=True
        )
        
        # Format the top reviews
        formatted_reviews = []
        for review in sorted_reviews[:count]:
            formatted_review = {
                "name": review.get('name', 'Customer'),
                "stars": int(float(review.get('rating', 5))),
                "date": review.get('date', ''),
                "text": review.get('review_text', ''),
                "logo": "/assets/images/googleimage.png"
            }
            formatted_reviews.append(formatted_review)
            
        return formatted_reviews
    
    def _extract_services(self) -> List[str]:
        """Extract all services from BBB profile."""
        all_services = []
        if 'services' in self.bbb_profile and isinstance(self.bbb_profile['services'], list):
            all_services.extend(self.bbb_profile['services'])
        elif 'services' in self.bbb_profile and isinstance(self.bbb_profile['services'], str):
            all_services.append(self.bbb_profile['services'])
            
        if 'additional_services' in self.bbb_profile and isinstance(self.bbb_profile['additional_services'], list):
            all_services.extend(self.bbb_profile['additional_services'])
            
        return all_services
    
    def _generate_hero_section(self) -> Dict[str, Any]:
        """Generate the hero section data with intelligent services categorization."""
        main_title, sub_title = self._extract_business_name()
        
        # Get services from BBB profile
        all_services = self._extract_services()
        
        # Add default services if we don't have enough
        residential_defaults = ["Shingling", "Roof Repair"]
        commercial_defaults = ["Coating", "Metal Roof"]
        
        # Use DeepSeek to categorize services as residential or commercial
        if all_services:
            services_text = ", ".join(all_services)
            prompt = f"""
            Below is a list of services offered by a roofing company. Please categorize these into Residential and Commercial services.
            If you're not sure, make your best guess based on typical roofing industry patterns.
            
            Services: {services_text}
            
            Return the result as a JSON with two keys: "residential" and "commercial", each containing an array of service names.
            Limit to 4 services maximum for each category. If there aren't enough services for both categories, you can put more in one category.
            """
            
            response = query_deepseek_api(prompt)
            
            try:
                # Extract JSON from response
                if '{' in response and '}' in response:
                    json_str = response[response.find('{'):response.rfind('}')+1]
                    categorized_services = json.loads(json_str)
                    
                    residential_services = categorized_services.get('residential', [])
                    commercial_services = categorized_services.get('commercial', [])
                    
                    # Add default services if we don't have enough
                    if len(residential_services) < 3:
                        for default in residential_defaults:
                            if default not in residential_services:
                                residential_services.append(default)
                                if len(residential_services) >= 4:
                                    break
                    
                    if len(commercial_services) < 3:
                        for default in commercial_defaults:
                            if default not in commercial_services:
                                commercial_services.append(default)
                                if len(commercial_services) >= 4:
                                    break
                else:
                    # Default services if parsing fails
                    residential_services = residential_defaults + ["Ventilation", "Siding"]
                    commercial_services = commercial_defaults + ["Single Ply", "Built Up"]
            except:
                # Default services if parsing fails
                residential_services = residential_defaults + ["Ventilation", "Siding"]
                commercial_services = commercial_defaults + ["Single Ply", "Built Up"]
        else:
            # Default services if none found
            residential_services = residential_defaults + ["Ventilation", "Siding"]
            commercial_services = commercial_defaults + ["Single Ply", "Built Up"]
        
        # Format the hero section
        residential_sub_services = [{"title": service} for service in residential_services[:4]]
        commercial_sub_services = [{"title": service} for service in commercial_services[:4]]
        
        return {
            "mainTitle": main_title.upper(),
            "subTitle": sub_title.upper(),
            "residential": {
                "subServices": residential_sub_services
            },
            "commercial": {
                "subServices": commercial_sub_services
            }
        }
    
    def _generate_booking_section(self) -> Dict[str, Any]:
        """Generate the booking section data with BBB profile data."""
        logger.info("Generating booking section")
        
        phone = self.bbb_profile.get('telephone', "(404) 555-1234")
        
        # Get the logo URL from BBB profile if available
        logo_url = "/assets/images/clipped-cowboy.png"  # Updated default logo path
        
        # Variations of "Contact Us"
        contact_texts = [
            "Contact Us!",
            "Get In Touch!",
            "Reach Out!",
            "Call Us Today!",
            "Request a Quote!"
        ]
        
        header_text = random.choice(contact_texts)
        
        return {
            "logo": logo_url,
            "headerText": header_text,
            "phone": phone
        }
    
    def _get_geocoordinates_from_address(self, address: str) -> tuple:
        """Use DeepSeek to extract approximate latitude and longitude from address."""
        if not address:
            return 33.422676, -84.640974  # Default coordinates for Georgia
            
        prompt = f"""
        I have an address for a roofing business: "{address}"
        
        Can you provide the approximate latitude and longitude coordinates for this address?
        If you're not certain of the exact coordinates, please provide your best estimate based on the city and state.
        
        Return your answer as a JSON with two keys:
        - "lat": float (latitude)
        - "lng": float (longitude)
        """
        
        response = query_deepseek_api(prompt)
        
        try:
            # Extract JSON from response
            if '{' in response and '}' in response:
                json_str = response[response.find('{'):response.rfind('}')+1]
                result = json.loads(json_str)
                
                lat = result.get('lat', 33.422676)
                lng = result.get('lng', -84.640974)
                
                return lat, lng
            else:
                return 33.422676, -84.640974  # Default coordinates
        except:
            return 33.422676, -84.640974  # Default coordinates
    
    def _generate_rich_text_section(self) -> Dict[str, Any]:
        """Generate rich text section content including standardized image paths."""
        logger.info("Generating rich text section")
        
        # Extract business info
        business_name = self.bbb_profile.get('business_name', 'Roofing Company')
        
        # Handle years_in_business correctly - can be either a number or a string like "Years in Business: 11"
        years_data = self.bbb_profile.get('years_in_business', 10)
        if isinstance(years_data, str) and "Years in Business:" in years_data:
            # Extract just the number from the string
            try:
                years = int(years_data.split(":")[-1].strip())
            except ValueError:
                # Fallback if parsing fails
                years = 10
                logger.warning(f"Could not parse years from '{years_data}', using default value of {years}")
        else:
            # Either already a number or a string that's just a number
            try:
                years = int(years_data)
            except (ValueError, TypeError):
                years = 10
                logger.warning(f"Could not convert '{years_data}' to an integer, using default value of {years}")
        
        city = self.bbb_profile.get('city', '')
        accredited = self.bbb_profile.get('accredited', True)
        
        # Updated image paths for rich text section with correct case (Richtext)
        rich_text_images = [
            "/assets/images/Richtext/roof_workers.jpg",
            "/assets/images/Richtext/roof_workers2.jpg",
            "/assets/images/Richtext/roof_workers3.webp"
        ]
        
        try:
            # Generate content with DeepSeek
            prompt = f"""
            Create rich text content for a roofing company website. The company is called '{business_name}' and has been in business for {years} years in {city}.
            
            Create:
            1) Two descriptive paragraphs (30-50 words each) about the company
            2) At least 4 cards highlighting benefits of choosing this company
            
            Return the result as a JSON with:
            - "description1": first paragraph
            - "description2": second paragraph 
            - "cards": array of objects with "title", "desc" (25-40 words), and "icon" (choose from: Certificate, Search, Cloud, ThermometerSnowflake, HeartHandshake, Shield, Clock, Tools, GraduationCap)
            
            Make it sound authentic and unique to this business. Each description should focus on different aspects.
            """
            
            response = query_deepseek_api(prompt)
            
            try:
                # Extract JSON from response
                if '{' in response and '}' in response:
                    json_str = response[response.find('{'):response.rfind('}')+1]
                    content = json.loads(json_str)
                    
                    description1 = content.get('description1', "")
                    description2 = content.get('description2', "")
                    cards = content.get('cards', [])
                    
                    # Ensure we have exactly 4 cards
                    cards = cards[:4]  # Limit to 4 cards
                    
                    # If accredited, replace least important card with BBB card
                    if accredited and len(cards) == 4:
                        # Ask DeepSeek which card to replace
                        cards_text = "\n".join([f"{i+1}. {card.get('title')} - {card.get('desc')}" for i, card in enumerate(cards)])
                        replace_prompt = f"""
                        Here are the current benefit cards for a roofing business website:
                        
                        {cards_text}
                        
                        The business is BBB accredited, which is important to highlight. Which card (by number) should be replaced with a BBB accreditation card? Choose the least impactful card to remove.
                        Return just the number (1-4) of the card to replace.
                        """
                        
                        replace_response = query_deepseek_api(replace_prompt).strip()
                        
                        try:
                            # Try to get the card number to replace
                            card_to_replace = int(replace_response) - 1
                            if 0 <= card_to_replace < len(cards):
                                cards[card_to_replace] = {
                                    "title": "BBB Accredited",
                                    "desc": "Recognized for integrity, transparency and commitment to customer satisfaction by the Better Business Bureau.",
                                    "icon": "Certificate"
                                }
                        except:
                            # If parsing fails, replace the last card
                            cards[-1] = {
                                "title": "BBB Accredited",
                                "desc": "Recognized for integrity, transparency and commitment to customer satisfaction by the Better Business Bureau.",
                                "icon": "Certificate"
                            }
                else:
                    # If JSON parsing fails, use default content
                    description1 = f"{business_name} specializes in premium residential and commercial roofing solutions, offering expert installation, repair, and maintenance services tailored to your specific needs."
                    description2 = f"Our licensed and insured team uses only top-grade materials backed by manufacturer warranties, ensuring your property receives superior protection against the elements for years to come."
                    
                    # Default cards
                    cards = [
                        {
                            "title": "BBB Accredited",
                            "desc": "Recognized for integrity, transparency and commitment to customer satisfaction by the Better Business Bureau.",
                            "icon": "Certificate"
                        },
                        {
                            "title": "Expert Inspections",
                            "desc": "Comprehensive roof assessments to identify damage, leaks, and structural issues before they become costly problems.",
                            "icon": "Search"
                        },
                        {
                            "title": "Weather Protection",
                            "desc": f"Storm-resistant installations designed to withstand high winds, heavy rain, and harsh {city} weather conditions.",
                            "icon": "Cloud"
                        },
                        {
                            "title": "Energy Efficiency",
                            "desc": "Smart roofing solutions that improve insulation and ventilation, reducing your energy costs year-round.",
                            "icon": "ThermometerSnowflake"
                        }
                    ]
            except:
                # Default content if JSON parsing fails
                description1 = f"{business_name} specializes in premium residential and commercial roofing solutions, offering expert installation, repair, and maintenance services tailored to your specific needs."
                description2 = f"Our licensed and insured team uses only top-grade materials backed by manufacturer warranties, ensuring your property receives superior protection against the elements for years to come."
                
                # Default cards
                cards = [
                    {
                        "title": "BBB Accredited",
                        "desc": "Recognized for integrity, transparency and commitment to customer satisfaction by the Better Business Bureau.",
                        "icon": "Certificate"
                    },
                    {
                        "title": "Expert Inspections",
                        "desc": "Comprehensive roof assessments to identify damage, leaks, and structural issues before they become costly problems.",
                        "icon": "Search"
                    },
                    {
                        "title": "Weather Protection",
                        "desc": f"Storm-resistant installations designed to withstand high winds, heavy rain, and harsh {city} weather conditions.",
                        "icon": "Cloud"
                    },
                    {
                        "title": "Energy Efficiency",
                        "desc": "Smart roofing solutions that improve insulation and ventilation, reducing your energy costs year-round.",
                        "icon": "ThermometerSnowflake"
                    }
                ]
        except:
            # Fallback if API fails completely
            description1 = f"{business_name} specializes in premium residential and commercial roofing solutions, offering expert installation, repair, and maintenance services tailored to your specific needs."
            description2 = f"Our licensed and insured team uses only top-grade materials backed by manufacturer warranties, ensuring your property receives superior protection against the elements for years to come."
            
            # Default cards
            cards = [
                {
                    "title": "BBB Accredited",
                    "desc": "Recognized for integrity, transparency and commitment to customer satisfaction by the Better Business Bureau.",
                    "icon": "Certificate"
                },
                {
                    "title": "Expert Inspections",
                    "desc": "Comprehensive roof assessments to identify damage, leaks, and structural issues before they become costly problems.",
                    "icon": "Search"
                },
                {
                    "title": "Weather Protection",
                    "desc": f"Storm-resistant installations designed to withstand high winds, heavy rain, and harsh {city} weather conditions.",
                    "icon": "Cloud"
                },
                {
                    "title": "Energy Efficiency",
                    "desc": "Smart roofing solutions that improve insulation and ventilation, reducing your energy costs year-round.",
                    "icon": "ThermometerSnowflake"
                }
            ]
        
        return {
            "heroText": self._generate_hero_text(business_name, city, years),
            "accredited": accredited,
            "years_in_business": f"{years} Years of Roofing Experience",
            "bus_description": description1,
            "bus_description_second": description2,
            "cards": cards[:4],  # Ensure exactly 4 cards
            "images": rich_text_images,
            "imageUploads": [
                {"file": None, "fileName": ""},
                {"file": None, "fileName": ""},
                {"file": None, "fileName": ""}
            ]
        }
        
    def _generate_hero_text(self, business_name: str, city: str, years: int) -> str:
        """Generate hero text options and select one."""
        hero_text_options = [
            "Professional Roofing Excellence",
            "\"Built to Weather Everything\"",
            f"Trusted {city} Roofing Since {2023-years}",
            "Quality Roofing, Lasting Protection",
            "Your Roof, Our Reputation"
        ]
        return random.choice(hero_text_options)
    
    def _generate_button_section(self) -> Dict[str, Any]:
        """Generate the button section data with standardized image paths."""
        logger.info("Generating button section")
        return {
            "text": "Services",  # Fixed to always be "Services"
            "buttonLink": "/about",
            "images": [
                "/assets/images/roof_slideshow/i1.jpeg",
                "/assets/images/roof_slideshow/i2.jpeg",
                "/assets/images/roof_slideshow/i3.jpeg",
                "/assets/images/roof_slideshow/i4.jpeg",
                "/assets/images/roof_slideshow/i5.jpeg",
                "/assets/images/roof_slideshow/i6.jpeg",
                "/assets/images/roof_slideshow/i7.webp",
                "/assets/images/roof_slideshow/i8.webp",
                "/assets/images/roof_slideshow/i9.jpeg",
                "/assets/images/roof_slideshow/i10.webp",
                "/assets/images/roof_slideshow/i11.jpeg",
                "/assets/images/roof_slideshow/i12.webp"
            ]
        }
    
    def _generate_map_section(self) -> Dict[str, Any]:
        """Generate the map section with location and business stats."""
        # Extract address and determine coordinates
        address = self.bbb_profile.get('address', "")
        phone = self.bbb_profile.get('telephone', "(404) 555-1234")
        
        # Get coordinates from address
        lat, lng = self._get_geocoordinates_from_address(address)
        
        # Extract years in business
        years_text = self.bbb_profile.get('years_in_business', "Years in Business: 5")
        if isinstance(years_text, str) and "Years in Business: " in years_text:
            try:
                years = int(years_text.split(":")[-1].strip())
            except ValueError:
                years = 5
        else:
            try:
                years = int(years_text)
            except (ValueError, TypeError):
                years = 5
        
        # Extract number of employees
        employees = self.bbb_profile.get('number_of_employees', "1")
        if isinstance(employees, str) and employees.isdigit():
            num_employees = int(employees)
        else:
            num_employees = 1
        
        # Prepare stats
        stats = []
        
        # Add years of service if over 5
        if years > 5:
            stats.append({"title": "Years of Service", "value": years, "icon": "FaCalendarAlt"})
        
        # Add employees if over 5
        if num_employees > 5:
            stats.append({"title": "Employees", "value": num_employees, "icon": "FaUsers"})
        
        # Add default stats
        customers_served = years * 50  # Estimate
        roofs_repaired = years * 30    # Estimate
        
        stats.append({"title": "Customers Served", "value": customers_served, "icon": "FaHandshake"})
        stats.append({"title": "Roofs Repaired", "value": roofs_repaired, "icon": "FaHome"})
        
        # If we don't have 4 stats yet, add a default one
        if len(stats) < 4:
            stats.append({"title": "Years of Experience", "value": years, "icon": "FaCalendarAlt"})
        
        # Ensure we only have 4 stats
        stats = stats[:4]
        
        return {
            "center": {
                "lat": lat,
                "lng": lng
            },
            "zoomLevel": 9,  # Changed from 11 to 9 for wider view
            "circleRadius": 6047,  # About 3.75 miles in meters
            "address": address,
            "telephone": phone,
            "serviceHours": [
                {"day": "Mon", "time": "08:00 AM - 6:00 PM"},
                {"day": "Tue", "time": "08:00 AM - 6:00 PM"},
                {"day": "Wed", "time": "08:00 AM - 6:00 PM"},
                {"day": "Thu", "time": "08:00 AM - 6:00 PM"},
                {"day": "Fri", "time": "08:00 AM - 6:00 PM"},
                {"day": "Sat", "time": "08:00 AM - 6:00 PM"},
                {"day": "Sun", "time": "CLOSED"}
            ],
            "stats": stats
        }
    
    def _generate_before_after_section(self) -> Dict[str, Any]:
        """Generate the before/after gallery section with standardized image paths."""
        logger.info("Generating before/after gallery section")
        return {
            "sectionTitle": "GALLERY",
            "items": [
                {
                    "before": "/assets/images/beforeafter/a1.jpeg",
                    "after": "/assets/images/beforeafter/b1.JPG",
                    "shingle": "Asphalt Shingle",
                    "sqft": "2000 sqft"
                },
                {
                    "before": "/assets/images/beforeafter/b2.jpeg",
                    "after": "/assets/images/beforeafter/a2.jpeg",
                    "shingle": "Metal Roofing",
                    "sqft": "1800 sqft"
                },
                {
                    "before": "/assets/images/beforeafter/b3.jpeg",
                    "after": "/assets/images/beforeafter/a3.jpeg",
                    "shingle": "Composite Shingle",
                    "sqft": "2200 sqft"
                }
            ]
        }
    
    def _generate_employees_section(self) -> Dict[str, Any]:
        """Generate the employees section with team members from BBB profile with standardized image paths."""
        logger.info("Generating employees section")
        # Get employee names from BBB profile
        employee_names = self.bbb_profile.get('employee_names', [])
        
        # Process actual employees from BBB profile
        processed_employees = []
        for emp in employee_names:
            if ',' in emp:
                name, role = emp.split(',', 1)
                processed_employees.append({
                    "name": name.strip(),
                    "role": role.strip(),
                    "image": "/assets/images/team/roofer.png" if "owner" in role.lower() else "/assets/images/team/foreman.png"
                })
        
        # Default employees to fill remaining slots
        default_employees = [
            {"name": "Frank", "role": "Estimator", "image": "/assets/images/team/estimator.png"},
            {"name": "Diana", "role": "Sales Rep", "image": "/assets/images/team/salesrep.png"},
            {"name": "Garret", "role": "Manager", "image": "/assets/images/team/manager.png"},
            {"name": "Drew", "role": "Inspector", "image": "/assets/images/team/inspector.png"},
        ]
        
        # Fill remaining slots to have 6 total employees
        remaining_slots = 6 - len(processed_employees)
        if remaining_slots > 0:
            # Randomly select from default employees without exceeding available defaults
            selected_defaults = random.sample(default_employees, min(remaining_slots, len(default_employees)))
            processed_employees.extend(selected_defaults)

        return {
            "sectionTitle": "OUR TEAM",
            "employee": processed_employees
        }
    
    def _generate_combined_page_section(self) -> Dict[str, Any]:
        """Generate combined page section with review and service data."""
        logger.info("Generating combined page section")
        
        # Extract the best reviews
        reviews = self._extract_best_reviews()
        
        # Get hero data, which contains services
        hero_data = self._generate_hero_section()
        residential_services = hero_data.get('residential', {}).get('subServices', [])
        commercial_services = hero_data.get('commercial', {}).get('subServices', [])
        
        # Add icons and links to services
        residential_icons = ["FaHardHat", "FaHome", "FaTools", "FaBroom"]
        commercial_icons = ["FaPaintRoller", "FaBuilding", "FaWarehouse", "FaChimney"]
        
        # Process residential services
        residential_with_icons = []
        for idx, service in enumerate(residential_services):
            icon = residential_icons[idx % len(residential_icons)]
            slug = service['title'].lower().replace(' ', '-')
            residential_with_icons.append({
                "icon": icon,
                "title": service['title'],
                "link": f"/residential/{slug}"
            })
        
        # Process commercial services
        commercial_with_icons = []
        for idx, service in enumerate(commercial_services):
            icon = commercial_icons[idx % len(commercial_icons)]
            slug = service['title'].lower().replace(' ', '-')
            commercial_with_icons.append({
                "icon": icon,
                "title": service['title'],
                "link": f"/commercial/{slug}"
            })
            
        # Get employee names for team section
        employee_names = []
        if 'employee_names' in self.bbb_profile and isinstance(self.bbb_profile['employee_names'], list):
            employee_names = self.bbb_profile['employee_names']
            
        # If we have no employee names, use placeholders
        if not employee_names:
            employee_names = ["John Smith, Owner", "Jane Doe, Project Manager"]
            
        return {
            "isCommercial": False,
            "title": "Services",
            "googleReviews": reviews,
            "residentialServices": residential_with_icons,
            "commercialServices": commercial_with_icons,
            "teamTitle": "Leadership",
            "teamMembers": employee_names,
            "largeResidentialImg": "/assets/images/main_image_expanded.jpg",
            "largeCommercialImg": "/assets/images/commercialservices.jpg"
        }
    
    def generate_combined_data(self) -> Dict[str, Any]:
        """Generate the complete combined data structure including all required media paths."""
        logger.info("Starting to generate combined data...")
        
        try:
            # Generate all sections
            combined_data = {
                "hero": self._generate_hero_section(),
                "booking": self._generate_booking_section(),
                "richText": self._generate_rich_text_section(),
                "button": self._generate_button_section(),
                "map": self._generate_map_section(),
                "combinedPage": self._generate_combined_page_section(),
                "beforeAfter": self._generate_before_after_section(),
                "employees": self._generate_employees_section()
            }
            
            # Save the combined data
            self._save_combined_data(combined_data)
            logger.info("Combined data generation complete with all media paths")
            
            return combined_data
            
        except Exception as e:
            logger.error(f"Error generating combined data: {str(e)}", exc_info=True)
            raise

def main():
    try:
        # File paths - updated to point to correct locations
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.dirname(script_dir)  # public/data directory
        
        bbb_profile_path = os.path.join(data_dir, "bbb_profile_data.json")
        reviews_path = os.path.join(data_dir, "sentiment_reviews.json")
        insights_path = os.path.join(script_dir, "roofing_business_insights.json")
        
        # Check if files exist before proceeding
        for path, name in [(bbb_profile_path, "bbb_profile_data.json"), 
                          (reviews_path, "sentiment_reviews.json")]:
            if not os.path.exists(path):
                print(f"Error: Required file not found: {name}")
                print(f"Expected location: {path}")
                print("\nPlease ensure the data files are in the correct location:")
                print("- bbb_profile_data.json should be in public/data/")
                print("- sentiment_reviews.json should be in public/data/")
                print("- roofing_business_insights.json should be in public/data/scripts/")
                return
        
        # Create generator and run generation
        generator = CombinedDataGenerator(bbb_profile_path, reviews_path, insights_path)
        combined_data = generator.generate_combined_data()
        
        print("\n---- Combined Data Generation Complete ----")
        print(f"Data saved to {generator.output_file}")
        
        # Print confirmation of sections generated
        print("\nGenerated sections:")
        for section in combined_data.keys():
            print(f"- {section}")
        
        # Print the paths used
        print("\nData files used:")
        print(f"BBB Profile: {bbb_profile_path}")
        print(f"Reviews: {reviews_path}")
        print(f"Insights: {insights_path}")
    
    except Exception as e:
        logger.error(f"Error generating combined data: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main() 