import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Animation definitions for different animation types
const animationDefinitions = {
  nail: {
    label: "Nail Animation",
    description: "Animated nails that slide in with the section header",
    icon: "🔨",
    defaultEnabled: true,
    supportedBlocks: ["BookingBlock", "EmployeesBlock", "BeforeAfterBlock"],
  },
  fadeIn: {
    label: "Fade In",
    description: "Elements fade in smoothly as they come into view",
    icon: "✨",
    defaultEnabled: true,
    supportedBlocks: [
      "BookingBlock",
      "EmployeesBlock",
      "BeforeAfterBlock",
      "ServiceSliderBlock",
      "HeroBlock",
    ],
  },
  slideIn: {
    label: "Slide Animation",
    description: "Elements slide in from different directions",
    icon: "➡️",
    defaultEnabled: true,
    supportedBlocks: ["ServiceSliderBlock", "ButtonBlock", "HeroBlock"],
  },
  bounceIn: {
    label: "Bounce Effect",
    description: "Elements bounce in with elastic timing",
    icon: "⚽",
    defaultEnabled: false,
    supportedBlocks: ["ButtonBlock", "ServiceSliderBlock"],
  },
  scaleIn: {
    label: "Scale Animation",
    description: "Elements scale up from small to normal size",
    icon: "🔍",
    defaultEnabled: true,
    supportedBlocks: ["BookingBlock", "ServiceSliderBlock", "HeroBlock"],
  },
  shrink: {
    label: "Shrink Effect",
    description:
      "Hero section shrinks from initial to final height after a delay",
    icon: "📏",
    defaultEnabled: true,
    supportedBlocks: ["HeroBlock"],
  },
};

// Animation Preview Component
const AnimationPreview = ({ animationType, isEnabled, onClick }) => {
  const animation = animationDefinitions[animationType];
  if (!animation) return null;

  return (
    <div
      className={`
        relative cursor-pointer rounded-lg border-2 transition-all duration-200 p-3
        ${
          isEnabled
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        }
      `}
      onClick={onClick}
    >
      {/* Animation Type Icon */}
      <div className="flex items-center justify-center mb-2">
        <div
          className={`
          text-2xl transition-transform duration-200
          ${isEnabled ? "animate-pulse" : "opacity-60"}
        `}
        >
          {animation.icon}
        </div>
      </div>

      {/* Animation Info */}
      <div className="text-center">
        <div
          className={`
          font-medium text-sm mb-1
          ${isEnabled ? "text-blue-700" : "text-gray-600"}
        `}
        >
          {animation.label}
        </div>
        <div className="text-xs text-gray-500 leading-tight">
          {animation.description}
        </div>
      </div>

      {/* Enabled indicator */}
      {isEnabled && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}

      {/* Visual Animation Preview */}
      <div className="mt-2 h-1 bg-gray-200 rounded overflow-hidden">
        <div
          className={`
          h-full transition-all duration-500 rounded
          ${isEnabled ? "bg-blue-500 animate-pulse" : "bg-gray-300"}
        `}
        />
      </div>
    </div>
  );
};

// Animation Controls Component
const AnimationControls = ({ currentData, onControlsChange, blockType }) => {
  // Get supported animations for this block type
  const supportedAnimations = Object.entries(animationDefinitions)
    .filter(([key, animation]) => animation.supportedBlocks.includes(blockType))
    .map(([key, animation]) => ({ key, ...animation }));

  // Get current animation states
  const getCurrentAnimationState = (animationType) => {
    // Handle legacy showNailAnimation for backwards compatibility
    if (
      animationType === "nail" &&
      currentData.showNailAnimation !== undefined
    ) {
      return currentData.showNailAnimation;
    }

    // Check for modern animation state structure
    if (
      currentData.animations &&
      currentData.animations[animationType] !== undefined
    ) {
      return currentData.animations[animationType];
    }

    // Default to animation's default enabled state
    return animationDefinitions[animationType]?.defaultEnabled || false;
  };

  const handleAnimationToggle = (animationType) => {
    const currentState = getCurrentAnimationState(animationType);
    const newState = !currentState;

    // Handle legacy nail animation for backwards compatibility
    if (animationType === "nail") {
      onControlsChange({
        showNailAnimation: newState,
        animations: {
          ...currentData.animations,
          [animationType]: newState,
        },
      });
    } else {
      // Modern animation state structure
      onControlsChange({
        animations: {
          ...currentData.animations,
          [animationType]: newState,
        },
      });
    }
  };

  const handleToggleAll = () => {
    const anyEnabled = supportedAnimations.some((animation) =>
      getCurrentAnimationState(animation.key)
    );
    const newState = !anyEnabled;

    const newAnimations = {};
    const updateData = {};

    supportedAnimations.forEach((animation) => {
      newAnimations[animation.key] = newState;

      // Handle legacy nail animation
      if (animation.key === "nail") {
        updateData.showNailAnimation = newState;
      }
    });

    onControlsChange({
      ...updateData,
      animations: {
        ...currentData.animations,
        ...newAnimations,
      },
    });
  };

  return (
    <div className="p-4 bg-white text-gray-800 rounded">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Animation Settings
        </h3>
        <button
          onClick={handleToggleAll}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Toggle All
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        Control which animations are enabled for this{" "}
        {blockType.replace("Block", "")} section. Animations enhance the user
        experience by providing smooth visual transitions.
      </p>

      {/* Animation Grid */}
      {supportedAnimations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {supportedAnimations.map((animation) => (
            <AnimationPreview
              key={animation.key}
              animationType={animation.key}
              isEnabled={getCurrentAnimationState(animation.key)}
              onClick={() => handleAnimationToggle(animation.key)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">🎭</div>
          <p>No animations available for this block type</p>
        </div>
      )}

      {/* Animation Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded border">
        <div className="text-sm text-gray-700">
          <span className="font-medium">
            {
              supportedAnimations.filter((animation) =>
                getCurrentAnimationState(animation.key)
              ).length
            }
          </span>
          {" of "}
          <span className="font-medium">{supportedAnimations.length}</span>
          {" animations enabled"}
        </div>

        {/* Performance note */}
        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: Fewer animations may improve performance on older devices
        </div>
      </div>
    </div>
  );
};

// Simple component shape previews for different variants
const VariantPreview = ({ variant, blockType = "BookingBlock" }) => {
  const getPreviewContent = () => {
    if (blockType === "BookingBlock") {
      switch (variant) {
        case "nail":
          return (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 relative overflow-hidden">
              {/* Wood plank effect */}
              <div className="absolute inset-0 opacity-20">
                <div className="h-1 bg-amber-800 mb-2"></div>
                <div className="h-1 bg-amber-700 mb-2"></div>
                <div className="h-1 bg-amber-800"></div>
              </div>
              {/* Nail dots */}
              <div className="absolute top-2 left-2 w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="absolute top-2 right-2 w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-1 h-1 bg-gray-600 rounded-full"></div>
              {/* Content area */}
              <div className="flex flex-col items-center justify-center h-full p-2">
                <div className="w-6 h-6 bg-blue-400 rounded mb-1"></div>
                <div className="w-8 h-1 bg-gray-400 rounded"></div>
              </div>
            </div>
          );
        case "modern":
          return (
            <div className="w-full h-full bg-gradient-to-r from-slate-50 to-gray-100 relative">
              {/* Split screen effect */}
              <div className="flex h-full">
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <div className="w-6 h-1 bg-gray-400 rounded"></div>
                </div>
              </div>
              {/* Modern accent line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-300 to-gray-300"></div>
            </div>
          );
        case "creative":
          return (
            <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
              {/* Three column layout */}
              <div className="flex h-full">
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-2 h-6 bg-pink-400 rounded"></div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-3 h-2 bg-orange-400 rounded"></div>
                </div>
              </div>
              {/* Playful decorative elements */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-400 rounded-full"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-green-400 rounded-full"></div>
            </div>
          );
        default:
          return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            </div>
          );
      }
    }

    if (blockType === "RichTextBlock") {
      switch (variant) {
        case "classic":
          return (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
              {/* Cards at top */}
              <div className="absolute top-1 left-1 right-1 flex justify-between">
                <div className="w-2 h-2 bg-blue-400 rounded"></div>
                <div className="w-2 h-2 bg-green-400 rounded"></div>
                <div className="w-2 h-2 bg-orange-400 rounded"></div>
              </div>
              {/* Hero text area */}
              <div className="absolute inset-x-0 top-4 bottom-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                <div className="w-8 h-1 bg-white rounded"></div>
              </div>
            </div>
          );
        case "modern":
          return (
            <div className="w-full h-full bg-gradient-to-r from-slate-900 to-blue-900 relative">
              {/* Split layout */}
              <div className="flex h-full">
                <div className="flex-1 bg-gradient-to-br from-slate-800 to-blue-800 flex flex-col items-center justify-center p-1">
                  <div className="w-6 h-1 bg-white/80 rounded mb-1"></div>
                  <div className="w-4 h-0.5 bg-white/60 rounded mb-1"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-2 h-2 bg-blue-200 rounded"></div>
                    <div className="w-2 h-1 bg-gray-200 rounded"></div>
                    <div className="w-2 h-1 bg-gray-200 rounded"></div>
                    <div className="w-2 h-2 bg-blue-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        case "grid":
          return (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
              {/* Hero text area at top */}
              <div className="absolute top-1 left-2 right-2 h-1 bg-gray-700 rounded"></div>

              {/* Image area in center */}
              <div className="absolute top-3 left-1 right-1 h-3 bg-blue-300 rounded"></div>

              {/* Grid of cards at bottom */}
              <div className="absolute bottom-1 left-1 right-1 grid grid-cols-3 gap-0.5">
                <div className="h-2 bg-blue-500 rounded"></div>
                <div className="h-2 bg-green-500 rounded"></div>
                <div className="h-2 bg-purple-500 rounded"></div>
              </div>

              {/* Clean layout indicators */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-blue-400 rounded-full"></div>
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-green-400 rounded-full"></div>
            </div>
          );
        default:
          return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            </div>
          );
      }
    }

    if (blockType === "ServiceSliderBlock") {
      switch (variant) {
        case "classic-cards":
          return (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-1 flex flex-col justify-around">
              <div className="w-full h-2 bg-gray-400 rounded-sm"></div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="h-4 bg-blue-200 rounded-sm"></div>
                <div className="h-4 bg-blue-200 rounded-sm"></div>
                <div className="h-4 bg-blue-200 rounded-sm"></div>
                <div className="h-4 bg-blue-200 rounded-sm"></div>
              </div>
            </div>
          );
        case "split-image":
          return (
            <div className="w-full h-full bg-gradient-to-r from-slate-50 to-gray-100 relative flex">
              <div className="w-1/3 bg-gray-800 p-1 flex flex-col justify-center space-y-1">
                <div className="h-1 w-full bg-gray-500 rounded-sm"></div>
                <div className="h-1 w-full bg-gray-500 rounded-sm"></div>
              </div>
              <div className="w-2/3 bg-blue-200"></div>
            </div>
          );
        default:
          return (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
            </div>
          );
      }
    }

    // Add more block types here in the future
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="w-4 h-4 bg-gray-400 rounded"></div>
      </div>
    );
  };

  return (
    <div className="w-16 h-12 bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
      {getPreviewContent()}
    </div>
  );
};

// Shadow variant preview component for ServiceSliderBlock
const ShadowVariantPreview = ({ variant, isSelected, onClick }) => {
  const getShadowClasses = (variant) => {
    switch (variant) {
      case "soft":
        return "shadow-lg";
      case "medium":
        return "shadow-xl drop-shadow-md";
      case "strong":
        return "shadow-2xl drop-shadow-lg";
      default:
        return "shadow-md";
    }
  };

  const getVariantLabel = (variant) => {
    switch (variant) {
      case "soft":
        return "Soft";
      case "medium":
        return "Medium";
      case "strong":
        return "Strong";
      default:
        return "Default";
    }
  };

  const getVariantDescription = (variant) => {
    switch (variant) {
      case "soft":
        return "Subtle shadow effect";
      case "medium":
        return "Enhanced shadow with drop effect";
      case "strong":
        return "Bold shadow for prominence";
      default:
        return "Standard shadow";
    }
  };

  return (
    <div className="relative">
      <label className="flex flex-col items-center cursor-pointer group">
        <input
          type="radio"
          name="shadowVariant"
          value={variant}
          checked={isSelected}
          onChange={onClick}
          className="sr-only"
        />

        {/* Card Preview with Shadow */}
        <div
          className={`relative mb-2 p-1 rounded-lg transition-all duration-200 ${
            isSelected
              ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800"
              : "ring-1 ring-gray-600 group-hover:ring-gray-500"
          }`}
        >
          <div
            className={`w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex flex-col items-center justify-center p-2 ${getShadowClasses(
              variant
            )}`}
          >
            <div className="w-full h-1 bg-gray-400 rounded-sm mb-1"></div>
            <div className="w-4/5 h-1 bg-gray-400 rounded-sm"></div>
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Variant Name */}
        <div
          className={`text-center transition-colors duration-200 ${
            isSelected
              ? "text-blue-400"
              : "text-gray-300 group-hover:text-white"
          }`}
        >
          <div className="font-medium text-sm">{getVariantLabel(variant)}</div>
          <div className="text-xs text-gray-400 mt-1 max-w-24 leading-tight">
            {getVariantDescription(variant)}
          </div>
        </div>
      </label>
    </div>
  );
};

const PanelStylingController = ({
  currentData,
  onControlsChange,
  blockType,
  controlType,
  animationDurationOptions,
  buttonSizeOptions,
}) => {
  const handleStylingChange = (field, value) => {
    const numericValue =
      typeof value === 'string' &&
      (field.includes('Height') ||
        field.includes('Duration') ||
        field.toLowerCase().includes('padding'))
        ? parseFloat(value)
        : value;

    onControlsChange({
      styling: {
        ...currentData.styling,
        [field]: numericValue,
      },
    });
  };

  const renderHeightControls = () => {
    const desktopHeight = currentData.styling?.desktopHeightVH ?? 20;
    const mobileHeight = currentData.styling?.mobileHeightVW ?? 35;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desktop Height:{' '}
            <span className="font-mono text-blue-600">{desktopHeight}vh</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={desktopHeight}
            onChange={(e) => handleStylingChange('desktopHeightVH', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Height:{' '}
            <span className="font-mono text-blue-600">{mobileHeight}vw</span>
          </label>
          <input
            type="range"
            min="10"
            max="150"
            value={mobileHeight}
            onChange={(e) => handleStylingChange('mobileHeightVW', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    );
  };

  const renderPaddingControls = () => {
    const paddingTop = currentData.styling?.paddingTop ?? 4;
    const paddingBottom = currentData.styling?.paddingBottom ?? 4;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Padding Top:{' '}
            <span className="font-mono text-blue-600">{paddingTop}rem</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={paddingTop}
            onChange={(e) => handleStylingChange('paddingTop', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Padding Bottom:{' '}
            <span className="font-mono text-blue-600">{paddingBottom}rem</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={paddingBottom}
            onChange={(e) => handleStylingChange('paddingBottom', e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (controlType) {
      case 'height':
        return renderHeightControls();
      case 'padding':
        return renderPaddingControls();
      default:
        return (
          <p className="text-sm text-gray-500">
            No styling controls for: {controlType}
          </p>
        );
    }
  };

  return <div className="p-4 bg-gray-50 rounded-lg">{renderContent()}</div>;
};

PanelStylingController.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  blockType: PropTypes.string,
  controlType: PropTypes.string,
  animationDurationOptions: PropTypes.object,
  buttonSizeOptions: PropTypes.array,
};

export default PanelStylingController;
