// src/pages/ExteriorPaintService.jsx
import React, { useEffect } from "react";
import HeroBlock from "./blocks/HeroBlock";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import GeneralListVariant2 from "./blocks/GeneralListVariant2";
import VideoCTA from "./blocks/VideoCTA";

const ExteriorPaintService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero
  const heroConfig = {
    backgroundImage: "/assets/images/paint/exterior_paint_hero.jpg",
    title: "Exterior Painting",
    shrinkAfterMs: 1200,
    initialHeight: "50vh",
    finalHeight: "25vh",
  };

  // Overview & Advantages
  const overviewConfig = {
    heading: "Why Repaint Your Home’s Exterior?",
    description:
      "A fresh coat of paint drastically improves curb appeal while protecting siding from weathering. Choose the right finish to ensure color longevity and minimal maintenance.",
    bullets: [
      {
        title: "Boosted Curb Appeal",
        desc: "Stand out in the neighborhood with a vibrant facade.",
      },
      {
        title: "Protective Barrier",
        desc: "Proper paint guards against moisture, UV damage, and pests.",
      },
      {
        title: "Energy Efficiency",
        desc: "Reflective or lighter shades reduce heat absorption, cutting cooling costs.",
      },
    ],
    footnote:
      "From color consultations to final touch-ups, our painting pros handle every detail.",
  };

  // “GeneralListVariant2” to highlight paint types
  const paintTypesConfig = {
    title: "Our Exterior Paint Types",
    items: [
      {
        id: 101,
        name: "Acrylic Latex",
        description:
          "Water-based and quick-drying. Offers excellent adhesion, fade-resistance, and simple cleanup.",
        features: ["Fast Dry Time", "Low Odor", "Easy Cleanup (soap & water)"],
        uses: "Wood, vinyl, fiber cement, or masonry surfaces in mild climates",
        limitations: "Not ideal below 50°F or on poorly prepped surfaces",
        imageUrl: "/assets/images/paint/acrylic_latex.jpg",
      },
      {
        id: 102,
        name: "Oil-Based",
        description:
          "Classic formula with a smooth finish. Excellent flow/leveling, but longer dry times and stronger odor.",
        features: ["Smooth, Hard Finish", "Good for older chalky surfaces"],
        uses: "Older homes that previously used oil-based finishes",
        limitations:
          "Requires mineral spirits cleanup; more fumes; can yellow indoors",
        imageUrl: "/assets/images/paint/oil_based.jpg",
      },
      {
        id: 103,
        name: "Elastomeric Coating",
        description:
          "Highly flexible paint that bridges small cracks. Great for stucco or masonry in harsh weather zones.",
        features: ["Crack Bridging", "Very Weather-Resistant"],
        uses: "Stucco, masonry walls prone to minor cracks",
        limitations: "Often thicker, costlier than standard acrylic",
        imageUrl: "/assets/images/paint/elastomeric.jpg",
      },
    ],
  };

  // Final CTA
  const videoCTAConfig = {
    videoSrc: "/assets/videos/exterior_paint.mp4",
    title: "Time for a New Coat?",
    description:
      "Enhance curb appeal and safeguard your home with professional exterior painting. Let’s chat about your color ideas!",
    buttonText: "Get a Painting Quote",
    buttonLink: "/#contact",
    textColor: "1",
    textAlignment: "center",
    overlayOpacity: 0.6,
  };

  return (
    <div className="w-full">
      <HeroBlock config={heroConfig} readOnly />
      <OverviewAndAdvantagesBlock config={overviewConfig} readOnly />
      <GeneralListVariant2 config={paintTypesConfig} readOnly />
      <VideoCTA config={videoCTAConfig} readOnly />
    </div>
  );
};

export default ExteriorPaintService;
