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
import random
import http.server
import socketserver
import webbrowser
import threading
import urllib.parse
from pathlib import Path

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
# Updated path to point to step_1/logo.png
LOGO_PATH = os.path.abspath(os.path.join(RAW_DATA_DIR, 'step_1', 'logo.png'))
COLORS_OUTPUT = os.path.abspath(os.path.join(RAW_DATA_DIR, 'colors_output.json'))
BBB_PROFILE = os.path.abspath(os.path.join(RAW_DATA_DIR, 'bbb_profile_data.json'))
HTML_EDITOR = os.path.abspath(os.path.join(SCRIPT_DIR, 'color_editor.html'))
NUM_COLORS = 8  # Increased to have more options to choose from

PORT = 8000  # Port for the web server

logger.info("Script directory: %s", SCRIPT_DIR)
logger.info("Raw data directory: %s", RAW_DATA_DIR)
logger.info("Logo path: %s", LOGO_PATH)
logger.info("Colors output path: %s", COLORS_OUTPUT)
logger.info("BBB profile path: %s", BBB_PROFILE)
logger.info("HTML editor path: %s", HTML_EDITOR)

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

def color_distance(color1, color2):
    """Calculate Euclidean distance between two RGB colors"""
    return sum((a - b) ** 2 for a, b in zip(color1, color2)) ** 0.5

def generate_unique_colors(palette_rgb, num_colors=4):
    """Generate completely unique colors from the palette or create new ones if needed"""
    
    # If we have enough colors in the palette, use them directly
    if len(palette_rgb) >= num_colors:
        # First, try to pick colors that are maximally different from each other
        selected_colors = [palette_rgb[0]]  # Start with the first color
        
        for _ in range(num_colors - 1):
            # For each remaining color in the palette, find the one that's most different from already selected colors
            max_min_distance = -1
            best_color = None
            
            for color in palette_rgb:
                if color in selected_colors:
                    continue
                    
                # Calculate minimum distance to any already selected color
                min_distance = min(color_distance(color, selected) for selected in selected_colors)
                
                if min_distance > max_min_distance:
                    max_min_distance = min_distance
                    best_color = color
            
            if best_color:
                selected_colors.append(best_color)
        
        return selected_colors
    
    # If we don't have enough colors in the palette, generate new ones
    # Start with the available colors from the palette
    unique_colors = list(palette_rgb)
    
    # Generate additional colors using color theory
    while len(unique_colors) < num_colors:
        # Create a new random color
        new_r = random.randint(30, 225)
        new_g = random.randint(30, 225)
        new_b = random.randint(30, 225)
        new_color = (new_r, new_g, new_b)
        
        # Check if it's different enough from existing colors
        if all(color_distance(new_color, color) > 50 for color in unique_colors):
            unique_colors.append(new_color)
    
    return unique_colors[:num_colors]

def generate_color_scheme(palette_rgb):
    """Generate a color scheme with truly unique colors"""
    
    # Generate 4 unique colors
    unique_colors = generate_unique_colors(palette_rgb, 4)
    
    # Create a color scheme
    color_scheme = {
        "accent": rgb_to_hex(unique_colors[0]),
        "banner": rgb_to_hex(unique_colors[1]),
        "faint-color": rgb_to_hex(unique_colors[2]),
        "second-accent": rgb_to_hex(unique_colors[3])
    }
    
    return color_scheme

def generate_html_editor(colors):
    """Generate an HTML page for viewing and editing colors"""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Color Scheme Editor</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }}
        h1 {{
            text-align: center;
            color: #333;
        }}
        .color-container {{
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
        }}
        .color-item {{
            flex: 1;
            min-width: 200px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .color-preview {{
            height: 100px;
            border-radius: 4px;
            margin-bottom: 10px;
        }}
        label {{
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }}
        input[type="color"] {{
            width: 100%;
            height: 40px;
            cursor: pointer;
        }}
        input[type="text"] {{
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            margin-top: 5px;
        }}
        button {{
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            text-align: center;
            text-decoration: none;
            display: block;
            font-size: 16px;
            margin: 20px auto;
            cursor: pointer;
            border-radius: 4px;
        }}
        button:hover {{
            background-color: #45a049;
        }}
        .color-sample {{
            margin-top: 30px;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
        }}
        .sample-header {{
            background-color: {colors["banner"]};
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
        }}
        .sample-button {{
            background-color: {colors["accent"]};
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }}
        .sample-content {{
            background-color: {colors["faint-color"]};
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
        }}
        .sample-highlight {{
            background-color: {colors["second-accent"]};
            padding: 5px 10px;
            border-radius: 4px;
            display: inline-block;
            margin: 5px 0;
        }}
    </style>
</head>
<body>
    <h1>Color Scheme Editor</h1>
    <p>Adjust the colors below and click "Save Colors" to update your color scheme.</p>
    
    <form action="/save_colors" method="get">
        <div class="color-container">
            <div class="color-item">
                <div class="color-preview" id="accent-preview" style="background-color: {colors["accent"]};"></div>
                <label for="accent">Accent Color:</label>
                <input type="color" id="accent" name="accent" value="{colors["accent"]}" onchange="updatePreview('accent')">
                <input type="text" id="accent-text" value="{colors["accent"]}" oninput="updateColor('accent')">
                <p>Used for: Buttons, links, and primary interactive elements</p>
            </div>
            
            <div class="color-item">
                <div class="color-preview" id="banner-preview" style="background-color: {colors["banner"]};"></div>
                <label for="banner">Banner Color:</label>
                <input type="color" id="banner" name="banner" value="{colors["banner"]}" onchange="updatePreview('banner')">
                <input type="text" id="banner-text" value="{colors["banner"]}" oninput="updateColor('banner')">
                <p>Used for: Headers, navigation bars, and prominent UI elements</p>
            </div>
            
            <div class="color-item">
                <div class="color-preview" id="faint-color-preview" style="background-color: {colors["faint-color"]};"></div>
                <label for="faint-color">Faint Color:</label>
                <input type="color" id="faint-color" name="faint-color" value="{colors["faint-color"]}" onchange="updatePreview('faint-color')">
                <input type="text" id="faint-color-text" value="{colors["faint-color"]}" oninput="updateColor('faint-color')">
                <p>Used for: Backgrounds, subtle highlights, and secondary elements</p>
            </div>
            
            <div class="color-item">
                <div class="color-preview" id="second-accent-preview" style="background-color: {colors["second-accent"]};"></div>
                <label for="second-accent">Second Accent Color:</label>
                <input type="color" id="second-accent" name="second-accent" value="{colors["second-accent"]}" onchange="updatePreview('second-accent')">
                <input type="text" id="second-accent-text" value="{colors["second-accent"]}" oninput="updateColor('second-accent')">
                <p>Used for: Call-to-actions, highlights, and accent elements</p>
            </div>
        </div>
        
        <h2>Color Sample Preview</h2>
        <div class="color-sample">
            <div class="sample-header">This is a banner using the Banner Color</div>
            <div class="sample-content">
                <p>This is content with a Faint Color background.</p>
                <button class="sample-button">Accent Color Button</button>
                <p>Here is some text with a <span class="sample-highlight">Second Accent highlight</span> to show contrast.</p>
            </div>
        </div>
        
        <button type="submit">Save Colors</button>
    </form>

    <script>
        function updatePreview(colorType) {{
            const colorInput = document.getElementById(colorType);
            const preview = document.getElementById(colorType + '-preview');
            const textInput = document.getElementById(colorType + '-text');
            
            preview.style.backgroundColor = colorInput.value;
            textInput.value = colorInput.value;
            updateSamplePreview();
        }}
        
        function updateColor(colorType) {{
            const textInput = document.getElementById(colorType + '-text');
            const colorInput = document.getElementById(colorType);
            const preview = document.getElementById(colorType + '-preview');
            
            // Validate hex color
            const isValidHex = /^#([0-9A-F]{{3}}){{1,2}}$/i.test(textInput.value);
            
            if (isValidHex) {{
                colorInput.value = textInput.value;
                preview.style.backgroundColor = textInput.value;
                updateSamplePreview();
            }}
        }}
        
        function updateSamplePreview() {{
            const accentColor = document.getElementById('accent').value;
            const bannerColor = document.getElementById('banner').value;
            const faintColor = document.getElementById('faint-color').value;
            const secondAccentColor = document.getElementById('second-accent').value;
            
            document.querySelector('.sample-header').style.backgroundColor = bannerColor;
            document.querySelector('.sample-button').style.backgroundColor = accentColor;
            document.querySelector('.sample-content').style.backgroundColor = faintColor;
            document.querySelector('.sample-highlight').style.backgroundColor = secondAccentColor;
        }}
    </script>
</body>
</html>
"""
    with open(HTML_EDITOR, 'w', encoding='utf-8') as f:
        f.write(html)
    
    return HTML_EDITOR

class ColorEditorHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Handle color save request
        if self.path.startswith('/save_colors'):
            parsed_url = urllib.parse.urlparse(self.path)
            query_params = urllib.parse.parse_qs(parsed_url.query)
            
            # Extract color values from query parameters
            new_colors = {
                "accent": query_params.get('accent', ['#2B4C7E'])[0],
                "banner": query_params.get('banner', ['#D32F2F'])[0],
                "faint-color": query_params.get('faint-color', ['#E0F7FA'])[0],
                "second-accent": query_params.get('second-accent', ['#FFA000'])[0]
            }
            
            # Save the new colors
            try:
                with open(COLORS_OUTPUT, 'w', encoding='utf-8') as f:
                    json.dump(new_colors, f, indent=2)
                logger.info(f"Updated color scheme saved to {COLORS_OUTPUT}")
                
                # Also copy to local directory
                local_output = os.path.join(SCRIPT_DIR, 'colors_output.json')
                shutil.copy2(COLORS_OUTPUT, local_output)
                logger.info(f"Also copied updated color scheme to {local_output}")
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                
                # Create a success page
                success_page = f"""<!DOCTYPE html>
<html>
<head>
    <title>Colors Saved</title>
    <meta http-equiv="refresh" content="2;url=/" />
    <style>
        body {{ font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }}
        .success {{ color: green; }}
    </style>
</head>
<body>
    <h1 class="success">Colors Saved Successfully!</h1>
    <p>Redirecting back to the editor...</p>
    <div style="margin: 30px auto; display: flex; justify-content: center; gap: 10px;">
        <div style="width: 50px; height: 50px; background-color: {new_colors['accent']}"></div>
        <div style="width: 50px; height: 50px; background-color: {new_colors['banner']}"></div>
        <div style="width: 50px; height: 50px; background-color: {new_colors['faint-color']}"></div>
        <div style="width: 50px; height: 50px; background-color: {new_colors['second-accent']}"></div>
    </div>
</body>
</html>
"""
                self.wfile.write(success_page.encode())
                
            except Exception as e:
                logger.error(f"Error saving updated color scheme: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(f"Error saving colors: {str(e)}".encode())
            
            return
            
        # Serve the editor HTML if requesting root
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            with open(HTML_EDITOR, 'rb') as file:
                self.wfile.write(file.read())
            return
            
        # For any other path, use the default handler
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def start_web_server(html_path):
    """Start a web server to host the color editor"""
    # Change to the directory containing the HTML file
    os.chdir(os.path.dirname(html_path))
    
    # Create the server
    handler = ColorEditorHandler
    httpd = socketserver.TCPServer(("", PORT), handler)
    
    logger.info(f"Starting web server at port {PORT}")
    logger.info(f"Open your browser to http://localhost:{PORT}/")
    
    # Open the browser automatically
    webbrowser.open(f"http://localhost:{PORT}/")
    
    # Start the server
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    finally:
        httpd.server_close()
        logger.info("Server closed")

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
                    # Make sure the directory exists
                    os.makedirs(os.path.dirname(LOGO_PATH), exist_ok=True)
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
            "banner": "#D32F2F",     # Red
            "faint-color": "#E0F7FA", # Light blue
            "second-accent": "#FFA000" # Amber
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
            
            # Generate color scheme with truly unique colors
            colors = generate_color_scheme(palette_rgb)
            logger.info("Generated color scheme with unique colors")
            
        except Exception as e:
            logger.error(f"Error during color extraction: {e}")
            # Fallback to default colors with unique values
            colors = {
                "accent": "#2B4C7E",     # Professional blue
                "banner": "#D32F2F",     # Red
                "faint-color": "#E0F7FA", # Light blue
                "second-accent": "#FFA000" # Amber
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
    
    # Generate the HTML editor
    html_path = generate_html_editor(colors)
    logger.info(f"Generated HTML editor at {html_path}")
    
    # Start web server in a separate thread
    logger.info("Starting web server for color editor")
    
    try:
        # Ask user if they want to launch the color editor
        print("\n========== COLOR EDITOR ==========")
        print(f"Colors extracted and saved to {COLORS_OUTPUT}")
        print("Would you like to open the color editor to adjust these colors? (y/n)")
        user_input = input().strip().lower()
        
        if user_input == 'y' or user_input == 'yes':
            # Start the web server
            start_web_server(html_path)
        else:
            print("Color editor not launched. You can run this script again if you want to edit colors later.")
    except KeyboardInterrupt:
        logger.info("Color editor not launched due to user interrupt")
    except Exception as e:
        logger.error(f"Error starting web server: {e}")
        print(f"Error starting color editor: {e}")
        print("Colors have been extracted and saved, but the editor could not be launched.")

if __name__ == "__main__":
    main() 