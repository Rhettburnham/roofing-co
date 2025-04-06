// src/components/MainPageBlocks/RichTextBlock.jsx
import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { FaQuestionCircle } from "react-icons/fa";
import ProcessBlock from "./ProcessBlock"; // Import ProcessBlock component

/* 
=============================================
1) RICH-TEXT PREVIEW (Read-Only)
---------------------------------------------
general info from step_4combined_data.json
=============================================
*/

// Create a persistent flag at module level
const ANIMATION_STATE = {
  hasAnimated: false
};

// taking data from step_4/combined_data.json
function RichTextPreview({ richTextData, processData }) {
  const [currentImage, setCurrentImage] = useState(0);
  // Track whether animations should be applied (initialized from global state)
  const [animationClass, setAnimationClass] = useState(
    ANIMATION_STATE.hasAnimated ? "animated" : "pre-animation"
  );

  const {
    heroText = "",
    bus_description = "",
    bus_description_second = "",
    cards = [],
    images = [],
  } = richTextData || {};

  if (!richTextData) {
    return <p className="text-center py-4">No RichText data found.</p>;
  }

  // Format image paths to ensure they're standardized
  const formattedImages = images.map((img) =>
    img.startsWith("/")
      ? img
      : `/assets/images/Richtext/${img.split("/").pop() || ""}`
  );

  // Use a default image if no images are provided
  const slideshowImages =
    formattedImages?.length > 0
      ? formattedImages
      : ["/assets/images/Richtext/roof_workers.jpg"];

  // little info card diff size vp logic
  const half = Math.ceil(cards.length / 2);
  const leftCards = cards.slice(0, half);
  const rightCards = cards.slice(half);

  // Overlay images used for card backgrounds and visual effects - use from data or fallback
  const overlayImages = richTextData.overlayImages || [
    "/assets/images/shake_img/1.png",
    "/assets/images/shake_img/2.png",
    "/assets/images/shake_img/3.png",
    "/assets/images/shake_img/4.png",
  ];

  // Trigger animation once on first mount only
  useEffect(() => {
    // If we've already animated, don't do anything
    if (ANIMATION_STATE.hasAnimated) return;
    
    // Set a small timeout to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setAnimationClass("animated");
      ANIMATION_STATE.hasAnimated = true;
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  function FeatureCard({ icon: Icon, title, desc, index, variant = "default" }) {
    // Base styling for all card variants
    const baseClasses = "relative bg-white p-2 rounded-lg shadow-lg flex flex-col items-center justify-center";

    // For md viewports, ensure square aspect ratio
    const sizeClasses =
      variant === "md"
        ? "md:w-[10vw] md:h-[10vw] w-[40vw] h-[22vw]"
        : "w-[40vw] h-[22vw] md:w-[13vw] md:h-[13vh]";

    // Calculate delay based on index to stagger animations
    const delay = index * 0.15;

    return (
      <div
        className={`${baseClasses} ${sizeClasses} feature-card ${animationClass}`}
        style={{ '--delay': `${delay}s` }}
      >
        {/* Decorative triangle in top-right corner */}
        <div
          className="absolute top-0 right-0 w-12 h-12 md:w-14 md:h-14 z-20 rounded-tr-lg"
          style={{
            backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
            backgroundPosition: "top right",
            backgroundRepeat: "no-repeat",
            backgroundSize: "auto",
            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
          }}
        />

        {/* Icon positioned in top-right corner */}
        <div className="absolute -top-1 -right-1 w-8 h-8 md:w-10 md:h-10 z-30 flex items-center justify-center">
          {Icon && <Icon className="text-white drop-shadow-lg" />}
        </div>

        {/* Gradient overlay for visual effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-transparent z-10 rounded-lg" />
        
        {/* Overlay image that fades away */}
        <div className={`absolute inset-0 bg-center bg-cover z-20 rounded-lg overlay-image ${animationClass}`}
             style={{ 
               backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
               '--delay': `${delay + 0.6}s`
             }}
        />
        
        {/* Title container */}
        <div className="flex flex-col z-30">
          <div className="absolute inset-0 top-5 w-full ml-2 md:ml-1 md:mr-5">
            <h3 className=" z-30 ml-1 md:ml-2 text-[2.3vw] md:text-[1.6vh] font-bold text-gray-900 font-sans">
              {title}
            </h3>
          </div>
          {/* Description text - Adjusted for tighter vertical spacing */}
          <p className="z-30 text-[2.2vw] md:text-[1.5vh] text-gray-700 text-left px-1 md:px-1 mr-4 md:mr-0 font-serif leading-tight mt-4 md:mt-3">
            {desc}
          </p>
        </div>
      </div>
    );
  }

  const animationStyles = `
    /* Style that applies only before animation starts */
    .feature-card.pre-animation {
      transform: translateX(-100%) rotate(45deg);
      opacity: 0;
    }
    
    /* Animation that runs once */
    .feature-card.animated {
      transform: translateX(0) rotate(0);
      opacity: 1;
      transition: transform 0.8s ease-out, opacity 0.8s ease-out;
      transition-delay: var(--delay, 0s);
    }
    
    /* Overlay image that fades away after cards appear */
    .overlay-image.pre-animation {
      opacity: 1;
    }
    
    .overlay-image.animated {
      opacity: 0;
      transition: opacity 0.5s ease-out;
      transition-delay: var(--delay, 0s);
    }
    
    /* Main slideshow image container */
    .image-container.pre-animation {
      opacity: 0;
    }
    
    .image-container.animated {
      opacity: 1;
      transition: opacity 1s ease-in-out;
      transition-delay: 0.5s;
    }
  `;

  return (
    <div className="w-full mx-auto">
      <style>{animationStyles}</style>

      {/* Process Block positioned at the top */}
      <div className="w-full">
        <ProcessBlock readOnly={true} processData={processData} />
      </div>

      {/* Medium screens and larger */}
      <div className="hidden md:flex flex-row px-2 mb-2 -mt-[15vh]">
        <div className="flex w-full">
          {/* Left Column: Cards stacked vertically */}
          <div className="w-1/6 flex p-1 flex-col justify-between  aspect-square ">
            {leftCards.map((card, idx) => {
              const IconComp = Icons[card.icon] || Icons.Star;
              return (
                <div
                  key={idx}
                  className="flex-1 mb-1 last:mb-0 flex items-center justify-center"
                >
                  <FeatureCard
                    variant="md"
                    icon={IconComp}
                    title={card.title}
                    desc={card.desc}
                    index={idx}
                  />
                </div>
              );
            })}
          </div>

          {/* Center Column: Image on top, text below */}
          <div className="relative flex mt-[10vh]">
            <div className="w-full flex">
              {/* Image Set: width increased */}
              <div className={`w-3/5 relative rounded-2xl shadow-md h-[30vh] image-container ${animationClass}`}>
                <img
                  src={slideshowImages[currentImage]}
                  alt="Slideshow"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-2 rounded-lg left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {slideshowImages.map((_, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setCurrentImage(sIdx)} 
                      className={`w-3 h-3 rounded-full ${
                        currentImage === sIdx
                          ? "bg-white scale-110"
                          : "bg-white/50"
                      }`}
                      aria-label={`Go to image ${sIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Bus Descriptions: width reduced slightly to balance the expanded image */}
              <div className="w-2/5 flex flex-col items-start justify-start">
                <div className="px-1">
                  <h2 className="text-[3.5vw] md:text-[2.1vh] text-center font-bold z-60 font-sans">
                    {heroText}
                  </h2>
                  <p className="text-[2.5vw] md:text-[1.6vh] text-gray-700 pl-3 mt-0.5 font-serif leading-tight">
                    {bus_description}
                  </p>
                  <p className="text-[2.5vw] md:text-[1.6vh] text-gray-700 pl-3 mt-2 font-serif leading-tight">
                    {bus_description_second}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Cards stacked vertically */}
          <div className="w-1/6 flex p-3 flex-col justify-between -mt-10">
            {rightCards.map((card, idx) => {
              const i = idx + half;
              const IconComp = Icons[card.icon] || Icons.Star;
              return (
                <div
                  key={i}
                  className="flex-1 mb-2 last:mb-0 flex items-center justify-center"
                >
                  <FeatureCard
                    variant="md"
                    icon={IconComp}
                    title={card.title}
                    desc={card.desc}
                    index={i}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smaller than medium screens */}
      <div className="relative md:hidden flex flex-col px-[3vw] mb-1 mt-0">
        {/* Image Section - Moved to top */}
        <div className={`relative w-full rounded-lg shadow-md px-3 image-container ${animationClass}`}>
          <img
            src={slideshowImages[currentImage]}
            alt="Slideshow"
            className="w-full h-[30vw] object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {slideshowImages.map((_, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setCurrentImage(sIdx)}
                className={`w-2 h-2 rounded-full ${currentImage === sIdx ? "bg-white scale-110" : "bg-white/50"}`}
                aria-label={`Go to image ${sIdx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Text Section - Now below slideshow */}
        <div className="mt-1 px-3">
          <h2 className="whitespace-nowrap relative text-[4vw] text-center font-bold z-60 px-[3vw] overflow-visible font-sans">
            {heroText}
          </h2>
        </div>

        <div>
          <p className="text-[2.8vw] text-gray-700 my-1 font-sans">
            {bus_description}
          </p>
          <p className="text-[2.8vw] text-gray-700 mb-2 font-sans">
            {bus_description_second}
          </p>
        </div>
        {/* Cards in a 2x2 (or more) grid */}
        <div className="grid grid-cols-2 gap-2 px-[2vw]">
          {cards.map((card, idx) => {
            const IconComp = Icons[card.icon] || Icons.Star;
            return (
              <div key={idx}>
                <FeatureCard
                  variant="mobile"
                  icon={IconComp}
                  title={card.title}
                  desc={card.desc}
                  index={idx}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* 
=============================================
2) RICH-TEXT EDITOR PANEL (Editing Mode)
---------------------------------------------
Allows editing of:
- heroText
- bus_description
- years_in_business
- cards[] (title, desc, icon)
- images[] (slideshow images via file upload)
Bubbles changes up via onSave()

This editor is part of the website's content management system
that allows for local editing and saving of JSON data. The edited
content can be downloaded and sent to the developer for permanent
integration into the site.
=============================================
*/
function RichTextEditorPanel({ localData, setLocalData, onSave, processData }) {
  const {
    heroText = "",
    accredited = false,
    years_in_business = "",
    bus_description = "",
    bus_description_second = "",
    cards = [],
    images = [],
    imageUploads = [],
    overlayImages = [],
  } = localData;

  // Add a new card with default values
  const handleAddCard = () => {
    setLocalData((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        { title: "New Title", desc: "New Desc", icon: "Star" },
      ],
    }));
  };

  // Remove a card at the specified index
  const handleRemoveCard = (index) => {
    const updated = [...cards];
    updated.splice(index, 1);
    setLocalData((prev) => ({ ...prev, cards: updated }));
  };

  // Update a specific field of a card at the specified index
  const handleChangeCard = (index, field, value) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setLocalData((prev) => ({ ...prev, cards: updated }));
  };

  // Add a new empty image entry to the slideshow
  const handleAddImage = () => {
    setLocalData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  // Remove an image at the specified index
  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setLocalData((prev) => ({ ...prev, images: updated }));
  };

  // Update an image at the specified index with a new file
  // Uses URL.createObjectURL to create a local URL for the image
  const handleChangeImage = (index, file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const updated = [...images];
      updated[index] = fileURL;
      setLocalData((prev) => ({ ...prev, images: updated }));
    }
  };

  return (
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto">
      {/* Show ProcessBlock in editor mode too */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Process Block Preview</h3>
        <div className="bg-gray-200 p-2 rounded">
          <ProcessBlock readOnly={true} processData={processData} />
        </div>
      </div>

      {/* Top row: Editor title + Save button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">RichText Editor</h1>
        <button
          type="button"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save
        </button>
      </div>

      {/* Hero Text */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Hero Text:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={heroText}
          onChange={(e) =>
            setLocalData((prev) => ({ ...prev, heroText: e.target.value }))
          }
        />
      </div>

      {/* Business Description */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Business Description:</label>
        <textarea
          className="w-full bg-gray-700 px-2 py-1 rounded"
          rows={3}
          value={bus_description}
          onChange={(e) =>
            setLocalData((prev) => ({
              ...prev,
              bus_description: e.target.value,
            }))
          }
        />
      </div>

      {/* Business Description Second */}
      <div className="mb-4">
        <label className="block text-sm mb-1">
          Additional Business Description:
        </label>
        <textarea
          className="w-full bg-gray-700 px-2 py-1 rounded"
          rows={3}
          value={bus_description_second}
          onChange={(e) =>
            setLocalData((prev) => ({
              ...prev,
              bus_description_second: e.target.value,
            }))
          }
        />
      </div>

      {/* Years in Business */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Years in Business:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={years_in_business}
          onChange={(e) =>
            setLocalData((prev) => ({
              ...prev,
              years_in_business: e.target.value,
            }))
          }
        />
      </div>

      {/* Feature Cards */}
      <div className="">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Feature Cards</h2>
          <button
            onClick={handleAddCard}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            + Add Card
          </button>
        </div>
        {cards.map((card, idx) => (
          <div key={idx} className="bg-gray-800 p-3 rounded mb-2 relative">
            <button
              onClick={() => handleRemoveCard(idx)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>
            <label className="block text-sm mb-1">
              Title:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={card.title || ""}
                onChange={(e) => handleChangeCard(idx, "title", e.target.value)}
              />
            </label>
            <label className="block text-sm mb-1">
              Description:
              <textarea
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                rows={2}
                value={card.desc || ""}
                onChange={(e) => handleChangeCard(idx, "desc", e.target.value)}
              />
            </label>
            <label className="block text-sm mb-1">
              Icon (lucide-react):
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={card.icon || ""}
                onChange={(e) => handleChangeCard(idx, "icon", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Slideshow Images */}
      <div>
        <div className="flex items-center justify-between mb-2 ">
          <h2 className="text-lg font-semibold">Slideshow Images</h2>
          <button
            onClick={handleAddImage}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            + Add Image
          </button>
        </div>
        {images.map((img, idx) => (
          <div key={idx} className="bg-gray-800 p-3 rounded mb-2 relative">
            <button
              onClick={() => handleRemoveImage(idx)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>
            <label className="block text-sm mb-1">
              Upload Image:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleChangeImage(idx, file);
                  }
                }}
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
              />
            </label>
            {img && (
              <img
                src={img}
                alt={`Slideshow ${idx + 1}`}
                className="mt-2 h-24 rounded shadow"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* 
=============================================
3) MAIN EXPORT: RichTextBlock
---------------------------------------------
- If readOnly=true, shows RichTextPreview
- If false, shows RichTextEditorPanel
- onConfigChange(updatedData) bubbles changes up.

This component is part of the website's content management system
that allows for local editing and saving of JSON data. The edited
content can be downloaded and sent to the developer for permanent
integration into the site.
=============================================
*/
export default function RichTextBlock({
  readOnly = false,
  richTextData,
  processData,
  onConfigChange,
}) {
  // Initialize local state with the provided data or defaults
  const [localData, setLocalData] = useState(() => {
    if (!richTextData) {
      return {
        heroText: "",
        accredited: false,
        years_in_business: "",
        bus_description: "",
        bus_description_second: "",
        cards: [],
        images: [],
        imageUploads: [],
        overlayImages: [
          "/assets/images/shake_img/1.png",
          "/assets/images/shake_img/2.png",
          "/assets/images/shake_img/3.png",
          "/assets/images/shake_img/4.png",
        ],
      };
    }
    return {
      ...richTextData,
      cards: richTextData.cards?.map((c) => ({ ...c })) || [],
      images: [...(richTextData.images || [])],
      overlayImages: [
        ...(richTextData.overlayImages || [
          "/assets/images/shake_img/1.png",
          "/assets/images/shake_img/2.png",
          "/assets/images/shake_img/3.png",
          "/assets/images/shake_img/4.png",
        ]),
      ],
    };
  });

  // Save changes back to the parent component
  const handleSave = () => {
    onConfigChange?.(localData);
  };

  // Render the appropriate component based on mode
  if (readOnly) {
    return (
      <RichTextPreview richTextData={richTextData} processData={processData} />
    );
  }

  return (
    <RichTextEditorPanel
      localData={localData}
      setLocalData={setLocalData}
      onSave={handleSave}
      processData={processData}
    />
  );
}
