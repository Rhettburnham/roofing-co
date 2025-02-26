// src/pages/Residential_service_1.jsx
import React from "react";
import HeroBlock from "../../blocks/HeroBlock";
import GeneralList from "../../blocks/GeneralList";
import VideoCTA from "../../blocks/VideoCTA";

const ResidentialService1 = () => {
  // Defaults pulled from your snippet

  // Hero config
  const heroConfig = {
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
    title: "Siding Options",
    shrinkAfterMs: 1000,
    initialHeight: "40vh",
    finalHeight: "20vh",
  };

  // The “GeneralList” data (6 items from your snippet)
  const generalListConfig = {
    sectionTitle: "Select a Siding Type",
    items: [
      {
        id: 1,
        name: "Vinyl",
        description:
          "Vinyl siding is one of the most cost-effective options, typically ranging between $2–$4 per square foot. It requires minimal maintenance and is available in numerous colors and styles—some even mimic wood grain.",
        advantages: [
          "Affordability: One of the most budget-friendly choices",
          "Low Maintenance: Occasional cleaning suffices",
          "Versatility: Many colors and styles, including wood-like textures",
          "Durability: Resistant to rot, insects, and moisture",
        ],
        colorPossibilities:
          "Wide range of both light and dark hues to match diverse exteriors",
        installationTime:
          "Lightweight and easy to install, reducing labor costs and time",
        pictures: [
          "assets/images/siding/viynl1.jpg",
          "assets/images/siding/viynl2.webp",
        ],
      },
      {
        id: 2,
        name: "Wood",
        description:
          "Wood siding offers a timeless, natural look that enhances curb appeal. It also provides good insulation. However, it may require regular maintenance...",
        advantages: [
          "Aesthetic Appeal: Classic, natural look",
          "Insulation Properties: Contributes to energy efficiency",
        ],
        colorPossibilities:
          "Can be painted or stained in various colors (but requires periodic maintenance)",
        installationTime:
          "More labor-intensive than vinyl, potentially increasing overall installation time",
        pictures: [
          "assets/images/siding/wood1.webp",
          "assets/images/siding/wood2.jpg",
        ],
      },
      {
        id: 3,
        name: "Aluminum & Steel",
        description:
          "Metal siding is extremely durable, resisting fire, rot, and insect damage. It provides a sleek, modern aesthetic...",
        advantages: [
          "Durability: Performs well under various weather conditions",
          "Low Maintenance: Generally requires only occasional cleaning",
          "Modern Aesthetic: Ideal for contemporary or industrial designs",
        ],
        colorPossibilities:
          "Various finishes and colors available, though some may fade over time",
        installationTime:
          "Can be time-consuming, adding to labor costs, especially for complex designs",
        pictures: [
          "assets/images/siding/alluminimum1.jpeg",
          "assets/images/siding/steel.jpg",
        ],
      },
      {
        id: 4,
        name: "Stucco",
        description:
          "Stucco is a durable option that can last 50 to 80 years with proper maintenance...",
        advantages: [
          "Durability: Long lifespan with appropriate care",
          "Breathability: Helps moisture evaporate rapidly",
        ],
        colorPossibilities:
          "Available in a wide range of textures and colors to suit various architectural styles",
        installationTime:
          "Labor-intensive process involving multiple layers; requires skilled professionals",
        pictures: [
          "assets/images/siding/stucco.jpg",
          "assets/images/siding/stucco2.jpg",
        ],
      },
      {
        id: 5,
        name: "Engineered Wood",
        description:
          "Engineered wood siding is a cost-effective alternative to natural wood, offering similar visual appeal with increased durability...",
        advantages: [
          "Cost-Effective: Generally more affordable than natural wood",
          "Durability: Resistant to insect damage and more stable than real wood",
          "Ease of Installation: Straightforward process favored by many contractors",
          "Enhanced Strength: Incorporates fiber cement for added durability",
          "Fire Resistant: Offers better fire protection compared to traditional wood",
        ],
        colorPossibilities:
          "Available in diverse colors and textures to match your desired style",
        installationTime:
          "Installation is relatively quick, potentially reducing labor costs",
        pictures: [
          "assets/images/siding/engineered1.jpeg",
          "assets/images/siding/engineered2.jpg",
          "assets/images/siding/engineered3.webp",
        ],
      },
      {
        id: 6,
        name: "Brick Siding",
        description:
          "Brick siding is known for its longevity—often exceeding a century with minimal maintenance. It offers a timeless look and is fire-resistant...",
        advantages: [
          "Longevity: Can last over 100 years with minimal upkeep",
          "Fire Resistance: Non-combustible material",
          "Aesthetic Appeal: Timeless and classic",
        ],
        colorPossibilities:
          "Limited to natural brick tones unless painted to achieve a different aesthetic",
        installationTime:
          "Labor-intensive due to masonry work, resulting in a longer installation period",
        pictures: [
          "assets/images/siding/brick1.jpeg",
          "assets/images/siding/brick2.jpeg",
        ],
      },
    ],
  };

  // The CTA config
  const videoCTAConfig = {
    videoSrc: "/assets/videos/sidingvideo.mp4",
    title: "Ready to Upgrade Your Siding?",
    description:
      "Contact us today for a free consultation on the best siding option for your home.",
    buttonText: "Schedule a Consultation",
    buttonLink: "/#contact",
    textColor: "1", // white
    textAlignment: "center",
    overlayOpacity: 0.5,
  };

  return (
    <div className="w-full">
      {/* HERO */}
      <HeroBlock config={heroConfig} readOnly={true} />

      {/* GENERAL LIST */}
      <GeneralList config={generalListConfig} readOnly={true} />

      {/* VIDEO CTA */}
      <VideoCTA config={videoCTAConfig} readOnly={true} />
    </div>
  );
};

export default ResidentialService1;
