import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Animation definitions for different animation types
const animationDefinitions = {
  nail: {
    label: 'Nail Animation',
    description: 'Animated nails that slide in with the section header',
    icon: '🔨',
    defaultEnabled: true,
    supportedBlocks: ['BookingBlock', 'EmployeesBlock', 'BeforeAfterBlock']
  },
  fadeIn: {
    label: 'Fade In',
    description: 'Elements fade in smoothly as they come into view',
    icon: '✨',
    defaultEnabled: true,
    supportedBlocks: ['BookingBlock', 'EmployeesBlock', 'BeforeAfterBlock', 'ServiceSliderBlock']
  },
  slideIn: {
    label: 'Slide Animation',
    description: 'Elements slide in from different directions',
    icon: '➡️',
    defaultEnabled: true,
    supportedBlocks: ['ServiceSliderBlock', 'ButtonBlock']
  },
  bounceIn: {
    label: 'Bounce Effect',
    description: 'Elements bounce in with elastic timing',
    icon: '⚽',
    defaultEnabled: false,
    supportedBlocks: ['ButtonBlock', 'ServiceSliderBlock']
  },
  scaleIn: {
    label: 'Scale Animation',
    description: 'Elements scale up from small to normal size',
    icon: '🔍',
    defaultEnabled: true,
    supportedBlocks: ['BookingBlock', 'ServiceSliderBlock']
  }
};

// Animation Preview Component
const AnimationPreview = ({ animationType, isEnabled, onClick }) => {
  const animation = animationDefinitions[animationType];
  if (!animation) return null;

  return (
    <div 
      className={`
        relative cursor-pointer rounded-lg border-2 transition-all duration-200 p-3
        ${isEnabled 
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }
      `}
      onClick={onClick}
    >
      {/* Animation Type Icon */}
      <div className="flex items-center justify-center mb-2">
        <div className={`
          text-2xl transition-transform duration-200
          ${isEnabled ? 'animate-pulse' : 'opacity-60'}
        `}>
          {animation.icon}
        </div>
      </div>
      
      {/* Animation Info */}
      <div className="text-center">
        <div className={`
          font-medium text-sm mb-1
          ${isEnabled ? 'text-blue-700' : 'text-gray-600'}
        `}>
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
        <div className={`
          h-full transition-all duration-500 rounded
          ${isEnabled 
            ? 'bg-blue-500 animate-pulse' 
            : 'bg-gray-300'
          }
        `} />
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
    if (animationType === 'nail' && currentData.showNailAnimation !== undefined) {
      return currentData.showNailAnimation;
    }
    
    // Check for modern animation state structure
    if (currentData.animations && currentData.animations[animationType] !== undefined) {
      return currentData.animations[animationType];
    }
    
    // Default to animation's default enabled state
    return animationDefinitions[animationType]?.defaultEnabled || false;
  };

  const handleAnimationToggle = (animationType) => {
    const currentState = getCurrentAnimationState(animationType);
    const newState = !currentState;
    
    // Handle legacy nail animation for backwards compatibility
    if (animationType === 'nail') {
      onControlsChange({
        showNailAnimation: newState,
        animations: {
          ...currentData.animations,
          [animationType]: newState
        }
      });
    } else {
      // Modern animation state structure
      onControlsChange({
        animations: {
          ...currentData.animations,
          [animationType]: newState
        }
      });
    }
  };

  const handleToggleAll = () => {
    const anyEnabled = supportedAnimations.some(animation => getCurrentAnimationState(animation.key));
    const newState = !anyEnabled;
    
    const newAnimations = {};
    const updateData = {};
    
    supportedAnimations.forEach(animation => {
      newAnimations[animation.key] = newState;
      
      // Handle legacy nail animation
      if (animation.key === 'nail') {
        updateData.showNailAnimation = newState;
      }
    });
    
    onControlsChange({
      ...updateData,
      animations: {
        ...currentData.animations,
        ...newAnimations
      }
    });
  };

  return (
    <div className="p-4 bg-white text-gray-800 rounded">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Animation Settings</h3>
        <button
          onClick={handleToggleAll}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          Toggle All
        </button>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        Control which animations are enabled for this {blockType.replace('Block', '')} section. 
        Animations enhance the user experience by providing smooth visual transitions.
      </p>
      
      {/* Animation Grid */}
      {supportedAnimations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {supportedAnimations.map(animation => (
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
            {supportedAnimations.filter(animation => getCurrentAnimationState(animation.key)).length}
          </span>
          {' of '}
          <span className="font-medium">{supportedAnimations.length}</span>
          {' animations enabled'}
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
const VariantPreview = ({ variant, blockType = 'BookingBlock' }) => {
  const getPreviewContent = () => {
    if (blockType === 'BookingBlock') {
      switch (variant) {
        case 'nail':
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
        case 'modern':
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
        case 'creative':
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
    
    if (blockType === 'RichTextBlock') {
      switch (variant) {
        case 'classic':
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
        case 'modern':
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
        case 'grid':
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
      case 'soft':
        return 'shadow-lg';
      case 'medium':
        return 'shadow-xl drop-shadow-md';
      case 'strong':
        return 'shadow-2xl drop-shadow-lg';
      default:
        return 'shadow-md';
    }
  };

  const getVariantLabel = (variant) => {
    switch (variant) {
      case 'soft':
        return 'Soft';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return 'Default';
    }
  };

  const getVariantDescription = (variant) => {
    switch (variant) {
      case 'soft':
        return 'Subtle shadow effect';
      case 'medium':
        return 'Enhanced shadow with drop effect';
      case 'strong':
        return 'Bold shadow for prominence';
      default:
        return 'Standard shadow';
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
        
        {/* Button Preview with Shadow */}
        <div className={`relative mb-2 p-1 rounded-lg transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800' 
            : 'ring-1 ring-gray-600 group-hover:ring-gray-500'
        }`}>
          <div className={`w-16 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center text-white text-xs font-medium ${getShadowClasses(variant)}`}>
            Button
          </div>
          
          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        
        {/* Variant Name */}
        <div className={`text-center transition-colors duration-200 ${
          isSelected ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'
        }`}>
          <div className="font-medium text-sm">{getVariantLabel(variant)}</div>
          <div className="text-xs text-gray-400 mt-1 max-w-24 leading-tight">{getVariantDescription(variant)}</div>
        </div>
      </label>
    </div>
  );
};

const PanelStylingController = ({ 
  currentData, 
  onControlsChange, 
  step = 0.5, 
  blockType = 'BookingBlock',
  controlType = 'height', // 'height', 'animationDuration', 'buttonSize', 'shadowVariants', 'animations'
  animationDurationOptions = null, // For ButtonBlock animation duration ranges
  buttonSizeOptions = null // For ButtonBlock button size options
}) => {
  const initialStyling = currentData.styling || { desktopHeightVH: 30, mobileHeightVW: 75 };
  const [activeMode, setActiveMode] = useState('laptop'); // 'laptop' or 'mobile'
  
  // Ensure initial values are numbers with proper ranges based on block type
  const getHeightRanges = (blockType) => {
    const ranges = {
      'BookingBlock': { desktop: { min: 20, max: 50 }, mobile: { min: 60, max: 100 } },
      'HeroBlock': { desktop: { min: 25, max: 45 }, mobile: { min: 40, max: 80 } },
      'RichTextBlock': { desktop: { min: 30, max: 60 }, mobile: { min: 50, max: 90 } },
      'ButtonBlock': { desktop: { min: 10, max: 25 }, mobile: { min: 25, max: 50 } },
      'BeforeAfterBlock': { desktop: { min: 20, max: 40 }, mobile: { min: 30, max: 50 } },
      'BasicMapBlock': { desktop: { min: 25, max: 45 }, mobile: { min: 35, max: 60 } },
      'ServiceSliderBlock': { desktop: { min: 20, max: 50 }, mobile: { min: 30, max: 60 } },
      'TestimonialBlock': { desktop: { min: 25, max: 45 }, mobile: { min: 35, max: 60 } },
      'EmployeesBlock': { desktop: { min: 20, max: 35 }, mobile: { min: 25, max: 45 } }
    };
    return ranges[blockType] || ranges['ButtonBlock'];
  };

  const getAnimationDurationRanges = () => {
    return animationDurationOptions || { min: 10, max: 200, default: 40 };
  };

  const getButtonSizeOptions = () => {
    return buttonSizeOptions || [
      { value: 'small', label: 'Small', description: 'Compact button size' },
      { value: 'medium', label: 'Medium', description: 'Standard button size' },
      { value: 'large', label: 'Large', description: 'Prominent button size' },
      { value: 'extra-large', label: 'Extra Large', description: 'Maximum impact button' }
    ];
  };

  const heightRanges = getHeightRanges(blockType);
  const animationRanges = getAnimationDurationRanges();
  const buttonSizes = getButtonSizeOptions();
  
  const [desktopHeight, setDesktopHeight] = useState(
    Math.max(heightRanges.desktop.min, Math.min(heightRanges.desktop.max, parseFloat(initialStyling.desktopHeightVH) || 30))
  );
  const [mobileHeight, setMobileHeight] = useState(
    Math.max(heightRanges.mobile.min, Math.min(heightRanges.mobile.max, parseFloat(initialStyling.mobileHeightVW) || 75))
  );
  const [animationDuration, setAnimationDuration] = useState(
    Math.max(animationRanges.min, Math.min(animationRanges.max, parseFloat(currentData.slideDuration || currentData.styling?.slideDuration) || animationRanges.default))
  );
  const [buttonSize, setButtonSize] = useState(
    currentData.buttonSize || currentData.styling?.buttonSize || 'medium'
  );

  // Check if this component supports variants from the styling object
  const supportsVariants = currentData.styling?.hasVariants === true;
  
  // DEBUG: Log variant support detection
  console.log("[PanelStylingController] DEBUG: Variant support check:", {
    blockType,
    controlType,
    currentDataStyling: currentData.styling,
    hasVariants: currentData.styling?.hasVariants,
    supportsVariants,
    currentVariant: currentData.variant
  });
  
  const getDefaultVariant = (blockType) => {
    switch (blockType) {
      case 'BookingBlock':
        return 'nail';
      case 'RichTextBlock':
        return 'classic';
      default:
        return 'default';
    }
  };
  const currentVariant = currentData.variant || getDefaultVariant(blockType);
  
  // Control what to show based on controlType
  const showHeightControls = !(blockType === 'BookingBlock' && supportsVariants) && controlType === 'height';
  const showAnimationControls = controlType === 'animationDuration';
  const showButtonSizeControls = controlType === 'buttonSize';
  const showShadowVariants = controlType === 'shadowVariants';

  useEffect(() => {
    const newStyling = currentData.styling || { desktopHeightVH: 30, mobileHeightVW: 75 };
    const ranges = getHeightRanges(blockType);
    const animRanges = getAnimationDurationRanges();
    
    // Ensure values are within proper ranges
    setDesktopHeight(Math.max(ranges.desktop.min, Math.min(ranges.desktop.max, parseFloat(newStyling.desktopHeightVH) || 30)));
    setMobileHeight(Math.max(ranges.mobile.min, Math.min(ranges.mobile.max, parseFloat(newStyling.mobileHeightVW) || 75)));
    setAnimationDuration(Math.max(animRanges.min, Math.min(animRanges.max, parseFloat(currentData.slideDuration || currentData.styling?.slideDuration) || animRanges.default)));
    setButtonSize(currentData.buttonSize || currentData.styling?.buttonSize || 'medium');
  }, [currentData.styling, currentData.slideDuration, currentData.buttonSize, blockType, animationDurationOptions]);

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    if (controlType === 'height') {
      if (activeMode === 'laptop') {
        setDesktopHeight(value);
        onControlsChange({
          ...currentData,
          styling: {
            ...initialStyling,
            desktopHeightVH: value,
          }
        });
      } else {
        setMobileHeight(value);
        onControlsChange({
          ...currentData,
          styling: {
            ...initialStyling,
            mobileHeightVW: value,
          }
        });
      }
    } else if (controlType === 'animationDuration') {
      setAnimationDuration(value);
      onControlsChange({
        ...currentData,
        slideDuration: value,
        styling: {
          ...initialStyling,
          slideDuration: value,
        }
      });
    }
  };

  const handleNumberInputChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;

    if (controlType === 'height') {
      const ranges = getHeightRanges(blockType);
      
      if (activeMode === 'laptop') {
        const clampedValue = Math.max(ranges.desktop.min, Math.min(ranges.desktop.max, value));
        setDesktopHeight(clampedValue);
        onControlsChange({
          ...currentData,
          styling: {
            ...initialStyling,
            desktopHeightVH: clampedValue,
          }
        });
      } else {
        const clampedValue = Math.max(ranges.mobile.min, Math.min(ranges.mobile.max, value));
        setMobileHeight(clampedValue);
        onControlsChange({
          ...currentData,
          styling: {
            ...initialStyling,
            mobileHeightVW: clampedValue,
          }
        });
      }
    } else if (controlType === 'animationDuration') {
      const animRanges = getAnimationDurationRanges();
      const clampedValue = Math.max(animRanges.min, Math.min(animRanges.max, value));
      setAnimationDuration(clampedValue);
      onControlsChange({
        ...currentData,
        slideDuration: clampedValue,
        styling: {
          ...initialStyling,
          slideDuration: clampedValue,
        }
      });
    }
  };

  const handleButtonSizeChange = (newSize) => {
    setButtonSize(newSize);
    onControlsChange({
      ...currentData,
      buttonSize: newSize,
      styling: {
        ...initialStyling,
        buttonSize: newSize,
      }
    });
  };

  const handleVariantChange = (newVariant) => {
    onControlsChange({
      ...currentData,
      variant: newVariant
    });
  };

  const handleShadowVariantChange = (newShadowVariant) => {
    onControlsChange({
      ...currentData,
      styling: {
        ...initialStyling,
        shadowVariant: newShadowVariant,
      }
    });
  };

  // Get current values based on control type
  const getCurrentValue = () => {
    if (controlType === 'height') {
      return activeMode === 'laptop' ? desktopHeight : mobileHeight;
    } else if (controlType === 'animationDuration') {
      return animationDuration;
    }
    return 0;
  };

  const getCurrentUnit = () => {
    if (controlType === 'height') {
      return activeMode === 'laptop' ? 'vh' : 'vw';
    } else if (controlType === 'animationDuration') {
      return 's';
    }
    return '';
  };

  const getCurrentRanges = () => {
    if (controlType === 'height') {
      const ranges = getHeightRanges(blockType);
      return {
        min: activeMode === 'laptop' ? ranges.desktop.min : ranges.mobile.min,
        max: activeMode === 'laptop' ? ranges.desktop.max : ranges.mobile.max
      };
    } else if (controlType === 'animationDuration') {
      return animationRanges;
    }
    return { min: 0, max: 100 };
  };

  const currentValue = getCurrentValue();
  const currentUnit = getCurrentUnit();
  const ranges = getCurrentRanges();
  const minValue = ranges.min;
  const maxValue = ranges.max;
  const stepValue = controlType === 'height' ? (activeMode === 'laptop' ? 1 : 5) : 5;

  // Get original height ranges for preset buttons (only needed for height control)
  const originalHeightRanges = controlType === 'height' ? getHeightRanges(blockType) : null;

  const getVariantOptions = () => {
    if (blockType === 'BookingBlock') {
      return [
        { value: 'nail', label: 'Nail Style', description: 'Original design with nail animations and wood plank styling' },
        { value: 'modern', label: 'Modern', description: 'Clean, minimalist design with gradients and split-screen layout' },
        { value: 'creative', label: 'Creative', description: 'Image-rich design with playful elements and three-column layout' }
      ];
    }
    
    if (blockType === 'RichTextBlock') {
      return [
        { value: 'classic', label: 'Classic', description: 'Original layout with hero text, slideshow background, and cards above' },
        { value: 'modern', label: 'Modern', description: 'Clean split-screen layout with text on one side and gallery on the other' },
        { value: 'grid', label: 'Grid', description: 'Clean grid layout with structured cards and clear content sections' }
      ];
    }
    
    // Add more block types here as they get variant support
    return [
      { value: 'default', label: 'Default', description: 'Standard design variant' }
    ];
  };

  const variantOptions = getVariantOptions();
  const currentShadowVariant = currentData.styling?.shadowVariant || 'default';

  // Render based on control type
  if (controlType === 'animations') {
    return (
      <AnimationControls
        currentData={currentData}
        onControlsChange={onControlsChange}
        blockType={blockType}
      />
    );
  }

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      {/* Variant Selector (only for components that support it) */}
      {supportsVariants && (
        <div className="mb-6 pb-6 border-b border-gray-600">
          {/* DEBUG: Log that we're rendering the variant selector */}
          {console.log("[PanelStylingController] DEBUG: Rendering variant selector for", blockType, "with variants:", variantOptions)}
          <h3 className="text-lg font-semibold mb-4 text-center">Design Variant</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {variantOptions.map((option) => (
              <div key={option.value} className="relative">
                <label className="flex flex-col items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="variant"
                    value={option.value}
                    checked={currentVariant === option.value}
                    onChange={() => handleVariantChange(option.value)}
                    className="sr-only"
                  />
                  
                  {/* Visual Preview with Selection Ring */}
                  <div className={`relative mb-2 p-1 rounded-lg transition-all duration-200 ${
                    currentVariant === option.value 
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800' 
                      : 'ring-1 ring-gray-600 group-hover:ring-gray-500'
                  }`}>
                    <VariantPreview variant={option.value} blockType={blockType} />
                    
                    {/* Selected indicator */}
                    {currentVariant === option.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Variant Name */}
                  <div className={`text-center transition-colors duration-200 ${
                    currentVariant === option.value ? 'text-blue-400' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-24 leading-tight">{option.description}</div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shadow Variants (for ServiceSliderBlock) */}
      {showShadowVariants && (
        <div className="mb-6 pb-6 border-b border-gray-600">
          <h3 className="text-lg font-semibold mb-4 text-center">Service Item Shadows</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: 'default', label: 'Default', description: 'Standard shadow' },
              { value: 'soft', label: 'Soft', description: 'Subtle shadow effect' },
              { value: 'medium', label: 'Medium', description: 'Enhanced shadow with drop effect' },
              { value: 'strong', label: 'Strong', description: 'Bold shadow for prominence' }
            ].map((option) => (
              <ShadowVariantPreview
                key={option.value}
                variant={option.value}
                isSelected={currentShadowVariant === option.value}
                onClick={() => handleShadowVariantChange(option.value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Height Controls - only show when showHeightControls is true */}
      {showHeightControls && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-center">Height Controls</h3>
          
          {/* Mode Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveMode('laptop')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeMode === 'laptop' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              💻 Desktop (md+)
            </button>
            <button
              onClick={() => setActiveMode('mobile')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeMode === 'mobile' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              📱 Mobile
            </button>
          </div>

          {/* Current Value Display */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-blue-400">
              {currentValue}{currentUnit}
            </div>
            <div className="text-sm text-gray-400">
              {activeMode === 'laptop' ? 'Desktop Height' : 'Mobile Height'}
            </div>
          </div>

          {/* Range Slider - Similar to VideoCTA.jsx */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {activeMode === 'laptop' ? `Desktop Height (${minValue}-${maxValue}vh)` : `Mobile Height (${minValue}-${maxValue}vw)`}
            </label>
            <input
              type="range"
              min={minValue}
              max={maxValue}
              step={stepValue}
              value={currentValue}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{minValue}{currentUnit}</span>
              <span>{maxValue}{currentUnit}</span>
            </div>
          </div>

          {/* Number Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Precise Value:
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min={minValue}
                max={maxValue}
                step={stepValue}
                value={currentValue}
                onChange={handleNumberInputChange}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="ml-2 text-gray-400 font-medium">{currentUnit}</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-2">
            {activeMode === 'laptop' ? (
              <>
                <button
                  onClick={() => handleSliderChange({ target: { value: originalHeightRanges.desktop.min + 5 } })}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Compact ({originalHeightRanges.desktop.min + 5}vh)
                </button>
                <button
                  onClick={() => handleSliderChange({ target: { value: Math.round((originalHeightRanges.desktop.min + originalHeightRanges.desktop.max) / 2) } })}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Default ({Math.round((originalHeightRanges.desktop.min + originalHeightRanges.desktop.max) / 2)}vh)
                </button>
                <button
                  onClick={() => handleSliderChange({ target: { value: originalHeightRanges.desktop.max - 5 } })}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Tall ({originalHeightRanges.desktop.max - 5}vh)
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSliderChange({ target: { value: originalHeightRanges.mobile.min + 10 } })}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Compact ({originalHeightRanges.mobile.min + 10}vw)
                </button>
                <button
                  onClick={() => handleSliderChange({ target: { value: Math.round((originalHeightRanges.mobile.min + originalHeightRanges.mobile.max) / 2) } })}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Default ({Math.round((originalHeightRanges.mobile.min + originalHeightRanges.mobile.max) / 2)}vw)
                </button>
                <button
                  onClick={() => handleSliderChange({ target: { value: originalHeightRanges.mobile.max - 10 } })}
                  className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Tall ({originalHeightRanges.mobile.max - 10}vw)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Animation Duration Controls - only show when showAnimationControls is true */}
      {showAnimationControls && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-center">Animation Duration</h3>
          
          {/* Current Value Display */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-blue-400">
              {animationDuration}s
            </div>
            <div className="text-sm text-gray-400">
              Animation Duration
            </div>
          </div>

          {/* Range Slider - Similar to VideoCTA.jsx */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Animation Duration (10s - 200s)
            </label>
            <input
              type="range"
              min={animationRanges.min}
              max={animationRanges.max}
              step={stepValue}
              value={animationDuration}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{animationRanges.min}s</span>
              <span>{animationRanges.max}s</span>
            </div>
          </div>

          {/* Number Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Precise Value:
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min={animationRanges.min}
                max={animationRanges.max}
                step={stepValue}
                value={animationDuration}
                onChange={handleNumberInputChange}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="ml-2 text-gray-400 font-medium">s</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSliderChange({ target: { value: animationRanges.min + 10 } })}
              className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              Short (10s)
            </button>
            <button
              onClick={() => handleSliderChange({ target: { value: Math.round((animationRanges.min + animationRanges.max) / 2) } })}
              className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              Default ({Math.round((animationRanges.min + animationRanges.max) / 2)}s)
            </button>
            <button
              onClick={() => handleSliderChange({ target: { value: animationRanges.max - 10 } })}
              className="py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
            >
              Long ({animationRanges.max - 10}s)
            </button>
          </div>
        </div>
      )}

      {/* Button Size Controls */}
      {controlType === 'buttonSize' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Size
            </label>
            <select
              value={currentValue}
              onChange={(e) => handleButtonSizeChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {buttonSizeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {buttonSizeOptions.find(opt => opt.value === currentValue)?.description && (
              <p className="mt-1 text-xs text-gray-500">
                {buttonSizeOptions.find(opt => opt.value === currentValue).description}
              </p>
            )}
          </div>
          
          {/* Button Size Preview Cards */}
          <div className="grid grid-cols-2 gap-2">
            {buttonSizeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleButtonSizeChange(option.value)}
                className={`p-3 text-center rounded-md border transition-all ${
                  currentValue === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Styles for Slider - Same as VideoCTA.jsx */}
      <style>
        {`
          .slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }

          .slider-thumb::-webkit-slider-track {
            background: #4b5563;
            height: 8px;
            border-radius: 4px;
          }

          .slider-thumb::-moz-range-track {
            background: #4b5563;
            height: 8px;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  );
};

PanelStylingController.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  step: PropTypes.number,
  blockType: PropTypes.string,
  controlType: PropTypes.string,
  animationDurationOptions: PropTypes.object,
  buttonSizeOptions: PropTypes.array,
};

export default PanelStylingController; 