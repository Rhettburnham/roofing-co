// src/pages/Residential_service_3.jsx
import React, { useEffect } from "react";

// Reuse existing blocks
import HeroBlock from "../../blocks/HeroBlock";
import ActionButtonBlock from "../../blocks/ActionButtonBlock";
import HeaderBannerBlock from "../../blocks/HeaderBannerBlock";

// New blocks
import GridImageTextBlock from "../../blocks/GridImageTextBlock";
import ThreeGridWithRichTextBlock from "../../blocks/ThreeGridWithRichTextBlock";
import ImageWrapBlock from "../../blocks/ImageWrapBlock";

const Residential_service_3 = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1) Hero config
  const heroConfig = {
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
    title: "Ventilation",
    shrinkAfterMs: 1500,
    initialHeight: "40vh",
    finalHeight: "20vh",
  };

  // 2) Button config (“Schedule an Inspection”)
  const buttonConfig = {
    buttonText: "Schedule an Inspection",
    buttonLink: "/#book",
    buttonColor: "1", // uses your dark_button by default
  };

  // 3) First header: “Our Roof Ventilation Solutions”
  const firstHeaderConfig = {
    title: "Our Roof Ventilation Solutions",
    textAlign: "center",
    fontSize: "text-3xl",
    textColor: "#ffffff",
    bannerHeight: "h-12 md:h-16",
    paddingY: "",
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
  };

  // 4) Grid of ventilation solutions (4 columns)
  const ventilationGridConfig = {
    columns: 4,
    items: [
      {
        title: "Ridge Vents",
        image: "/assets/images/ventilation/ridge_vent.jpeg",
        alt: "Ridge Vents",
        description:
          "Installed at the peak of the roof to allow warm, humid air to escape naturally, preventing moisture buildup.",
      },
      {
        title: "Soffit Vents",
        image: "/assets/images/ventilation/soffit_vent.avif",
        alt: "Soffit Vents",
        description:
          "Installed under the eaves to draw cool air into the attic, maintaining a steady and efficient airflow.",
      },
      {
        title: "Gable Vents",
        image: "/assets/images/ventilation/gable_vent.jpg",
        alt: "Gable Vents",
        description:
          "Positioned on the gable ends to ensure effective cross-ventilation throughout the attic space.",
      },
      {
        title: "Roof Vents",
        image: "/assets/images/ventilation/roof_vent.jpg",
        alt: "Roof Vents",
        description:
          "Designed to remove excess heat and moisture, improving ventilation and roof longevity.",
      },
    ],
  };

  // 5) Second header: “Tailored Ventilation for Every Roof Type”
  const secondHeaderConfig = {
    title: "Tailored Ventilation for Every Roof Type",
    textAlign: "center",
    fontSize: "text-3xl",
    textColor: "#ffffff",
    bannerHeight: "h-16",
    paddingY: "",
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
  };

  // 6) A ThreeGridWithRichText block for the 3 roof types
  const threeGridConfig = {
    paragraphText:
      "Whether your roof is made of shingles, metal, or tiles, our expert team provides customized ventilation solutions that seamlessly integrate with your roof's aesthetic and structural integrity.",
    items: [
      {
        title: "Shingle Roofs",
        image: "/assets/images/ventilation/vent_shingle.jpeg",
        alt: "Shingle Roof",
      },
      {
        title: "Metal Roofs",
        image: "/assets/images/ventilation/vent_metal.jpg",
        alt: "Metal Roof",
      },
      {
        title: "Tile Roofs",
        image: "/assets/images/ventilation/vent_tile.jpeg",
        alt: "Tile Roof",
      },
    ],
  };

  // 7) Another button below that ( “View Shingle Selection” )
  const secondButtonConfig = {
    buttonText: "View Shingle Selection",
    buttonLink: "/shingleinstallation",
    buttonColor: "1",
  };

  // 8) Third header: “Boost Your Home's Energy Efficiency”
  const thirdHeaderConfig = {
    title: "Boost Your Home's Energy Efficiency",
    textAlign: "center",
    fontSize: "text-3xl",
    textColor: "#ffffff",
    bannerHeight: "h-16",
    paddingY: "",
    backgroundImage: "/assets/images/growth/hero_growth.jpg",
  };

  // 9) The final image + single paragraph block
  const imageWrapConfig = {
    imageUrl: "/assets/images/ventilation/roof_installation.webp",
    altText: "Energy Efficiency",
    floatSide: "left",
    maxWidthPx: 280,
    paragraph:
      "Proper roof ventilation is essential for reducing your home's cooling costs. According to the U.S. Department of Energy, effective ventilation can lower cooling expenses by up to 10% by allowing trapped hot air to escape, thereby decreasing the reliance on air conditioning systems (Energy.gov). Implementing adequate roof ventilation creates a more comfortable living environment, lowers energy bills, and extends the lifespan of your roofing materials. The National Roofing Contractors Association highlights that proper ventilation helps prevent heat-related damage, which can extend roof longevity by several years (NRCA).",
  };

  return (
    <div className="w-full">
      {/* 1) Hero */}
      <HeroBlock config={heroConfig} readOnly={true} />

      {/* 2) ActionButton */}
      <ActionButtonBlock config={buttonConfig} readOnly={true} />

      {/* 3) First header: “Our Roof Ventilation Solutions” */}
      <HeaderBannerBlock config={firstHeaderConfig} readOnly={true} />

      {/* 4) Ventilation solutions grid */}
      <GridImageTextBlock config={ventilationGridConfig} readOnly={true} />

      {/* 5) Second header: “Tailored Ventilation...” */}
      <HeaderBannerBlock config={secondHeaderConfig} readOnly={true} />

      {/* 6) 3-col grid + paragraph */}
      <ThreeGridWithRichTextBlock config={threeGridConfig} readOnly={true} />

      {/* 7) Another button */}
      <ActionButtonBlock config={secondButtonConfig} readOnly={true} />

      {/* 8) Third header: “Boost Your Home's Energy Efficiency” */}
      <HeaderBannerBlock config={thirdHeaderConfig} readOnly={true} />

      {/* 9) Image wrap final block */}
      <ImageWrapBlock config={imageWrapConfig} readOnly={true} />
    </div>
  );
};

export default Residential_service_3;
