// src/components/blocks/VideoCTA.jsx
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { HashLink } from "react-router-hash-link";

const VideoCTA = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    videoSrc = "/assets/videos/sidingvideo.mp4",
    title = "Ready to Upgrade Your Siding?",
    description = "Contact us today for a free consultation on the best siding option for your home.",
    buttonText = "Schedule a Consultation",
    buttonLink = "/#contact",
    textColor = "1", // "1", "2", or "3"
    textAlignment = "center", // left, center, right
    overlayOpacity = 0.5,
  } = config;

  // Map "1,2,3" -> tailwind colors
  const colorMap = {
    1: "text-white",
    2: "text-black",
    3: "text-gray-800",
  };
  const chosenTextClass = colorMap[textColor] || "text-white";

  // Map alignment
  const alignMap = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };
  const chosenAlign = alignMap[textAlignment] || alignMap.center;

  const videoRef = useRef(null);

  // Attempt autoplay in readOnly mode
  useEffect(() => {
    if (readOnly && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [readOnly]);

  // READ ONLY (LIVE) RENDER
  if (readOnly) {
    return (
      <section className="relative overflow-hidden rounded-[40px] px-4 md:px-[10vw] my-3">
        <div className="relative w-full h-[30vh] md:h-[40vh] lg:h-[50vh]">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            tabIndex={-1}
            src={videoSrc}
            className="absolute top-0 left-0 w-full h-full object-cover rounded-[40px]"
            style={{ pointerEvents: "none" }}
          />
          <div
            className="absolute inset-0 bg-black rounded-[40px]"
            style={{ opacity: overlayOpacity }}
          ></div>

          <div
            className={`absolute inset-0 flex flex-col justify-center px-4 ${chosenAlign}`}
          >
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className={`text-[5vw] md:text-4xl font-bold mb-3 md:mb-6 ${chosenTextClass}`}
            >
              {title}
            </motion.h2>
            <p
              className={`text-[3.5vw] md:text-xl mb-5 md:mb-8 ${chosenTextClass}`}
            >
              {description}
            </p>
            <HashLink
              to={buttonLink}
              className="px-3 py-2 md:px-8 md:py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
            >
              {buttonText}
            </HashLink>
          </div>
        </div>
      </section>
    );
  }

  // EDIT MODE
  const handleChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="p-2 bg-gray-800 rounded text-white">
      <h3 className="font-bold mb-2">Video CTA Editor</h3>

      {/* Video Source */}
      <label className="block text-sm mb-1">
        Video Source URL:
        <input
          type="text"
          value={videoSrc}
          onChange={(e) => handleChange("videoSrc", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
        />
      </label>

      {/* Title */}
      <label className="block text-sm mb-1">
        Title:
        <input
          type="text"
          value={title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
        />
      </label>

      {/* Description */}
      <label className="block text-sm mb-1">
        Description:
        <textarea
          rows={2}
          value={description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
        />
      </label>

      {/* Button Text */}
      <label className="block text-sm mb-1">
        Button Text:
        <input
          type="text"
          value={buttonText}
          onChange={(e) => handleChange("buttonText", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
        />
      </label>

      {/* Button Link */}
      <label className="block text-sm mb-1">
        Button Link:
        <input
          type="text"
          value={buttonLink}
          onChange={(e) => handleChange("buttonLink", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
        />
      </label>

      {/* Text Color */}
      <label className="block text-sm mb-1">
        Text Color (3 options):
        <select
          value={textColor}
          onChange={(e) => handleChange("textColor", e.target.value)}
          className="mt-1 w-full bg-gray-700 text-white rounded border border-gray-600"
        >
          <option value="1">White</option>
          <option value="2">Black</option>
          <option value="3">Gray 800</option>
        </select>
      </label>

      {/* Alignment */}
      <label className="block text-sm mb-1">
        Text Alignment:
        <select
          value={textAlignment}
          onChange={(e) => handleChange("textAlignment", e.target.value)}
          className="mt-1 w-full bg-gray-700 text-white rounded border border-gray-600"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>

      {/* Overlay Opacity */}
      <label className="block text-sm mb-1">
        Overlay Opacity (0–1):
        <input
          type="number"
          value={overlayOpacity}
          step="0.1"
          min="0"
          max="1"
          onChange={(e) => handleChange("overlayOpacity", parseFloat(e.target.value))}
          className="mt-1 w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600"
        />
      </label>
    </div>
  );
};

export default VideoCTA;
