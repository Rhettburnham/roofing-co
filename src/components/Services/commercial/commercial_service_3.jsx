// src/pages/commercial_service_3.jsx
import React, { useEffect } from "react";

// Reuse blocks
import HeroBlock from "../../blocks/HeroBlock";
import GeneralListVariant2 from "../../blocks/GeneralListVariant2";
import VideoCTA from "../../blocks/VideoCTA";

const CommercialService3 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1) Hero config
  const heroConfig = {
    backgroundImage: "", // e.g. "/assets/images/growth/hero_growth.jpg" if desired
    title: "Roof Coating",
    shrinkAfterMs: 1000,
    initialHeight: "40vh",
    finalHeight: "20vh",
  };

  // 2) “GeneralListVariant2” config for the roof coating items
  const coatingsConfig = {
    title: "Types of Roof Coatings",
    items: [
      {
        id: 1,
        name: "Acrylic Coatings",
        description:
          "Acrylic coatings are water-based and cost-effective, known for their reflectivity and UV resistance. They suit a variety of climates but may be less ideal with ponding water.",
        features: [
          "Cost-Effective",
          "Good Reflectivity",
          "Easy, Quick Application",
          "Versatile on multiple roof types",
          "UV Resistant",
        ],
        uses: "Works on metal, asphalt, single-ply membranes, etc.",
        limitations: "Not the best for continuous ponding water areas.",
        imageUrl: "/assets/images/coating/acrylic.webp",
      },
      {
        id: 2,
        name: "Silicone Coatings",
        description:
          "Silicone coatings are reflective, excel with ponding water, and offer superior UV/weather resistance. Great for extreme temps and mold/mildew resistance.",
        features: [
          "Exceptional Water Resistance",
          "High UV Stability",
          "Durable in extreme temps",
        ],
        uses: "Perfect for flat roofs in wet climates or heavy rainfall.",
        limitations:
          "Surface prep is key; silicone can be pricier than acrylic.",
        imageUrl: "/assets/images/coating/silicone.jpg",
      },
      {
        id: 3,
        name: "Polyurethane Coatings",
        description:
          "Durable, impact-resistant coatings that handle foot traffic well. Aromatic vs. aliphatic formulations differ in UV stability.",
        features: [
          "High Impact Resistance",
          "Flexible for temperature changes",
          "Good chemical resistance",
        ],
        uses: "Areas with mechanical stress or frequent foot traffic.",
        limitations:
          "Aromatic degrade under UV faster; aliphatic cost more but keep color better.",
        imageUrl: "/assets/images/coating/polyurethane.jpg",
      },
      {
        id: 4,
        name: "Elastomeric Coatings",
        description:
          "Flexible, weather-resistant seal that extends roof life. Adapts to temperature swings without cracking.",
        features: [
          "Flexibility for structural movement",
          "Excellent weather resistance",
          "Longer roof lifespan",
        ],
        uses: "Refurbishing older roofs in variable climates.",
        limitations:
          "Needs proper drying time; not all elastomerics are equal.",
        imageUrl: "/assets/images/coating/elastomeric.jpg",
      },
      {
        id: 5,
        name: "Commercial Foam (SPF)",
        description:
          "Spray Polyurethane Foam offers seamless insulation & waterproofing in one. Great R-value, lightweight application.",
        features: [
          "Seamless, minimal leak points",
          "Excellent insulation (high R-value)",
          "Lightweight on existing structure",
        ],
        uses: "Commercial roofs needing both insulation & waterproofing.",
        limitations: "Foam requires protective coating & proper curing.",
        imageUrl: "/assets/images/coating/spf.jpg",
      },
    ],
  };

  // 3) Video CTA config
  const videoCTAConfig = {
    videoSrc: "/assets/videos/roof_coating.mp4",
    title: "Ready to Get Started?",
    description:
      "Contact us today for a free roof inspection and personalized plan.",
    buttonText: "Schedule an Inspection",
    buttonLink: "/#contact",
    textColor: "1", // "1" => text-white
    textAlignment: "center", // center alignment
    overlayOpacity: 0.7,
  };

  return (
    <div className="w-full">
      {/* 1) Hero */}
      <HeroBlock config={heroConfig} readOnly={true} />

      {/* 2) Coating Selection */}
      <GeneralListVariant2 config={coatingsConfig} readOnly={true} />

      {/* 3) Video CTA */}
      <VideoCTA config={videoCTAConfig} readOnly={true} />
    </div>
  );
};

export default CommercialService3;
