import React, { createContext, useContext, useEffect, useState } from "react";

const ConfigContext = createContext();

// Debug panel component
const DebugPanel = () => {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      // Call original console.log
      originalConsoleLog.apply(console, args);
      
      // Add to our logs
      const timestamp = new Date().toISOString();
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ');
      
      setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '400px',
      height: '300px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      overflow: 'auto',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999
    }}>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={() => setLogs([])}
          style={{ marginRight: '10px' }}
        >
          Clear
        </button>
      </div>
      <div style={{ overflow: 'auto', height: 'calc(100% - 40px)' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export function useConfig() {
  return useContext(ConfigContext);
}

// Custom logger for ConfigContext
const configLogger = {
  logs: [],
  log: function(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    this.logs.push(logEntry);
    
    // Create a blob and download it
    const blob = new Blob([this.logs.join('')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config-context-logs.txt';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  clear: function() {
    this.logs = [];
  }
};

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
  const [virtualFS, setVirtualFS] = useState(null);

  // Development mode flag
  const isDevelopment = process.env.NODE_ENV === 'development';

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

        if (isDevelopment) {
          console.log("Development mode: Loading local config data");
          try {
            // Load local config files
            const [combinedResponse, colorsResponse, servicesResponse] = await Promise.all([
              fetch("/data/raw_data/step_4/combined_data.json"),
              fetch("/data/raw_data/step_4/colors_output.json"),
              fetch("/data/raw_data/step_4/services.json")
            ]);

            const configData = {
              success: true,
              combined_data: combinedResponse.ok ? await combinedResponse.json() : null,
              colors: colorsResponse.ok ? await colorsResponse.json() : null,
              services: servicesResponse.ok ? await servicesResponse.json() : null
            };

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

            setLoading(false);
            return;
          } catch (err) {
            console.error('Error loading local config:', err);
            setError(err.message);
            setLoading(false);
            return;
          }
        }

        // Production mode: Load from API
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
            Object.entries(configData.assets).forEach(([path, url]) => {
              // In development, we'll use the local public directory
              if (isDevelopment) {
                // For development, we'll use the original path since it's already relative to public
                console.log(`Development mode: Using original path ${path}`);
                virtualFS[path] = path;
              } else {
                // Production mode: use the API URL
                virtualFS[path] = url;
              }
              console.log(`Registered asset override: ${path} -> ${virtualFS[path]}`);
            });

            // Replace public assets with virtual ones
            const originalFetch = window.fetch;
            window.fetch = async (input, init) => {
              const url = typeof input === 'string' ? input : input.url;
              
              // Check if this is an asset request
              if (url.startsWith('/assets/')) {
                const relativePath = url.substring(1); // Remove leading slash
                console.log(`Intercepted asset request: ${relativePath}`);
                if (virtualFS[relativePath]) {
                  console.log(`Using override for ${relativePath}: ${virtualFS[relativePath]}`);
                  // In development, we'll fetch from the local public directory
                  if (isDevelopment) {
                    // Use the path directly since it's already relative to public
                    const localUrl = `/${virtualFS[relativePath]}`;
                    console.log(`Development mode: Fetching from ${localUrl}`);
                    return fetch(localUrl);
                  }
                  // Production mode: use the API URL
                  return fetch(virtualFS[relativePath]);
                } else {
                  console.log(`No override found for ${relativePath}, using original`);
                }
              }
              
              // Fall back to original fetch for non-asset requests
              return originalFetch(input, init);
            };

            // Override getDisplayUrl to handle both custom and default images
            const originalGetDisplayUrl = getDisplayUrl;
            getDisplayUrl = (imageValue) => {
              if (!imageValue) return null;
              
              // If it's a string path, check if we have an override
              if (typeof imageValue === 'string') {
                const path = imageValue.startsWith('/') ? imageValue.substring(1) : imageValue;
                console.log(`getDisplayUrl called with string path: ${path}`);
                if (virtualFS[path]) {
                  const overrideUrl = virtualFS[path];
                  console.log(`Using override for ${path}: ${overrideUrl}`);
                  // In development, ensure path starts with /
                  if (isDevelopment) {
                    return `/${overrideUrl}`;
                  }
                  return overrideUrl;
                }
                return imageValue;
              }
              
              // If it's an object with a url property
              if (typeof imageValue === 'object' && imageValue.url) {
                // If it's a blob URL, return it directly
                if (imageValue.url.startsWith('blob:')) {
                  console.log(`Using blob URL directly: ${imageValue.url}`);
                  return imageValue.url;
                }
                
                // If it's a path, check for override
                const path = imageValue.url.startsWith('/') ? imageValue.url.substring(1) : imageValue.url;
                console.log(`getDisplayUrl called with object URL: ${path}`);
                if (virtualFS[path]) {
                  const overrideUrl = virtualFS[path];
                  console.log(`Using override for ${path}: ${overrideUrl}`);
                  // In development, ensure path starts with /
                  if (isDevelopment) {
                    return `/${overrideUrl}`;
                  }
                  return overrideUrl;
                }
                return imageValue.url;
              }
              
              return null;
            };

            // Clean up function
            return () => {
              // Restore original fetch
              window.fetch = originalFetch;
              // Restore original getDisplayUrl
              getDisplayUrl = originalGetDisplayUrl;
              // Clear logs
              configLogger.clear();
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
  }, [isDevelopment]);

  return (
    <ConfigContext.Provider value={{ 
      config, 
      colors, 
      services, 
      loading, 
      error,
      isCustomDomain,
      isAuthenticated,
      configId,
      virtualFS
    }}>
      {children}
      {/* <DebugPanel /> */}
    </ConfigContext.Provider>
  );
}; 