import React, { useState } from "react";

const WhyChoose = () => {
  const [activeCard, setActiveCard] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const features = [
    {
      title: "Reliability",
      content:
        "Clients value contractors who are dependable, punctual, and adhere to agreed-upon schedules. Demonstrating professionalism by arriving on time and fulfilling commitments builds trust and confidence.",
    },
    {
      title: "Materials",
      content:
        "Clients are interested in the types of materials the roofer uses and whether they align with their preferences for durability, aesthetics, and budget.",
    },
    {
      title: "Warranty",
      content:
        "Offering warranties on both materials and workmanship provides customers with peace of mind.",
    },
    {
      title: "Safety",
      content:
        "Clients are concerned about the safety protocols that contractors have in place to protect both workers and the property during the roofing project.",
    },
  ];

  const handleCardClick = (index) => {
    if (isAnimating) return;
    if (activeCard === index) {
      setActiveCard(null);
      return;
    }

    setIsAnimating(true);
    setActiveCard(index);

    setAnimationPhase("right");
    setTimeout(() => setAnimationPhase("scale"), 300);
    setTimeout(() => setAnimationPhase("left"), 600);
    setTimeout(() => {
      setAnimationPhase(null);
      setIsAnimating(false);
    }, 900);
  };

  const getCardStyle = (index, isMobile = false) => {
    if (isMobile) {
      const baseStyle = {
        transform: "translate(0, 0) scale(1)",
        transition: "transform 0.2s ease-in-out",
      };

      let zIndex = features.length - index;

      if (index !== activeCard) {
        return { ...baseStyle, zIndex };
      }

      const transforms = {
        right: "translate(20vw, 0) scale(1)",
        scale: "translate(20vw, 0) scale(1.05)",
        left: "translate(0, 0) scale(1.05)",
        null: "translate(0, 0) scale(1)",
      };

      if (animationPhase === "right") {
        zIndex = features.length - index;
      } else {
        zIndex = 30;
      }

      return {
        ...baseStyle,
        transform: transforms[animationPhase] || transforms.null,
        zIndex,
      };
    }

    // Desktop styles
    const baseStyle = {
      transform: "translate(-50%, 0) scale(1)",
      transition: index === activeCard ? "none" : "transform 0.2s ease-in-out",
      width: "24rem",
      height: "16rem",
      left: "50%",
    };

    let zIndex = features.length - index;

    if (index !== activeCard) {
      return { ...baseStyle, zIndex };
    }

    const transforms = {
      right: "translate(-30%, 0) scale(1)",
      scale: "translate(-30%, 0) scale(1.05)",
      left: "translate(-50%, 0) scale(1.05)",
      null: "translate(-50%, 0) scale(1)",
    };

    if (animationPhase === "right") {
      zIndex = features.length - index;
    } else {
      zIndex = 30;
    }

    return {
      ...baseStyle,
      transform: transforms[animationPhase] || transforms.null,
      zIndex,
    };
  };

  return (
    <section className="">
      <div className="relative px-4 bg-gradient-to-b from-faint-color to-white">
        <h3 className="text-[4.5vw] md:text-3xl text-center font-bold text-gray-900 py-6">
          Why Choose Us?
        </h3>
        
        {/* Mobile view */}
        <div className="flex md:hidden items-start relative pb-8 mb:p-14">
          <div className="flex flex-col items-start space-y-2">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                disabled={isAnimating}
                className={`flex justify-start w-full text-left px-4 py-2 rounded transition-all duration-300 text-sm ${
                  activeCard === index
                    ? "bg-blue text-white"
                    : "hover:bg-blue-100 text-gray-700"
                }`}
              >
                <span
                  className={`mr-2 transition-transform duration-300 ${
                    activeCard === index ? "rotate-90" : ""
                  }`}
                >
                  →
                </span>
                {feature.title}
              </button>
            ))}
          </div>
          <div className="relative w-2/3">
            {features.map((feature, index) => (
              <div
                key={index}
                style={getCardStyle(index, true)}
                className="absolute transform bg-white p-4 rounded-xl drop-shadow-lg transition-transform duration-200"
              >
                <h4 className="text-[3.5vw] font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h4>
                <p className="text-[3vw] text-gray-600 mb-3">{feature.content}</p>
                <p className="text-[2.5vw] text-right text-blue-600 font-semibold">
                  {feature.source}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop view with centered deck */}
        <div className="hidden md:block relative ">
          <div className="absolute left-4 flex flex-col items-start space-y-2 justify-center h-48 w-48">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => handleCardClick(index)}
                disabled={isAnimating}
                className={`flex justify-start w-full text-left px-4 py-2 rounded ${
                  activeCard === index
                    ? "bg-blue text-white"
                    : "hover:bg-blue-100 text-gray-700"
                } ${
                  activeCard === index ? "" : "transition-all duration-300"
                }`}
              >
                <span
                  className={`mr-3 ${
                    activeCard === index ? "rotate-90" : ""
                  } ${
                    activeCard === index ? "" : "transition-transform duration-300"
                  }`}
                >
                  →
                </span>
                {feature.title}
              </button>
            ))}
          </div>
          <div className="mx-auto max-w-2xl h-64 relative">
            {features.map((feature, index) => (
              <div
                key={index}
                style={getCardStyle(index, false)}
                className="absolute transform bg-white p-6 rounded-xl drop-shadow-lg"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{feature.content}</p>
                <p className="text-xs text-right text-blue-600 font-semibold">
                  {feature.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;