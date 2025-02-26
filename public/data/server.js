// File: /Users/rhettburnham/Desktop/Scrap_tool/reviews-demo/server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const { Vibrant } = require('node-vibrant/node');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get extracted colors
app.get('/api/colors', async (req, res) => {
  try {
    // Path to the image
    const imagePath = path.join(__dirname,'public', 'assets', 'images', 'placeholder.png'); // Ensure correct path and casing

    // Check if the image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image file not found.' });
    }

    // Extract the color palette
    const palette = await Vibrant.from(imagePath).getPalette();

    console.log('Full Palette Object:', palette); // For debugging

    // Extract colors with optional chaining
    const colors = {
      Vibrant: palette.Vibrant?.hex || null,
      Muted: palette.Muted?.hex || null,
      DarkVibrant: palette.DarkVibrant?.hex || null,
      DarkMuted: palette.DarkMuted?.hex || null,
      LightVibrant: palette.LightVibrant?.hex || null,
    };

    console.log('Extracted Swatches:', colors); // For debugging

    // Filter out nulls
    const filteredColors = Object.values(colors).filter(color => color !== null);

    console.log('Filtered Colors:', filteredColors); // For debugging

    res.json(filteredColors);
  } catch (error) {
    console.error('Error extracting colors:', error);
    res.status(500).json({ error: 'Failed to extract colors.' });
  }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
