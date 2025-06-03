# TODO: Detailed Block Refactoring Plan for Inline Editing & Focused Panels

This document outlines specific refactoring actions for each block in `src/components/blocks/` to align with the editing paradigm exemplified by `GeneralList.jsx` and detailed in `README_BlockEditingGuidelines.md`. The primary goal is to make all textual content and interactive elements (buttons, icons) editable directly within the block's display when `readOnly=false`, reserving `EditorPanel`s for media, colors, and broad structural styling.

**Core Principles to Apply to ALL Blocks:**

*   **Inline Text Editing**: All titles, descriptions, paragraphs, list items, button text, labels, etc., must use an `EditableText` for single-click inline editing. Data flows from `config` prop -> `EditableText` -> block's local state -> `onConfigChange`. look at the @general list for hwo to complete this
*   **Inline Icon Editing**: Content icons (not UI icons) should be clickable to open `IconSelectorModal.jsx` for selection.
*   **Focused `EditorPanel`s**: Panels are ONLY for: image/video uploads/URLs, color pickers, and broad structural style choices (e.g., layout columns, animation toggles, predefined block themes). They MUST NOT contain inputs for text editable inline.
*   **Visual Consistency**: `readOnly={false}` display should be visually identical to `readOnly={true}` display, except for subtle editing cues.
*   **Data Source**: Assume block `config` props are sourced from `services.json` (via `ServiceEditPage.jsx`) or `combined_data.json` (via `MainPageForm.jsx`).

--- 

## Block-Specific Refactoring Actions:

Below is a breakdown for each block. `config` refers to the block's primary data prop.

**1. `HeroBlock.jsx` (Reference - Already mostly compliant)**
    *   **Inline Editable**: `config.title` (already done).
    *   **EditorPanel**: Manages `config.backgroundImage`, `config.titleTextColor`, `config.fallbackBackgroundColor`, `config.shrinkAfterMs`, `config.initialHeight`, `config.finalHeight`. (This is good, title input was removed).
    *   **TODO**: N/A, good example.

**2. `GeneralList.jsx` (Reference - Already refactored)**
    *   **Inline Editable**: `config.sectionTitle` (or `config.title`), individual string items in `config.items`, and for structured items: `item.name`, `item.description`, `item.advantages[]` text, `item.colorPossibilities`, `item.installationTime`.
    *   **EditorPanel**: Manages `config.items[index].pictures[]` (image uploads/URLs for structured items).
    *   **Display Controls (`!readOnly` view)**: Controls for `config.listStyle`, adding/removing items, adding/removing advantages.
    *   **TODO**: N/A, good example.

**3. `VideoCTA.jsx`**
    *   **Likely `config` fields**: `title`, `description`, `buttonText`, `buttonLink`, `videoSrc`, `textColor`, `textAlignment`, `overlayOpacity`.
    *   **Inline Editable**: `config.title`, `config.description`, `config.buttonText`.
    *   **EditorPanel**: `config.videoSrc` (upload/URL), `config.buttonLink`, `config.textColor` (picker), `config.textAlignment` (select: left/center/right), `config.overlayOpacity` (slider/number).

**4. `ThreeGridWithRichTextBlock.jsx`**
    *   **Likely `config` fields**: `paragraphText`, `items: [{ title, image, alt }]`.
    *   **Inline Editable**: `config.paragraphText`. For each item in `config.items`: `item.title`.
    *   **EditorPanel**: For each item in `config.items`: `item.image` (upload/URL), `item.alt` (text input, as it's metadata for the image). Controls to add/remove items.

**5. `OverviewAndAdvantagesBlock.jsx`**
    *   **Likely `config` fields**: `heading`, `description`, `bullets: [{ title, desc, icon? }]`, `footnote`.
    *   **Inline Editable**: `config.heading`, `config.description`, `config.footnote`. For each item in `config.bullets`: `item.title`, `item.desc`.
    *   **EditorPanel**: Controls to add/remove bullet items. If bullets have icons (`item.icon`), these should be editable inline via `IconSelectorModal` on click when `readOnly=false`.

**6. `PricingGrid.jsx`**
    *   **Likely `config` fields**: `showPrice` (boolean), `items: [{ title, image, alt, description, rate }]`.
    *   **Inline Editable**: For each item in `config.items`: `item.title`, `item.description`, `item.rate`.
    *   **EditorPanel**: `config.showPrice` (toggle). For each item: `item.image` (upload/URL), `item.alt` (text input). Controls to add/remove items.

**7. `ShingleSelectorBlock.jsx`**
    *   **Likely `config` fields**: `sectionTitle`, `shingleOptions: [{ title, description, benefit, image? }]`.
    *   **Inline Editable**: `config.sectionTitle`. For each item in `config.shingleOptions`: `item.title`, `item.description`, `item.benefit`.
    *   **EditorPanel**: For each `item.image` (if present): upload/URL. Controls to add/remove shingle options.

**8. `ImageWrapBlock.jsx`**
    *   **Likely `config` fields**: `imageUrl`, `altText`, `floatSide`, `maxWidthPx`, `paragraph`.
    *   **Inline Editable**: `config.paragraph`, `config.altText` (as it directly relates to the displayed image content meaning).
    *   **EditorPanel**: `config.imageUrl` (upload/URL), `config.floatSide` (select: left/right), `config.maxWidthPx` (number input).

**9. `ListDropdown.jsx` (Accordion-like)**
    *   **Likely `config` fields**: `textColor`, `items: [{ title, causes, impact, diagnosis: [] }]`.
    *   **Inline Editable**: For each item in `config.items`: `item.title`, `item.causes`, `item.impact`. For each string in `item.diagnosis`: the string itself.
    *   **EditorPanel**: `config.textColor` (picker). Controls to add/remove items in `config.items`, and add/remove diagnosis strings within each item.

**10. `ListImageVerticalBlock.jsx`**
    *   **Likely `config` fields**: `title`, `enableAnimation`, `items: [{ number, title, description, image }]`.
    *   **Inline Editable**: `config.title`. For each item in `config.items`: `item.number` (or auto-generate), `item.title`, `item.description`.
    *   **EditorPanel**: `config.enableAnimation` (toggle). For each item: `item.image` (upload/URL). Controls to add/remove items.

**11. `GeneralListVariant2.jsx`**
    *   **Likely `config` fields**: `title`, `items: [{ id, name, description, features: [], uses, limitations, imageUrl }]`.
    *   **Inline Editable**: `config.title`. For each item in `config.items`: `item.name`, `item.description`, `item.uses`, `item.limitations`. For each string in `item.features`: the string itself.
    *   **EditorPanel**: For each item: `item.imageUrl` (upload/URL). Controls to add/remove items and features within items.

**12. `GridImageTextBlock.jsx`**
    *   **Likely `config` fields**: `columns`, `items: [{ title, image, alt, description }]`.
    *   **Inline Editable**: For each item in `config.items`: `item.title`, `item.description`.
    *   **EditorPanel**: `config.columns` (number input or select). For each item: `item.image` (upload/URL), `item.alt` (text input). Controls to add/remove items.

**13. `HeaderBannerBlock.jsx`**
    *   **Likely `config` fields**: `title`, `textAlign`, `fontSize`, `textColor`, `bannerHeight`, `paddingY`, `backgroundImage`.
    *   **Inline Editable**: `config.title`.
    *   **EditorPanel**: `config.backgroundImage` (upload/URL), `config.textColor` (picker), `config.textAlign` (select), `config.fontSize` (select or text input), `config.bannerHeight` (select or text input), `config.paddingY` (select or text input).

**14. `ActionButtonBlock.jsx`**
    *   **Likely `config` fields**: `buttonText`, `buttonLink`, `buttonColor` (or style variant).
    *   **Inline Editable**: `config.buttonText`.
    *   **EditorPanel**: `config.buttonLink` (text input), `config.buttonColor` (picker or style variant selector).

**15. `PageHeroBlock.jsx` (Potentially more complex Hero variant)**
    *   **Analyze**: Identify all text elements (main title, subtitle, descriptions, button texts if any).
    *   **Inline Editable**: All identified text elements. Any buttons for their text.
    *   **EditorPanel**: Background images/videos, color overlays, color pickers, animation settings, structural toggles (e.g., show/hide subtitle).

**16. `ImageFeatureListBlock.jsx`**
    *   **Likely `config` fields**: `items: [{ title, description, icon?, image? }]`.
    *   **Inline Editable**: For each item: `item.title`, `item.description`. If `item.icon` exists, make it clickable to use `IconSelectorModal`.
    *   **EditorPanel**: For each item `item.image` (if it exists): upload/URL. Controls to add/remove items.

**17. `DetailedListBlock.jsx` (Likely similar to GeneralList but more complex items)**
    *   **Analyze**: Structure of `config.items`. Identify all text fields within each item.
    *   **Inline Editable**: All text fields within each item.
    *   **EditorPanel**: Image/media management for items, color pickers for item elements (if not theme-based), structural choices (e.g., layout per item).

**18. `CallToActionButtonBlock.jsx`**
    *   **Likely `config` fields**: `title`, `subtitle`, `buttonText`, `buttonLink`, `backgroundImage`, `icon?`.
    *   **Inline Editable**: `config.title`, `config.subtitle`, `config.buttonText`. If `config.icon` is present and part of content, make it editable with `IconSelectorModal`.
    *   **EditorPanel**: `config.backgroundImage` (upload/URL), `config.buttonLink` (text input). Color pickers for text, button, background overlay.

**19. `AccordionBlock.jsx`**
    *   **Likely `config` fields**: `items: [{ title, content }]`.
    *   **Inline Editable**: For each item: `item.title`, `item.content` (likely multi-line/rich text capable).
    *   **EditorPanel**: Controls to add/remove accordion items. Styling options for accordion (colors, icons for open/close state if not hardcoded).

**20. `NumberedImageTextBlock.jsx`**
    *   **Likely `config` fields**: `items: [{ number?, title, text, image, alt }]`.
    *   **Inline Editable**: For each item: `item.number` (if manually set), `item.title`, `item.text`.
    *   **EditorPanel**: For each item: `item.image` (upload/URL), `item.alt`. Controls to add/remove items. Option for auto-numbering.

**21. `OptionSelectorBlock.jsx` (Potentially complex, like a tabbed or selectable card interface)**
    *   **Analyze**: How options are defined and displayed. Identify titles, descriptions, sub-features within each option.
    *   **Inline Editable**: All text associated with each option.
    *   **EditorPanel**: Management of options (add/remove). Image/icon uploads for options. Styling for selected vs. unselected states, overall layout.

**22. `TextImageBlock.jsx`**
    *   **Likely `config` fields**: `title?`, `text`, `image`, `alt`, `imagePosition` (left/right).
    *   **Inline Editable**: `config.title` (if exists), `config.text`.
    *   **EditorPanel**: `config.image` (upload/URL), `config.alt`, `config.imagePosition` (select).

**23. `CardGridBlock.jsx`**
    *   **Likely `config` fields**: `columns`, `items: [{ title, text, image?, icon?, buttonText?, buttonLink? }]`.
    *   **Inline Editable**: For each item: `item.title`, `item.text`, `item.buttonText`. If `item.icon` exists, make inline editable with `IconSelectorModal`.
    *   **EditorPanel**: `config.columns` (select). For each item: `item.image` (upload/URL), `item.buttonLink`. Add/remove items. Card styling options (colors, borders).

**24. `IconTextBlockGrid.jsx`**
    *   **Likely `config` fields**: `columns`, `items: [{ icon, title, text }]`.
    *   **Inline Editable**: For each item: `item.title`, `item.text`. Each `item.icon` should be clickable to use `IconSelectorModal`.
    *   **EditorPanel**: `config.columns` (select). Add/remove items. Styling for icon/text (colors, sizes if not intrinsic).

**25. `PricingTableBlock.jsx`**
    *   **Likely `config` fields**: `tables: [{ title, price, features: [], buttonText, buttonLink, highlighted? }]`.
    *   **Inline Editable**: For each table: `table.title`, `table.price`, `table.buttonText`. Each string in `table.features`.
    *   **EditorPanel**: Add/remove tables. For each table: `table.buttonLink`, `table.highlighted` (toggle). Styling options (colors for tables, highlight color).

**26. `SectionBannerBlock.jsx`**
    *   **Likely `config` fields**: `title`, `subtitle?`, `backgroundImage`, `overlayColor?`, `textColor?`.
    *   **Inline Editable**: `config.title`, `config.subtitle`.
    *   **EditorPanel**: `config.backgroundImage` (upload/URL), `config.overlayColor` (picker), `config.textColor` (picker).

**27. `FeatureOverviewBlock.jsx`**
    *   **Likely `config` fields**: `mainTitle`, `features: [{ icon, title, description, image? }]`, `overallLayout?` (e.g., alternating, all left).
    *   **Inline Editable**: `config.mainTitle`. For each feature: `feature.title`, `feature.description`. Each `feature.icon` via `IconSelectorModal`.
    *   **EditorPanel**: For each feature `feature.image` (if exists): upload/URL. Add/remove features. `config.overallLayout` (select). Styling options.

**28. `VideoHighlightBlock.jsx`**
    *   **Likely `config` fields**: `videoSrc`, `posterImage?`, `title?`, `description?`, `layoutVariant?` (e.g., video left/text right).
    *   **Inline Editable**: `config.title` (if exists), `config.description` (if exists).
    *   **EditorPanel**: `config.videoSrc` (upload/URL), `config.posterImage` (upload/URL), `config.layoutVariant` (select).

---
This detailed plan should guide the refactoring process. Each block will need careful implementation of its inline editing capabilities and a corresponding cleanup/refocusing of its `EditorPanel` (if one is necessary). 