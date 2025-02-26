// src/pages/ChimneyCapsService.jsx
import React, { useEffect } from "react";
// Updated HeroBlock with shrinking effect
import HeroBlock from "./blocks/HeroBlock";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import PricingGrid from "./blocks/PricingGrid";
import ListImageVerticalBlock from "./blocks/ListImageVerticalBlock";
import VideoCTA from "./blocks/VideoCTA";

const ChimneyCapsService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1) Hero config, uses your new HeroBlock
  const heroConfig = {
    backgroundImage: "/assets/images/chimneycaps/chimney_hero.jpg",
    title: "Chimney Caps & Protection",
    shrinkAfterMs: 1200,       // Wait 1.2s, then shrink
    initialHeight: "45vh",
    finalHeight: "20vh",
  };

  // 2) Overview & Advantages
  const overviewConfig = {
    heading: "Why Chimney Caps?",
    description:
      "Installing a proper chimney cap is crucial for keeping out rain, animals, and debris. Whether you prefer stainless steel or custom copper, we tailor solutions for maximum safety and longevity.",
    bullets: [
      { title: "Moisture Defense", desc: "Stop water damage to flue and masonry." },
      { title: "Animal Blockage", desc: "Keep out birds, squirrels, or rodents." },
      { title: "Spark Arrest", desc: "Reduce stray embers landing on the roof." },
    ],
    footnote: "Extend chimney lifespan, avoid costly repairs, and ensure safer venting.",
  };

  // 3) PricingGrid example
  const pricingConfig = {
    showPrice: true,
    items: [
      {
        title: "Stainless Steel Cap",
        image: "/assets/images/chimneycaps/stainless.jpg",
        alt: "Stainless Cap",
        description: "Durable, corrosion-resistant, and fits standard flue sizes.",
        rate: "$200 - $350 (installed)",
      },
      {
        title: "Copper Cap",
        image: "/assets/images/chimneycaps/copper.jpg",
        alt: "Copper Cap",
        description: "Offers a premium look and naturally patinas over time.",
        rate: "$300 - $450 (installed)",
      },
      {
        title: "Custom Fabricated",
        image: "/assets/images/chimneycaps/custom.jpg",
        alt: "Custom Chimney Cap",
        description: "Fully tailored solutions for unique chimney shapes or aesthetics.",
        rate: "Pricing varies by design",
      },
    ],
  };

  // 4) A short “ListImageVerticalBlock” for basic steps
  const stepsConfig = {
    title: "Our Chimney Cap Installation Steps",
    enableAnimation: true,
    items: [
      {
        number: "1",
        title: "Inspection & Measurement",
        description: "We check chimney structure and measure flue dimensions for an exact fit.",
        image: "/assets/images/chimneycaps/inspection.jpg",
      },
      {
        number: "2",
        title: "Fabrication / Selection",
        description: "Choose a pre-fab or custom solution. We ensure top-grade materials.",
        image: "/assets/images/chimneycaps/fabrication.jpg",
      },
      {
        number: "3",
        title: "Secure Installation",
        description: "Caps are anchored and sealed, preventing any moisture or critter entry.",
        image: "/assets/images/chimneycaps/installation.jpg",
      },
    ],
  };

  // 5) Video CTA
  const videoCTAConfig = {
    videoSrc: "/assets/videos/chimney_cap_demo.mp4",
    title: "Ready for a Safer Chimney?",
    description:
      "Book a free chimney inspection and cap fitting to shield your home from damage.",
    buttonText: "Schedule Your Chimney Check",
    buttonLink: "/#contact",
    textColor: "1",
    textAlignment: "center",
    overlayOpacity: 0.6,
  };

  return (
    <div className="w-full">
      <HeroBlock config={heroConfig} readOnly />
      <OverviewAndAdvantagesBlock config={overviewConfig} readOnly />
      <PricingGrid config={pricingConfig} readOnly />
      <ListImageVerticalBlock config={stepsConfig} readOnly />
      <VideoCTA config={videoCTAConfig} readOnly />
    </div>
  );
};

export default ChimneyCapsService;
