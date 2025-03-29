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
        
        # Load services from the shared roofing_services.json
        self.services = self._load_services()
        
        # Set output file path relative to project root
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.dirname(script_dir)
        self.output_file = os.path.join(data_dir, "combined_data.json")
        logger.info(f"Output file will be saved to: {self.output_file}")
    
    def _load_services(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load services from the shared roofing_services.json file."""
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.dirname(script_dir)
        services_path = os.path.join(data_dir, "roofing_services.json")
        
        # Default services in case the file doesn't exist
        default_services = {
            "residential": [
                {"id": 1, "name": "Asphalt Shingle Roofing"},
                {"id": 2, "name": "Metal Roof Installation"},
                {"id": 3, "name": "Roof Leak Repair"},
                {"id": 4, "name": "Roof Inspection & Maintenance"}
            ],
            "commercial": [
                {"id": 1, "name": "Flat Roof Systems"},
                {"id": 2, "name": "TPO Membrane Roofing"},
                {"id": 3, "name": "Commercial Roof Restoration"},
                {"id": 4, "name": "Industrial Roof Maintenance"}
            ]
        }
        
        try:
            if os.path.exists(services_path):
                with open(services_path, 'r', encoding='utf-8') as f:
                    services = json.load(f)
                logger.info(f"Successfully loaded services from {services_path}")
                return services
            else:
                logger.warning(f"Services file not found at {services_path}, using default services")
                return default_services
        except Exception as e:
            logger.error(f"Error loading services file: {e}")
            return default_services
    
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
    
    def _generate_hero_section(self) -> Dict[str, Any]:
        """Generate the hero section data with services from the shared services data."""
        main_title, sub_title = self._extract_business_name()
        
        # Get services from the shared services data
        residential_services = self.services.get('residential', [])
        commercial_services = self.services.get('commercial', [])
        
        # Format the services for the hero section
        residential_sub_services = [{"title": service.get('name', '')} for service in residential_services]
        commercial_sub_services = [{"title": service.get('name', '')} for service in commercial_services]
        
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
        """Generate the booking section info with a logo from the BBB profile."""
        logger.info("Generating booking section")
        
        # Get phone number from BBB profile or use a default
        phone = self.bbb_profile.get('phone', "(404) 227-5000")
            
        # Format phone number if needed here
            
        return {
            "logo": "/assets/images/logo/clipped.png",
            "headerText": "Call Us Today!",
            "phone": phone
        }
    
    def _generate_map_section(self) -> Dict[str, Any]:
        """Generate the map section with BBB profile data."""
        
        # Get business address and service area from BBB profile
        address = self.bbb_profile.get('address', "123 Main St, Anytown, USA")
        
        if address.strip() == "":
            address = "40 Tipperary TrlSharpsburg, GA 30277-3502"  # Default address if not provided
        
        # Get coordinates (lat, lng) from address
        lat, lng = self._get_geocoordinates_from_address(address)
        
        # Get service hours from BBB profile
        hours = self.bbb_profile.get('service_hours', [])
        
        # Format service hours or use defaults
        formatted_hours = []
        if hours and isinstance(hours, list):
            # Loop through existing hours and format them
            formatted_hours = hours
        else:
            # Default hours if none found
            formatted_hours = [
                {"day": "Mon", "time": "08:00 AM - 6:00 PM"},
                {"day": "Tue", "time": "08:00 AM - 6:00 PM"},
                {"day": "Wed", "time": "08:00 AM - 6:00 PM"},
                {"day": "Thu", "time": "08:00 AM - 6:00 PM"},
                {"day": "Fri", "time": "08:00 AM - 6:00 PM"},
                {"day": "Sat", "time": "08:00 AM - 6:00 PM"},
                {"day": "Sun", "time": "CLOSED"}
            ]
        
        # Generate stats based on business data
        years_in_business = self.bbb_profile.get('years_in_business', 10)
        if isinstance(years_in_business, str) and ":" in years_in_business:
            # Extract just the number if it's in format "Years in Business: 10"
            try:
                years_in_business = int(years_in_business.split(":")[-1].strip())
            except:
                years_in_business = 10
                
        # Round up customers served and roofs repaired based on years
        customers_served = round(years_in_business * 50, -1)  # approx 50 customers per year, rounded to nearest 10
        roofs_repaired = round(years_in_business * 30, -1)  # approx 30 roofs per year, rounded to nearest 10
        
        # Map stats with years of experience
        stats = [
            {"title": "Years of Service", "value": years_in_business, "icon": "FaCalendarAlt"},
            {"title": "Customers Served", "value": customers_served, "icon": "FaHandshake"},
            {"title": "Roofs Repaired", "value": roofs_repaired, "icon": "FaHome"},
            {"title": "Years of Experience", "value": years_in_business, "icon": "FaCalendarAlt"}
        ]
        
        # Get phone number
        phone = self.bbb_profile.get('phone', "(404) 227-5000")
        
        # Map marker/pin icon
        marker_icon = "/assets/images/logo/clipped.png"
        
        return {
            "center": {
                "lat": lat,
                "lng": lng
            },
            "zoomLevel": 9,
            "circleRadius": 6047,  # 6047 meters (approx. 3.75 miles)
            "address": address,
            "telephone": phone,
            "serviceHours": formatted_hours,
            "stats": stats,
            "markerIcon": marker_icon
        }
    
    def _generate_combined_page_section(self) -> Dict[str, Any]:
        """Generate combined page section with review and service data from shared services file."""
        logger.info("Generating combined page section")
        
        # Extract the best reviews
        reviews = self._extract_best_reviews()
        
        # Get services from the shared services data
        residential_services = self.services.get('residential', [])
        commercial_services = self.services.get('commercial', [])
        
        # Add icons and links to services
        residential_icons = ["FaHardHat", "FaHome", "FaTools", "FaBroom"]
        commercial_icons = ["FaPaintRoller", "FaBuilding", "FaWarehouse", "FaChimney"]
        
        # Process residential services
        residential_with_icons = []
        for idx, service in enumerate(residential_services):
            icon = residential_icons[idx % len(residential_icons)]
            service_name = service.get('name', '')
            slug = service_name.lower().replace(' ', '-')
            residential_with_icons.append({
                "icon": icon,
                "title": service_name,
                "link": f"/residential/{slug}"
            })
        
        # Process commercial services
        commercial_with_icons = []
        for idx, service in enumerate(commercial_services):
            icon = commercial_icons[idx % len(commercial_icons)]
            service_name = service.get('name', '')
            slug = service_name.lower().replace(' ', '-')
            commercial_with_icons.append({
                "icon": icon,
                "title": service_name,
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
        
        # Standardized image paths for rich text section
        rich_text_images = [
            "/assets/images/Richtext/roof_workers.jpg",
            "/assets/images/Richtext/roof_workers2.jpg",
            "/assets/images/Richtext/roof_workers3.webp"
        ]
        
        # Make sure the images property is properly set to ensure slideshow functionality
        imageUploads = [
            {"file": None, "fileName": ""},
            {"file": None, "fileName": ""},
            {"file": None, "fileName": ""}
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

def main():
    """Main entry point for the script."""
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    raw_data_dir = os.path.join(data_dir, "raw_data")
    
    # Input files from previous steps
    bbb_profile_path = os.path.join(raw_data_dir, "step_1", "bbb_profile_data.json")
    reviews_path = os.path.join(raw_data_dir, "step_2", "sentiment_reviews.json")
    insights_path = os.path.join(raw_data_dir, "step_2", "roofing_business_insights.json")
    
    # Ensure output directory exists
    output_dir = os.path.join(raw_data_dir, "step_4")
    os.makedirs(output_dir, exist_ok=True)
    
    # Read clipped logo from step_3
    clipped_logo_path = os.path.join(raw_data_dir, "step_3", "clipped.png")
    if not os.path.exists(clipped_logo_path):
        # Try the root raw_data directory as fallback
        clipped_logo_path = os.path.join(raw_data_dir, "clipped.png")
        
    logger.info(f"Using bbb_profile_path: {bbb_profile_path}")
    logger.info(f"Using reviews_path: {reviews_path}")
    logger.info(f"Using insights_path: {insights_path}")
    logger.info(f"Using clipped_logo_path: {clipped_logo_path}")
    
    # Initialize and run the generator
    generator = CombinedDataGenerator(
        bbb_profile_path=bbb_profile_path,
        reviews_path=reviews_path,
        insights_path=insights_path
    )
    
    # Set the output file to be in the step_4 directory
    generator.output_file = os.path.join(output_dir, "combined_data.json")
    
    # Run the generation process
    generator.generate()
    
if __name__ == "__main__":
    main()