# OneForm Download Organization

## Overview

The `OneForm.jsx` download functionality has been enhanced to create a well-organized ZIP file that mimics your existing `/personal/old/` directory structure with intelligent filename preservation. When you download content from the OneForm editor, you get a structured package that maintains compatibility with the original file organization and preserves original image names where possible.

## Download Structure

```
downloaded_zip/
├── manifest.json              # Detailed tracking of all changes
├── README.md                  # Integration instructions
├── jsons/                     # Updated JSON configuration files
│   ├── combined_data.json     # Main page blocks configuration
│   ├── services.json          # Service pages configuration  
│   ├── about_page.json        # About page configuration
│   ├── all_blocks_showcase.json # Development blocks showcase
│   └── colors_output.json     # Color theme configuration
└── personal/old/              # OLD structure assets (preserves original filenames)
    └── img/                   # All image and video assets
        ├── main_page_images/  # Home page content organized by block
        │   ├── HeroBlock/     # Hero section images
        │   ├── AboutBlock/    # About section images
        │   ├── ServiceSliderBlock/ # Service slider images
        │   ├── TestimonialBlock/  # Testimonial images
        │   └── [other blocks]/ # Other home page blocks
        ├── about_page/        # About page content
        │   ├── team/          # Team member photos (preserves roofer.png, foreman.png)
        │   ├── videos/        # About page videos
        │   └── about-hero.jpg # About page hero image
        ├── services/          # Service page content organized by service
        │   ├── commercial_1/  # Commercial service ID 1
        │   │   └── assets/
        │   │       ├── images/ # Service images with original names
        │   │       └── videos/ # Service videos with original names
        │   ├── residential_2/ # Residential service ID 2
        │   │   └── assets/
        │   │       ├── images/ # Service images with original names
        │   │       └── videos/ # Service videos with original names
        │   └── [other services]/ # Additional service folders
        └── all_dev/           # Development/showcase content
            └── assets/images/ # Development block images
```

## Filename Preservation System

### Intelligent Name Detection

The system preserves original filenames by:

1. **Old Structure Recognition**: Detects `/personal/old/` paths and extracts original names
2. **Asset Path Recognition**: Identifies `/assets/images/` and `/assets/videos/` paths
3. **Team Photo Mapping**: Automatically maps team photos to known names (roofer.png, foreman.png)
4. **Clean Fallback**: Uses sanitized versions of uploaded filenames when no original is found

### Original Name Priority

When processing images, the system follows this priority:
1. Extract filename from `originalUrl` if it contains `/personal/old/`
2. Extract filename from `originalUrl` if it contains `/assets/`
3. Use the uploaded file's original name (cleaned)
4. Generate a descriptive fallback name

## Asset Organization Logic

### Content Type-Based Organization

The system organizes assets based on content type to match the OLD structure:

1. **Main Page (`contentType: 'main'`)**
   - Path: `personal/old/img/main_page_images/{BlockName}/`
   - Preserves original block-specific image names

2. **About Page (`contentType: 'about'`)**
   - Path: `personal/old/img/about_page/`
   - Team photos: `personal/old/img/about_page/team/` (preserves roofer.png, foreman.png)
   - Videos: `personal/old/img/about_page/videos/` (auto-detected by file extension)
   - Hero image: `personal/old/img/about_page/about-hero.jpg`

3. **Services (`contentType: 'services'`)**
   - Path: `personal/old/img/services/{category}_{id}/assets/{type}/`
   - Example: `personal/old/img/services/commercial_1/assets/images/`
   - Example: `personal/old/img/services/residential_2/assets/videos/`
   - Preserves original service image names where possible

4. **Showcase/Development (`contentType: 'showcase'`)**
   - Path: `personal/old/img/all_dev/assets/images/`

### File Handling

The system handles three types of assets:

1. **New Uploads (`type: 'file'`)**: Fresh file uploads from the user
2. **Modified Existing (`type: 'blob'`)**: Existing files that have been edited
3. **Copied Assets (`type: 'local'`)**: Current assets being preserved

### Filename Cleaning

All filenames are sanitized to prevent issues:
- Special characters replaced with underscores
- Only alphanumeric characters, dots, and hyphens preserved
- Original names tracked in metadata

## JSON Path Updates

When assets are processed, the JSON files are updated with paths matching the OLD structure:

```json
{
  "heroImage": "/personal/old/img/main_page_images/HeroBlock/hero_background.jpg",
  "teamPhoto": "/personal/old/img/about_page/team/roofer.png",
  "serviceImage": "/personal/old/img/services/commercial_1/assets/images/metal_roof.jpg"
}
```

## Manifest File

Each download includes a `manifest.json` with enhanced tracking:

```json
{
  "generated": "2024-01-15T10:30:00.000Z",
  "structure": "mirrors /personal/old/ directory structure with original filename preservation",
  "totalAssets": 15,
  "assetsByType": {
    "uploaded": 8,
    "modified": 3,
    "copied": 4
  },
  "directories": {
    "jsons/": "Updated JSON configuration files",
    "personal/old/img/main_page_images/": "Home page block images organized by block type",
    "personal/old/img/about_page/": "About page images (team photos, videos, etc.)",
    "personal/old/img/services/": "Service page images organized by service type",
    "personal/old/img/all_dev/": "Development/showcase block images"
  },
  "assets": [
    {
      "path": "personal/old/img/about_page/team/roofer.png",
      "type": "file",
      "originalName": "new_team_photo.jpg",
      "description": "New upload (renamed to preserve original structure)",
      "serviceContext": null
    }
  ],
  "note": "Original filenames are preserved when possible. Uploaded images replace existing ones with matching names in the old structure."
}
```

## Integration Instructions

1. **Backup**: Always backup your current `/personal/old/` directory
2. **JSONs**: Replace JSON files in `/personal/old/jsons/`
3. **Assets**: Extract `personal/old/img/` directory contents to your existing `/personal/old/img/`
4. **Verify**: Check that all paths in JSON files point to existing assets

## Benefits

- **Original Name Preservation**: Maintains existing filename conventions (roofer.png, foreman.png, etc.)
- **OLD Structure Compatibility**: Perfect match with `/personal/old/` directory organization
- **Easy Integration**: Clear paths make it simple to merge changes
- **Asset Tracking**: Know exactly what files are new, modified, or copied
- **Rollback Support**: Clear documentation enables easy rollback if needed
- **Service Organization**: Service assets properly organized by category and ID
- **Automatic Path Updates**: JSON files automatically updated with correct OLD structure paths
- **Team Photo Intelligence**: Automatically recognizes and properly names team photos

This system ensures that your downloaded content integrates seamlessly with your existing OLD structure website while preserving original filenames and maintaining backward compatibility. 