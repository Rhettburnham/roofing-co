// src/pages/Residential_service_2.jsx
import React, { useEffect } from "react";
import HeroBlock from "../../blocks/HeroBlock";
import ActionButtonBlock from "../../blocks/ActionButtonBlock";
import HeaderBannerBlock from "../../blocks/HeaderBannerBlock";
import PricingGrid from "../../blocks/PricingGrid";
import ListDropdown from "../../blocks/ListDropdown";

const Residential_service_2 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1) Hero config
  const heroConfig = {
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
    title: "Guttering",
    shrinkAfterMs: 1500,
    initialHeight: "40vh",
    finalHeight: "20vh",
  };

  // 2) Action button config
  const buttonConfig = {
    buttonText: "Schedule an Inspection",
    buttonLink: "/#book",
    buttonColor: "1", // or "2"/"3"
  };

  // 3) First Header Banner: “Gutter Options”
  const gutterOptionsHeaderConfig = {
    title: "Gutter Options",
    textAlign: "center",
    fontSize: "text-2xl",
    textColor: "#ffffff",
    bannerHeight: "h-16",
    paddingY: "",
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
  };

  // 4) PricingGrid for the gutter options
  const pricingGridConfig = {
    showPrice: false, // if you want to show price, set true
    items: [
      {
        title: "Aluminum Gutters",
        image: "/assets/images/gutter_image/Aluminum_gutter.webp",
        alt: "Aluminum Gutters",
        description:
          "Aluminum gutters are cost-effective, rust-resistant, and lightweight, making them a popular choice for most homes. They can last up to 20 years with proper maintenance.",
        rate: "$5 - $8 per linear foot",
      },
      {
        title: "Seamless Gutters",
        image: "/assets/images/gutter_image/Seamless_gutter.webp",
        alt: "Seamless Gutters",
        description:
          "Seamless gutters are custom-fitted, reducing leaks by eliminating joints. They offer a streamlined appearance and are durable over time.",
        rate: "$8 - $12 per linear foot",
      },
      {
        title: "Steel Gutters",
        image: "/assets/images/gutter_image/steel_gutter.jpeg",
        alt: "Steel Gutters",
        description:
          "Strong and withstand heavy rainfall and snow. Prone to rust without maintenance, but offer good durability in harsh weather.",
        rate: "$9 - $12 per linear foot",
      },
      {
        title: "Half Round Gutters",
        image: "/assets/images/gutter_image/Half_round_gutters.png",
        alt: "Half Round Gutters",
        description:
          "Semi-circular shape for efficient water drainage. Often used in historic homes to maintain architectural style.",
        rate: "$12 - $25 per linear foot",
      },
      {
        title: "Copper Gutters",
        image: "/assets/images/gutter_image/Copper_gutter.webp",
        alt: "Copper Gutters",
        description:
          "Durable and corrosion-resistant. Develop a patina over time and can last up to 50 years.",
        rate: "$25 - $40 per linear foot",
      },
      {
        title: "Vinyl Gutters",
        image: "/assets/images/gutter_image/Vinyl_gutter.webp",
        alt: "Vinyl Gutters",
        description:
          "Lightweight, inexpensive, and easy to install, but can crack or warp in extreme temperatures.",
        rate: "$3 - $5 per linear foot",
      },
    ],
  };

  // 5) Second Header Banner: “Issues and Diagnosis”
  const issuesHeaderConfig = {
    title: "Issues and Diagnosis",
    textAlign: "center",
    fontSize: "text-2xl",
    textColor: "#ffffff",
    bannerHeight: "h-16",
    paddingY: "",
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
  };

  // 6) ListDropdown for gutter issues
  const listDropdownConfig = {
    textColor: "#000000",
    items: [
      {
        title: "Clogged Gutters",
        causes:
          "Over time, gutters can become clogged with leaves, debris, and dirt.",
        impact:
          "Water that doesn’t drain properly can seep into the roof, walls, and foundation, causing water damage, mold, and erosion.",
        diagnosis: [
          "Inspect gutters after heavy rains for overflowing water.",
          "Look for debris buildup in gutters or downspouts.",
          "Examine the foundation for pooling water or erosion.",
        ],
      },
      {
        title: "Sagging Gutters",
        causes:
          "Accumulation of water/debris or poor installation adds weight, pulling them away from the roofline.",
        impact:
          "Sagging gutters cause improper drainage, possibly roof leaks or foundation issues.",
        diagnosis: [
          "Visually inspect gutters for uneven sections or sagging.",
          "Check for loose or missing fasteners.",
          "Look for water stains on the siding from overflow.",
        ],
      },
      {
        title: "Leaky Gutters",
        causes:
          "Corrosion, cracked seams, or improper sealing, typically at the joints.",
        impact:
          "Leaky gutters cause water to drip down the side of the house, damaging siding, windows, and foundation.",
        diagnosis: [
          "Inspect gutters during rainfall for leaks.",
          "Check for rust or cracks at joints.",
          "Look for water stains on siding/windows.",
        ],
      },
      {
        title: "Improper Gutter Slope",
        causes:
          "Gutters must have a slight slope to allow water flow. If it’s wrong, water pools inside.",
        impact:
          "Standing water leads to corrosion, leaks, and gutter damage, plus mosquito breeding.",
        diagnosis: [
          "Check for standing water post-rainstorm.",
          "Pour water in gutters to see flow to downspouts.",
          "Look for slow draining or pooling water.",
        ],
      },
      {
        title: "Damaged Downspouts",
        causes:
          "Clogs, poor installation, or physical impact can damage or disconnect downspouts.",
        impact:
          "Water pools near the foundation, risking basement flooding or erosion.",
        diagnosis: [
          "Check for water pooling near foundation.",
          "Inspect downspouts for cracks or disconnections.",
          "Ensure they extend far from house to direct water away.",
        ],
      },
      {
        title: "Rust and Corrosion",
        causes:
          "Metal gutters can rust over time due to moisture and the elements.",
        impact:
          "Corroded gutters may leak, damaging roof, walls, or foundation.",
        diagnosis: [
          "Look for rust spots or orange discoloration.",
          "Check for holes in the gutter system.",
          "Run water through to spot leaks in corroded areas.",
        ],
      },
      {
        title: "Ice Dams",
        causes:
          "In cold climates, snow/ice accumulate in gutters, blocking drainage.",
        impact:
          "Water backs under shingles, causing leaks, roof damage, and warped gutters.",
        diagnosis: [
          "Check gutters for ice buildup in winter.",
          "Inspect roof eaves for icicles or water stains after freeze.",
          "Look for sagging gutters from ice weight.",
        ],
      },
    ],
  };

  return (
    <div className="w-full">
      {/* 1) Hero */}
      <HeroBlock config={heroConfig} readOnly={true} />

      {/* 2) ActionButton (CTA button) */}
      <ActionButtonBlock config={buttonConfig} readOnly={true} />

      {/* 3) "Gutter Options" Banner */}
      <HeaderBannerBlock config={gutterOptionsHeaderConfig} readOnly={true} />

      {/* 4) Pricing Grid */}
      <PricingGrid config={pricingGridConfig} readOnly={true} />

      {/* 5) "Issues and Diagnosis" Banner */}
      <HeaderBannerBlock config={issuesHeaderConfig} readOnly={true} />

      {/* 6) List Dropdown */}
      <ListDropdown config={listDropdownConfig} readOnly={true} />
    </div>
  );
};

export default Residential_service_2;
