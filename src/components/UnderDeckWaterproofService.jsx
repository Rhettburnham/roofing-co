// src/pages/UnderDeckWaterproofService.jsx
import React, { useEffect } from "react";
import HeroBlock from "./blocks/HeroBlock";
import ThreeGridWithRichTextBlock from "./blocks/ThreeGridWithRichTextBlock";
import ListImageVerticalBlock from "./blocks/ListImageVerticalBlock";
import PricingGrid from "./blocks/PricingGrid";
import VideoCTA from "./blocks/VideoCTA";

const UnderDeckWaterproofService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero
  const heroConfig = {
    backgroundImage: "/assets/images/underdeck/underdeck_hero.jpg",
    title: "Under-Deck Waterproof Systems",
    shrinkAfterMs: 1000,
    initialHeight: "50vh",
    finalHeight: "25vh",
  };

  // Short 3-grid introduction
  const threeGridConfig = {
    paragraphText:
      "Transform the damp area under your deck into a functional living or storage space by installing a professional-grade under-deck waterproof system.",
    items: [
      {
        title: "Dry Storage",
        image: "/assets/images/underdeck/storage.jpg",
        alt: "Underdeck Storage",
      },
      {
        title: "Outdoor Lounge",
        image: "/assets/images/underdeck/lounge.jpg",
        alt: "Underdeck Lounge",
      },
      {
        title: "Seamless Gutter Integration",
        image: "/assets/images/underdeck/integration.jpg",
        alt: "Underdeck Gutter System",
      },
    ],
  };

  // Steps with images
  const stepsConfig = {
    title: "Our Installation Process",
    enableAnimation: true,
    items: [
      {
        number: "1",
        title: "Deck Inspection & Prep",
        description:
          "Check joist spacing, correct existing issues, ensure proper deck slope for drainage.",
        image: "/assets/images/underdeck/inspection.jpg",
      },
      {
        number: "2",
        title: "Custom Panels & Drainage",
        description:
          "We measure and trim watertight panels, channeling water away to a gutter or downspout.",
        image: "/assets/images/underdeck/panels.jpg",
      },
      {
        number: "3",
        title: "Finishing Touches",
        description:
          "Add lighting, fans, or finishing trim to create a polished, comfortable area below.",
        image: "/assets/images/underdeck/finishing.jpg",
      },
    ],
  };

  // PricingGrid for example packages
  const pricingConfig = {
    showPrice: true,
    items: [
      {
        title: "Basic Under-Deck",
        image: "/assets/images/underdeck/basic.jpg",
        alt: "Basic Under-Deck",
        description:
          "Entry-level drainage system that keeps rainwater away for a dry lounge space.",
        rate: "$7 - $10 per sq ft",
      },
      {
        title: "Premium Under-Deck",
        image: "/assets/images/underdeck/premium.jpg",
        alt: "Premium Under-Deck",
        description:
          "Upgraded materials, color-matched soffits, optional integrated lighting/fans.",
        rate: "$12 - $18 per sq ft",
      },
    ],
  };

  // Final CTA
  const videoCTAConfig = {
    videoSrc: "/assets/videos/underdeck_demo.mp4",
    title: "Maximize Your Space Below Deck",
    description:
      "Ready to create a cozy, rain-proof retreat? Let’s discuss your under-deck waterproofing options!",
    buttonText: "Schedule Your Under-Deck Consult",
    buttonLink: "/#contact",
    textColor: "1",
    textAlignment: "center",
    overlayOpacity: 0.5,
  };

  return (
    <div className="w-full">
      <HeroBlock config={heroConfig} readOnly />
      <ThreeGridWithRichTextBlock config={threeGridConfig} readOnly />
      <ListImageVerticalBlock config={stepsConfig} readOnly />
      <PricingGrid config={pricingConfig} readOnly />
      <VideoCTA config={videoCTAConfig} readOnly />
    </div>
  );
};

export default UnderDeckWaterproofService;
