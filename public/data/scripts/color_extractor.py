#!/usr/bin/env python3
# public/data/color_extractor.py

import os
import json
import colorsys
import requests
from PIL import Image
from io import BytesIO
from colorthief import ColorThief

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(SCRIPT_DIR, 'logo.png')
COLORS_OUTPUT = os.path.join(SCRIPT_DIR, 'colors_output.json')
BBB_PROFILE = os.path.join(SCRIPT_DIR, 'bbb_profile_data.json')
NUM_COLORS = 5

def download_logo(url, save_path):
    try:
        response = requests.get(url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        img.save(save_path)
        return True
    except Exception as e:
        print(f"Error downloading logo: {e}")
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
    """Generate multiple color combinations based on color theory."""
    darker = adjust_brightness(dominant_rgb, 0.7)
    lighter = adjust_brightness(dominant_rgb, 1.3)
    
    # Generate several options for the three main colors
    options = []
    
    # Option 1: Based on dominant color
    options.append({
        "accent": rgb_to_hex(dominant_rgb),
        "banner": rgb_to_hex(darker),
        "faint-color": rgb_to_hex(lighter)
    })
    
    # Option 2: Using complementary color if available
    if len(palette_rgb) > 1:
        options.append({
            "accent": rgb_to_hex(palette_rgb[0]),
            "banner": rgb_to_hex(palette_rgb[1]),
            "faint-color": rgb_to_hex(adjust_brightness(palette_rgb[0], 1.3))
        })
    
    # Option 3: Monochromatic scheme
    options.append({
        "accent": rgb_to_hex(dominant_rgb),
        "banner": rgb_to_hex(adjust_brightness(dominant_rgb, 0.6)),
        "faint-color": rgb_to_hex(adjust_brightness(dominant_rgb, 1.4))
    })
    
    return options

def select_best_combination(options, business_name):
    """Use color theory and business context to select the best combination."""
    # TODO: Integrate with DeepSeek API for intelligent color selection
    # For now, return the first option as default
    return options[0]

def main():
    # First check if we need to download the logo
    business_name = "Default Business"
    
    if os.path.exists(BBB_PROFILE):
        with open(BBB_PROFILE, 'r') as f:
            bbb_data = json.load(f)
            business_name = bbb_data.get('business_name', business_name)
            if 'logo_url' in bbb_data and not os.path.exists(LOGO_PATH):
                print(f"Downloading logo from {bbb_data['logo_url']}")
                download_logo(bbb_data['logo_url'], LOGO_PATH)

    if not os.path.exists(LOGO_PATH):
        print("No logo found. Using default professional color scheme...")
        colors = {
            "accent": "#2B4C7E",     # Professional blue
            "banner": "#1A2F4D",     # Darker blue
            "faint-color": "#E0F7FA" # Light blue
        }
    else:
        print("Extracting colors from logo...")
        thief = ColorThief(LOGO_PATH)
        dominant_rgb = thief.get_color(quality=1)
        palette_rgb = thief.get_palette(color_count=NUM_COLORS, quality=1)
        
        # Generate color combinations
        options = generate_color_combinations(dominant_rgb, palette_rgb)
        
        # Select best combination based on business context
        colors = select_best_combination(options, business_name)

    # Save the color scheme
    with open(COLORS_OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(colors, f, indent=2)
    print(f"[INFO] Wrote {COLORS_OUTPUT} with color scheme")

if __name__ == "__main__":
    main()
