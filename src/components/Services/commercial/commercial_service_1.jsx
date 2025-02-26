// src/pages/commercial_service_1.jsx
import React, { useEffect, useState } from "react";

// Import your block components
import HeroBlock from "../../blocks/HeroBlock";
import GeneralList from "../../blocks/GeneralList";
import VideoCTA from "../../blocks/VideoCTA";

// Map block names (from JSON) to React components
const blockComponents = {
  HeroBlock,
  GeneralList,
  VideoCTA
};

const CommercialService1 = () => {
  const [serviceData, setServiceData] = useState(null);
  const serviceId = 1; // For now, we are only working with service one

  useEffect(() => {
    window.scrollTo(0, 0);
    // Make sure the file exists at public/data/service1.json
    fetch("/data/services.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.id === serviceId) {
          setServiceData(data);
        }
      })
      .catch((error) => console.error("Error fetching service data:", error));
  }, [serviceId]);
  
  // Show a loading state while data is being fetched
  if (!serviceData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {/* Loop over the blocks defined in the JSON and render them */}
      {serviceData.blocks.map((block, index) => {
        const BlockComponent = blockComponents[block.blockName];
        if (!BlockComponent) {
          console.error(`No component found for block name: ${block.blockName}`);
          return null;
        }
        return (
          <BlockComponent key={index} config={block.config} readOnly={true} />
        );
      })}
    </div>
  );
};

export default CommercialService1;
