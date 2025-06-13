// scripts/generate-icon-list.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to convert kebab-case to PascalCase
const toPascalCase = (str) => {
  return str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, '').toUpperCase());
};

const constructionKeywords = [
  // Construction & Tools
  'wrench', 'hammer', 'truck', 'home', 'house', 'building', 'construct', 'roof', 'window', 'door', 'crane', 'ruler', 'tool', 'paint', 'hard-hat', 'shovel', 'trowel', 'brick', 'axe', 'chisel', 'drill', 'forklift', 'ladder', 'nail', 'pallet', 'pickup-truck', 'pipe', 'roller', 'saw', 'screw', 'screwdriver', 'toolbox', 'traffic-cone', 'traffic-barrier', 'trowel-square', 'utility-pole', 'varnish', 'wheelbarrow', 'broom', 'fan', 'warehouse', 'smog', 'cone',
  
  // Trades & Specifics
  'electrician', 'plumber', 'carpenter', 'welder', 'mechanic', 'technician', 'engineer', 'architect', 'surveyor', 'inspector', 'demolition', 'excavation', 'foundation', 'framing', 'insulation', 'drywall', 'flooring', 'tiling', 'roofing', 'siding', 'gutters', 'hvac', 'ventilation', 'plumbing', 'electrical', 'wiring', 'circuit', 'outlet', 'switch', 'generator', 'solar', 'panel', 'battery', 'concrete', 'asphalt', 'paver', 'bricklayer', 'mason', 'bulldozer', 'excavator', 'dump-truck', 'mixer', 'compressor', 'scaffolding', 'blueprint', 'measure', 'tape', 'level', 'square', 'utility-knife', 'bolt', 'nut', 'washer', 'gear', 'cog', 'engine', 'motor', 'pump', 'valve', 'sealant', 'caulk', 'grout', 'mortar', 'stucco', 'plaster', 'conduit', 'junction-box', 'breaker', 'fuse', 'transformer', 'inverter', 'voltage', 'current', 'power', 'energy', 'fuel', 'gas', 'diesel', 'water', 'sewer', 'drainage', 'irrigation', 'hydrant', 'sprinkler', 'nozzle', 'hose', 'faucet', 'sink', 'toilet', 'shower', 'heater', 'boiler', 'furnace', 'air-conditioner', 'duct', 'vent', 'thermostat', 'suspension', 'steering', 'chassis', 'frame',
  
  // General Business & Quality
  'shield', 'check', 'award', 'badge', 'star', 'circle', 'phone', 'mail', 'map', 'user', 'users', 'calendar', 'percent', 'tag', 'image', 'video', 'camera', 'settings', 'sliders', 'search', 'info', 'help', 'menu', 'grip', 'layout', 'grid', 'box', 'package', 'archive', 'clipboard', 'file', 'folder', 'book', 'pen', 'pencil', 'edit', 'trash', 'key', 'lock', 'unlock', 'link', 'download', 'upload', 'share', 'thumbs-up', 'thumbs-down', 'message', 'comment', 'quote', 'trending-up', 'trending-down', 'plug', 'lightbulb',
  
  // Finance & Measurement
  'pie-chart', 'bar-chart', 'activity', 'pulse', 'gauge', 'speedometer', 'timer', 'watch', 'clock', 'save', 'money', 'credit-card', 'wallet', 'gift', 'trophy', 'certificate',
  
  // Nature & Elements
  'sun', 'cloud', 'wind', 'snowflake', 'leaf', 'flame', 'bolt', 'droplet', 'filter', 'waves', 'mountain', 'tree',
  
  // Navigation & UI
  'arrow', 'log-in', 'log-out', 'user-plus', 'user-minus', 'user-check', 'user-x', 'briefcase', 'coffee', 'flag', 'globe', 'layers', 'life-buoy', 'navigation', 'compass', 'siren', 'terminal', 'wifi', 'battery',
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function getLucideIcons() {
  try {
    const dynamicImportsPath = path.resolve(rootDir, 'node_modules/lucide-react/dist/esm/dynamicIconImports.js');
    const { default: dynamicIconImports } = await import(`file://${dynamicImportsPath}`);
    const iconNames = Object.keys(dynamicIconImports);

    const filtered = iconNames.filter(name => 
        constructionKeywords.some(keyword => name.includes(keyword))
    );
    
    return filtered.map(toPascalCase);
  } catch (error) {
    console.error("Error loading lucide-react dynamic imports:", error);
    return [];
  }
}

async function getFaIcons() {
    try {
        const faIndexPath = path.resolve(rootDir, 'node_modules/react-icons/fa/index.mjs');
        const content = await fs.promises.readFile(faIndexPath, 'utf-8');
        const iconNames = [...content.matchAll(/export function (Fa[A-Z][a-zA-Z0-9]+)/g)].map(m => m[1]);
        
        const filtered = iconNames.filter(name => 
            constructionKeywords.some(keyword => name.toLowerCase().includes(keyword))
        );

        return filtered;
    } catch (error) {
        console.error("Could not read FontAwesome icons:", error);
        return [];
    }
}

async function generateIconList() {
  console.log("Generating icon lists...");

  const lucideIcons = await getLucideIcons();
  console.log(`Found ${lucideIcons.length} lucide icons.`);

  const faIcons = await getFaIcons();
  console.log(`Found ${faIcons.length} FontAwesome icons.`);

  const allIcons = {
    lucide: [...new Set(lucideIcons)].sort(),
    fa: [...new Set(faIcons)].sort(),
  };

  const outputPath = path.resolve(rootDir, 'src/constants/icon-lists.json');
  fs.writeFileSync(outputPath, JSON.stringify(allIcons, null, 2));

  console.log(`Successfully wrote ${allIcons.lucide.length} lucide and ${allIcons.fa.length} fa icons to ${outputPath}`);
}

generateIconList(); 