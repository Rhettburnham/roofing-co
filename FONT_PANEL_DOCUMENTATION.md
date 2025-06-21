# Font Panel Documentation

## Overview

The Font Panel system provides a comprehensive way to manage fonts across all blocks in the BottomStickyEditPanel. It features a dropdown menu with categorized fonts, live preview with "ABC abc" display, and seamless integration with existing block configurations.

## Components

### PanelFontController

The main font selection component that provides:
- Dropdown menu with font categories (Sans-Serif, Serif, Display, Monospace, etc.)
- Live preview showing "ABC abc" in the selected font
- Font names styled in their respective fonts
- Support for both direct field updates and nested data structures

### Usage

#### Basic Usage
```jsx
<PanelFontController
  label="Font Family"
  currentFontValue={currentFont}
  onFontChange={handleFontChange}
  fieldName="fontFamily"
  showPreview={true}
  showCategories={true}
/>
```

#### Nested Data Structure Usage (recommended for blocks)
```jsx
<PanelFontController
  label="Font Family"
  currentData={blockData}
  onControlsChange={onControlsChange}
  fieldPrefix="textSettings"
  showPreview={true}
  showCategories={true}
/>
```

## Available Fonts

### System Fonts
- Arial
- Helvetica
- Georgia
- Times New Roman
- Courier New
- Verdana
- Trebuchet MS
- Impact

### Modern Sans-Serif (Google Fonts)
- Inter
- Roboto
- Open Sans
- Lato
- Montserrat
- Source Sans Pro
- Nunito
- Poppins
- Raleway
- Ubuntu

### Serif Fonts
- Playfair Display
- Merriweather
- Lora
- PT Serif
- Crimson Text

### Display Fonts
- Oswald
- Bebas Neue
- Anton
- Righteous

### Monospace Fonts
- Fira Code
- Source Code Pro
- JetBrains Mono

## Integration with Blocks

### 1. Add Import
```jsx
import PanelFontController from "../common/PanelFontController";
```

### 2. Create Font Controls Component
```jsx
const BlockFontsControls = ({ currentData, onControlsChange }) => {
  return (
    <div className="bg-white text-gray-800 p-4 rounded">
      <h3 className="text-lg font-semibold mb-4">Font Settings</h3>
      
      <div className="space-y-4">
        <PanelFontController
          label="Text Font"
          currentData={currentData}
          onControlsChange={onControlsChange}
          fieldPrefix="textSettings"
          showPreview={true}
          showCategories={true}
        />
        
        {/* Optional: Preview section */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div 
            className="p-4 bg-gray-100 rounded-md border"
            style={{ 
              fontFamily: currentData.textSettings?.fontFamily || 'Arial, sans-serif'
            }}
          >
            <div className="text-lg font-semibold mb-1">Sample Title</div>
            <div className="text-sm text-gray-600">Sample description text</div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 3. Add to tabsConfig
```jsx
BlockName.tabsConfig = (blockCurrentData, onControlsChange, themeColors) => {
  return {
    fonts: (props) => (
      <BlockFontsControls 
        {...props} 
        currentData={blockCurrentData}
        onControlsChange={onControlsChange}
      />
    ),
    // ... other tabs
  };
};
```

## `BottomStickyEditPanel` Integration

The fonts tab is automatically included in the standard tab order: `['general', 'fonts', 'images', 'colors', 'styling']`. The BottomStickyEditPanel will automatically display the fonts tab if a block has a `fonts` function in its `tabsConfig`.

To enable the fonts tab for a block, simply define the `fonts` key in its `tabsConfig` object.

## Example Implementations

### HeroBlock
- Controls `textSettings.fontFamily` for service text
- Provides preview of service categories
- Nested data structure using `fieldPrefix="textSettings"`

### ServiceSliderBlock
- Controls separate fonts for title and service items
- Uses direct field updates (`titleFont`, `serviceFont`)
- Multiple font controls in one panel

## Data Structure

### Nested Structure (Recommended)
```json
{
  "textSettings": {
    "fontFamily": "\"Inter\", sans-serif",
    "fontSize": 20,
    "fontWeight": 600,
    // ... other text properties
  }
}
```

### Direct Structure
```json
{
  "titleFont": "\"Playfair Display\", serif",
  "serviceFont": "\"Open Sans\", sans-serif"
}
```

## Props Reference

### PanelFontController Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | string | No | Label displayed above the font picker |
| `currentFontValue` | string | No | Current font value (for direct usage) |
| `onFontChange` | function | No | Callback for direct field updates |
| `fieldName` | string | No | Field name for direct updates |
| `currentData` | object | No | Current block data (for nested usage) |
| `onControlsChange` | function | No | Callback for nested updates |
| `fieldPrefix` | string | No | Prefix for nested field access |
| `showPreview` | boolean | No | Show "ABC abc" preview (default: true) |
| `showCategories` | boolean | No | Show category filter (default: true) |
| `className` | string | No | Additional CSS classes |

## Best Practices

1. **Use nested structure** with `fieldPrefix` for better organization
2. **Include preview sections** to show how fonts will appear
3. **Group related font controls** in a dedicated component
4. **Provide meaningful labels** and descriptions
5. **Set sensible defaults** for font fallbacks
6. **Test with various fonts** to ensure compatibility

## Troubleshooting

### Font not displaying
- Check that the font is included in the FONT_OPTIONS array
- Verify the font value format (quotes for multi-word fonts)
- Ensure CSS font loading is working

### Updates not saving
- Verify `onControlsChange` is being called correctly
- Check that the field path matches your data structure
- Ensure the block's `onConfigChange` is working

### Tab not showing
- Confirm the block has a `fonts` function in its tabsConfig
- Check BottomStickyEditPanel includes 'fonts' in `standardTabOrder`
- Ensure block passes a valid `onControlsChange` function
- Confirm `themeColors` are being passed down correctly for the color pickers in the font panel 