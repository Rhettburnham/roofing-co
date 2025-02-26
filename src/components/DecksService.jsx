// src/pages/DecksService.jsx
import React, { useEffect } from "react";
import HeroBlock from "./blocks/HeroBlock";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import PricingGrid from "./blocks/PricingGrid";
import ListDropdown from "./blocks/ListDropdown";
import VideoCTA from "./blocks/VideoCTA";

const DecksService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero
  const heroConfig = {
    backgroundImage: "/assets/images/decks/deck_hero.jpg",
    title: "Decks & Outdoor Living",
    shrinkAfterMs: 1000,
    initialHeight: "40vh",
    finalHeight: "20vh",
  };

  // Overview
  const overviewConfig = {
    heading: "Why Build a Custom Deck?",
    description:
      "A deck adds valuable outdoor living space, perfect for relaxation or entertaining. From pressure-treated wood to composite boards, our decks are designed for beauty and durability.",
    bullets: [
      { title: "Expanded Living Space", desc: "Enjoy dining or parties outdoors in comfort." },
      { title: "Increased Home Value", desc: "A quality deck can enhance curb appeal & resale." },
      { title: "Versatile Materials", desc: "Wood, composite, or exotic finishes for your style." },
    ],
    footnote: "We handle everything from design and permits to the final sealing and railing installation.",
  };

  // PricingGrid
  const pricingConfig = {
    showPrice: false,
    items: [
      {
        title: "Pressure-Treated Deck",
        image: "/assets/images/decks/treateddeck.jpg",
        alt: "Treated Deck",
        description:
          "Classic wood deck. Budget-friendly, easy to stain or paint. Lifespan 10-15 years with care.",
        rate: "$15-$20 per sq ft installed",
      },
      {
        title: "Composite Deck",
        image: "/assets/images/decks/compositedeck.jpg",
        alt: "Composite Deck",
        description:
          "Durable, low-maintenance boards in various colors. Won’t warp, fade, or splinter easily.",
        rate: "$28-$40 per sq ft installed",
      },
      {
        title: "Cedar or Redwood Deck",
        image: "/assets/images/decks/redwooddeck.jpg",
        alt: "Redwood Deck",
        description:
          "Naturally resistant to rot and insects, offering a warm, rich look.",
        rate: "$25-$35 per sq ft installed",
      },
    ],
  };

  // A “ListDropdown” highlighting deck issues / maintenance tips
  const maintenanceDropdownConfig = {
    textColor: "#333333",
    items: [
      {
        title: "Board Rot",
        causes: "High moisture, lack of sealing",
        impact: "Weakens structure, potential safety hazard",
        diagnosis: [
          "Look for soft or discolored wood",
          "Probe boards with a screwdriver for softness",
        ],
      },
      {
        title: "Loose Fasteners",
        causes: "Expansion/contraction of wood, heavy foot traffic",
        impact: "Boards shift or squeak, can lead to trip hazards",
        diagnosis: [
          "Check for raised nails or screws",
          "Listen for squeaks when walking on deck",
        ],
      },
      {
        title: "Fading & Discoloration",
        causes: "Sun exposure, weathering, insufficient sealant",
        impact: "Weakens deck’s aesthetic, can accelerate drying & cracks",
        diagnosis: [
          "Visual check for graying or bleaching color",
          "Sprinkle water: if it soaks in fast, sealant is worn",
        ],
      },
    ],
  };

  // Final CTA
  const videoCTAConfig = {
    videoSrc: "/assets/videos/deck_showcase.mp4",
    title: "Transform Your Backyard",
    description:
      "Ready for a cozy outdoor retreat? Book a consultation with our deck specialists now!",
    buttonText: "Get a Deck Estimate",
    buttonLink: "/#contact",
    textColor: "1",
    textAlignment: "center",
    overlayOpacity: 0.5,
  };

  return (
    <div className="w-full">
      <HeroBlock config={heroConfig} readOnly />
      <OverviewAndAdvantagesBlock config={overviewConfig} readOnly />
      <PricingGrid config={pricingConfig} readOnly />
      <ListDropdown config={maintenanceDropdownConfig} readOnly />
      <VideoCTA config={videoCTAConfig} readOnly />
    </div>
  );
};

export default DecksService;
