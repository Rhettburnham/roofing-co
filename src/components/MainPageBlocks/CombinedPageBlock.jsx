import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "../StarRating";

// Icons for Services
import { FaTools, FaFan, FaPaintRoller, FaTint } from "react-icons/fa";
import googleIcon from "/assets/images/googleimage.png";

// Additional icons from lucide-react
import { Home, Building2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   SERVICES DATA (as in your original snippet)
───────────────────────────────────────────────────────────── */
const residentialServices = [
  { icon: FaTools, title: "Shingling", link: "/Residential_service_1" },
  { icon: FaFan, title: "Ventilation", link: "/Residential_service_2" },
  { icon: FaTint, title: "Guttering", link: "/Residential_service_3" },
  { icon: FaPaintRoller, title: "Siding", link: "/Residential_service_4" },
];

const commercialServices = [
  { icon: FaTools, title: "Single Ply", link: "/CommercialService1" },
  { icon: FaPaintRoller, title: "Coating", link: "/CommercialService2" },
  { icon: FaTools, title: "Metal Roof", link: "/CommercialService3" },
  { icon: FaTools, title: "Built Up", link: "/CommercialService4" },
];

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS FOR THE SERVICES BUTTONS (unchanged)
───────────────────────────────────────────────────────────── */
const containerVariants = {
  enter: {
    transition: {
      // Stagger children from last to first on enter
      // because we'll reverse the array
      staggerChildren: 0.07,
      staggerDirection: 1,
    },
  },
  exit: {
    transition: {
      // Stagger children from last to first on exit
      staggerChildren: 0.07,
      staggerDirection: 1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: "-50%" },
  enter: {
    opacity: 1,
    x: "0%",
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.3 },
  },
};

/* ─────────────────────────────────────────────────────────────
   A SINGLE TESTIMONIAL ITEM
───────────────────────────────────────────────────────────── */
const TestimonialItem = ({ testimonial }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  // On small screens, show truncated text unless expanded
  const truncated =
    testimonial.text.length > 100
      ? testimonial.text.slice(0, 100) + "..."
      : testimonial.text;

  return (
    <div
      className="p-4 bg-white rounded-lg custom-circle-shadow relative cursor-pointer"
      onClick={handleExpandClick}
    >
      {/* If there's a link and logo, show clickable logo in top-right */}
      {testimonial.link && testimonial.logo && (
        <a
          href={testimonial.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10"
          onClick={(e) => e.stopPropagation()} // don't toggle on logo click
        >
          <img src={testimonial.logo} alt="Logo" className="w-full h-full" />
        </a>
      )}

      {/* Name, rating, date */}
      <div className="flex flex-col -space-y-1 ">
        <p className="ml-1 md:ml-1 text-[2.5vw] md:text-[2vh] font-bold text-black font-serif">
          {testimonial.name}
        </p>
        <div className="flex items-center text-base md:text-xl justify-between">
          <StarRating rating={testimonial.stars} />
          <p className="text-gray-500 text-[2vw] md:text-[1.6vh] mt-1 md:mt-2">{testimonial.date}</p>
        </div>
      </div>

      {/* Text */}
      <p className="text-gray-800 ">
        <span className=" text-[2vw] md:text-[2vh] block md:hidden">
          {isExpanded ? testimonial.text : truncated}
        </span>
        <span className="md:text-xs hidden md:block">{testimonial.text}</span>
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   COMBINEDPAGE COMPONENT
   (All styling, no Yelp toggles — only Google data)
───────────────────────────────────────────────────────────── */
export default function CombinedPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCommercial, setIsCommercial] = useState(false);
  const [googleReviews, setGoogleReviews] = useState([]);

  // On mount, fetch from /data/sentiment_reviews.json
  useEffect(() => {
    fetch("/data/sentiment_reviews.json")
      .then((res) => res.json())
      .then((data) => {
        // Filter to get only positive reviews
        const processed = data
          .filter(
            (review) =>
              review.sentiment && review.sentiment.toLowerCase() === "positive"
          )
          .map((review) => ({
            name: review.name,
            stars: parseInt(review.rating, 10),
            date: review.date,
            text: review.review_text,
            logo: googleIcon,
            link: "https://www.google.com/maps/place/Rhetts+Roofing/",
          }))
          // Sort highest rated first
          .sort((a, b) => b.stars - a.stars)
          // Limit to 9
          .slice(0, 9);

        setGoogleReviews(processed);
      })
      .catch((error) => {
        console.error("Error fetching JSON:", error);
      });
  }, []);

  // Which services to show
  const currentServices = isCommercial ? commercialServices : residentialServices;

  // For the “Testimonials” arrows
  const chunkSize = 3;
  const totalReviews = googleReviews.length;
  const visibleReviews = googleReviews.slice(currentIndex, currentIndex + chunkSize);

  const handlePrev = () => {
    if (currentIndex - chunkSize >= 0) {
      setCurrentIndex((prev) => prev - chunkSize);
    }
  };
  const handleNext = () => {
    if (currentIndex + chunkSize < totalReviews) {
      setCurrentIndex((prev) => prev + chunkSize);
    }
  };

  const handleResidentialClick = () => setIsCommercial(false);
  const handleCommercialClick = () => setIsCommercial(true);

  return (
    <div className="w-full bg-black">
      {/* ──────────────────────────────────────────────────────────
          1) SMALL SCREEN SECTION
      ────────────────────────────────────────────────────────── */}
      <div className="block md:hidden relative w-full">
        <div className="relative bg-hover-color h-[1vh] z-30 w-full">
          <div className="absolute bottom-0 right-0 left-0 h-[0.75vh] bg-gradient-to-b from-transparent to-orange-600" />
        </div>
        {/* Two images side-by-side, animate x for swap */}
        <div className="overflow-hidden w-full relative">
          <motion.div
            animate={{ x: isCommercial ? "-100vw" : "0%" }}
            transition={{ duration: 0.8 }}
            className="flex"
          >
            {/* Residential image */}
            <img
              src="/assets/images/main_img.jpg"
              alt="Residential Services"
              className="w-full h-auto"
            />
            {/* Commercial image */}
            <img
              src="/assets/images/commercialservices.jpg"
              alt="Commercial Services"
              className="w-full h-auto"
            />
          </motion.div>
        </div>

        {/* White triangle at bottom (no pointer events) */}
        <div
          className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-black z-0 pointer-events-none"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
        <h2
          className="absolute top-[0vh] left-1/2 transform -translate-x-1/2
                        text-white text-[10vw] font-normal font-ultra-condensed font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)]"
        >
          Services
        </h2>

        {/* SERVICES Buttons (staggered exit/enter) */}
        <div className="absolute bottom-[10vh] left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex flex-row gap-6">
            <button
              onClick={handleResidentialClick}
              className={`flex items-center px-2 md:px-4 md:py-2 rounded-full border-1 mx-2 text-md
                ${
                  !isCommercial
                    ? "bg-dark-below-header text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                    : "bg-gray-500 text-white hover:bg-white hover:text-black"
                }
                transition-colors duration-300`}
              onMouseEnter={(e) => {
                if (isCommercial) {
                  e.currentTarget.style.boxShadow =
                    "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              <Home className="mr-2" size={16} />
              <p className="text-[3vw]">Residential</p>
            </button>
            <button
              onClick={handleCommercialClick}
              className={`flex items-center px-2 md:px-4 py-1 md:py-2 text-lg rounded-full border-1 mx-2 
                ${
                  isCommercial
                    ? "bg-dark-below-header text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                    : "bg-gray-500 hover:bg-white hover:text-black text-white"
                }
                transition-colors duration-300`}
              onMouseEnter={(e) => {
                if (!isCommercial) {
                  e.currentTarget.style.boxShadow =
                    "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              <Building2 className="mr-2" size={16} />
              <p className="text-[3vw]">Commercial</p>
            </button>
          </div>
        </div>

        {/* Staggered row of service icons */}
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-[26vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={isCommercial ? "commercial" : "residential"}
              className="flex flex-row gap-6"
              variants={containerVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              {[...currentServices].reverse().map((service, idx) => (
                <motion.div
                  key={service.title}
                  variants={itemVariants}
                  className="flex flex-col items-center -mt-[7vh] md:-mt-[2vh]"
                >
                  <Link to={service.link}>
                    <div
                      className="group whitespace-nowrap flex-col dark_button w-[11vh] h-[11vh] md:w-24 md:h-24 rounded-full 
                                 flex items-center justify-center
                                 text-white text-[5vw]
                                 hover:text-gray-200 hover:bg-gray-200 transition
                                 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 0 30px 10px rgba(0,0,0,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {React.createElement(service.icon)}
                      <h3 className="mt-1 text-white text-[3vw] group-hover:text-gray-200 md:text-sm font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                        {service.title}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          2) TESTIMONIALS (SMALL SCREEN)
      ────────────────────────────────────────────────────────── */}
      <div className="block md:hidden -mt-[5vh] relative z-20 px-[6vw] pb-6">
        {/* Title */}
        <div className="flex items-center justify-center px-4">
          <h2
            className="text-[7.5vw] text-white md:text-[6vh] md:text-5xl font-serif mr-2 mt-3"
            style={{ fontFamily: "Times New Roman, Times, serif" }}
          >
            Testimonials
          </h2>
        </div>

        {/* Testimonial Cards (3 at a time) with arrow nav */}
        <div className="relative mt-3 pb-3">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2
                         bg-white text-gray-700 rounded-full w-6 h-6
                         flex items-center justify-center
                         drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 ml-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-3 h-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
          )}

          <div className="grid grid-cols-1 gap-3 px-6">
            {visibleReviews.map((t, idx) => (
              <TestimonialItem key={idx} testimonial={t} />
            ))}
          </div>

          {currentIndex + chunkSize < totalReviews && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2
                         bg-white text-gray-700 rounded-full w-6 h-6
                         flex items-center justify-center
                         drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)]
                         hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 mr-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-3 h-3"
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

        {/* "Leave a Review" */}
        <div className="text-center">
          <div className="flex justify-center space-x-4">
            <a
              href="https://www.google.com/maps/place/Rhetts+Roofing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-xs"
            >
              <img src={googleIcon} alt="Google" className="w-4 h-4 mr-1" />
              <span>Review on Google</span>
            </a>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          3) LARGE SCREENS
      ────────────────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-hidden">
        {/* Large images side-by-side */}
        <div className="relative bg-hover-color h-[1vh] z-30 w-full">
          <div className="absolute bottom-0 right-0 left-0 h-[0.75vh] bg-gradient-to-b from-transparent to-orange-600" />
        </div>
        <div className="relative w-full h-[60vh]">
          <motion.div
            animate={{ x: isCommercial ? "-100vw" : "0%" }}
            transition={{ duration: 1 }}
            className="flex w-[200%] h-full"
          >
            <img
              src="/assets/images/main_image_expanded.jpg"
              alt="Residential Services"
              className="w-[100vw] h-full object-cover"
            />
            <img
              src="/assets/images/commercialservices.jpg"
              alt="Commercial Services"
              className="w-[100vw] h-full object-cover"
            />
          </motion.div>

          {/* Title near top */}
          <div className="absolute top-0 w-full flex justify-center">
            <h2
              className="relative z-40 text-white text-[11.5vh] font-serif font-semibold tracking-wider font-condensed drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)]"
            >
              Services
            </h2>
          </div>

          {/* Toggle: Residential / Commercial */}
          <div className="absolute bottom-[6vh] left-1/2 transform -translate-x-1/2 z-30">
            <div className="flex flex-row">
              <button
                onClick={handleResidentialClick}
                className={`flex items-center px-4 py-2 rounded-full border-1 mx-2 text-lg
                  ${
                    !isCommercial
                      ? "bg-dark-below-header text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                      : "bg-gray-500 text-white hover:bg-white hover:text-black"
                  }
                  transition-colors duration-300`}
                onMouseEnter={(e) => {
                  if (isCommercial) {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                }}
              >
                <Home className="mr-2" size={30} />
                Residential
              </button>
              <button
                onClick={handleCommercialClick}
                className={`flex items-center px-4 py-2 text-lg rounded-full border-1 mx-2 
                  ${
                    isCommercial
                      ? "bg-dark-below-header text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                      : "bg-gray-500 hover:bg-white hover:text-black text-white"
                  }
                  transition-colors duration-300`}
                onMouseEnter={(e) => {
                  if (!isCommercial) {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                }}
              >
                <Building2 className="mr-2" size={30} />
                Commercial
              </button>
            </div>
          </div>

          {/* Services (buttons) with staggered exit/enter */}
          <div className="absolute inset-0 flex items-end justify-center mb-[26vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isCommercial ? "commercial-lg" : "residential-lg"}
                className="grid grid-cols-4 gap-[5.5vw] group-hover:text-black"
                variants={containerVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                {[...currentServices].reverse().map((service) => (
                  <motion.div
                    key={service.title}
                    variants={itemVariants}
                    className="flex flex-col items-center group-hover:text-black"
                  >
                    <Link to={service.link}>
                      <div
                        className="dark_button flex-col w-28 h-28 rounded-full 
                                   flex items-center justify-center
                                   text-white text-[6vh]
                                   hover:text-black hover:bg-gray-200 transition
                                   drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 30px 10px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {React.createElement(service.icon)}
                        <h3 className="mt-1 text-white text-lg font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                          {service.title}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative bottom-0 right-0 left-0 bg-hover-color h-[1vh] z-30 w-full">
            <div className="absolute top-0 right-0 left-0 h-[0.75vh] bg-gradient-to-t from-transparent to-orange-700" />
          </div>
        </div>

        {/* TESTIMONIALS SECTION (LARGE) */}
        <section id="testimonials" className="relative bg-black px-3 pt-5">
          <div className="flex items-center justify-center mb-3">
            <h2
              className="text-5xl text-white text-font-serif mr-4 my-3"
              style={{ fontFamily: "Times New Roman, Times, serif" }}
            >
              Testimonials
            </h2>
          </div>

          {/* Cards + Arrows (3 at a time) */}
          <div className="container mx-auto px-2 relative pb-3">
            <div className="grid gap-4 grid-cols-3">
              {/* Left Arrow */}
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute -left-4 top-1/2 transform -translate-y-1/2
                             bg-white text-gray-700 rounded-full w-8 h-8
                             flex items-center justify-center
                             drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)]
                             hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"
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
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
              )}

              {visibleReviews.map((t, idx) => (
                <TestimonialItem key={idx} testimonial={t} />
              ))}

              {/* Right Arrow */}
              {currentIndex + chunkSize < totalReviews && (
                <button
                  onClick={handleNext}
                  className="absolute -right-4 top-1/2 transform -translate-y-1/2
                             bg-white text-gray-700 rounded-full w-8 h-8
                             flex items-center justify-center
                             drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)]
                             hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"
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

          {/* "Leave a Review" at bottom */}
          <div className="py-3 text-center px-3">
            <div className="flex justify-center space-x-6">
              <a
                href="https://www.google.com/maps/place/Rhetts+Roofing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-sm"
              >
                <img src={googleIcon} alt="Google" className="w-6 h-6 mr-2" />
                <span>Review us on Google</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
