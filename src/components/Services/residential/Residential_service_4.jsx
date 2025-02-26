// src/pages/Residential_service_4.jsx
import React, { useEffect } from "react";
import HeroBlock from "../../blocks/HeroBlock";
import ActionButtonBlock from "../../blocks/ActionButtonBlock";
import HeaderBannerBlock from "../../blocks/HeaderBannerBlock";
import ShingleSelectorBlock from "../../blocks/ShingleSelectorBlock";
import ListImageVerticalBlock from "../../blocks/ListImageVerticalBlock";

const Residential_service_4 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1) Hero
  const heroConfig = {
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
    title: "Shingle Installation",
    shrinkAfterMs: 1500,
    initialHeight: "100vh",
    finalHeight: "20vh",
  };

  // 2) ShingleSelector
  const shingleSelectorConfig = {
    sectionTitle: "Explore Our Shingle Options",
    shingleOptions: [
      {
        title: "Asphalt Shingles",
        description:
          "Asphalt shingles are the most popular and affordable roofing material. They come in a variety of colors and styles and provide good durability and weather resistance.",
        benefit:
          "Cost-effective and easy to install, ideal for most residential properties.",
      },
      {
        title: "Metal Shingles",
        description:
          "Metal shingles offer superior durability and can withstand harsh weather conditions. Available in various finishes, they provide a modern look.",
        benefit:
          "Long-lasting and energy-efficient, with a lifespan of 40-70 years.",
      },
      {
        title: "Slate Shingles",
        description:
          "Slate shingles are a premium option known for their natural beauty and exceptional durability. They can last over a century with proper care.",
        benefit:
          "Highly durable and adds significant curb appeal, perfect for high-end homes.",
      },
      {
        title: "Tile Shingles",
        description:
          "Tile shingles (clay or concrete) suit Mediterranean or Spanish-style roofs. They provide excellent durability and insulation.",
        benefit:
          "Resistant to fire, rot, and insects, and offers great thermal performance.",
      },
    ],
  };

  // 3) CTA button
  const ctaButtonConfig = {
    buttonText: "Schedule an Inspection",
    buttonLink: "/#book",
    buttonColor: "1", // dark_button style
  };

  // 4) Process header
  const processHeaderConfig = {
    title: "Our Installation Process",
    textAlign: "center",
    fontSize: "text-2xl",
    textColor: "#ffffff",
    bannerHeight: "h-16",
    paddingY: "",
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
  };

  // 5) Steps block
  const stepsBlockConfig = {
    title: "Our Installation Process",
    enableAnimation: true,
    items: [
      {
        number: "1",
        title: "Roof Inspection & Preparation",
        description:
          "We perform a thorough roof inspection to ensure the structure is sound and free from damage. We'll repair or replace any issues before installing new shingles.",
        image: "assets/images/shingleinstallation/inspection.jpg",
      },
      {
        number: "2",
        title: "Underlayment Installation",
        description:
          "We add a high-quality underlayment as the first layer of protection against moisture, wind, and other environmental factors.",
        image: "assets/images/shingleinstallation/underlayment.jpg",
      },
      {
        number: "3",
        title: "Shingle Placement",
        description:
          "Our expert team carefully aligns and fastens each shingle according to manufacturer guidelines for maximum performance.",
        image: "assets/images/shingleinstallation/placement.jpg",
      },
      {
        number: "4",
        title: "Final Inspection & Cleanup",
        description:
          "We conduct a final inspection to ensure everything is perfect, then leave your property spotless.",
        image: "assets/images/shingleinstallation/finalinspection.jpg",
      },
    ],
  };

  return (
    <div className="w-full">
      {/* 1) Hero */}
      <HeroBlock config={heroConfig} readOnly={true} />

      {/* 2) ShingleSelector */}
      <ShingleSelectorBlock config={shingleSelectorConfig} readOnly={true} />

      {/* 3) CTA Button */}
      <ActionButtonBlock config={ctaButtonConfig} readOnly={true} />

      {/* 4) Process Header */}
      <HeaderBannerBlock config={processHeaderConfig} readOnly={true} />

      {/* 5) Steps (vertical list with images) */}
      <ListImageVerticalBlock config={stepsBlockConfig} readOnly={true} />
    </div>
  );
};

export default Residential_service_4;
