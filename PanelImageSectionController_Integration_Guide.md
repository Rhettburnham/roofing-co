# PanelImageSectionController Integration Guide

## Overview

The `PanelImageSectionController` is a new standardized component for managing image arrays across different blocks in the OneForm system. It mirrors the functionality of `PanelTextSectionController` but is specifically designed for image collections with proper integration into OneForm's download system.

## Key Features

### 1. **Image Array Management**
- Add/remove/reorder images with intuitive UI
- Drag and drop file uploads
- Image previews with file size info
- Bulk operations (clear all)

### 2. **Smart Naming Logic**
Images are automatically named based on:
- Block type (e.g., "richtext", "button", "beforeafter")
- Array type (e.g., "overlay", "carousel", "gallery")
- Index position (e.g., "richtext_overlay_1", "button_carousel_2")

### 3. **OneForm Integration**
- Properly integrates with OneForm's `processDataForJson` function
- Images are collected and organized in the download ZIP
- Supports both new uploads and existing images
- Path generation follows OneForm's directory structure

## Integration by Block

### RichTextBlock
```javascript
// Added overlayImages tab
tabs.overlayImages = (props) => (
  <PanelImageSectionController
    {...props}
    currentData={localData}
    onControlsChange={onControlsChange}
    controlType="overlayImages"
    blockType="RichTextBlock"
  />
);
```

**Generated paths**: `personal/new/img/main_page_images/RichTextBlock/overlays/richtext_overlay_1.jpg`

### ButtonBlock
```javascript
// Added carousel tab
tabs.carousel = (props) => (
  <PanelImageSectionController
    {...props}
    currentData={blockData}
    onControlsChange={onUpdate}
    controlType="carousel"
    blockType="ButtonBlock"
  />
);
```

**Generated paths**: `personal/new/img/main_page_images/ButtonBlock/carousel/button_carousel_1.jpg`

### BeforeAfterBlock
```javascript
// Added gallery tab with custom config
tabs.gallery = (props) => (
  <PanelImageSectionController
    {...props}
    currentData={blockData}
    onControlsChange={onUpdate}
    controlType="gallery"
    blockType="BeforeAfterBlock"
    imageConfig={{
      label: 'Before/After Gallery',
      itemLabel: 'Pair',
      arrayFieldName: 'items',
      generateName: (index, blockType) => `beforeafter_pair_${index + 1}`,
      maxFileSize: 8 * 1024 * 1024, // 8MB
    }}
  />
);
```

**Generated paths**: `personal/new/img/main_page_images/BeforeAfterBlock/gallery/beforeafter_pair_1.jpg`

### EmployeesBlock
```javascript
// Added team tab
tabs.team = (props) => (
  <PanelImageSectionController
    {...props}
    currentData={blockData}
    onControlsChange={onUpdate}
    controlType="gallery"
    blockType="EmployeesBlock"
    imageConfig={{
      label: 'Team Photos',
      itemLabel: 'Employee',
      arrayFieldName: 'employee',
      generateName: (index, blockType) => `employee_${index + 1}`,
      defaultPath: '/assets/images/team/'
    }}
  />
);
```

**Generated paths**: `personal/new/img/main_page_images/EmployeesBlock/gallery/employee_1.jpg`

## Configuration Options

### Control Types
- `images` - Standard slideshow images
- `overlayImages` - Overlay images for cards/effects
- `gallery` - Photo gallery collections
- `carousel` - Carousel/slider images

### Custom Image Config
```javascript
imageConfig={{
  label: 'Custom Label',
  itemLabel: 'Item',
  arrayFieldName: 'customArray',
  generateName: (index, blockType) => `custom_${index + 1}`,
  acceptedTypes: 'image/*',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  defaultPath: '/assets/images/custom/'
}}
```

## OneForm Integration Updates

### 1. Enhanced `processDataForJson`
Added support for new image array fields:
```javascript
// Added handlers for:
- overlayImages
- gallery
- employee
```

### 2. Smart Path Generation
Enhanced `generateAssetPath` to create specialized paths:
```javascript
// Examples:
- Overlay images: img/main_page_images/RichTextBlock/overlays/
- Carousel images: img/main_page_images/ButtonBlock/carousel/
- Gallery images: img/main_page_images/BeforeAfterBlock/gallery/
```

## Data Structure

### Input Format (from config)
```json
{
  "overlayImages": [
    {
      "id": "img_123456789_abc123",
      "file": File, // Browser File object (for new uploads)
      "url": "blob:http://localhost:5173/...", // Preview URL
      "name": "richtext_overlay_1",
      "originalUrl": "/assets/images/overlays/card_overlay.jpg"
    }
  ]
}
```

### Output Format (in download ZIP)
```json
{
  "overlayImages": [
    {
      "id": "img_123456789_abc123",
      "url": "/personal/new/img/main_page_images/RichTextBlock/overlays/richtext_overlay_1.jpg",
      "name": "richtext_overlay_1.jpg",
      "originalUrl": "/personal/new/img/main_page_images/RichTextBlock/overlays/richtext_overlay_1.jpg"
    }
  ]
}
```

## Usage Example

```javascript
// In your block's tabsConfig:
BlockName.tabsConfig = (blockData, onUpdate, themeColors) => ({
  // ... other tabs
  customImages: (props) => (
    <PanelImageSectionController
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      controlType="gallery"
      blockType="YourBlock"
      imageConfig={{
        label: 'Special Images',
        itemLabel: 'Image',
        arrayFieldName: 'specialImages',
        generateName: (index, blockType) => `special_${index + 1}`,
        maxFileSize: 10 * 1024 * 1024, // 10MB
      }}
    />
  ),
});
```

## Directory Structure in ZIP

```
personal/
├── old/                   # Initial state
│   ├── jsons/
│   └── img/
└── new/                   # Changes/additions
    ├── jsons/
    └── img/
        └── main_page_images/
            ├── RichTextBlock/
            │   ├── overlays/      # richtext_overlay_*.jpg
            │   └── carousel/      # richtext_slideshow_*.jpg
            ├── ButtonBlock/
            │   └── carousel/      # button_carousel_*.jpg
            ├── BeforeAfterBlock/
            │   └── gallery/       # beforeafter_pair_*.jpg
            └── EmployeesBlock/
                └── gallery/       # employee_*.jpg
```

## Benefits

1. **Standardized Interface**: Consistent UX across all blocks
2. **Smart Asset Management**: Automatic file organization and naming
3. **OneForm Integration**: Seamless download and deployment workflow
4. **Flexible Configuration**: Adaptable to different image array needs
5. **Performance Optimized**: Efficient file handling and preview generation
6. **User-Friendly**: Drag-and-drop, previews, and intuitive controls

This system provides a robust foundation for managing image collections across all blocks while maintaining proper integration with OneForm's download and deployment system. 