#!/usr/bin/env python3

import os
import json
import logging
import time
import random
import re
from typing import Dict, Any, List, Optional, Tuple
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
    Uses a template approach where placeholder variables are replaced with actual data.
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
        
        # Load template file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.template_file = os.path.join(script_dir, "template_data.json")
        
        # Set output file path relative to project root
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
    
    def _extract_business_name(self) -> Tuple[str, str]:
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
            
    def _simple_business_name_split(self, business_name: str) -> Tuple[str, str]:
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
                "logo": "/assets/images/hero/googleimage.png",
                "link": "https://www.google.com/maps"
            }
            formatted_reviews.append(formatted_review)
            
        return formatted_reviews
    
    def _generate_rich_text_hero(self, business_name: str) -> str:
        """Generate hero text for rich text section."""
        templates = [
            f"Expert Roofs, Trusted Craftsmanship",
            f"Quality Roofing Solutions by {business_name}",
            f"Protecting Your Home with Excellence",
            f"Reliable Roofing for Every Season"
        ]
        return random.choice(templates)
    
    def _get_geocoordinates_from_address(self, address: str) -> Tuple[float, float]:
        """
        Get geocoordinates (latitude, longitude) from address using DeepSeek API.
        
        Since we don't have direct access to mapping APIs, we'll use DeepSeek to
        estimate the coordinates based on the address.
        """
        prompt = f"""
        Please provide latitude and longitude coordinates for this address: {address}
        
        Return only the coordinates as a JSON with 'lat' and 'lng' keys.
        Example: {{"lat": 33.7490, "lng": -84.3880}}
        
        Do not include any additional information or explanation, just the JSON.
        """
        
        response = query_deepseek_api(prompt)
        
        try:
            # Extract JSON from response
            if '{' in response and '}' in response:
                json_str = response[response.find('{'):response.rfind('}')+1]
                result = json.loads(json_str)
                
                lat = result.get('lat', 33.7490)  # Default to Atlanta coordinates
                lng = result.get('lng', -84.3880)
                
                return lat, lng
            else:
                # Default to Atlanta coordinates if parsing fails
                return 33.7490, -84.3880
        except:
            # Default to Atlanta coordinates if any error occurs
            return 33.7490, -84.3880
    
    def _extract_city_from_address(self, address: str) -> str:
        """Extract city from address string."""
        # Try simple pattern matching for city extraction
        city_pattern = r'(?:,\s*|\s+)([A-Za-z\s]+)(?:,\s*[A-Z]{2}|$)'
        match = re.search(city_pattern, address)
        if match:
            city = match.group(1).strip()
            if city and len(city) > 2:  # Ensure we have a reasonable city name
                return city
        
        # Default city if extraction fails
        return "Atlanta"
    
    def _generate_about_history(self, business_name: str, years: int, city: str) -> str:
        """Generate company history paragraph for about page."""
        current_year = 2023  # Hardcoded for consistency, can be updated to use datetime
        founded_year = current_year - years
        
        history = f"Founded in {founded_year}, {business_name} has been serving the {city} community with top-tier roofing solutions for nearly a decade. What started as a small, family-owned business has grown into a trusted name in the industry, known for quality craftsmanship and exceptional customer service. Over the years, we've tackled everything from minor repairs to full roof replacements, earning a reputation for reliability and attention to detail. Our deep roots in {city} drive our commitment to protecting homes and businesses with durable, weather-resistant roofing systems tailored to the region's unique climate."
        
        return history
    
    def _generate_about_mission(self, business_name: str) -> str:
        """Generate mission statement for about page."""
        mission = f"Our mission is to deliver superior roofing solutions with integrity, precision, and care. We strive to exceed expectations by combining expert craftsmanship with personalized service, ensuring every project—big or small—is built to last and backed by our unwavering commitment to quality."
        
        return mission
    
    def _format_employee_data(self) -> List[Dict[str, Any]]:
        """Format employee data from BBB profile."""
        formatted_employees = []
        
        # Extract employee names from BBB profile
        employee_names = []
        if 'employee_names' in self.bbb_profile and isinstance(self.bbb_profile['employee_names'], list):
            employee_names = self.bbb_profile['employee_names']
        
        # Default photos to use
        photos = [
            "/assets/images/team/roofer.png",
            "/assets/images/team/foreman.png",
            "/assets/images/team/estimator.png",
            "/assets/images/team/salesrep.png",
            "/assets/images/team/manager.png",
            "/assets/images/team/inspector.png"
        ]
        
        # Default positions if not included in the employee name
        positions = ["Owner", "Manager", "Estimator", "Sales Rep", "Inspector", "Foreman"]
        
        # Format each employee
        for i, name in enumerate(employee_names[:6]):  # Limit to 6 employees
            # Try to extract position from name if it contains a comma
            position = positions[i % len(positions)]
            if ',' in name:
                name_parts = name.split(',', 1)
                employee_name = name_parts[0].strip()
                # Use position from the name if available, otherwise use default
                if len(name_parts) > 1 and name_parts[1].strip():
                    position = name_parts[1].strip()
            else:
                employee_name = name
            
            formatted_employees.append({
                "name": employee_name,
                "role": position,
                "image": photos[i % len(photos)]
            })
        
        # If no employees found, add default placeholders
        if not formatted_employees:
            formatted_employees = [
                {
                    "name": "John Smith",
                    "role": "Owner",
                    "image": "/assets/images/team/roofer.png"
                },
                {
                    "name": "Jane Doe",
                    "role": "Manager",
                    "image": "/assets/images/team/foreman.png"
                }
            ]
        
        return formatted_employees
    
    def _format_and_add_slugs_to_services(self, services_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Dict[str, List[Dict[str, Any]]]]:
        """
        Format services data and add slugs for the hero section and combined page.
        Returns data formatted for both hero section and combined page.
        """
        result = {
            "hero": {
                "residential": [],
                "commercial": []
            },
            "combined": {
                "residential": [],
                "commercial": []
            }
        }
        
        # Icons for combined page
        residential_icons = ["FaHardHat", "FaHome", "FaTools", "FaBroom"]
        commercial_icons = ["FaPaintRoller", "FaBuilding", "FaWarehouse", "FaChimney"]
        
        # Process residential services
        for idx, service in enumerate(services_data.get("residential", [])):
            service_id = service.get("id", idx + 1)
            service_name = service.get("name", f"Service {service_id}")
            
            # Create slug - replace spaces with hyphens and make lowercase
            slug = f"residential-{service_id}-{service_name.lower().replace(' ', '-')}"
            
            # Add to hero format
            result["hero"]["residential"].append({
                "title": service_name,
                "slug": slug
            })
            
            # Add to combined page format with icon
            icon = residential_icons[idx % len(residential_icons)]
            result["combined"]["residential"].append({
                "icon": icon,
                "title": service_name,
                "link": f"/services/{slug}"
            })
        
        # Process commercial services
        for idx, service in enumerate(services_data.get("commercial", [])):
            service_id = service.get("id", idx + 1)
            service_name = service.get("name", f"Service {service_id}")
            
            # Create slug
            slug = f"commercial-{service_id}-{service_name.lower().replace(' ', '-')}"
            
            # Add to hero format
            result["hero"]["commercial"].append({
                "title": service_name,
                "slug": slug
            })
            
            # Add to combined page format with icon
            icon = commercial_icons[idx % len(commercial_icons)]
            result["combined"]["commercial"].append({
                "icon": icon,
                "title": service_name,
                "link": f"/services/{slug}"
            })
        
        return result
    
    def _generate_booking_header(self) -> str:
        """Generate a short, 1-3 word booking header text."""
        options = [
            "Call Us Today!",
            "Contact Us",
            "Get a Quote",
            "Free Estimate",
            "Roof Help?",
            "Need Service?"
        ]
        return random.choice(options)
    
    def _generate_gallery_title(self) -> str:
        """Generate a 1-2 word variation for the gallery section title."""
        options = [
            "GALLERY",
            "PORTFOLIO",
            "SHOWCASE",
            "OUR WORK",
            "PROJECTS"
        ]
        return random.choice(options)
    
    def _generate_team_section_title(self) -> str:
        """Generate a 1-2 word variation for the team members section title."""
        options = [
            "TEAM MEMBERS",
            "OUR TEAM",
            "CREW",
            "EXPERTS",
            "PROFESSIONALS"
        ]
        return random.choice(options)
    
    def generate(self):
        """Generate the combined data by populating the template with actual data."""
        logger.info("Starting generation of combined data")
        
        try:
            # Load template
            if not os.path.exists(self.template_file):
                logger.error(f"Template file not found: {self.template_file}")
                return
            
            with open(self.template_file, 'r', encoding='utf-8') as f:
                template_data = json.load(f)
            
            logger.info("Template loaded successfully")
            
            # Extract data from BBB profile and other sources
            business_name = self.bbb_profile.get('business_name', 'Roofing Company')
            main_title, sub_title = self._extract_business_name()
            address = self.bbb_profile.get('address', "123 Main St, Atlanta, GA")
            city = self._extract_city_from_address(address)
            phone = self.bbb_profile.get('telephone', "(404) 227-5000")
            accredited = self.bbb_profile.get('accredited', True)
            
            # Parse years in business
            years_data = self.bbb_profile.get('years_in_business', 10)
            if isinstance(years_data, str) and ":" in years_data:
                try:
                    years = int(years_data.split(":")[-1].strip())
                except ValueError:
                    years = 10
            else:
                try:
                    years = int(years_data)
                except (ValueError, TypeError):
                    years = 10
            
            # Get geocoordinates
            lat, lng = self._get_geocoordinates_from_address(address)
            
            # Calculate stats
            customers_served = round(years * 50, -1)
            roofs_repaired = round(years * 30, -1)
            completed_projects = round(years * 55, -1)
            happy_clients = round(years * 45, -1)
            team_members_count = min(8, 2 + years // 2)  # Scale team size with years
            
            # Format services
            formatted_services = self._format_and_add_slugs_to_services(self.services)
            
            # Extract reviews
            reviews = self._extract_best_reviews()
            
            # Generate about page content
            about_history = self._generate_about_history(business_name, years, city)
            about_mission = self._generate_about_mission(business_name)
            
            # Generate rich text content
            rich_text_hero = self._generate_rich_text_hero(business_name)
            rich_text_desc1 = f"{business_name} has been a trusted name in the roofing industry for {years} years, delivering exceptional craftsmanship and reliability. Specializing in residential and commercial roofing, we combine time-tested techniques with modern materials to ensure durability, aesthetic appeal, and long-lasting protection for your property."
            rich_text_desc2 = f"At {business_name}, we pride ourselves on personalized service and unwavering integrity. Our skilled team handles every project with meticulous attention to detail, from initial inspection to final installation. Customer satisfaction is our top priority, and we stand behind our work with industry-leading warranties and transparent communication."
            
            # Format employees for team sections
            employee_data = self._format_employee_data()
            
            # Generate section titles variations
            booking_header = self._generate_booking_header()
            gallery_title = self._generate_gallery_title()
            team_section_title = self._generate_team_section_title()
            
            # Apply all replacements to the template data
            
            # 1. Hero section
            template_data["hero"]["mainTitle"] = main_title.upper()
            template_data["hero"]["subTitle"] = sub_title.upper()
            template_data["hero"]["residential"]["subServices"] = formatted_services["hero"]["residential"]
            template_data["hero"]["commercial"]["subServices"] = formatted_services["hero"]["commercial"]
            
            # 2. About page
            template_data["aboutPage"]["title"] = f"{business_name}: {city}'s Trusted Roofing Experts"
            template_data["aboutPage"]["history"] = about_history
            template_data["aboutPage"]["mission"] = about_mission
            # Update city in Community Focus value
            for value in template_data["aboutPage"]["values"]:
                if value["title"] == "Community Focus":
                    value["description"] = value["description"].replace("{{CITY}}", city)
            # Update stats
            for stat in template_data["aboutPage"]["stats"]:
                if stat["title"] == "Years in Business":
                    stat["value"] = years
                elif stat["title"] == "Completed Projects":
                    stat["value"] = completed_projects
                elif stat["title"] == "Happy Clients":
                    stat["value"] = happy_clients
                elif stat["title"] == "Team Members":
                    stat["value"] = team_members_count
            # Add team members
            template_data["aboutPage"]["team"] = employee_data[:2]  # Just use the first two for leadership
            
            # 3. Booking section
            template_data["booking"]["phone"] = phone
            template_data["booking"]["headerText"] = booking_header
            
            # 4. Rich text section
            template_data["richText"]["heroText"] = rich_text_hero
            template_data["richText"]["accredited"] = accredited
            template_data["richText"]["years_in_business"] = f"{years} Years of Roofing Experience"
            template_data["richText"]["bus_description"] = rich_text_desc1
            template_data["richText"]["bus_description_second"] = rich_text_desc2
            # Update years in Expert Craftsmanship card
            for card in template_data["richText"]["cards"]:
                if card["title"] == "Expert Craftsmanship":
                    card["desc"] = card["desc"].replace("{{YEARS_IN_BUSINESS}}", str(years))
            
            # If accredited, make sure BBB card is included, otherwise replace it
            if not accredited:
                # Find and replace the BBB card with an alternative
                for i, card in enumerate(template_data["richText"]["cards"]):
                    if card["title"] == "BBB Accredited":
                        template_data["richText"]["cards"][i] = {
                            "title": "Satisfaction Guaranteed",
                            "desc": "Our commitment to excellence means we stand behind every project, ensuring your complete satisfaction with our workmanship.",
                            "icon": "ThumbsUp"
                        }
                        break
            
            # 5. Map section
            template_data["map"]["center"]["lat"] = lat
            template_data["map"]["center"]["lng"] = lng
            template_data["map"]["address"] = address
            template_data["map"]["telephone"] = phone
            for stat in template_data["map"]["stats"]:
                if stat["title"] == "Years of Service" or stat["title"] == "Years of Experience":
                    stat["value"] = years
                elif stat["title"] == "Customers Served":
                    stat["value"] = customers_served
                elif stat["title"] == "Roofs Repaired":
                    stat["value"] = roofs_repaired
            
            # 6. Combined page section
            template_data["combinedPage"]["googleReviews"] = reviews
            template_data["combinedPage"]["residentialServices"] = formatted_services["combined"]["residential"]
            template_data["combinedPage"]["commercialServices"] = formatted_services["combined"]["commercial"]
            template_data["combinedPage"]["teamMembers"] = [member["name"] for member in employee_data[:2]]
            
            # 7. Employees section
            template_data["employees"]["employee"] = employee_data
            template_data["employees"]["sectionTitle"] = team_section_title
            
            # 8. Before/After section
            template_data["before_after"]["sectionTitle"] = gallery_title
            
            # 9. Button section - shuffle images
            random.shuffle(template_data["button"]["images"])
            
            # 10. Reviews section
            template_data["reviews"] = reviews
            
            # Save the final combined data
            self._save_combined_data(template_data)
            logger.info("Combined data generation completed successfully")
            
        except Exception as e:
            logger.error(f"Error generating combined data: {e}")
            raise

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