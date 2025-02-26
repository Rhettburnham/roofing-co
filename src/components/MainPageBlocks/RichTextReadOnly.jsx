// src/components/MainPageBlocks/RichTextReadOnly.jsx
import React, { useState } from "react";

/**
 * The read-only display for Rich Text.
 * - No "add/remove" or <input> fields.
 * - Just show the final text, cards, images, etc.
 */
export default function RichTextReadOnly({
  heroText = "We Provide Quality Roofing Services",
  accredited = false,
  years_in_business = "14 Years in Business",
  cards = [],
  images = []
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Example: If accredited => show an extra "BBB accredited" notice, etc.
  let displayCards = accredited
    ? [
        ...cards.slice(0, 3),
        {
          title: "BBB Accredited",
          desc: "We are accredited by the Better Business Bureau, ensuring trust and reliability.",
          icon: "BadgeCheck",
        },
      ]
    : cards.slice(0, 4);

  return (
    <section className="bg-white text-black p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{heroText}</h2>
        <p className="text-gray-600">{years_in_business}</p>
      </div>

      {/* Cards Display */}
      <div className="flex flex-wrap gap-4">
        {displayCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-gray-100 border border-gray-300 p-3 w-[200px] rounded"
          >
            <h4 className="font-semibold">{card.title}</h4>
            <p className="text-sm text-gray-700">{card.desc}</p>
            <p className="text-xs text-gray-400">Icon: {card.icon}</p>
          </div>
        ))}
      </div>

      {/* Slideshow */}
      <div className="mt-6 max-w-sm">
        {images?.[currentImageIndex] ? (
          <img
            src={images[currentImageIndex]}
            alt="RichText slideshow"
            className="w-full h-auto rounded"
          />
        ) : (
          <div className="bg-gray-400 text-white p-4 rounded">
            No Images
          </div>
        )}

        {/* Simple dot or arrow controls */}
        <div className="mt-2 flex space-x-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentImageIndex === i
                  ? "bg-blue-600 scale-110"
                  : "bg-blue-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
