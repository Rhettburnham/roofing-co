// src/pages/commercial_service_2.jsx
import React, { useEffect } from "react";

// Reuse existing blocks
import HeroBlock from "../../blocks/HeroBlock";
import GeneralList from "../../blocks/GeneralList";
import VideoCTA from "../../blocks/VideoCTA";

const CommercialService2 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1) Hero
  const heroConfig = {
    backgroundImage: "",
    title: "Built-Up Roofing (Another Variation)",
    shrinkAfterMs: 1000,
    initialHeight: "40vh",
    finalHeight: "20vh",
  };

  // 2) General List - same or similar data as snippet #2
  const generalListConfig = {
    title: "Choose Your Flat Roofing Option",
    items: [
      {
        id: 1,
        name: "Built-Up Roofing (BUR)",
        description:
          "BUR is a traditional roofing system made of multiple layers of bitumen and reinforcing fabrics. Known for excellent waterproofing and durability for flat/low-slope roofs.",
        advantages: [
          "Durability: 15–30+ years with proper maintenance",
          "Waterproofing: Multi-layer design effectively prevents leaks",
          "UV Resistance: Gravel/mineral top layer protects against sun",
          "Low Maintenance: Requires minimal upkeep",
        ],
        colorPossibilities:
          "Typically gravel/mineral finish in neutral tones; reflective coatings optional",
        installationTime:
          "Labor-intensive, can take days to weeks depending on roof size",
        pictures: [
          "/assets/images/builtup/builtupdemo.avif",
          "/assets/images/builtup/builtuproofing2.jpg",
        ],
      },
      {
        id: 2,
        name: "Modified Bitumen Roofing",
        description:
          "Modified Bitumen uses polymers to increase elasticity, weather resistance, and lifespan. Often installed in rolled sheets via torch, cold-adhesive, or self-adhering methods.",
        advantages: [
          "Enhanced Durability: Polymers protect against extreme weather",
          "Flexibility: Adapts to temperature changes without cracking",
          "Ease of Installation: Quicker than BUR",
          "Energy Efficiency: Reflective coatings available",
        ],
        colorPossibilities:
          "Multiple colors/finishes (including shingle-like options). Reflective coatings reduce cooling costs",
        installationTime:
          "Typically 1–3 days, depending on roof size and method",
        pictures: [
          "/assets/images/builtup/modified1.jpg",
          "/assets/images/builtup/modified2.avif",
        ],
      },
    ],
  };

  // 3) Video CTA
  const videoCTAConfig = {
    videoSrc: "",
    title: "Ready to Upgrade Your Flat Roof?",
    description:
      "Get in touch for a free consultation. Let us help you choose the best flat roofing solution for your property.",
    buttonText: "Schedule a Consultation",
    buttonLink: "/#contact",
    textColor: "1",
    textAlignment: "center",
    overlayOpacity: 0.7,
  };

  return (
    <div className="w-full">
      <HeroBlock config={heroConfig} readOnly={true} />
      <GeneralList config={generalListConfig} readOnly={true} />
      <VideoCTA config={videoCTAConfig} readOnly={true} />
    </div>
  );
};

export default CommercialService2;
