#!/usr/bin/env python3
import json
import os
import requests
from datetime import datetime
import random

"""
Generate About Page Script

This script creates or updates the about page section in the combined_data.json file.
It generates professional content for a roofing company's about page, complete with
company history, mission statement, core values, and team member information.

The generated content is designed to showcase the company's expertise, values, and team
in a professional and engaging way.
"""

def main():
    print("Starting About Page Generation...")
    
    try:
        # Check if combined_data.json exists
        data_file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'combined_data.json')
        
        if os.path.exists(data_file_path):
            with open(data_file_path, 'r') as file:
                combined_data = json.load(file)
        else:
            combined_data = {}
        
        # Get company name from existing data or use default
        company_name = "Cowboys-Vaqueros Construction"
        if 'hero' in combined_data and 'mainTitle' in combined_data['hero']:
            company_name = combined_data['hero']['mainTitle']
        
        # Get year established (looking for patterns in existing data)
        year_established = 2012
        years_in_business = 11
        if 'richText' in combined_data and 'years_in_business' in combined_data['richText']:
            years_text = combined_data['richText']['years_in_business']
            try:
                years_in_business = int(years_text.split()[0])
                year_established = datetime.now().year - years_in_business
            except:
                pass
        
        # Generate about page content
        about_page = generate_about_page(company_name, year_established, years_in_business)
        
        # Add to combined data
        combined_data['aboutPage'] = about_page
        
        # Save updated combined data
        with open(data_file_path, 'w') as file:
            json.dump(combined_data, file, indent=2)
        
        print("About page generation completed successfully!")
        print(f"Content saved to: {data_file_path}")
    
    except Exception as e:
        print(f"Error generating about page: {str(e)}")
        return 1
    
    return 0

def generate_about_page(company_name, year_established, years_in_business):
    """
    Generate the about page content with realistic and professional information.
    
    Args:
        company_name: Name of the company
        year_established: Year the company was established
        years_in_business: Number of years in business
    
    Returns:
        Dictionary containing the about page data
    """
    # Core content generation
    history = generate_history_content(company_name, year_established, years_in_business)
    mission = generate_mission_content(company_name)
    values = generate_values_content()
    team = generate_team_content()
    stats = generate_stats_content(years_in_business)
    
    # Create about page data structure
    about_page = {
        "title": f"About {company_name}",
        "subtitle": f"Building Trust Since {year_established}",
        "history": history,
        "mission": mission,
        "values": values,
        "team": team,
        "stats": stats,
        "heroImage": "/assets/images/about/about-hero.jpg"
    }
    
    return about_page

def generate_history_content(company_name, year_established, years_in_business):
    """Generate professional company history content."""
    history_templates = [
        "Founded in {year}, {company_name} has grown from a small family business to one of the most trusted roofing companies in the region. With a focus on quality craftsmanship and customer satisfaction, we've built a reputation for excellence in both residential and commercial roofing.",
        "Since our establishment in {year}, {company_name} has been dedicated to providing top-quality roofing solutions to our community. What began as a small operation has now expanded into a full-service roofing company with a team of skilled professionals and a portfolio of successful projects across the region.",
        "{company_name} was founded in {year} with a simple mission: to provide honest, reliable roofing services at fair prices. Over the past {years} years, we've stayed true to that mission while growing our expertise, team, and service offerings to better serve our customers."
    ]
    
    template = random.choice(history_templates)
    return template.format(company_name=company_name, year=year_established, years=years_in_business)

def generate_mission_content(company_name):
    """Generate professional mission statement content."""
    mission_templates = [
        "Our mission is to provide the highest quality roofing services with integrity, exceptional customer service, and a commitment to excellence. We strive to build lasting relationships with our clients based on trust, reliability, and outstanding results.",
        "At {company_name}, our mission is simple: to protect your most valuable asset with quality roofing solutions that stand the test of time. We're committed to using premium materials, employing skilled craftsmen, and providing transparent communication throughout every project.",
        "{company_name} is dedicated to exceeding customer expectations through superior workmanship, professional service, and attention to detail. We aim to be the most trusted name in roofing by treating every home or business as if it were our own."
    ]
    
    template = random.choice(mission_templates)
    return template.format(company_name=company_name)

def generate_values_content():
    """Generate professional company values."""
    all_values = [
        {
            "title": "Quality",
            "description": "We never compromise on quality, using only the best materials and techniques in every project."
        },
        {
            "title": "Integrity",
            "description": "We believe in honest communication, fair pricing, and standing behind our work."
        },
        {
            "title": "Community",
            "description": "We're proud to serve our local community and contribute to making homes safer and more beautiful."
        },
        {
            "title": "Excellence",
            "description": "We strive for excellence in everything we do, from customer service to the final inspection."
        },
        {
            "title": "Safety",
            "description": "Safety is our top priority on every job site, protecting both our team and your property."
        },
        {
            "title": "Innovation",
            "description": "We continuously update our methods and materials to incorporate the latest advances in roofing technology."
        },
        {
            "title": "Sustainability",
            "description": "We're committed to environmentally responsible practices and offering sustainable roofing options."
        }
    ]
    
    # Select 3-4 random values
    num_values = random.randint(3, 4)
    selected_values = random.sample(all_values, num_values)
    
    return selected_values

def generate_team_content():
    """Generate sample team members."""
    # These would typically be replaced with actual team information
    team = [
        {
            "name": "Luis Aguilar-Lopez",
            "position": "Owner",
            "photo": "/assets/images/team/roofer.png"
        },
        {
            "name": "Erika Salinas",
            "position": "Manager",
            "photo": "/assets/images/team/foreman.png"
        }
    ]
    
    # Additional sample team members that could be randomly added
    additional_members = [
        {
            "name": "Michael Rodriguez",
            "position": "Lead Technician",
            "photo": "/assets/images/team/manager.png"
        },
        {
            "name": "Sarah Johnson",
            "position": "Customer Relations",
            "photo": "/assets/images/team/salesrep.png"
        },
        {
            "name": "Robert Garcia",
            "position": "Project Manager",
            "photo": "/assets/images/team/estimator.png"
        }
    ]
    
    # Randomly add 0-2 additional team members
    num_additional = random.randint(0, 2)
    if num_additional > 0:
        selected_additional = random.sample(additional_members, num_additional)
        team.extend(selected_additional)
    
    return team

def generate_stats_content(years_in_business):
    """Generate company statistics for the about page."""
    stats = [
        {
            "title": "Years in Business",
            "value": years_in_business,
            "icon": "FaHistory"
        },
        {
            "title": "Completed Projects",
            "value": random.randint(years_in_business * 30, years_in_business * 60),
            "icon": "FaAward"
        },
        {
            "title": "Happy Clients",
            "value": random.randint(years_in_business * 25, years_in_business * 50),
            "icon": "FaUsers"
        },
        {
            "title": "Team Members",
            "value": random.randint(10, 20),
            "icon": "FaHandshake"
        }
    ]
    
    return stats

if __name__ == "__main__":
    exit(main()) 