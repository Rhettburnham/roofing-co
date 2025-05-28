import React, { createContext, useContext, useEffect, useState } from "react";

const ConfigContext = createContext();

export function useConfig() {
  return useContext(ConfigContext);
}

// Helper function to normalize color keys
const normalizeColorKeys = (colors) => {
  if (!colors) return {};
  const normalized = {};
  Object.entries(colors).forEach(([key, value]) => {
    // Convert snake_case to kebab-case
    const normalizedKey = key.replace(/_/g, '-');
    normalized[normalizedKey] = value;
  });
  return normalized;
};

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [colors, setColors] = useState(null);
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [configId, setConfigId] = useState(null);

  // Apply colors to CSS variables
  const applyColorsToCSS = (colorData) => {
    const normalizedColors = normalizeColorKeys(colorData);
    Object.entries(normalizedColors).forEach(([key, value]) => {
      const cssVarName = `--color-${key}`;
      document.documentElement.style.setProperty(cssVarName, value);
    });
    return normalizedColors;
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we're on a custom domain
        const customDomain = window.location.hostname !== 'roofing-co.pages.dev' && 
                           window.location.hostname !== 'roofing-www.pages.dev' &&
                           window.location.hostname !== 'localhost';
        setIsCustomDomain(customDomain);

        // Check authentication status
        const authResponse = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        const authData = await authResponse.json();
        setIsAuthenticated(authData.isAuthenticated);
        setConfigId(authData.configId);

        // Load config data
        const configResponse = await fetch('/api/config/load', {
          credentials: 'include'
        });
        const configData = await configResponse.json();

        if (configData.success) {
          // Update config data
          if (configData.combined_data) {
            setConfig(configData.combined_data);
          }
          
          // Handle colors with clear precedence
          let finalColors = null;
          
          // 1. First try colors_output.json
          if (configData.colors) {
            finalColors = configData.colors;
          }
          
          // 2. Then try combined_data.colors
          if (configData.combined_data?.colors) {
            finalColors = { ...finalColors, ...configData.combined_data.colors };
          }
          
          // 3. Apply colors if we have any
          if (finalColors) {
            const normalizedColors = applyColorsToCSS(finalColors);
            setColors(normalizedColors);
          }
          
          // Handle services with clear precedence
          let finalServices = null;
          
          // 1. First try services.json
          if (configData.services) {
            finalServices = configData.services;
          }
          
          // 2. Then try combined_data.services
          if (configData.combined_data?.services) {
            finalServices = { ...finalServices, ...configData.combined_data.services };
          }
          
          // 3. Set services if we have any
          if (finalServices) {
            setServices(finalServices);
          }

          // Handle assets if present
          if (configData.assets) {
            // Create a virtual file system for the assets
            const virtualFS = {};
            
            // Process each asset
            Object.entries(configData.assets).forEach(([path, asset]) => {
              // Create a blob URL for the asset
              const blob = new Blob([asset.data], { type: asset.contentType });
              const url = URL.createObjectURL(blob);
              
              // Store in virtual FS
              virtualFS[path] = url;
            });

            // Replace public assets with virtual ones
            const originalFetch = window.fetch;
            window.fetch = async (input, init) => {
              const url = typeof input === 'string' ? input : input.url;
              
              // Check if this is an asset request
              if (url.startsWith('/assets/')) {
                const relativePath = url.substring(1); // Remove leading slash
                if (virtualFS[relativePath]) {
                  // Return a Response with the virtual asset
                  return new Response(await fetch(virtualFS[relativePath]).then(r => r.blob()), {
                    headers: {
                      'Content-Type': configData.assets[relativePath].contentType
                    }
                  });
                }
              }
              
              // Fall back to original fetch for non-asset requests
              return originalFetch(input, init);
            };

            // Clean up function
            return () => {
              // Restore original fetch
              window.fetch = originalFetch;
              
              // Revoke all blob URLs
              Object.values(virtualFS).forEach(url => URL.revokeObjectURL(url));
            };
          }
        }
      } catch (err) {
        console.error('Error loading config:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ 
      config, 
      colors, 
      services, 
      loading, 
      error,
      isCustomDomain,
      isAuthenticated,
      configId
    }}>
      {children}
    </ConfigContext.Provider>
  );
}; 