# Image Management Documentation

## Overview

This document explains the standardized image organization structure used in the roofing website. All images are now centrally managed in `combined_data.json` to ensure consistency between components.

## Directory Structure

Images are organized into the following directory structure:

```
/assets
  /images
    /logo           - Logo images
    /team           - Team member portraits 
    /richtext       - Images for the rich text section
    /roof_slideshow - Images for the sliding carousel
    /beforeafter    - Before and after comparison images
    /builtup        - Built-up roofing service images
    /coating        - Coating service images
    [+ other service-specific folders]
```

## Standard Image Paths

The following standardized paths are used throughout the application:

### Logo
- `/assets/images/logo/clipped.png` - Main logo

### Team Members
- `/assets/images/team/roofer.png` - Owner
- `/assets/images/team/foreman.png` - Manager
- `/assets/images/team/estimator.png` - Estimator
- `/assets/images/team/salesrep.png` - Sales Rep
- `/assets/images/team/manager.png` - Manager
- `/assets/images/team/inspector.png` - Inspector

### Rich Text Section
- `/assets/images/richtext/roof_workers.jpg`
- `/assets/images/richtext/roof_workers2.jpg`
- `/assets/images/richtext/roof_workers3.webp`

### Slideshow (Button Block)
- `/assets/images/roof_slideshow/i1.jpeg` through `/assets/images/roof_slideshow/i12.jpeg`

### Before/After Comparisons
- `/assets/images/beforeafter/a1.jpeg` - After image 1
- `/assets/images/beforeafter/b1.JPG` - Before image 1
- `/assets/images/beforeafter/a2.jpeg` - After image 2
- `/assets/images/beforeafter/b2.jpeg` - Before image 2
- `/assets/images/beforeafter/a3.jpeg` - After image 3
- `/assets/images/beforeafter/b3.jpeg` - Before image 3

### Services Images
- `/assets/images/builtup/builtupdemo.avif` - Built-up roofing demo
- `/assets/images/builtup/builtuproofing2.jpg` - Built-up roofing example
- `/assets/images/builtup/modified1.jpg` - Modified bitumen example 1
- `/assets/images/builtup/modified2.avif` - Modified bitumen example 2
- `/assets/images/coating/acrylic.webp` - Acrylic coating
- `/assets/images/coating/silicone.jpg` - Silicone coating
- `/assets/images/coating/polyurethane.jpg` - Polyurethane coating
- `/assets/images/coating/elastomeric.jpg` - Elastomeric coating
- `/assets/images/coating/spf.jpg` - Spray Polyurethane Foam

### Other Images
- `/assets/images/googleimage.png` - Google review icon
- `/assets/images/main_image_expanded.jpg` - Main residential services image
- `/assets/images/commercialservices.jpg` - Main commercial services image

## Managing Images

### Adding New Images

1. Place the image in the appropriate directory based on its use
2. Update `combined_data.json` to reference the new image path
3. The component will automatically use the image from `combined_data.json`

### Replacing Images

1. Replace the image file in the appropriate directory, keeping the same filename
2. The change will reflect automatically on the website

## Scripts

The following scripts help maintain the image structure:

### `organize_assets.py`

This script:
- Creates the required directory structure
- Finds and copies images to their proper locations
- Updates paths in `combined_data.json` to ensure consistency

Run it with:
```
python public/data/scripts/organize_assets.py
```

### `generate_combined_data.py`

This script generates the `combined_data.json` file with all standardized image paths.
It ensures that all image references follow the structured format.

Run it with:
```
python public/data/scripts/generate_combined_data.py
``` 