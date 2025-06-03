# Editable Block Development Guidelines

This document outlines the rules and best practices for developing editable content blocks within the application, particularly for use in `MainPageForm.jsx` and `ServiceEditPage.jsx` via `OneForm.jsx`. The goal is to ensure a consistent and intuitive editing experience for users.

## Core Principles

1.  **Direct Inline Editing**: Users should be able to edit content directly on the block's preview when in edit mode (`readOnly = false`).
2.  **Focused Editor Panels**: Separate editor panels (`YourBlock.EditorPanel`) should be reserved for managing media, colors, and structural/style variations, not primary text content or direct icon choices.
3.  **Visual Consistency**: The block's appearance in edit mode should closely mirror its read-only display, maintaining formatting and layout.
4.  **Standardized Image Handling**: Image uploads, especially from `ServiceEditPage.jsx`, should follow a defined path structure for organization.

## Rule 1: Inline Editing for Text, Buttons, and Icons

*   **Text Content**:
    *   All primary textual content (titles, descriptions, paragraphs, list items, etc.) must be editable directly within the block's display when `readOnly` is `false`.
    *   Utilize a helper component like `EditableText` (see `GeneralList.jsx` or the title in `HeroBlock.jsx` for examples) that activates on a **single click** and allows text input.
    *   The `EditableText` component should manage its own editing state and use an `onChange` callback to propagate changes to the block's local state, which then calls the `onConfigChange` prop with the entire updated block configuration.

*   **Buttons**:
    *   Button text should be editable inline using an `EditableText`-like approach.
    *   Button links/actions should ideally also be configurable directly or through a very simple inline mechanism. If a modal is needed for complex actions (like selecting an internal page link from a list), it should be triggered from an inline affordance on the button/link.

*   **Icons**:
    *   Icons displayed as part of the content should be clickable in the `readOnly = false` display to open an icon selection modal.
    *   Use the `IconSelectorModal.jsx` component (from `src/components/common/`) for a consistent icon selection experience.
    *   The logic for handling icon selection (opening the modal, updating the config) can be referenced from `BasicMapBlock.jsx` (specifically its stats items' icons, which are editable in the preview via a click that opens the modal).
    *   The selected icon should be immediately reflected in the display. The icon itself is part of the content, so its selection is inline.

## Rule 2: Editor Panel for Media, Colors, and Broad Styles Only

*   If a block requires more complex configuration that doesn't fit direct inline editing, it can have an associated `EditorPanel` component (e.g., `MyBlock.EditorPanel = MyEditorPanelComponent;`).
*   **The Editor Panel's responsibilities are strictly limited to**:
    *   **Image/Video Management**: Uploading new images/videos, pasting URLs, removing media.
    *   **Color Selection**: Using `ThemeColorPicker` or standard color inputs for block-specific color configurations (backgrounds, text colors not tied to specific inline editable elements, global accent colors for the block, etc.).
    *   **Structural/Style Choices**: Modifying broad layout options (e.g., number of columns in a grid, overall theme/variant of the block), selecting predefined style variants, toggling structural elements (e.g., show/hide an optional part of the block), or complex animation settings.
*   **The Editor Panel MUST NOT contain controls for**:
    *   Editing primary text content (this is handled by inline editing as per Rule 1).
    *   Editing button text.
    *   Directly selecting icons that are part of the main content (this is handled by inline editing with `IconSelectorModal` as per Rule 1).

*Refer to `RichTextBlock.EditorPanel` (in `MainPageBlocks`) as an example of a panel focused on media (slideshow images) and global styles (shared banner color). `GeneralList.EditorPanel` is an example of a panel focused on image management for structured list items.*

## Rule 3: Image Upload Path and `services.json` Overwrites (for `ServiceEditPage.jsx`)

*   When a block is used within `ServiceEditPage.jsx` (managed by `OneForm.jsx`), image uploads initiated from that block must be handled by `OneForm.jsx`'s central data management to:
    1.  **Update `services.json`**: The path to the new image should overwrite the corresponding field in the live `servicesData` (managed by `ServiceEditPage` and accessible by `OneForm`).
    2.  **Save Image to Correct Path for ZIP**: The actual image file should be collected by `OneForm.jsx` for inclusion in the ZIP file under a path structure like:
        `/assets/images/{service_name_or_slug}/{block_name}/{image_filename.ext}`
        *   `{service_name_or_slug}`: The title or a generated slug for the specific service page being edited (e.g., "Siding", "Built-Up-Roofing"). This context needs to be available to the file processing logic in `OneForm.jsx`.
        *   `{block_name}`: The `blockName` of the block instance (e.g., "HeroBlock", "GeneralList").
        *   `{image_filename.ext}`: The name of the uploaded file.

*   This path convention ensures that images are organized logically. The `traverseAndModifyDataForZip` function (or a similar specialized function for services data) in `OneForm.jsx` is responsible for this transformation when preparing the downloadable ZIP.

## Rule 4: Visual Consistency Between Edit and Read-Only Modes

*   The block's appearance when `readOnly = false` should be **visually identical** to its `readOnly = true` state in terms of:
    *   Layout and spacing.
    *   Typography (font sizes, weights, colors - unless a color is being actively edited via a picker within the panel).
    *   Overall styling.
*   The only differences should be the presence of editing affordances (e.g., a light hover effect on editable text, clickable icons/buttons that reveal edit options or open modals).
*   Avoid significant layout shifts or style changes when toggling edit mode. This provides a true "what you see is what you get" (WYSIWYG) experience.

## Implementation Notes:

*   **Props**: Blocks will typically receive `config` (or a similarly named prop for their data), `readOnly`, `onConfigChange`, `themeColors`. For blocks needing file handling, they might also receive `getDisplayUrl` and `onFileChange` (or `onPanelFileChange` if the upload is initiated from the `EditorPanel`).
*   **State Management**: Blocks should manage their temporary editing state locally if needed (e.g., for `EditableText`). All persistent changes to the block's configuration are propagated upwards via `onConfigChange(newConfig)`.
*   **`EditableText` Component**: A shared or per-block helper component for inline text editing is highly recommended. It should:
    *   Switch between text display and an input field on a single click.
    *   Automatically focus the input field.
    *   Save changes on blur or Enter (for single-line inputs).
    *   Allow reversion of changes (e.g., on Escape key).
    *   Support both single-line `<input>` and multi-line `<textarea>`.
    *   Respect the `readOnly` prop to disable editing functionality.

By adhering to these guidelines, we can create a cohesive and user-friendly content editing experience across all blocks. 