// src/components/blocks/OverviewAndAdvantagesBlock.jsx
import React from "react";
import { CheckCircle } from "lucide-react";

/**
 * OverviewAndAdvantagesBlock
 *
 * config = {
 *   heading: "Overview & Advantages",
 *   description: "Single-ply membranes like TPO, PVC, and EPDM ...",
 *   bullets: [
 *     { title: "Durability", desc: "Resistant to punctures, tears ..." },
 *     { title: "Flexibility", desc: "Adapts to building movement ..." },
 *     ...
 *   ]
 *   footnote?: "Optional last line or paragraph"
 * }
 */
const OverviewAndAdvantagesBlock = ({
  config = {},
  readOnly = false,
  onConfigChange,
}) => {
  const {
    heading = "Overview & Advantages",
    description = "",
    bullets = [],
    footnote = "",
  } = config;

  // READ ONLY
  if (readOnly) {
    return (
      <section className="my-3 md:my-8 px-4 md:px-16">
        {/* Heading */}
        <h2 className="text-[5vw] md:text-4xl font-bold text-center text-gray-800 mb-1 md:mb-4">
          {heading}
        </h2>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-center mx-auto max-w-3xl text-[3vw] md:text-lg mb-4">
            {description}
          </p>
        )}

        {/* Bullets */}
        {bullets.length > 0 && (
          <ul className="grid sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {bullets.map((adv, i) => (
              <li
                key={i}
                className="flex bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500"
              >
                <CheckCircle className="text-blue-500 w-6 h-6 md:w-8 md:h-8 mr-3" />
                <div>
                  <h4 className="font-semibold text-gray-800 text-[3.5vw] md:text-lg">
                    {adv.title}
                  </h4>
                  <p className="text-gray-600 text-[3vw] md:text-base">{adv.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footnote (optional) */}
        {footnote && (
          <p className="text-center text-[3vw] md:text-base text-gray-600 mt-6 max-w-3xl mx-auto">
            {footnote}
          </p>
        )}
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

  const updateBulletField = (idx, field, val) => {
    const updated = [...bullets];
    updated[idx][field] = val;
    handleChange("bullets", updated);
  };

  const addBullet = () => {
    const updated = [...bullets, { title: "", desc: "" }];
    handleChange("bullets", updated);
  };

  const removeBullet = (idx) => {
    const updated = [...bullets];
    updated.splice(idx, 1);
    handleChange("bullets", updated);
  };

  return (
    <div className="p-2 bg-gray-700 rounded text-white">
      <h3 className="font-bold mb-2">Overview & Advantages Editor</h3>

      {/* heading */}
      <label className="block text-sm mb-1">
        Heading:
        <input
          type="text"
          value={heading}
          onChange={(e) => handleChange("heading", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
        />
      </label>

      {/* description */}
      <label className="block text-sm mb-1">
        Description:
        <textarea
          rows={3}
          value={description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
        />
      </label>

      {/* bullets */}
      <p className="mt-2 font-semibold">Bullets:</p>
      {bullets.map((b, i) => (
        <div key={i} className="border border-gray-600 p-2 rounded mb-2">
          <div className="flex justify-between items-center mb-1">
            <span>Bullet {i + 1}</span>
            <button
              type="button"
              onClick={() => removeBullet(i)}
              className="bg-red-600 text-white px-2 py-1 rounded text-sm"
            >
              Remove
            </button>
          </div>
          <label className="block text-sm mb-1">
            Title:
            <input
              type="text"
              value={b.title}
              onChange={(e) => updateBulletField(i, "title", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
            />
          </label>
          <label className="block text-sm mb-1">
            Description:
            <textarea
              rows={2}
              value={b.desc}
              onChange={(e) => updateBulletField(i, "desc", e.target.value)}
              className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={addBullet}
        className="mt-1 bg-blue-600 text-white px-2 py-1 rounded text-sm"
      >
        + Add Bullet
      </button>

      {/* footnote */}
      <label className="block text-sm mt-2">
        Footnote (optional):
        <textarea
          rows={2}
          value={footnote}
          onChange={(e) => handleChange("footnote", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white border border-gray-500 rounded"
        />
      </label>
    </div>
  );
};

export default OverviewAndAdvantagesBlock;
