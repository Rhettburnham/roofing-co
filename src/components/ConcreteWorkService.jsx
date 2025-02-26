// src/pages/ConcreteWorkService.jsx
import React, { useEffect } from "react";
import HeroBlock from "./blocks/HeroBlock";
import OverviewAndAdvantagesBlock from "./blocks/OverviewAndAdvantagesBlock";
import ThreeGridWithRichTextBlock from "./blocks/ThreeGridWithRichTextBlock";
import VideoCTA from "./blocks/VideoCTA";

const ConcreteWorkService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero
  const heroConfig = {
    backgroundImage: "/assets/images/concrete/concrete_hero.jpg",
    title: "Concrete Work & Finishing",
    shrinkAfterMs: 1200,
    initialHeight: "50vh",
    finalHeight: "25vh",
  };

  // Overview & Advantages
  const overviewConfig = {
    heading: "Why Concrete?",
    description:
      "Concrete is a versatile, long-lasting material for driveways, patios, and structural additions. Our experts handle everything from site prep to decorative finishes.",
    bullets: [
      {
        title: "Durability",
        desc: "Concrete withstands heavy loads and weather extremes for decades.",
      },
      {
        title: "Customization",
        desc: "Stamped, exposed aggregate, or polished—create unique finishes.",
      },
      {
        title: "Low Maintenance",
        desc: "Periodic sealing keeps surfaces looking great.",
      },
      {
        title: "Energy Efficient",
        desc: "Helps regulate ground temperature, reducing heat island effect.",
      },
    ],
    footnote: "Whether you want a basic slab or an elegant stamped design, we’ve got you covered.",
  };

  // A ThreeGridWithRichText block to highlight finishes
  const finishesConfig = {
    paragraphText:
      "Explore three popular finishes for your next project:",
    items: [
      {
        title: "Stamped Concrete",
        image: "/assets/images/concrete/stamped.jpg",
        alt: "Stamped Concrete",
      },
      {
        title: "Exposed Aggregate",
        image: "/assets/images/concrete/exposed.jpg",
        alt: "Exposed Aggregate",
      },
      {
        title: "Broom Finish",
        image: "/assets/images/concrete/broomfinish.jpg",
        alt: "Broom Finish Concrete",
      },
    ],
  };

  // Video CTA
  const videoCTAConfig = {
    videoSrc: "/assets/videos/concrete_promo.mp4",
    title: "Ready for a New Concrete Project?",
    description:
      "From a simple patio to an elaborate driveway, we’ll help plan & execute your dream. Schedule a free estimate.",
    buttonText: "Get a Free Quote",
    buttonLink: "/#contact",
    textColor: "1",
    textAlignment: "center",
    overlayOpacity: 0.5,
  };

  return (
    <div className="w-full">
      <HeroBlock config={heroConfig} readOnly />
      <OverviewAndAdvantagesBlock config={overviewConfig} readOnly />
      <ThreeGridWithRichTextBlock config={finishesConfig} readOnly />
      <VideoCTA config={videoCTAConfig} readOnly />
    </div>
  );
};

export default ConcreteWorkService;
