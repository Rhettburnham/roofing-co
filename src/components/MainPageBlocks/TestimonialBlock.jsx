import React, { useState, useEffect } from "react";
import StarRating from "../StarRating";
import googleIcon from "/assets/images/hero/googleimage.png";

// A SINGLE TESTIMONIAL ITEM COMPONENT
const TestimonialItem = ({ testimonial }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const handleExpandClick = () => setIsExpanded(!isExpanded);

  const truncated =
    testimonial.text.length > 100
      ? testimonial.text.slice(0, 250) + "..."
      : testimonial.text;

  return (
    <div
      className="p-2 md:p-4 bg-white rounded-lg custom-circle-shadow relative cursor-pointer" // Increased padding md:p-4
      onClick={handleExpandClick}
    >
      <div className="flex items-start mb-2">
        {testimonial.link && testimonial.logo && (
          <a
            href={testimonial.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center self-center mr-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={testimonial.logo}
              alt="Logo"
              className="w-6 h-6 md:w-9 md:h-9"
            />
          </a>
        )}
        <div className="flex-grow">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[3vw] md:text-[1.8vh] font-semibold text-black font-sans truncate">
              {testimonial.name}
            </p>
            <div className="flex-shrink-0">
              <StarRating rating={testimonial.stars} />
            </div>
          </div>
          <p className="text-gray-700 text-[3vw] md:text-[1.4vh] md:-mt-2">
            {testimonial.date}
          </p>
        </div>
      </div>
      <p className="text-gray-800 indent-3">
        <span className="text-[3.2vw] md:text-[2.2vh] block md:hidden">
          {isExpanded ? testimonial.text : truncated}
        </span>
        <span className="text-xs hidden md:block font-serif">
          {testimonial.text}
        </span>
      </p>
    </div>
  );
};

// EDITOR PANEL
function TestimonialEditorPanel({ localData, setLocalData, onSave }) {
  const handleAddTestimonial = () => {
    setLocalData(prev => ({
      ...prev,
      title: prev.title || "Testimonials",
      googleReviews: [
        ...(prev.googleReviews || []),
        {
          name: "New Customer",
          stars: 5,
          date: "1 month ago",
          text: "Add your testimonial text here...",
          logo: "/assets/images/hero/googleimage.png",
          link: "https://www.google.com/maps"
        }
      ]
    }));
  };

  const handleRemoveTestimonial = (index) => {
    setLocalData(prev => {
      const updatedReviews = [...(prev.googleReviews || [])];
      updatedReviews.splice(index, 1);
      return { ...prev, googleReviews: updatedReviews };
    });
  };

  const handleTestimonialChange = (index, field, value) => {
    setLocalData(prev => {
      const updatedReviews = [...(prev.googleReviews || [])];
      updatedReviews[index] = {
        ...updatedReviews[index],
        [field]: field === 'stars' ? Number(value) : value
      };
      return { ...prev, googleReviews: updatedReviews };
    });
  };
  
  const handleTitleChange = (e) => {
    setLocalData(prev => ({ ...prev, title: e.target.value }));
  };
  
  const handleReviewButtonLinkChange = (e) => {
    setLocalData(prev => ({ ...prev, reviewButtonLink: e.target.value }));
  };
  
  const handleReviewButtonTextChange = (e) => {
    setLocalData(prev => ({ ...prev, reviewButtonText: e.target.value }));
  };


  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg max-h-[75vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Testimonials Editor</h2>
        <button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-medium"
        >
          Save Changes
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Section Title:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-3 py-2 rounded text-white"
          value={localData.title || "Testimonials"}
          onChange={handleTitleChange}
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Review Button Text:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-3 py-2 rounded text-white"
          value={localData.reviewButtonText || "Review us on Google"}
          onChange={handleReviewButtonTextChange}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Review Button Link:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-3 py-2 rounded text-white"
          value={localData.reviewButtonLink || "https://www.google.com/maps"}
          onChange={handleReviewButtonLinkChange}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">Google Reviews</h3>
          <button
            onClick={handleAddTestimonial}
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
          >
            + Add Testimonial
          </button>
        </div>
        {(localData.googleReviews || []).map((review, index) => (
          <div key={index} className="bg-gray-700 p-3 rounded mb-4 relative">
            <button
              onClick={() => handleRemoveTestimonial(index)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
              title="Remove testimonial"
            > × </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm mb-1">Name:</label>
                <input
                  type="text"
                  className="w-full bg-gray-600 px-2 py-1 rounded"
                  value={review.name || ""}
                  onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Date:</label>
                <input
                  type="text"
                  className="w-full bg-gray-600 px-2 py-1 rounded"
                  value={review.date || ""}
                  onChange={(e) => handleTestimonialChange(index, 'date', e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Rating (1-5):</label>
              <input
                type="number" min="1" max="5"
                className="w-full bg-gray-600 px-2 py-1 rounded"
                value={review.stars || 5}
                onChange={(e) => handleTestimonialChange(index, 'stars', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Review Text:</label>
              <textarea
                className="w-full bg-gray-600 px-2 py-1 rounded h-20"
                value={review.text || ""}
                onChange={(e) => handleTestimonialChange(index, 'text', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Link:</label>
              <input
                type="text"
                className="w-full bg-gray-600 px-2 py-1 rounded"
                value={review.link || ""}
                onChange={(e) => handleTestimonialChange(index, 'link', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Logo URL (e.g., Google icon):</label>
              <input
                type="text"
                className="w-full bg-gray-600 px-2 py-1 rounded"
                value={review.logo || ""}
                onChange={(e) => handleTestimonialChange(index, 'logo', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// TESTIMONIAL BLOCK COMPONENT
export default function TestimonialBlock({ readOnly = false, config = {}, onConfigChange }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [googleReviews, setGoogleReviews] = useState([]);
  
  const [localData, setLocalData] = useState(() => {
    const initialConfig = config || {};
    return {
      title: initialConfig.title || "Testimonials",
      googleReviews: initialConfig.googleReviews || [],
      reviewButtonText: initialConfig.reviewButtonText || "Review us on Google",
      reviewButtonLink: initialConfig.reviewButtonLink || "https://www.google.com/maps",
    };
  });

  useEffect(() => {
    const currentConfig = config || {};
    setLocalData({
        title: currentConfig.title || "Testimonials",
        googleReviews: currentConfig.googleReviews || [],
        reviewButtonText: currentConfig.reviewButtonText || "Review us on Google",
        reviewButtonLink: currentConfig.reviewButtonLink || "https://www.google.com/maps",
    });
    setGoogleReviews(currentConfig.googleReviews || []);
  }, [config]);


  const chunkSize = 3; // For large screens
  const smallScreenChunkSize = 1; // For small screens
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

  const handleSave = () => {
    if (onConfigChange) {
      onConfigChange(localData);
    }
  };

  if (!readOnly) {
    return <TestimonialEditorPanel localData={localData} setLocalData={setLocalData} onSave={handleSave} />;
  }

  // READ-ONLY MODE
  return (
    <div className="w-full bg-black pb-6 md:pt-5"> {/* Consolidated padding */}
      {/* TESTIMONIALS (SMALL SCREEN) */}
      <div className="block md:hidden pt-8 -mt-[5vh] relative z-20 px-[2vw]"> {/* Adjusted mt for potential overlap with triangle from service slider */}
        <div className="flex items-center justify-center px-4">
          <h2 className="text-[7.5vw] text-white md:text-[6vh] font-serif mt-3">
            {config.title || "Testimonials"}
          </h2>
        </div>
        <div className="relative mt-3 pb-3">
          {totalReviews > smallScreenChunkSize && currentIndex > 0 && (
            <button
              onClick={() => handlePrev(true)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <div className="grid grid-cols-1 gap-3 px-6">
            {getVisibleReviews(true).map((t, idx) => (
              <TestimonialItem key={idx} testimonial={t} />
            ))}
          </div>
          {totalReviews > smallScreenChunkSize && currentIndex + smallScreenChunkSize < totalReviews && (
            <button
              onClick={() => handleNext(true)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
        <div className="text-center mt-3">
          <div className="flex justify-center space-x-4">
            <a
              href={config.reviewButtonLink || "https://www.google.com/maps"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-xs font-sans"
            >
              <img src={googleIcon} alt="Google" className="w-4 h-4 mr-1" />
              <span>{config.reviewButtonText || "Review on Google"}</span>
            </a>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS (LARGE SCREENS) */}
      <div className="hidden md:block bg-black px-3"> {/* Ensure bg-black for this section */}
        <div className="flex items-center justify-center mb-3">
          <h2 className="text-5xl text-white mr-4 my-2 font-serif">
            {config.title || "Testimonials"}
          </h2>
        </div>
        <div className="container mx-auto px-2 relative pb-3">
          <div className="grid gap-4 grid-cols-3">
            {totalReviews > chunkSize && currentIndex > 0 && (
              <button
                onClick={() => handlePrev(false)}
                className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                 </svg>
              </button>
            )}
            {getVisibleReviews(false).map((t, idx) => (
              <TestimonialItem key={idx} testimonial={t} />
            ))}
            {totalReviews > chunkSize && currentIndex + chunkSize < totalReviews && (
              <button
                onClick={() => handleNext(false)}
                className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="py-1 text-center px-3">
          <div className="flex justify-center space-x-6">
            <a
              href={config.reviewButtonLink || "https://www.google.com/maps"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-1 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-sm md:text-lg font-sans"
            >
              <img src={googleIcon} alt="Google" className="w-6 h-6 mr-2" />
              <span>{config.reviewButtonText || "Review us on Google"}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 