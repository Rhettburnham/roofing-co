import { useState, useEffect, useRef } from "react";
import StarRating from "../StarRating";
import googleIcon from "/assets/images/hero/googleimage.png";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelFontController from "../common/PanelFontController";
import PanelStylingController from "../common/PanelStylingController";
import PropTypes from "prop-types";

// Helper to generate styles from text settings object
const getTextStyles = (settings) => {
  if (!settings || typeof settings !== 'object') {
    return {};
  }
  const styles = {};
  if (settings.fontFamily) styles.fontFamily = settings.fontFamily;
  if (settings.fontSize) styles.fontSize = `${settings.fontSize}px`;
  if (settings.fontWeight) styles.fontWeight = settings.fontWeight;
  if (settings.lineHeight) styles.lineHeight = settings.lineHeight;
  if (settings.letterSpacing) styles.letterSpacing = `${settings.letterSpacing}px`;
  if (settings.textAlign) styles.textAlign = settings.textAlign;
  if (settings.color) styles.color = settings.color;
  return styles;
};

// =============================================
// STYLING CONSTANTS - Keep consistent between edit and read-only modes
// =============================================
const TEXT_STYLES = {
  testimonialName: {
    base: "text-[3vw] md:text-[1.8vh] font-semibold text-black font-sans truncate",
    editable:
      "text-[3vw] md:text-[1.8vh] font-semibold text-black font-sans bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-1 w-full outline-none",
    readOnly:
      "text-[3vw] md:text-[1.8vh] font-semibold text-black font-sans truncate",
  },
  testimonialText: {
    base: "text-gray-800 indent-3",
    editable:
      "text-gray-800 indent-3 bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none outline-none",
    readOnly: "text-gray-800 indent-3",
  },
  sectionTitle: {
    base: "text-[7.5vw] text-white md:text-[6vh] font-serif mt-3",
    editable:
      "text-[7.5vw] text-white md:text-[6vh] font-serif mt-3 bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 outline-none",
    readOnly: "text-[7.5vw] text-white md:text-[6vh] font-serif mt-3",
  },
};

// =============================================
// VARIANT-SPECIFIC STYLING FUNCTIONS
// =============================================
const getVariantClasses = (variant) => {
  switch (variant) {
    case "compact":
      return {
        container: "flex gap-2 justify-center items-center items-stretch", // Added items-stretch for equal height
        title: "text-4xl text-white mr-4 my-1 font-serif", // Smaller title
        testimonialCard: "p-2 md:p-3 bg-white rounded-md relative cursor-pointer group flex-1 min-w-0 max-w-xs overflow-hidden", // Added overflow-hidden
        mobileContainer: "flex flex-col gap-2 px-4", // Flex column for mobile
        mobileTitle: "text-[6vw] text-white md:text-[5vh] font-serif mt-2", // Smaller mobile title
      };
    case "feature":
      return {
        container: "flex gap-6 justify-center items-stretch", // Added items-stretch for equal height
        title: "text-6xl text-white mr-4 my-4 font-serif", // Larger title
        testimonialCard: "p-4 md:p-6 bg-white rounded-xl relative cursor-pointer group border-2 border-blue-100 flex-1 min-w-0 max-w-sm overflow-hidden", // Added overflow-hidden
        mobileContainer: "flex flex-col gap-4 px-8", // More spacing on mobile
        mobileTitle: "text-[8vw] text-white md:text-[7vh] font-serif mt-4", // Larger mobile title
      };
    default: // 'default'
      return {
        container: "flex gap-4 justify-center items-stretch", // Added items-stretch for equal height
        title: "text-5xl text-white mr-4 my-2 font-serif", // Standard title
        testimonialCard: "p-2 md:p-4 bg-white rounded-lg relative cursor-pointer group flex-1 min-w-0 max-w-md overflow-hidden", // Added overflow-hidden
        mobileContainer: "flex flex-col gap-3 px-6", // Standard mobile
        mobileTitle: "text-[7.5vw] text-white md:text-[6vh] font-serif mt-3", // Standard mobile title
      };
  }
};

const getVariantChunkSize = (variant, isSmallScreen) => {
  if (isSmallScreen) return 3; // Mobile always shows 3

  // Desktop always shows exactly 3 items regardless of variant
  return 3;
};

const getArrowStyles = (style, data) => {
  const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      transition: 'all 0.2s ease-in-out',
      color: data.arrowColor || '#000000',
      backgroundColor: data.arrowBgColor || '#ffffff',
  };

  switch (style) {
      case 'vintage':
          return { ...baseStyles, width: '2rem', height: '2rem', borderRadius: '9999px' };
      case 'modern':
          return { ...baseStyles, width: '1.5rem', height: '1.5rem', color: data.textcolor, backgroundColor: 'transparent', filter: 'none' };
      default: // 'classic'
          return { ...baseStyles, width: '2rem', height: '2rem', borderRadius: '0.375rem', borderWidth: '1px', borderColor: '#E5E7EB' };
  }
};

// A SINGLE TESTIMONIAL ITEM COMPONENT
const TestimonialItem = ({ testimonial, readOnly, onTestimonialChange, index, variant = 'default', backgroundColor, textColor, shadowColor, shadowVariant, nameTextSettings, dateTextSettings, bodyTextSettings }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleExpandClick = () => setIsExpanded(!isExpanded);

  const handleFieldChange = (field, value) => {
    if (onTestimonialChange) {
      const updatedTestimonial = { ...testimonial, [field]: value };
      onTestimonialChange(index, updatedTestimonial);
    }
  };

  const hexToRgba = (hex, alpha) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return `rgba(0,0,0,${alpha})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getShadowStyles = (variant, color, hexToRgbaFunc) => {
    const rgbaColor = (alpha) => hexToRgbaFunc(color, alpha);
    switch (variant) {
        case 'soft':
            return `0 4px 6px -1px ${rgbaColor(0.05)}, 0 2px 4px -2px ${rgbaColor(0.05)}`;
        case 'medium':
            return `0 10px 15px -3px ${rgbaColor(0.1)}, 0 4px 6px -4px ${rgbaColor(0.1)}`;
        case 'strong':
            return `0 20px 25px -5px ${rgbaColor(0.1)}, 0 8px 10px -6px ${rgbaColor(0.1)}`;
        default:
            return `0 4px 6px -1px ${rgbaColor(0.1)}, 0 2px 4px -2px ${rgbaColor(0.1)}`;
    }
  };

  const truncated =
    testimonial.text.length > 100
      ? testimonial.text.slice(0, 250) + "..."
      : testimonial.text;

  const showViewMore = testimonial.text.length > 100 && !isExpanded;
  const variantClasses = getVariantClasses(variant);

  const nameStyle = getTextStyles(nameTextSettings);
  const dateStyle = getTextStyles(dateTextSettings);
  const bodyStyle = getTextStyles(bodyTextSettings);

  const shadowStyle = { boxShadow: getShadowStyles(shadowVariant, shadowColor, hexToRgba) };
  const cardClasses = `${variantClasses.testimonialCard} flex flex-col h-full justify-center`;

  return (
    <div
      className={cardClasses}
      style={{ 
        backgroundColor: backgroundColor || '#ffffff',
        ...shadowStyle
      }}
      onClick={!readOnly ? undefined : handleExpandClick}
    >
      <div className="flex items-start mb-2 flex-shrink-0">
        {testimonial.link && testimonial.logo && (
          <a
            href={testimonial.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center self-start mr-2 flex-shrink-0 mt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={testimonial.logo}
              alt="Logo"
              className={`${variant === "feature" ? "w-8 h-8 md:w-12 md:h-12" : variant === "compact" ? "w-4 h-4 md:w-6 md:h-6" : "w-5 h-5 md:w-8 md:h-8"}`}
            />
          </a>
        )}
        <div className="flex-grow min-w-0">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between gap-1">
              {!readOnly ? (
                <input
                  type="text"
                  value={testimonial.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`font-sans bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-1 w-full outline-none ${variant === 'feature' ? 'text-lg md:text-xl' : variant === 'compact' ? 'text-sm md:text-base' : 'text-[2.5vw] md:text-[1.6vh]'} min-w-0 text-left leading-tight`}
                  style={{...nameStyle, color: nameStyle.color || textColor || '#000000'}}
                  onClick={(e) => e.stopPropagation()}
                  // style={{ color: textColor }}
                />
              ) : (
                <p 
                  className={`font-sans truncate ${variant === 'feature' ? 'text-lg md:text-xl' : variant === 'compact' ? 'text-sm md:text-base' : 'text-[2.5vw] md:text-[1.6vh]'} min-w-0 overflow-hidden text-center leading-tight`}
                  style={{...nameStyle, color: nameStyle.color || textColor || '#000000' }}
                >
                  {testimonial.name}
                </p>
              )}
              <div className="flex-shrink-0">
                <StarRating
                  rating={testimonial.stars}
                  starSize={
                    variant === "feature"
                      ? "text-xl md:text-2xl"
                      : variant === "compact"
                        ? "text-sm md:text-base"
                        : "text-base md:text-lg"
                  }
                />
              </div>
            </div>
            <p 
              className={`text-gray-600 ${variant === 'feature' ? 'text-sm md:text-base' : variant === 'compact' ? 'text-xs md:text-sm' : 'text-[2.2vw] md:text-[1.2vh]'} text-left leading-tight -mt-1`}
              style={{...dateStyle, color: dateStyle.color || (textColor ? `${textColor}CC` : '#6B7280')}} // Slightly transparent version of textColor
            >
              {testimonial.date}
            </p>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex items-center justify-center">
        {!readOnly ? (
          <textarea
            value={testimonial.text}
            onChange={(e) => handleFieldChange('text', e.target.value)}
            className={`indent-3 bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none outline-none ${variant === 'feature' ? 'text-base' : variant === 'compact' ? 'text-xs' : 'text-sm'} h-full min-h-0 w-full text-center leading-relaxed`}
            style={{...bodyStyle, color: bodyStyle.color || textColor || '#000000' }}
            onClick={(e) => e.stopPropagation()}
            rows={variant === "feature" ? 6 : variant === "compact" ? 3 : 4}
            // style={{ color: textColor }}
          />
        ) : (
          <div className="w-full text-center">
            <p className={`indent-3 ${variant === 'feature' ? 'text-base' : variant === 'compact' ? 'text-xs' : ''} break-words text-center`}>
              <span 
                className={`${variant === 'feature' ? 'text-base md:text-lg' : variant === 'compact' ? 'text-xs md:text-sm' : 'text-[2.8vw] md:text-[2.0vh]'} block md:hidden break-words leading-snug`}
                style={{...bodyStyle, color: bodyStyle.color || textColor || '#374151' }}
              >
                {isExpanded ? testimonial.text : truncated}
                {showViewMore && (
                  <span className="text-blue-600 opacity-60 ml-1">
                    view more
                  </span>
                )}
              </span>
              <span 
                className={`${variant === 'feature' ? 'text-sm md:text-base' : variant === 'compact' ? 'text-xs' : 'text-xs'} hidden md:block font-serif break-words leading-relaxed`}
                style={{...bodyStyle, color: bodyStyle.color || textColor || '#374151' }}
              >
                {testimonial.text}
              </span>
            </p>
          </div>
        )}
      </div>
      {!readOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Remove testimonial logic here
            if (onTestimonialChange) {
              // Signal that this testimonial should be removed
              onTestimonialChange(index, null, true); // Pass true as a remove flag
            }
          }}
          className="absolute top-2 right-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/30 hover:bg-white/50 rounded-full"
          title="Remove Testimonial"
        >
          ×
        </button>
      )}
    </div>
  );
};

TestimonialItem.propTypes = {
  testimonial: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  onTestimonialChange: PropTypes.func,
  index: PropTypes.number,
  variant: PropTypes.string,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  shadowColor: PropTypes.string,
  shadowVariant: PropTypes.string,
  nameTextSettings: PropTypes.object,
  dateTextSettings: PropTypes.object,
  bodyTextSettings: PropTypes.object,
};

// =============================================
// Helper function to derive local state from props
// =============================================
const deriveInitialLocalData = (testimonialsDataInput) => {
  const initial = testimonialsDataInput || {};

  return {
    title: initial.title || "Testimonials",
    googleReviews: initial.googleReviews || [],
    reviewButtonText: initial.reviewButtonText || "Review us on Google",
    reviewButtonLink: initial.reviewButtonLink || "https://www.google.com/maps",
    variant: initial.variant || 'default',
    backgroundColor: initial.backgroundColor || '#000000',
    textcolor: initial.textcolor || '#ffffff',
    testimonialbg: initial.testimonialbg || '#ffffff',
    testimonialShadowColor: initial.testimonialShadowColor || '#000000',
    arrowStyle: initial.arrowStyle || 'default',
    arrowColor: initial.arrowColor || '#000000',
    arrowBgColor: initial.arrowBgColor || '#ffffff',
    styling: initial.styling || { shadowVariant: 'soft' },
    sectionTitleTextSettings: initial.sectionTitleTextSettings || {},
    nameTextSettings: initial.nameTextSettings || {},
    dateTextSettings: initial.dateTextSettings || {},
    bodyTextSettings: initial.bodyTextSettings || {},
    buttonTextSettings: initial.buttonTextSettings || {},
  };
};

// =============================================
// Tab Control Components
// =============================================

const TestimonialColorControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleColorUpdate = (fieldName, colorValue) => {
    onControlsChange({ ...currentData, [fieldName]: colorValue });
  };

  return (
    <div className="p-3">
      <ThemeColorPicker
        label="Background Color:"
        currentColorValue={currentData.backgroundColor || "#000000"}
        themeColors={themeColors}
        onColorChange={(fieldName, value) =>
          handleColorUpdate("backgroundColor", value)
        }
        fieldName="backgroundColor"
      />
      <ThemeColorPicker
        label="Text Color:"
        currentColorValue={currentData.textcolor || "#ffffff"}
        themeColors={themeColors}
        onColorChange={(fieldName, value) =>
          handleColorUpdate("textcolor", value)
        }
        fieldName="textcolor"
      />
      <ThemeColorPicker
        label="Testimonial Card Background:"
        currentColorValue={currentData.testimonialbg || "#ffffff"}
        themeColors={themeColors}
        onColorChange={(fieldName, value) =>
          handleColorUpdate("testimonialbg", value)
        }
        fieldName="testimonialbg"
      />
      <ThemeColorPicker
        label="Testimonial Shadow Color:"
        currentColorValue={currentData.testimonialShadowColor || '#000000'}
        themeColors={themeColors}
        onColorChange={(fieldName, value) => handleColorUpdate('testimonialShadowColor', value)}
        fieldName="testimonialShadowColor"
      />
      <ThemeColorPicker
        label="Arrow Color:"
        currentColorValue={currentData.arrowColor || '#000000'}
        themeColors={themeColors}
        onColorChange={(fieldName, value) => handleColorUpdate('arrowColor', value)}
        fieldName="arrowColor"
      />
      <ThemeColorPicker
        label="Arrow Background Color:"
        currentColorValue={currentData.arrowBgColor || '#ffffff'}
        themeColors={themeColors}
        onColorChange={(fieldName, value) => handleColorUpdate('arrowBgColor', value)}
        fieldName="arrowBgColor"
      />
    </div>
  );
};

TestimonialColorControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
};

const TestimonialStylingControls = ({ currentData, onControlsChange }) => {
  return (
    <div className="space-y-6">
      <PanelStylingController
        currentData={currentData}
        onControlsChange={onControlsChange}
        blockType="TestimonialBlock"
      />

      {/* Custom Arrow Style Control */}
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Arrow Style</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['classic', 'modern', 'vintage'].map((style) => (
            <button
              key={style}
              onClick={() => onControlsChange({ ...currentData, arrowStyle: style })}
              className={`p-3 text-center rounded-md border transition-all ${
                (currentData.arrowStyle || 'classic') === style
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className="mx-auto"
                style={getArrowStyles(style, currentData)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
              <div className="font-medium text-sm capitalize mt-2">{style}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

TestimonialStylingControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

const TestimonialReviewsControls = ({ currentData, onControlsChange }) => {
  const [sentimentReviews, setSentimentReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    stars: 5,
    date: new Date().getFullYear() + " ago",
    text: "",
    logo: googleIcon,
    link: "https://www.google.com/maps",
  });
  const currentReviews = currentData.googleReviews || [];

  useEffect(() => {
    const fetchSentimentReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "/personal/old/jsons/sentiment_reviews.json"
        );
        if (response.ok) {
          const data = await response.json();
          // Get top 30 positive reviews, sorted by rating and polarity
          const positiveReviews = data
            .filter(
              (review) =>
                review.sentiment === "positive" && review.review_text !== "N/A"
            )
            .sort((a, b) => {
              // Sort by rating first, then by polarity (sentiment strength)
              if (parseInt(b.rating) !== parseInt(a.rating)) {
                return parseInt(b.rating) - parseInt(a.rating);
              }
              return b.polarity - a.polarity;
            })
            .slice(0, 30);
          setSentimentReviews(positiveReviews);
        }
      } catch (error) {
        console.error("Error fetching sentiment reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentReviews();
  }, []);

  const handleRemoveReview = (indexToRemove) => {
    const updatedReviews = currentReviews.filter(
      (_, index) => index !== indexToRemove
    );
    onControlsChange({
      ...currentData,
      googleReviews: updatedReviews,
    });
  };

  const handleAddReview = (review) => {
    // Check if review is already added
    const isAlreadyAdded = currentReviews.some(
      (r) => r.name === review.name && r.text === review.review_text
    );
    if (isAlreadyAdded) return;

    const newReview = {
      name: review.name,
      stars: parseInt(review.rating),
      date: review.date,
      text: review.review_text,
      logo: googleIcon,
      link: "https://www.google.com/maps",
    };

    onControlsChange({
      ...currentData,
      googleReviews: [...currentReviews, newReview],
    });
  };

  const handleAddManualTestimonial = () => {
    if (!newTestimonial.name.trim() || !newTestimonial.text.trim()) return;

    onControlsChange({
      ...currentData,
      googleReviews: [...currentReviews, { ...newTestimonial }],
    });

    // Reset form
    setNewTestimonial({
      name: "",
      stars: 5,
      date: new Date().getFullYear() + " ago",
      text: "",
      logo: googleIcon,
      link: "https://www.google.com/maps",
    });
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading sentiment reviews...</div>;
  }

  return (
    <div className="p-4 h-96 flex gap-4">
      {/* Left Column: Current Active Reviews */}
      <div className="flex-1 bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Active Reviews ({currentReviews.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              {showAddForm ? "Cancel" : "Add Manual"}
            </button>
            <button
              onClick={() =>
                onControlsChange({ ...currentData, googleReviews: [] })
              }
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              disabled={currentReviews.length === 0}
            >
              Clear All
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="mb-4 p-3 bg-white border rounded-lg">
            <h4 className="font-medium text-sm mb-2">Add Manual Testimonial</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={newTestimonial.name}
                onChange={(e) =>
                  setNewTestimonial({ ...newTestimonial, name: e.target.value })
                }
                placeholder="Customer Name"
                className="w-full px-2 py-1 text-xs border rounded"
              />
              <div className="flex gap-2">
                <select
                  value={newTestimonial.stars}
                  onChange={(e) =>
                    setNewTestimonial({
                      ...newTestimonial,
                      stars: parseInt(e.target.value),
                    })
                  }
                  className="px-2 py-1 text-xs border rounded"
                >
                  {[5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>
                      {num} stars
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newTestimonial.date}
                  onChange={(e) =>
                    setNewTestimonial({
                      ...newTestimonial,
                      date: e.target.value,
                    })
                  }
                  placeholder="Date"
                  className="flex-1 px-2 py-1 text-xs border rounded"
                />
              </div>
              <textarea
                value={newTestimonial.text}
                onChange={(e) =>
                  setNewTestimonial({ ...newTestimonial, text: e.target.value })
                }
                placeholder="Review text..."
                className="w-full px-2 py-1 text-xs border rounded resize-none"
                rows={3}
              />
              <button
                onClick={handleAddManualTestimonial}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                disabled={
                  !newTestimonial.name.trim() || !newTestimonial.text.trim()
                }
              >
                Add Testimonial
              </button>
            </div>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto space-y-2">
          {currentReviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No active reviews. Add some from the right panel or manually.
            </p>
          ) : (
            currentReviews.map((review, index) => (
              <div key={index} className="p-3 bg-white border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{review.name}</h4>
                      <StarRating rating={review.stars} starSize="text-xs" />
                      <span className="text-xs text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {review.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveReview(index)}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
                    title="Remove Review"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Available Sentiment Reviews */}
      <div className="flex-1 bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Top 30 Sentiment Reviews</h3>
          <span className="text-sm text-gray-600">Click to add →</span>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2">
          {sentimentReviews.map((review, index) => {
            const isAlreadyAdded = currentReviews.some(
              (r) => r.name === review.name && r.text === review.review_text
            );

            return (
              <div
                key={index}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isAlreadyAdded
                    ? "bg-green-100 border-green-300 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:bg-blue-100 hover:border-blue-300"
                }`}
                onClick={() => !isAlreadyAdded && handleAddReview(review)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{review.name}</h4>
                      <StarRating
                        rating={parseInt(review.rating)}
                        starSize="text-xs"
                      />
                      <span className="text-xs text-gray-500">
                        {review.date}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        {(review.polarity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">
                      {review.review_text}
                    </p>
                  </div>
                  <div className="ml-2 text-lg">
                    {isAlreadyAdded ? "✓" : "+"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

TestimonialReviewsControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

/* ==============================================
   TESTIMONIAL FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for Testimonial text elements
=============================================== */
const TestimonialFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  const fontFields = [
    { prefix: 'sectionTitleTextSettings', label: 'Section Title' },
    { prefix: 'nameTextSettings', label: 'Testimonial Name' },
    { prefix: 'dateTextSettings', label: 'Testimonial Date' },
    { prefix: 'bodyTextSettings', label: 'Testimonial Body' },
    { prefix: 'buttonTextSettings', label: 'Google Review Button' },
  ];

  return (
    <div className="bg-white text-gray-800 p-4 rounded">
      <h3 className="text-lg font-semibold mb-4">Font Settings</h3>
      <div className="space-y-6">
        {fontFields.map(({ prefix, label }) => (
          <div key={prefix} className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{label}</h4>
            <PanelFontController
              label={`${label} Font`}
              currentData={currentData}
              onControlsChange={onControlsChange}
              fieldPrefix={prefix}
              themeColors={themeColors}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================
// MAIN EXPORT: TestimonialBlock
// =============================================
export default function TestimonialBlock({
  readOnly = false,
  config,
  onConfigChange,
  themeColors,
}) {
  const [localData, setLocalData] = useState(() =>
    deriveInitialLocalData(config)
  );
  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalData(deriveInitialLocalData(config));
    }
  }, [config]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log(
          "TestimonialBlock: Editing finished. Calling onConfigChange."
        );
        onConfigChange(localData);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (updatedFieldsOrFunction) => {
    setLocalData((prevLocalData) => {
      const newState =
        typeof updatedFieldsOrFunction === "function"
          ? updatedFieldsOrFunction(prevLocalData)
          : { ...prevLocalData, ...updatedFieldsOrFunction };

      if (!readOnly && onConfigChange) {
        console.log("TestimonialBlock: Live update during editing");
        onConfigChange(newState);
      }
      return newState;
    });
  };

  const handleTestimonialChange = (
    index,
    updatedTestimonial,
    isRemove = false
  ) => {
    handleLocalDataChange((prevData) => {
      const updatedReviews = [...(prevData.googleReviews || [])];

      if (isRemove) {
        // Remove the testimonial at the specified index
        updatedReviews.splice(index, 1);

        // Adjust currentIndex if necessary to prevent being on an empty page
        const chunkSize = getVariantChunkSize(
          localData.variant || "default",
          false
        );
        const newTotalReviews = updatedReviews.length;

        if (newTotalReviews > 0) {
          const maxIndex = Math.max(0, newTotalReviews - chunkSize);
          if (currentIndex > maxIndex) {
            setCurrentIndex(maxIndex);
          }
        } else {
          setCurrentIndex(0);
        }
      } else {
        // Update the testimonial at the specified index
        updatedReviews[index] = updatedTestimonial;
      }

      return { ...prevData, googleReviews: updatedReviews };
    });
  };

  const handleFieldChange = (field, value) => {
    handleLocalDataChange({ [field]: value });
  };

  // Render logic similar to current implementation but with inline editing
  const [currentIndex, setCurrentIndex] = useState(0);
  const googleReviews = localData.googleReviews || [];

  // Use variant-specific chunk sizes
  const currentVariant = localData.variant || "default";
  const variantClasses = getVariantClasses(currentVariant);
  const chunkSize = getVariantChunkSize(currentVariant, false);
  const smallScreenChunkSize = getVariantChunkSize(currentVariant, true);
  const totalReviews = googleReviews.length;

  const getVisibleReviews = (isSmallScreen) => {
    const currentChunkSize = isSmallScreen ? smallScreenChunkSize : chunkSize;
    return googleReviews.slice(currentIndex, currentIndex + currentChunkSize);
  };

  const handlePrev = (isSmallScreen) => {
    const currentChunkSize = isSmallScreen ? smallScreenChunkSize : chunkSize;
    if (currentIndex - currentChunkSize >= 0) {
      setCurrentIndex((prev) => prev - currentChunkSize);
    }
  };

  const handleNext = (isSmallScreen) => {
    const currentChunkSize = isSmallScreen ? smallScreenChunkSize : chunkSize;
    if (currentIndex + currentChunkSize < totalReviews) {
      setCurrentIndex((prev) => prev + currentChunkSize);
    }
  };

  return (
    <div
      className="w-full pb-6 md:pt-5"
      style={{
        backgroundColor: localData.backgroundColor,
      }}
    >
      {/* TESTIMONIALS (SMALL SCREEN) */}
      <div className="block md:hidden pt-8 -mt-[5vh] relative z-20 px-[2vw]">
        <div className="flex items-center justify-center px-4">
          {!readOnly ? (
            <input
              type="text"
              value={localData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className={`${variantClasses.mobileTitle} bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 outline-none text-center`}
              style={getTextStyles(localData.sectionTitleTextSettings)}
            />
          ) : (
            <h2 className={variantClasses.mobileTitle} style={getTextStyles(localData.sectionTitleTextSettings)}>
              {localData.title}
            </h2>
          )}
        </div>
        <div className="relative mt-3 pb-3">
          {totalReviews > smallScreenChunkSize && currentIndex > 0 && (
            <button
              onClick={() => handlePrev(true)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 ml-1"
              style={getArrowStyles(localData.arrowStyle, localData)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          )}
          <div className={variantClasses.mobileContainer}>
            {getVisibleReviews(true).map((t, idx) => (
              <TestimonialItem
                key={idx}
                testimonial={t}
                readOnly={readOnly}
                onTestimonialChange={handleTestimonialChange}
                index={currentIndex + idx}
                variant={localData.variant}
                backgroundColor={localData.testimonialbg}
                textColor={localData.textcolor}
                shadowColor={localData.testimonialShadowColor}
                shadowVariant={localData.styling?.shadowVariant}
                nameTextSettings={localData.nameTextSettings}
                dateTextSettings={localData.dateTextSettings}
                bodyTextSettings={localData.bodyTextSettings}
              />
            ))}
          </div>
          {totalReviews > smallScreenChunkSize && currentIndex + smallScreenChunkSize < totalReviews && (
            <button
              onClick={() => handleNext(true)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-1"
              style={getArrowStyles(localData.arrowStyle, localData)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
        <div className="text-center mt-3">
          <div
            className="flex justify-center space-x-4"
            style={{
              backgroundColor: localData.backgroundColor,
            }}
          >
            <a
              href={localData.reviewButtonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1  rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-xs font-sans"
            >
              <img src={googleIcon} alt="Google" className="w-4 h-4 mr-1" />
              <span style={getTextStyles(localData.buttonTextSettings)}>{localData.reviewButtonText}</span>
            </a>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS (LARGE SCREENS) */}
      <div className="hidden md:block px-1">
        <div className="flex items-center justify-center mb-3">
          {!readOnly ? (
            <input
              type="text"
              value={localData.title}
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className={`${variantClasses.title} bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 outline-none text-center`}
              style={getTextStyles(localData.sectionTitleTextSettings)}
            />
          ) : (
            <h2 className={variantClasses.title} style={getTextStyles(localData.sectionTitleTextSettings)}>
              {localData.title}
            </h2>
          )}
        </div>
        <div className="container mx-auto px-2 relative pb-3">
          <div className={variantClasses.container}>
            {totalReviews > chunkSize && currentIndex > 0 && (
              <button
                onClick={() => handlePrev(false)}
                className="absolute -left-10 top-1/2 transform -translate-y-1/2"
                style={getArrowStyles(localData.arrowStyle, localData)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
            )}
            {getVisibleReviews(false).map((t, idx) => (
              <TestimonialItem
                key={idx}
                testimonial={t}
                readOnly={readOnly}
                onTestimonialChange={handleTestimonialChange}
                index={currentIndex + idx}
                variant={localData.variant}
                backgroundColor={localData.testimonialbg}
                textColor={localData.textcolor}
                shadowColor={localData.testimonialShadowColor}
                shadowVariant={localData.styling?.shadowVariant}
                nameTextSettings={localData.nameTextSettings}
                dateTextSettings={localData.dateTextSettings}
                bodyTextSettings={localData.bodyTextSettings}
              />
            ))}
            {totalReviews > chunkSize && currentIndex + chunkSize < totalReviews && (
              <button
                onClick={() => handleNext(false)}
                className="absolute -right-10 top-1/2 transform -translate-y-1/2"
                style={getArrowStyles(localData.arrowStyle, localData)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="py-1 text-center px-3">
          <div className="flex justify-center space-x-6">
            <a
              href={localData.reviewButtonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-1 rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-sm md:text-lg font-sans"
            >
              <img src={googleIcon} alt="Google" className="w-6 h-6 mr-2" />
              <span style={getTextStyles(localData.buttonTextSettings)}>{localData.reviewButtonText}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

TestimonialBlock.propTypes = {
  readOnly: PropTypes.bool,
  config: PropTypes.object,
  onConfigChange: PropTypes.func,
  themeColors: PropTypes.object,
};

// Tab configuration for BottomStickyEditPanel
TestimonialBlock.tabsConfig = (currentData, onControlsChange, themeColors, sitePalette) => {
  const tabs = {};

  // Images Tab (using reviews interface)
  tabs.images = (props) => (
    <TestimonialReviewsControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
    />
  );

  // Colors Tab
  tabs.colors = (props) => (
    <TestimonialColorControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  );

  // Styling Tab
  tabs.styling = (props) => (
    <TestimonialStylingControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
    />
  );

  // Fonts Tab
  tabs.fonts = (props) => (
    <TestimonialFontsControls
      {...props}
      currentData={currentData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  );

  return tabs;
};
