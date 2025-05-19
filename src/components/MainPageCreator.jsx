import React, { useState, useEffect, lazy, Suspense } from "react";
import LoadingScreen from "./loadingScreen"; // Assuming this is a shared component

// Lazy load all main page block components
const HeroBlock = lazy(() => import("./MainPageBlocks/HeroBlock"));
const RichTextBlock = lazy(() => import("./MainPageBlocks/RichTextBlock"));
const ButtonBlock = lazy(() => import("./MainPageBlocks/ButtonBlock"));
const BasicMapBlock = lazy(() => import("./MainPageBlocks/BasicMapBlock"));
const BookingBlock = lazy(() => import("./MainPageBlocks/BookingBlock"));
const ServiceSliderBlock = lazy(() => import("./MainPageBlocks/ServiceSliderBlock"));
const TestimonialBlock = lazy(() => import("./MainPageBlocks/TestimonialBlock"));
const BeforeAfterBlock = lazy(() => import("./MainPageBlocks/BeforeAfterBlock"));
const EmployeesBlock = lazy(() => import("./MainPageBlocks/EmployeesBlock"));
const AboutBlock = lazy(() => import("./MainPageBlocks/AboutBlock")); // Assuming AboutBlock might be used on main page too

// Helper function to get props for main page blocks (can be expanded if needed)
const getBlockProps = (blockName, config) => {
  switch (blockName) {
    case "HeroBlock":
      return { heroconfig: config, readOnly: true };
    case "RichTextBlock":
      return { richTextData: config, readOnly: true };
    case "ButtonBlock":
      return { buttonconfig: config, readOnly: true };
    case "BasicMapBlock":
      return { mapData: config, readOnly: true };
    case "BookingBlock":
      return { bookingData: config, readOnly: true };
    case "ServiceSliderBlock":
      return { config: config, readOnly: true };
    case "TestimonialBlock":
      return { config: config, readOnly: true };
    case "BeforeAfterBlock":
      return { beforeAfterData: config, readOnly: true };
    case "EmployeesBlock":
      return { employeesData: config, readOnly: true };
    case "AboutBlock": // If AboutBlock is used on the main page
      return { aboutData: config, readOnly: true };
    default:
      return { config: config, readOnly: true }; // Default case
  }
};

const MainPageCreator = () => {
  const [mainPageData, setMainPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dataUrl = "/data/raw_data/step_4/combined_data.json";

  useEffect(() => {
    const fetchMainPageData = async () => {
      setLoading(true);
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch main page content");
        }
        const data = await response.json();
        console.log("MainPageCreator fetched data:", data);
        setMainPageData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading main page data for MainPageCreator:", error);
        setLoading(false);
      }
    };
    fetchMainPageData();
  }, [dataUrl]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!mainPageData || !mainPageData.mainPageBlocks || mainPageData.mainPageBlocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No main page blocks configured or data found.</p>
      </div>
    );
  }

  const { mainPageBlocks } = mainPageData;

  return (
    <div className="main-page-content">
      <Suspense fallback={<LoadingScreen />}>
        {mainPageBlocks.map((block, index) => {
          const blockProps = getBlockProps(block.blockName, block.config);
          let ComponentToRender = null;

          switch (block.blockName) {
            case "HeroBlock":
              ComponentToRender = HeroBlock;
              break;
            case "RichTextBlock":
              ComponentToRender = RichTextBlock;
              break;
            case "ButtonBlock":
              ComponentToRender = ButtonBlock;
              break;
            case "BasicMapBlock":
              ComponentToRender = BasicMapBlock;
              break;
            case "BookingBlock":
              ComponentToRender = BookingBlock;
              break;
            case "ServiceSliderBlock":
              ComponentToRender = ServiceSliderBlock;
              break;
            case "TestimonialBlock":
              ComponentToRender = TestimonialBlock;
              break;
            case "BeforeAfterBlock":
              ComponentToRender = BeforeAfterBlock;
              break;
            case "EmployeesBlock":
              ComponentToRender = EmployeesBlock;
              break;
            case "AboutBlock":
              ComponentToRender = AboutBlock;
              break;
            default:
              console.warn(`Unknown block type: ${block.blockName}`);
              return (
                <div key={index} className="p-4 text-center bg-yellow-100 text-yellow-700">
                  Unknown block type: {block.blockName}. Please check configuration.
                </div>
              );
          }

          if (!ComponentToRender) {
            return (
              <div key={index} className="p-4 text-center bg-red-100 text-red-500">
                Component for {block.blockName} not found.
              </div>
            );
          }
          
          const sectionId = block.config?.id || block.blockName.toLowerCase().replace(/block$/, "") || `section-${index}`;

          return (
            <section id={sectionId} key={index} className={block.blockName === "HeroBlock" ? "mt-[-3.5rem]" : ""}>
              <ComponentToRender {...blockProps} />
            </section>
          );
        })}
      </Suspense>
    </div>
  );
};

export default MainPageCreator; 