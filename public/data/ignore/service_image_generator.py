#!/usr/bin/env python3
import json
import os
import time
import random
import re
import requests
import base64
from typing import Dict, List, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Check for OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please set it in your .env file.")

def generate_image_with_dalle(prompt: str, output_path: str) -> bool:
    """
    Generate an image using DALL-E 3 and save it to the specified path.
    
    Args:
        prompt: The text prompt for image generation
        output_path: Where to save the generated image
        
    Returns:
        bool: Whether the image was successfully generated and saved
    """
    try:
        print(f"Generating image for prompt: {prompt}")
        
        # API endpoint for DALL-E 3 image generation
        url = "https://api.openai.com/v1/images/generations"
        
        # Request headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        # Request body
        data = {
            "model": "dall-e-3",  # Use DALL-E 3 for higher quality images
            "prompt": prompt,
            "n": 1,  # Generate one image
            "size": "1024x1024",  # Standard size
            "response_format": "b64_json"  # Get base64 encoded image
        }
        
        # Make the API request
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  # Raise exception for HTTP errors
        
        # Extract the image data
        response_data = response.json()
        image_data = response_data["data"][0]["b64_json"]
        
        # Save the image
        with open(output_path, "wb") as f:
            f.write(base64.b64decode(image_data))
            
        # Verify the file was created and has content
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            print(f"✓ Image saved to: {output_path}")
            return True
        else:
            print(f"✗ Failed to save image to: {output_path}")
            return False
            
    except Exception as e:
        print(f"Error generating image: {e}")
        return False

def create_prompt_for_service(service_name: str, block_title: str = None) -> str:
    """
    Create a detailed prompt for DALL-E based on service name and block title.
    
    Args:
        service_name: The name of the roofing service
        block_title: Optional title of the specific content block
        
    Returns:
        str: A detailed prompt for image generation
    """
    # Base prompt structure
    base_prompt = "Professional, high-quality photograph of "
    
    # Use block title if available, otherwise use service name
    subject = block_title if block_title else service_name
    
    # Add specific details based on service type
    if "repair" in subject.lower():
        prompt = f"{base_prompt}roofing repair work being performed on a residential home. Workers carefully fixing damaged shingles on a sloped roof, with tools and materials neatly organized. Sunny day, professional setting."
    elif "install" in subject.lower() or "replacement" in subject.lower():
        prompt = f"{base_prompt}a new roof installation on a modern residential home. Professional roofers installing fresh shingles in a neat pattern. Clean worksite with materials organized, bright daylight showing the quality of work."
    elif "inspect" in subject.lower() or "maintenance" in subject.lower():
        prompt = f"{base_prompt}a professional roof inspection. A roofing expert carefully examining shingles and flashing on a residential roof. The inspector is taking notes on a clipboard and using proper safety equipment."
    elif "gutter" in subject.lower():
        prompt = f"{base_prompt}newly installed modern gutters on a residential home. Clean, properly aligned gutters with downspouts directing water away from the foundation. Professional installation visible at the roofline."
    elif "emergency" in subject.lower():
        prompt = f"{base_prompt}emergency roof repair after storm damage. Professional roofers securing a tarp over damaged section of residential roof. Weather is clearing after a storm, showing quick response to prevent further damage."
    elif "commercial" in subject.lower():
        prompt = f"{base_prompt}a large commercial flat roof installation. Professional roofing team working on a commercial building with proper safety equipment. Wide angle view showing the scale of the commercial roofing project."
    else:
        # Generic roofing prompt
        prompt = f"{base_prompt}a high-quality {subject.lower()} roofing service. Professional roofing team working on a residential home with attention to detail. Clean worksite, proper safety equipment, and excellent craftsmanship visible."
    
    # Add universal requirements
    prompt += " No text overlays, no watermarks, photorealistic style."
    
    return prompt

def process_service_images(service: Dict[str, Any]) -> None:
    """
    Process and update images for a service and its blocks using DALL-E.
    
    Args:
        service: The service data to process
    """
    service_name = service.get('name', '')
    print(f"\nProcessing service: {service_name}")
    
    # Check if this service has blocks
    if 'blocks' not in service or not isinstance(service['blocks'], list):
        print(f"No blocks found for service {service_name}, skipping")
        return
    
    # Process each block
    for i, block in enumerate(service['blocks']):
        # Skip blocks that already have images
        if 'image' in block and block['image'] and not block['image'].startswith("http"):
            print(f"  Block {i+1} already has image: {block['image']}")
            continue
        
        # Create the prompt based on block content
        block_title = block.get('title', '')
        prompt = create_prompt_for_service(service_name, block_title)
        
        print(f"  Generating image for block {i+1}: {block_title or service_name}")
        
        # Create a safe filename based on service name and block index
        safe_service_name = re.sub(r'[^a-zA-Z0-9]', '_', service_name.lower())
        image_filename = f"{safe_service_name}_block_{i+1}.jpg"
        
        # Set up the image directory in the workspace
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.dirname(script_dir)
        image_dir = os.path.join(data_dir, "service_images")
        os.makedirs(image_dir, exist_ok=True)
        
        image_path = os.path.join(image_dir, image_filename)
        
        # Generate the image with DALL-E
        success = generate_image_with_dalle(prompt, image_path)
        
        if success:
            # Update the block with the new image path
            # Use relative path for storing in JSON
            block['image'] = f"/assets/images/services/{image_filename}"
            print(f"  ✓ Image generated and saved as: {image_filename}")
        else:
            print(f"  ✗ Failed to generate image for block {i+1}")
        
        # Add a delay to avoid hitting rate limits
        time.sleep(3)

def main():
    """Main entry point for the script"""
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    raw_data_dir = os.path.join(data_dir, "raw_data")
    
    # Input file from step_3
    input_file = os.path.join(raw_data_dir, "step_3", "services_search_term.json")
    
    # Output directory and file in step_4
    output_dir = os.path.join(raw_data_dir, "step_4")
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "services_with_dalle_images.json")
    
    # Image directory
    image_dir = os.path.join(data_dir, "service_images")
    os.makedirs(image_dir, exist_ok=True)
    
    print(f"Reading services from: {input_file}")
    print(f"Saving images to: {image_dir}")
    print(f"Writing output to: {output_file}")
    
    try:
        # Read the services data
        with open(input_file, 'r') as f:
            services_data = json.load(f)

        # Process each service
        for service in services_data:
            process_service_images(service)
            
        # Write the updated services data
        with open(output_file, 'w') as f:
            json.dump(services_data, f, indent=2)
            
        print("\nImage generation completed successfully!")
        print(f"Generated {sum(1 for service in services_data for block in service.get('blocks', []) if 'image' in block)} images")
    
    except FileNotFoundError:
        print(f"Error: {input_file} not found. Run step_3 scripts first.")
    except Exception as e:
        print(f"Error during image generation: {e}")

if __name__ == "__main__":
    main() 