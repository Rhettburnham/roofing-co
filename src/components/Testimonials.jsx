import React, { useState } from "react";
import StarRating from "./StarRating";

// Icons
import yelpIcon from "/assets/images/yelp.png";
import googleIcon from "/assets/images/googleimage.png";

// ─────────────────────────────────────────────────────────
//    1. TESTIMONIALS DATA
//       Each set: 9 total reviews
// ─────────────────────────────────────────────────────────

const testimonialsDataSet1 = [
  {
    name: "Katy O'Neil",
    stars: 5,
    date: "",
    text: "Test",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Anthony Yates",
    stars: 5,
    date: "",
    text: "I hired Rhett's Roofing to install a new roof on my house. Rhett came out the day I called and showed me my options...",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Aimee Cantrell",
    stars: 5,
    date: "",
    text: "They were in and out in just a day. Rhett was a real pleasure to work with and has earned my business in the future...",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },

  // 6 additional Google-based reviews
  {
    name: "Michael B.",
    stars: 5,
    date: "Aug 1, 2024",
    text: "Rhett’s team replaced my old shingles quickly and my roof looks incredible! Highly recommend.",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Susanna R.",
    stars: 5,
    date: "May 23, 2024",
    text: "Top-notch work and friendly service. The entire process was explained thoroughly!",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Carlos D.",
    stars: 5,
    date: "Jun 15, 2024",
    text: "From quote to cleanup, everything was seamless. Definitely one of the best experiences with home repair.",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Janice L.",
    stars: 5,
    date: "Jul 8, 2024",
    text: "Excellent crew who worked quickly and professionally. They even took extra care of my garden!",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Jameson R.",
    stars: 5,
    date: "Sep 10, 2024",
    text: "The best roofing experience I've had. Great communication from start to finish.",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Brett P.",
    stars: 5,
    date: "Oct 2, 2024",
    text: "Straightforward pricing and high-quality work. Thanks to Rhett and his amazing team!",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
];

const testimonialsDataSet2 = [
  {
    name: "Shantericka G.",
    stars: 5,
    date: "Aug 12, 2024",
    text: "Rhett & Sons replaced our roof after weather damage, and the experience was seamless...",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Echoing Review",
    stars: 5,
    date: "Sep 4, 2024",
    text: "The team at Rhett's Roofing did a fantastic job installing our new gutters, even with snow on the ground!",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Mary P.",
    stars: 5,
    date: "Jul 18, 2024",
    text: "They replaced our roof in one day, and the results were fantastic. Rhett led a hardworking team!",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },

  // 6 additional Yelp-based reviews
  {
    name: "Linda F.",
    stars: 5,
    date: "Jul 30, 2024",
    text: "I love how straightforward Rhett was. No hidden fees, no surprises. My roof looks incredible!",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Bryan K.",
    stars: 5,
    date: "Aug 14, 2024",
    text: "Fantastic experience! Rhett’s crew replaced my old shingles within a day. Highly recommended!",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Denise W.",
    stars: 5,
    date: "Mar 2, 2024",
    text: "Courteous, professional, and precise. I’ve never had such a stress-free home improvement project.",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Ronald P.",
    stars: 5,
    date: "Apr 12, 2024",
    text: "Rhett’s Roofing impressed me with their speed and attention to detail. Clean up was spotless!",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Kevin T.",
    stars: 5,
    date: "Jun 17, 2024",
    text: "Responsive and reliable. They worked around my schedule and exceeded all expectations.",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Rebecca H.",
    stars: 5,
    date: "Nov 1, 2024",
    text: "I can’t believe how painless this was. Great customer service and beautiful work. Thank you!",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
];

const TestimonialItem = ({ testimonial }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClick = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className="p-4 bg-white rounded-lg custom-circle-shadow relative cursor-pointer"
      onClick={handleExpandClick}
    >
      <a
        href={testimonial.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 w-8 h-8"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={testimonial.logo}
          alt="Logo"
          className="w-full h-full object-cover"
        />
      </a>
      <div className="flex flex-col items-start mb-2">
        <p className="text-sm font-semibold text-black">{testimonial.name}</p>
        <StarRating rating={testimonial.stars} />
        <p className="text-gray-500 text-xs mt-1">{testimonial.date}</p>
      </div>
      <p className="text-gray-800 text-sm mt-2">
        <span className="block md:hidden">
          {isExpanded
            ? testimonial.text
            : testimonial.text.length > 100
              ? `${testimonial.text.slice(0, 100)}...`
              : testimonial.text}
        </span>
        <span className="hidden md:block">{testimonial.text}</span>
      </p>
    </div>
  );
};

const Testimonials = () => {
  const [activeSet, setActiveSet] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTestimonials =
    activeSet === 1 ? testimonialsDataSet1 : testimonialsDataSet2;
  const totalReviews = currentTestimonials.length;
  const chunkSize = 3;

  const visibleReviews = currentTestimonials.slice(
    currentIndex,
    currentIndex + chunkSize
  );

  const handleNext = () => {
    if (currentIndex + chunkSize < totalReviews) {
      setCurrentIndex(currentIndex + chunkSize);
    }
  };

  const handlePrev = () => {
    if (currentIndex - chunkSize >= 0) {
      setCurrentIndex(currentIndex - chunkSize);
    }
  };

  const handleSwap = () => {
    setActiveSet((prev) => (prev === 1 ? 2 : 1));
    setCurrentIndex(0);
  };

  return (
    <section
      id="testimonials"
      className="relative bg-black min-h-screen py-8"
    >
      {/* Header Section */}
      <div className="flex items-center justify-center md:mb-6 mx-6 sm:mx-12">
        <h2
          className="text-[7.5vw] md:text-[6vh]  font-serif mr-4 my-3"
          style={{ fontFamily: "Times New Roman, Times, serif" }}
        >
          Testimonials
        </h2>

        <div
          onClick={handleSwap}
          className="relative w-20 h-10 md:w-32 md:h-16 
                     flex items-center justify-around 
                     rounded-lg overflow-hidden 
                     shadow-md cursor-pointer"
          aria-label="Switch Testimonials Data Set"
        >
          <div className="relative w-1/2 h-full flex items-center justify-center bg-white">
            <img
              src={googleIcon}
              alt="Google Icon"
              className={`h-6 w-6 md:h-8 md:w-8 transition-opacity duration-300
               ${activeSet === 1 ? "opacity-100" : "opacity-50"}`}
            />
            {activeSet !== 1 && (
              <div className="absolute inset-0 bg-gray-300 opacity-30 pointer-events-none" />
            )}
          </div>
          <div className="relative w-1/2 h-full flex items-center justify-center bg-white">
            <img
              src={yelpIcon}
              alt="Yelp Icon"
              className={`h-6 w-6 md:h-8 md:w-8 transition-opacity duration-300
               ${activeSet === 2 ? "opacity-100" : "opacity-50"}`}
            />
            {activeSet !== 2 && (
              <div className="absolute inset-0 bg-gray-300 opacity-30 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Testimonials Grid + Arrows */}
      <div className="container mx-auto px-12 sm:px-16 md:px-20 relative pb-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 relative">
          {/* Left Arrow */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 
                         bg-white text-gray-700 rounded-full w-8 h-8
                         flex items-center justify-center shadow-md hover:shadow-lg z-10
                         -translate-x-12 sm:-translate-x-16
                         transition-all duration-300"
              aria-label="Previous"
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

          {/* Testimonials */}
          {visibleReviews.map((testimonial, index) => (
            <TestimonialItem testimonial={testimonial} key={index} />
          ))}

          {/* Right Arrow */}
          {currentIndex + chunkSize < totalReviews && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 
                         bg-white text-gray-700 rounded-full w-8 h-8
                         flex items-center justify-center shadow-md hover:shadow-lg z-10
                         translate-x-12 sm:translate-x-16
                         transition-all duration-300"
              aria-label="Next"
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
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Review Section */}
      <div className="py-6 text-center px-6 sm:px-12">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a
            href="https://www.google.com/maps/place/Rhetts+Roofing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 text-sm w-full sm:w-auto justify-center"
          >
            <img src={googleIcon} alt="Google" className="w-6 h-6 mr-2" />
            <span>Review us on Google</span>
          </a>
          <a
            href="https://www.yelp.com/biz/rhetts-roofing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 text-sm w-full sm:w-auto justify-center"
          >
            <img src={yelpIcon} alt="Yelp" className="w-6 h-6 mr-2" />
            <span>Review us on Yelp</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
