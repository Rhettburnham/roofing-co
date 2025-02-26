// src/pages/ServicePage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Import ALL block components used across commercial & residential
import HeroBlock from "./blocks/HeroBlock";
import GeneralList from "./blocks/GeneralList";
import VideoCTA from "./blocks/VideoCTA";
import GeneralListVariant2 from "./blocks/GeneralListVariant2";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import ActionButtonBlock from "./blocks/ActionButtonBlock";
import HeaderBannerBlock from "./blocks/HeaderBannerBlock";
import PricingGrid from "./blocks/PricingGrid";
import ListDropdown from "./blocks/ListDropdown";
import GridImageTextBlock from "./blocks/GridImageTextBlock";
import ThreeGridWithRichTextBlock from "./blocks/ThreeGridWithRichTextBlock";
import ImageWrapBlock from "./blocks/ImageWrapBlock";
import ShingleSelectorBlock from "./blocks/ShingleSelectorBlock";
import ListImageVerticalBlock from "./blocks/ListImageVerticalBlock";

// Map block names from the JSON to the actual React components
const blockMap = {
  HeroBlock,
  GeneralList,
  VideoCTA,
  GeneralListVariant2,
  OverviewAndAdvantagesBlock,
  ActionButtonBlock,
  HeaderBannerBlock,
  PricingGrid,
  ListDropdown,
  GridImageTextBlock,
  ThreeGridWithRichTextBlock,
  ImageWrapBlock,
  ShingleSelectorBlock,
  ListImageVerticalBlock
};

const ServicePage = () => {
  const [serviceData, setServiceData] = useState(null);

  // Suppose your route is /service/:category/:id
  // e.g. /service/commercial/1 or /service/residential/2
  const { category, id } = useParams();

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Fetch the combined JSON
    fetch("/data/services.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // 'category' is either "commercial" or "residential"
        // 'id' is something like "1", "2", "3", "4"
        const idNum = parseInt(id, 10);

        if (!data[category]) {
          throw new Error(`Category "${category}" not found in JSON`);
        }

        const foundService = data[category].find(
          (service) => service.id === idNum
        );
        if (!foundService) {
          throw new Error(
            `No service with id=${idNum} under category="${category}"`
          );
        }

        setServiceData(foundService);
      })
      .catch((error) => {
        console.error("Error fetching service data:", error);
      });
  }, [category, id]);

  // Show a loading state while data is being fetched
  if (!serviceData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      {serviceData.blocks.map((block, index) => {
        const Component = blockMap[block.blockName];
        if (!Component) {
          console.warn(`No component found for block: ${block.blockName}`);
          return null;
        }
        return (
          <Component key={index} config={block.config} readOnly={true} />
        );
      })}
    </div>
  );
};

export default ServicePage;
