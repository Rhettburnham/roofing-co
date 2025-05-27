import React, { createContext, useContext, useEffect, useState } from "react";

const ConfigContext = createContext();

export function useConfig() {
  return useContext(ConfigContext);
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [colors, setColors] = useState(null);
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        // Check if we're on a custom domain
        const customDomain = window.location.hostname !== 'roofing-co.pages.dev' && 
                           window.location.hostname !== 'roofing-www.pages.dev' &&
                           window.location.hostname !== 'localhost';

        if (customDomain) {
          console.log("On custom domain:", window.location.hostname);
          try {
            // Fetch the domain-specific config
            const domainConfigResponse = await fetch('/api/public/config');
            console.log("Domain config response status:", domainConfigResponse.status);
            
            if (domainConfigResponse.ok) {
              const domainData = await domainConfigResponse.json();
              console.log("Successfully loaded domain config data");
              setConfig(domainData);
              
              // Fetch colors and services for custom domain
              try {
                const colorsResponse = await fetch('/api/public/colors');
                if (colorsResponse.ok) {
                  const colorsData = await colorsResponse.json();
                  setColors(colorsData);
                }
                
                const servicesResponse = await fetch('/api/public/services');
                if (servicesResponse.ok) {
                  const servicesData = await servicesResponse.json();
                  setServices(servicesData);
                }
              } catch (error) {
                console.error("Error loading domain colors/services:", error);
              }
              
              setLoading(false);
              return;
            } else {
              console.error("Failed to load domain config. Status:", domainConfigResponse.status);
              const errorText = await domainConfigResponse.text();
              console.error("Error response:", errorText);
            }
          } catch (domainConfigError) {
            console.error("Error loading domain config:", domainConfigError);
          }
        }

        // If not on custom domain or domain config failed, check authentication
        console.log("Checking authentication status...");
        const authResponse = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        console.log("Auth response status:", authResponse.status);
        
        const authData = await authResponse.json();
        console.log("Auth data received:", authData);

        if (authData.isAuthenticated) {
          console.log("User is authenticated. Config ID:", authData.configId);
          try {
            // Fetch all configs in a single request
            console.log("Fetching all configs from:", `/api/config/combined_data.json`);
            const configResponse = await fetch(`/api/config/combined_data.json`, {
              credentials: 'include'
            });
            console.log("Config response status:", configResponse.status);
            
            if (configResponse.ok) {
              const { combined_data, colors: colorsData, services: servicesData } = await configResponse.json();
              console.log("Successfully loaded all config data");
              
              if (combined_data) {
                setConfig(combined_data);
              }
              if (colorsData) {
                setColors(colorsData);
              }
              if (servicesData) {
                setServices(servicesData);
              }
              
              setLoading(false);
              return;
            } else {
              console.error("Failed to load configs. Status:", configResponse.status);
              const errorText = await configResponse.text();
              console.error("Error response:", errorText);
            }
          } catch (configError) {
            console.error("Error loading configs:", configError);
          }
        } else {
          console.log("User is not authenticated");
        }

        // Fallback to static configs
        console.log("Falling back to static configs...");
        try {
          // Fetch combined_data.json
          const staticResponse = await fetch("/data/raw_data/step_4/combined_data.json");
          if (!staticResponse.ok) {
            throw new Error("Failed to load static combined_data.json");
          }
          const staticData = await staticResponse.json();
          console.log("Successfully loaded static combined_data.json");
          setConfig(staticData);

          // Fetch colors_output.json
          const colorsResponse = await fetch("/data/colors_output.json");
          if (colorsResponse.ok) {
            const colorsData = await colorsResponse.json();
            console.log("Successfully loaded static colors_output.json");
            setColors(colorsData);
          }

          // Fetch services.json
          const servicesResponse = await fetch("/data/ignore/services.json");
          if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();
            console.log("Successfully loaded static services.json");
            setServices(servicesData);
          }
        } catch (err) {
          console.error("Error loading static configs:", err);
          throw err;
        }

      } catch (err) {
        console.error("Error in fetchConfig:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, colors, services, loading, error }}>
      {children}
    </ConfigContext.Provider>
  );
} 