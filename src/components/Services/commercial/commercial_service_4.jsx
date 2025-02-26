// src/pages/commercial_service_4.jsx
import React, { useEffect } from "react";

// Reuse blocks
import HeroBlock from "../../blocks/HeroBlock";
import GeneralListVariant2 from "../../blocks/GeneralListVariant2";
import OverviewAndAdvantagesBlock from "../../blocks/OverviewAndAdvantagesBlock";
import VideoCTA from "../../blocks/VideoCTA";

const CommercialService4 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1) Hero config
  const heroConfig = {
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
    title: "Single Ply",
    shrinkAfterMs: 1000,
    initialHeight: "40vh",
    finalHeight: "20vh",
  };

  // 2) Single-ply config for “GeneralListVariant2”
  const singlePlyConfig = {
    title: "Explore Our Single-Ply Membranes",
    items: [
      {
        id: 1,
        name: "Thermoplastic TPO",
        description:
          "A reflective roofing membrane known for energy efficiency, UV/heat resistance, and durability—helping reduce cooling costs in hot climates.",
        features: [
          "Energy Efficiency (White surface)",
          "UV & Heat Resistance",
          "Durable vs. punctures/tears",
        ],
        uses: "Commercial buildings needing a reflective, cost-effective roof",
        limitations:
          "Requires clean installation; dirt accumulation can reduce reflectivity",
        imageUrl: "/assets/images/ply/Tpo.jpg",
      },
      {
        id: 2,
        name: "Thermoplastic PVC",
        description:
          "A single-ply membrane offering strong chemical/fire resistance—commonly used where roofs face grease or industrial chemicals.",
        features: [
          "Chemical Resistance (great for industrial)",
          "Fire Resistance",
          "Long-lasting, high tensile strength",
        ],
        uses: "Roofs with potential chemical exposure or high-heat zones",
        limitations:
          "Often pricier than EPDM; might need specialized install methods",
        imageUrl: "/assets/images/ply/pvc.jpg",
      },
      {
        id: 3,
        name: "EPDM",
        description:
          "A synthetic rubber membrane prized for durability and flexibility in extreme weather. Typically black, but white EPDM variants exist.",
        features: [
          "All-weather performance (heat & cold)",
          "Flexibility for building movement",
          "Long lifespan (30+ years with care)",
        ],
        uses: "Commercial/industrial roofs needing proven, long-term performance",
        limitations:
          "Black version absorbs heat; white variant is more reflective but may cost more",
        imageUrl: "/assets/images/ply/epdm.jpg",
      },
    ],
  };

  // 3) Overview & Advantages config
  const overviewConfig = {
    heading: "Overview & Advantages",
    description:
      "Single-ply membranes like TPO, PVC, and EPDM are popular for commercial and industrial roofs. Below are key benefits to consider:",
    bullets: [
      {
        title: "Durability",
        desc: "Resistant to punctures, tears, and general wear.",
      },
      {
        title: "Flexibility",
        desc: "Handles building movements & temperature swings.",
      },
      {
        title: "UV Resistance",
        desc: "Helps prevent damage from intense sunlight.",
      },
      {
        title: "Energy Efficiency",
        desc: "Reflective options help reduce cooling costs.",
      },
      {
        title: "Ease of Installation",
        desc: "Often faster & simpler than multi-layer systems.",
      },
    ],
    footnote:
      "Installation is typically quick, making these membranes cost-effective and less disruptive.",
  };

  // 4) Video CTA config
  const videoCTAConfig = {
    videoSrc: "/assets/videos/single_ply.mp4",
    title: "Ready to Get Started?",
    description:
      "Contact us today for a free roof inspection and a personalized plan for your commercial property.",
    buttonText: "Schedule an Inspection",
    buttonLink: "/#book",
    textColor: "1", // white text
    textAlignment: "center",
    overlayOpacity: 0.8,
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <HeroBlock config={heroConfig} readOnly={true} />

      {/* Single-Ply List */}
      <GeneralListVariant2 config={singlePlyConfig} readOnly={true} />

      {/* Overview & Advantages */}
      <OverviewAndAdvantagesBlock config={overviewConfig} readOnly={true} />

      {/* Video CTA */}
      <VideoCTA config={videoCTAConfig} readOnly={true} />
    </div>
  );
};

export default CommercialService4;
