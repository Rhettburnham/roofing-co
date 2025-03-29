#!/usr/bin/env python3
import json
import os
import random

"""
This script generates a showcase page that displays all available block types
with sample content to help with design and development. It creates a special
service.json file entry called 'all_blocks_showcase' that contains one instance
of each block type with sample content.
"""

# Define all the available block types
BLOCK_TYPES = [
    "HeroBlock",
    "GeneralList", 
    "VideoCTA",
    "GeneralListVariant2",
    "OverviewAndAdvantagesBlock",
    "ActionButtonBlock",
    "HeaderBannerBlock",
    "PricingGrid",
    "ListDropdown",
    "ListImageVerticalBlock",
    "ShingleSelectorBlock",
    "ImageWrapBlock",
    "ThreeGridWithRichTextBlock",
    "GridImageTextBlock"
]

def create_sample_content_for_block(block_type):
    """
    Creates sample content for a given block type
    """
    config = {}
    
    if block_type == "HeroBlock":
        config = {
            "title": "Hero Block Example",
            "subtitle": "This block is used for main headers with a background image",
            "backgroundImage": "/assets/images/placeholder.png",
            "backgroundOpacity": 0.5,
            "buttonText": "Call to Action",
            "buttonUrl": "#"
        }
        
    elif block_type == "GeneralList":
        config = {
            "title": "General List Block",
            "subtitle": "A versatile list of items with icons and descriptions",
            "items": [
                {
                    "title": "Item One",
                    "icon": "FaCheckCircle",
                    "description": "This is the first item in our general list."
                },
                {
                    "title": "Item Two",
                    "icon": "FaToolbox",
                    "description": "This is the second item in our general list."
                },
                {
                    "title": "Item Three",
                    "icon": "FaWrench",
                    "description": "This is the third item in our general list."
                }
            ]
        }
        
    elif block_type == "VideoCTA":
        config = {
            "title": "Video Call to Action",
            "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
            "description": "This block displays a video with a call to action.",
            "buttonText": "Learn More",
            "buttonUrl": "#"
        }
        
    elif block_type == "GeneralListVariant2":
        config = {
            "title": "General List Variant 2",
            "subtitle": "Another style of list with different presentation",
            "items": [
                {
                    "title": "Feature One",
                    "description": "Description of the first feature."
                },
                {
                    "title": "Feature Two",
                    "description": "Description of the second feature."
                },
                {
                    "title": "Feature Three",
                    "description": "Description of the third feature."
                }
            ]
        }
        
    elif block_type == "OverviewAndAdvantagesBlock":
        config = {
            "title": "Overview and Advantages",
            "overview": "This block provides an overview and advantages.",
            "advantages": [
                "Advantage one with detailed explanation",
                "Advantage two with detailed explanation",
                "Advantage three with detailed explanation"
            ]
        }
        
    elif block_type == "ActionButtonBlock":
        config = {
            "text": "Action Button",
            "buttonLink": "#",
            "images": [
                "/assets/images/placeholder.png",
                "/assets/images/placeholder.png"
            ]
        }
        
    elif block_type == "HeaderBannerBlock":
        config = {
            "title": "Header Banner Block",
            "subtitle": "A banner-style header to highlight important information",
            "buttonText": "Get Started",
            "buttonUrl": "#"
        }
        
    elif block_type == "PricingGrid":
        config = {
            "title": "Pricing Grid",
            "subtitle": "Compare our different pricing options",
            "plans": [
                {
                    "title": "Basic Plan",
                    "price": "$99",
                    "features": ["Feature 1", "Feature 2", "Feature 3"]
                },
                {
                    "title": "Pro Plan",
                    "price": "$199",
                    "features": ["Everything in Basic", "Pro Feature 1", "Pro Feature 2"]
                },
                {
                    "title": "Enterprise",
                    "price": "$299",
                    "features": ["Everything in Pro", "Enterprise Feature 1", "Enterprise Feature 2"]
                }
            ]
        }
        
    elif block_type == "ListDropdown":
        config = {
            "title": "List Dropdown",
            "subtitle": "Expandable content sections for FAQs or information",
            "items": [
                {
                    "title": "Section 1",
                    "content": "Expanded content for section 1."
                },
                {
                    "title": "Section 2",
                    "content": "Expanded content for section 2."
                },
                {
                    "title": "Section 3",
                    "content": "Expanded content for section 3."
                }
            ]
        }
        
    elif block_type == "ListImageVerticalBlock":
        config = {
            "title": "List with Vertical Images",
            "items": [
                {
                    "title": "Item One",
                    "description": "Description for item one",
                    "image": "/assets/images/placeholder.png"
                },
                {
                    "title": "Item Two",
                    "description": "Description for item two",
                    "image": "/assets/images/placeholder.png"
                },
                {
                    "title": "Item Three",
                    "description": "Description for item three",
                    "image": "/assets/images/placeholder.png"
                }
            ]
        }
        
    elif block_type == "ShingleSelectorBlock":
        config = {
            "title": "Shingle Selector",
            "subtitle": "Choose your preferred shingle style and color",
            "options": [
                {
                    "name": "Option 1",
                    "image": "/assets/images/placeholder.png"
                },
                {
                    "name": "Option 2",
                    "image": "/assets/images/placeholder.png"
                },
                {
                    "name": "Option 3",
                    "image": "/assets/images/placeholder.png"
                }
            ]
        }
        
    elif block_type == "ImageWrapBlock":
        config = {
            "title": "Image Wrap Block",
            "subtitle": "Text wrapping around an image",
            "image": "/assets/images/placeholder.png",
            "content": "This is a block of text that wraps around an image. It's useful for cases where you want to show an image alongside content without it taking up the full width."
        }
        
    elif block_type == "ThreeGridWithRichTextBlock":
        config = {
            "title": "Three Grid with Rich Text",
            "subtitle": "A grid of three items with rich text",
            "items": [
                {
                    "title": "Grid Item 1",
                    "content": "<p>This is <strong>rich text</strong> content for item 1.</p>"
                },
                {
                    "title": "Grid Item 2",
                    "content": "<p>This is <strong>rich text</strong> content for item 2.</p>"
                },
                {
                    "title": "Grid Item 3",
                    "content": "<p>This is <strong>rich text</strong> content for item 3.</p>"
                }
            ]
        }
        
    elif block_type == "GridImageTextBlock":
        config = {
            "title": "Grid Image Text Block",
            "subtitle": "A grid with images and text",
            "items": [
                {
                    "title": "Grid Item 1",
                    "description": "Description for grid item 1",
                    "image": "/assets/images/placeholder.png"
                },
                {
                    "title": "Grid Item 2",
                    "description": "Description for grid item 2",
                    "image": "/assets/images/placeholder.png"
                },
                {
                    "title": "Grid Item 3",
                    "description": "Description for grid item 3",
                    "image": "/assets/images/placeholder.png"
                },
                {
                    "title": "Grid Item 4",
                    "description": "Description for grid item 4",
                    "image": "/assets/images/placeholder.png"
                }
            ]
        }
        
    return config

def generate_all_blocks_showcase():
    """
    Generates a showcase of all block types with sample content
    """
    # Create an array to hold all blocks
    all_blocks = []
    
    # Add a title block first
    all_blocks.append({
        "blockName": "HeroBlock",
        "config": {
            "title": "Block Type Showcase",
            "subtitle": "A visual reference of all available block types",
            "backgroundOpacity": 0.7,
            "buttonText": "Return Home",
            "buttonUrl": "/"
        }
    })
    
    # Add an explanation header
    all_blocks.append({
        "blockName": "HeaderBannerBlock",
        "config": {
            "title": "Design Reference for All Block Types",
            "subtitle": "This page displays examples of all available block types for design reference",
            "buttonText": "View Services",
            "buttonUrl": "/services"
        }
    })
    
    # Add each block type with sample content
    for block_type in BLOCK_TYPES:
        # If we've already added this block type as a header, skip it
        if block_type == "HeroBlock" or block_type == "HeaderBannerBlock":
            continue
            
        # Add a header before each block to identify it
        all_blocks.append({
            "blockName": "HeaderBannerBlock",
            "config": {
                "title": block_type,
                "subtitle": f"Example of the {block_type} component",
                "buttonText": "",
                "buttonUrl": ""
            }
        })
        
        # Add the block with sample content
        all_blocks.append({
            "blockName": block_type,
            "config": create_sample_content_for_block(block_type)
        })
    
    # Create a special service for the all blocks showcase
    showcase_service = {
        "id": "all-blocks-showcase",
        "slug": "all-blocks-showcase",
        "blocks": all_blocks
    }
    
    return showcase_service

def update_services_json(showcase_service):
    """
    Updates the services.json file to include the showcase service
    """
    try:
        # Load the existing services.json file
        with open("public/data/services.json", "r") as f:
            services_data = json.load(f)
        
        # Add the showcase service to a special category
        if "showcase" not in services_data:
            services_data["showcase"] = []
            
        # Remove any existing showcase service with the same id
        services_data["showcase"] = [
            s for s in services_data["showcase"] 
            if s.get("id") != "all-blocks-showcase"
        ]
        
        # Add the new showcase service
        services_data["showcase"].append(showcase_service)
        
        # Create a separate file for the showcase service
        with open("public/data/all_blocks_showcase.json", "w") as f:
            json.dump(showcase_service, f, indent=2)
        
        # Write the updated services.json file
        with open("public/data/services.json", "w") as f:
            json.dump(services_data, f, indent=2)
            
        print("Successfully created all-blocks showcase service")
        print("View it at /all-service-blocks")
        
    except Exception as e:
        print(f"Error updating services.json: {e}")

def main():
    """
    Main function to run the script
    """
    try:
        # Generate the showcase service
        showcase_service = generate_all_blocks_showcase()
        
        # Update the services.json file
        update_services_json(showcase_service)
        
        # Script completed successfully
        print("All blocks showcase generated successfully")
        
    except Exception as e:
        print(f"Error generating all blocks showcase: {e}")

if __name__ == "__main__":
    main() 
 