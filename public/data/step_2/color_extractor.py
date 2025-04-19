#!/usr/bin/env python3
# public/data/color_extractor.py

import os
import json
import colorsys
import requests
from PIL import Image
from io import BytesIO
from colorthief import ColorThief
import logging
import shutil
import sys

# Configure logging to both file and console
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("color_extractor.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Set up paths with absolute paths for clarity
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(SCRIPT_DIR), 'raw_data'))
LOGO_PATH = os.path.abspath(os.path.join(RAW_DATA_DIR, 'logo.png'))
COLORS_OUTPUT = os.path.abspath(os.path.join(RAW_DATA_DIR, 'colors_output.json'))
BBB_PROFILE = os.path.abspath(os.path.join(RAW_DATA_DIR, 'bbb_profile_data.json'))
NUM_COLORS = 5

logger.info("Script directory: %s", SCRIPT_DIR)
logger.info("Raw data directory: %s", RAW_DATA_DIR)
logger.info("Logo path: %s", LOGO_PATH)
logger.info("Colors output path: %s", COLORS_OUTPUT)
logger.info("BBB profile path: %s", BBB_PROFILE)

# Make sure raw_data directory exists
if not os.path.exists(RAW_DATA_DIR):
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    logger.info(f"Created raw_data directory at {RAW_DATA_DIR}")
else:
    logger.info(f"Raw data directory already exists at {RAW_DATA_DIR}")

# List contents of the raw_data directory
try:
    logger.info("Contents of raw_data directory:")
    for file in os.listdir(RAW_DATA_DIR):
        file_path = os.path.join(RAW_DATA_DIR, file)
        file_size = os.path.getsize(file_path) if os.path.isfile(file_path) else "DIR"
        logger.info(f"  {file} - {file_size} bytes")
except Exception as e:
    logger.error(f"Error listing contents of raw_data directory: {e}")

def download_logo(url, save_path):
    try:
        response = requests.get(url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        img.save(save_path)
        logger.info(f"Logo downloaded and saved to {save_path}")
        return True
    except Exception as e:
        logger.error(f"Error downloading logo: {e}")
        return False

def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)

def hex_to_rgb(hex_str):
    hex_str = hex_str.strip("#")
    r = int(hex_str[0:2], 16)
    g = int(hex_str[2:4], 16)
    b = int(hex_str[4:6], 16)
    return (r, g, b)

def adjust_brightness(rgb, factor):
    h, l, s = colorsys.rgb_to_hls(rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0)
    l = max(min(l * factor, 1.0), 0.0)
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return (int(r*255), int(g*255), int(b*255))

def generate_color_combinations(dominant_rgb, palette_rgb):
    """Generate multiple color combinations based on color theory.
    This function creates completely different colors, not just variations 
    of the dominant color."""
    
    options = []
    
    # Generate Option 1: Use completely different colors from palette if available
    if len(palette_rgb) >= 4:
        # If we have at least 4 colors in the palette, use them directly
        options.append({
            "accent": rgb_to_hex(palette_rgb[0]),
            "banner": rgb_to_hex(palette_rgb[1]),
            "faint-color": rgb_to_hex(palette_rgb[2]),
            "second-accent": rgb_to_hex(palette_rgb[3])
        })
    elif len(palette_rgb) >= 2:
        # If we have at least 2 colors, use them and create complementary colors
        # Get complementary colors by hue rotation (180 degrees in HSL space)
        color1 = palette_rgb[0]
        color2 = palette_rgb[1]
        
        # Create complementary colors for the other two
        h1, l1, s1 = colorsys.rgb_to_hls(color1[0]/255.0, color1[1]/255.0, color1[2]/255.0)
        h2, l2, s2 = colorsys.rgb_to_hls(color2[0]/255.0, color2[1]/255.0, color2[2]/255.0)
        
        # Complementary colors (shift hue by 0.5 = 180 degrees)
        comp_h1 = (h1 + 0.5) % 1.0
        comp_h2 = (h2 + 0.33) % 1.0  # Shift by 120 degrees instead for triadic
        
        r1, g1, b1 = colorsys.hls_to_rgb(comp_h1, l1, s1)
        r2, g2, b2 = colorsys.hls_to_rgb(comp_h2, l2, s2)
        
        comp_color1 = (int(r1*255), int(g1*255), int(b1*255))
        comp_color2 = (int(r2*255), int(g2*255), int(b2*255))
        
        options.append({
            "accent": rgb_to_hex(color1),
            "banner": rgb_to_hex(color2),
            "faint-color": rgb_to_hex(comp_color1),
            "second-accent": rgb_to_hex(comp_color2)
        })
    else:
        # If we have just the dominant color, create a color scheme using color theory
        # Convert to HSL for easier color manipulation
        h, l, s = colorsys.rgb_to_hls(dominant_rgb[0]/255.0, dominant_rgb[1]/255.0, dominant_rgb[2]/255.0)
        
        # Create complementary, triadic and quadratic colors
        # Complementary (opposite on color wheel)
        comp_h = (h + 0.5) % 1.0
        # Triadic (120 degrees on color wheel)
        triadic_h1 = (h + 0.33) % 1.0
        # Quadratic (90 degrees on color wheel)
        quadratic_h = (h + 0.25) % 1.0
        
        # Convert back to RGB
        comp_rgb = colorsys.hls_to_rgb(comp_h, l, s)
        triadic_rgb = colorsys.hls_to_rgb(triadic_h1, l, s)
        quadratic_rgb = colorsys.hls_to_rgb(quadratic_h, l, s)
        
        # Convert to integers
        comp_color = (int(comp_rgb[0]*255), int(comp_rgb[1]*255), int(comp_rgb[2]*255))
        triadic_color = (int(triadic_rgb[0]*255), int(triadic_rgb[1]*255), int(triadic_rgb[2]*255))
        quadratic_color = (int(quadratic_rgb[0]*255), int(quadratic_rgb[1]*255), int(quadratic_rgb[2]*255))
        
        options.append({
            "accent": rgb_to_hex(dominant_rgb),
            "banner": rgb_to_hex(comp_color),
            "faint-color": rgb_to_hex(triadic_color),
            "second-accent": rgb_to_hex(quadratic_color)
        })
    
    # Option 2: Create a high-contrast scheme with tetradic colors (4 evenly spaced on color wheel)
    h, l, s = colorsys.rgb_to_hls(dominant_rgb[0]/255.0, dominant_rgb[1]/255.0, dominant_rgb[2]/255.0)
    
    # Create 4 colors evenly spaced around the color wheel (90 degrees apart)
    colors = []
    for i in range(4):
        new_h = (h + i * 0.25) % 1.0
        # Vary lightness and saturation slightly for better contrast
        new_l = min(max(l + (i * 0.1 - 0.15), 0.3), 0.7)
        new_s = min(max(s + (i * 0.05 - 0.075), 0.3), 0.9)
        
        rgb = colorsys.hls_to_rgb(new_h, new_l, new_s)
        colors.append((int(rgb[0]*255), int(rgb[1]*255), int(rgb[2]*255)))
    
    options.append({
        "accent": rgb_to_hex(colors[0]),
        "banner": rgb_to_hex(colors[1]),
        "faint-color": rgb_to_hex(colors[2]),
        "second-accent": rgb_to_hex(colors[3])
    })
    
    return options

def select_best_combination(options, business_name):
    """Use color theory and business context to select the best combination."""
    logger.info(f"Selecting best color combination for {business_name}")
    
    # Use option 2 if available (for more contrast), otherwise default to option 0
    selected_option = options[1] if len(options) > 1 else options[0]
    
    logger.info(f"Selected color option with accent: {selected_option['accent']}, banner: {selected_option['banner']}")
    return selected_option

def main():
    logger.info("Starting color extraction process")
    logger.info(f"Looking for logo at {LOGO_PATH}")
    
    # Check if the logo exists
    if os.path.exists(LOGO_PATH):
        logger.info(f"Logo file exists at {LOGO_PATH}")
        file_size = os.path.getsize(LOGO_PATH)
        logger.info(f"Logo file size: {file_size} bytes")
    else:
        logger.warning(f"Logo file does not exist at {LOGO_PATH}")
    
    # First check if we need to download the logo
    business_name = "Default Business"
    
    if os.path.exists(BBB_PROFILE):
        try:
            with open(BBB_PROFILE, 'r') as f:
                bbb_data = json.load(f)
                business_name = bbb_data.get('business_name', business_name)
                logger.info(f"Loaded business name: {business_name}")
                
                if 'logo_url' in bbb_data and not os.path.exists(LOGO_PATH):
                    logger.info(f"Downloading logo from {bbb_data['logo_url']}")
                    download_logo(bbb_data['logo_url'], LOGO_PATH)
        except Exception as e:
            logger.error(f"Error loading BBB profile data: {e}")
    else:
        logger.warning(f"BBB profile not found at {BBB_PROFILE}")

    # Verify again if the logo exists after potential download
    if os.path.exists(LOGO_PATH):
        logger.info(f"Logo verified at {LOGO_PATH} after potential download")
    
    # Check if logo exists and use it for color extraction
    if not os.path.exists(LOGO_PATH):
        logger.warning(f"No logo found at {LOGO_PATH}. Using default professional color scheme...")
        colors = {
            "accent": "#2B4C7E",     # Professional blue
            "banner": "#1A2F4D",     # Darker blue
            "faint-color": "#E0F7FA", # Light blue
            "second-accent": "#FFF8E1" # Amber 100 equivalent
        }
    else:
        logger.info(f"Found logo at {LOGO_PATH}, extracting colors...")
        try:
            # Verify logo file can be read
            with open(LOGO_PATH, 'rb') as f:
                logger.info("Successfully opened logo file for reading")
            
            # Verify the image can be opened with PIL
            try:
                img = Image.open(LOGO_PATH)
                logger.info(f"Successfully opened logo with PIL - Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
                img.close()
            except Exception as e:
                logger.error(f"Error opening logo with PIL: {e}")
                raise
            
            # Proceed with color extraction
            thief = ColorThief(LOGO_PATH)
            dominant_rgb = thief.get_color(quality=1)
            logger.info(f"Successfully extracted dominant color")
            
            palette_rgb = thief.get_palette(color_count=NUM_COLORS, quality=1)
            logger.info(f"Successfully extracted color palette with {len(palette_rgb)} colors")
            
            # Log extracted colors
            logger.info(f"Dominant color: {rgb_to_hex(dominant_rgb)}")
            logger.info(f"Color palette: {[rgb_to_hex(color) for color in palette_rgb]}")
            
            # Generate color combinations
            options = generate_color_combinations(dominant_rgb, palette_rgb)
            logger.info(f"Generated {len(options)} color combinations")
            
            # Select best combination based on business context
            colors = select_best_combination(options, business_name)
            logger.info("Selected best color combination")
        except Exception as e:
            logger.error(f"Error during color extraction: {e}")
            # Fallback to default colors
            colors = {
                "accent": "#2B4C7E",     # Professional blue
                "banner": "#1A2F4D",     # Darker blue
                "faint-color": "#E0F7FA", # Light blue
                "second-accent": "#FFF8E1" # Amber 100 equivalent
            }
            logger.info("Using fallback colors due to error")

    # Save the color scheme to raw_data directory
    try:
        with open(COLORS_OUTPUT, 'w', encoding='utf-8') as f:
            json.dump(colors, f, indent=2)
        logger.info(f"Wrote color scheme to {COLORS_OUTPUT}")
        
        # Log the colors
        for key, value in colors.items():
            logger.info(f"  {key}: {value}")
            
        # Also copy to final_single directory for convenience
        local_output = os.path.join(SCRIPT_DIR, 'colors_output.json')
        shutil.copy2(COLORS_OUTPUT, local_output)
        logger.info(f"Also copied color scheme to {local_output}")
    except Exception as e:
        logger.error(f"Error saving color scheme: {e}")

if __name__ == "__main__":
    main() 