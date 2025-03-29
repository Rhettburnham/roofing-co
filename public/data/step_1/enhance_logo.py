import os
import base64
import requests
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import logging
import tempfile

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Load the API key from .env file in the data directory
data_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(data_dir, '.env')
load_dotenv(env_path)

# Get the API key from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found. Please ensure it's in the .env file in the data directory.")

def ensure_rgba_format(image_path, output_path=None):
    """
    Ensure the image is in RGBA format.
    
    Args:
        image_path: Path to the input image
        output_path: Path to save the RGBA image (if None, a temporary file is created)
        
    Returns:
        Path to the RGBA image
    """
    try:
        # Create a temporary file if no output path provided
        if output_path is None:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            output_path = temp_file.name
            temp_file.close()
        
        # Open and convert the image
        img = Image.open(image_path)
        if img.mode != 'RGBA':
            logging.info(f"Converting image from {img.mode} to RGBA mode")
            img = img.convert('RGBA')
        
        # Save with maximum quality
        img.save(output_path, format='PNG', optimize=False, quality=100)
        logging.info(f"Saved RGBA image to {output_path}")
        
        return output_path
    except Exception as e:
        logging.error(f"Error ensuring RGBA format: {e}")
        return None

def encode_image_to_base64(image_path):
    """Convert an image to base64 string."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def enhance_logo(input_path, output_path):
    """
    Enhance the logo using OpenAI's image variation API.
    
    Args:
        input_path: Path to the input logo image
        output_path: Path to save the enhanced logo
    """
    temp_files = []
    
    try:
        # Ensure input image is in RGBA format
        rgba_input_path = ensure_rgba_format(input_path)
        if not rgba_input_path:
            return False
        if rgba_input_path != input_path:
            temp_files.append(rgba_input_path)
        
        # Prepare the API request
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        # Open the image file for the multipart/form-data payload
        with open(rgba_input_path, "rb") as image_file:
            files = {
                "image": ("image.png", image_file, "image/png")
            }
            
            data = {
                "model": "dall-e-2",
                "n": 1,
                "size": "1024x1024"
            }
            
            # Make the API request
            logging.info("Sending request to the images/variations endpoint...")
            response = requests.post(
                "https://api.openai.com/v1/images/variations",
                headers=headers,
                files=files,
                data=data
            )
        
        # Clean up temporary files
        for file_path in temp_files:
            if os.path.exists(file_path):
                os.remove(file_path)
                logging.info(f"Removed temporary file: {file_path}")
        
        if response.status_code != 200:
            logging.error(f"API request failed with status code {response.status_code}")
            logging.error(f"Error message: {response.text}")
            return False
        
        # Get the enhanced image URL
        enhanced_image_url = response.json()['data'][0]['url']
        
        # Download the enhanced image
        image_response = requests.get(enhanced_image_url)
        if image_response.status_code != 200:
            logging.error("Failed to download enhanced image")
            return False
        
        # Save the enhanced image
        enhanced_image = Image.open(BytesIO(image_response.content))
        
        # Ensure the image has an alpha channel for transparency
        if enhanced_image.mode != 'RGBA':
            enhanced_image = enhanced_image.convert('RGBA')
        
        # Save with maximum quality and preserve transparency
        enhanced_image.save(output_path, format='PNG', optimize=False, quality=100)
        
        logging.info(f"Enhanced logo saved to {output_path}")
        return True
        
    except Exception as e:
        logging.error(f"Error enhancing logo: {e}")
        
        # Clean up any temporary files
        for file_path in temp_files:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    logging.info(f"Removed temporary file: {file_path}")
                except:
                    pass
        
        return False

def main():
    """Main function to enhance the logo."""
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    
    input_path = os.path.join(data_dir, "raw_data", "step_1", "logo.png")
    output_path = os.path.join(data_dir, "raw_data", "step_1", "logo_enhanced.png")
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Enhance the logo
    if enhance_logo(input_path, output_path):
        print("Logo enhancement completed successfully!")
        
        # Compare file sizes
        original_size = os.path.getsize(input_path)
        enhanced_size = os.path.getsize(output_path)
        print(f"\nOriginal logo size: {original_size / 1024:.2f} KB")
        print(f"Enhanced logo size: {enhanced_size / 1024:.2f} KB")
        
        # If enhancement was successful, optionally replace the original
        replace = input("\nWould you like to replace the original logo with the enhanced version? (y/n): ")
        if replace.lower() == 'y':
            import shutil
            backup_path = input_path + '.backup'
            shutil.copy2(input_path, backup_path)
            print(f"Original logo backed up to: {backup_path}")
            
            shutil.move(output_path, input_path)
            print("Original logo replaced with enhanced version")
    else:
        print("Logo enhancement failed. Please check the logs for details.")
        print("\nTo use this script, you need a valid OpenAI API key with access to DALL-E 2.")
        print("Make sure your API key is in the .env file in the data directory.")
        print("\nNote: The image variations API creates variations of the logo with enhanced quality.")
        print("This may result in subtle design changes while maintaining the overall look.")

if __name__ == "__main__":
    main() 