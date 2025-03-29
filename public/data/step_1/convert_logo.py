import os
from PIL import Image
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def convert_to_png(input_path, output_path):
    """
    Convert an image to proper PNG format with transparency.
    
    Args:
        input_path: Path to the input image
        output_path: Path to save the converted PNG
    """
    try:
        # Open the image
        img = Image.open(input_path)
        
        # Convert to RGBA mode for transparency
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Save as PNG with maximum quality
        img.save(output_path, 'PNG', optimize=False, quality=100)
        
        logging.info(f"Image converted to PNG and saved to {output_path}")
        return True
    except Exception as e:
        logging.error(f"Error converting image: {e}")
        return False

def main():
    """Main function to convert the logo to PNG."""
    # Set up paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.dirname(script_dir)
    
    input_path = os.path.join(data_dir, "raw_data", "step_1", "logo.png")
    output_path = os.path.join(data_dir, "raw_data", "step_1", "logo_proper.png")
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Convert the image
    if convert_to_png(input_path, output_path):
        print("Logo converted to proper PNG format successfully!")
        
        # Compare file sizes
        original_size = os.path.getsize(input_path)
        converted_size = os.path.getsize(output_path)
        print(f"\nOriginal file size: {original_size / 1024:.2f} KB")
        print(f"Converted file size: {converted_size / 1024:.2f} KB")
        
        # Replace the original
        import shutil
        backup_path = input_path + '.jpeg_backup'
        shutil.copy2(input_path, backup_path)
        print(f"Original file backed up to: {backup_path}")
        
        shutil.move(output_path, input_path)
        print("Original file replaced with proper PNG version")
    else:
        print("Logo conversion failed. Please check the logs for details.")

if __name__ == "__main__":
    main() 