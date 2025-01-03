import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";
// Icons for Services (existing ones)
import { FaTools, FaFan, FaPaintRoller, FaTint } from "react-icons/fa";
// Icons for Testimonials
import yelpIcon from "/assets/images/yelp.png";
import googleIcon from "/assets/images/googleimage.png";
// NEW ICONS from lucide-react
import { Home, Building2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   SERVICES DATA
───────────────────────────────────────────────────────────── */
const residentialServices = [
  { icon: FaTools, title: "Shingling", link: "/shingleinstallation" },
  { icon: FaFan, title: "Ventilation", link: "/ventilation" },
  { icon: FaTint, title: "Guttering", link: "/gutterrelated" },
  { icon: FaPaintRoller, title: "Siding", link: "/sidingshowcase" },
];

const commercialServices = [
  { icon: FaTools, title: "Single Ply", link: "/singleplysystems" },
  { icon: FaPaintRoller, title: "Coating", link: "/roofcoating" },
  { icon: FaTools, title: "Metal Roof", link: "/metalroofs" },
  { icon: FaTools, title: "Built Up", link: "/builtuproofing" },
];

/* ─────────────────────────────────────────────────────────────
   TESTIMONIALS DATA
───────────────────────────────────────────────────────────── */
const testimonialsDataSet1 = [
  {
    name: "Katy O'Neil",
    stars: 5,
    date: "",
    text: "Professionalism and courtesy at the highest level. Rhett's crew arrived promptly both days and efficiently completed our total roof replacement...",
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
      {/* Clickable logo in top-right */}
      <a
        href={testimonial.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 w-8 h-8"
        onClick={(e) => e.stopPropagation()} // don't toggle on logo click
      >
        <img src={testimonial.logo} alt="Logo" className="w-full h-full" />
      </a>

      {/* Name, rating, date */}
      <div className="flex flex-col items-start mb-2">
        <p className="text-sm font-semibold text-black">{testimonial.name}</p>
        <StarRating rating={testimonial.stars} />
        <p className="text-gray-500 text-xs mt-1">{testimonial.date}</p>
      </div>

      {/* Text */}
      <p className="text-gray-800 text-sm mt-2">
        <span className="block md:hidden">
          {isExpanded ? testimonial.text : truncated}
        </span>
        <span className="hidden md:block">{testimonial.text}</span>
      </p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS FOR THE SERVICES BUTTONS
   - We define a container that handles staggered transitions
   - Each button has enter/exit animations
   - We manually reverse the array so the "rightmost" item
     is effectively index=0 (it exits first, enters first).
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
   THE COMBINED PAGE COMPONENT
───────────────────────────────────────────────────────────── */
const CombinedPage = () => {
  const [activeSet, setActiveSet] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCommercial, setIsCommercial] = useState(false);

  const currentTestimonials =
    activeSet === 1 ? testimonialsDataSet1 : testimonialsDataSet2;

  const totalReviews = currentTestimonials.length; // 9
  const chunkSize = 3;
  const visibleReviews = currentTestimonials.slice(
    currentIndex,
    currentIndex + chunkSize
  );

  /* --------------------------
     TESTIMONIALS NAV
  ---------------------------*/
  const handlePrev = () => {
    if (currentIndex - chunkSize >= 0) {
      setCurrentIndex(currentIndex - chunkSize);
    }
  };
  const handleNext = () => {
    if (currentIndex + chunkSize < totalReviews) {
      setCurrentIndex(currentIndex + chunkSize);
    }
  };
  const handleSwap = () => {
    setActiveSet(activeSet === 1 ? 2 : 1);
    setCurrentIndex(0);
  };

  /* --------------------------
     SERVICES (Conditional)
  ---------------------------*/
  const currentServices = isCommercial ? commercialServices : residentialServices;
  const handleResidentialClick = () => setIsCommercial(false);
  const handleCommercialClick = () => setIsCommercial(true);

  return (
    <div className="w-full">
      {/* ──────────────────────────────────────────────────────────
          SMALL SCREEN SECTION
      ────────────────────────────────────────────────────────── */}
      <div className="block md:hidden relative w-full ">
        {/* (1) The two toggle buttons ABOVE the image */}
        <div className="flex justify-center gap-2 py-4 faint-color">
          {/* RESIDENTIAL button */}
          <button
            onClick={handleResidentialClick}
            className={`flex items-center px-3 py-2 rounded-full border-2 z-30
              ${
                !isCommercial
                  ? "bg-gray-800 text-white border-gray-800"
                  : "border-gray-400 text-gray-600"
              } 
              transition-colors duration-300`}
          >
            <Home className="mr-2" size={18} />
            Residential
          </button>

          {/* COMMERCIAL button */}
          <button
            onClick={handleCommercialClick}
            className={`flex items-center px-3 py-2 rounded-full border-2 z-30
              ${
                isCommercial
                  ? "bg-gray-800 text-white border-gray-800"
                  : "border-gray-400 text-gray-600"
              }
              transition-colors duration-300`}
          >
            <Building2 className="mr-2" size={18} />
            Commercial
          </button>
        </div>

        {/* (2) Two images side-by-side, animate x for swap */}
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

        {/* (3) White triangle at bottom, no pointer events */}
        <div
          className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-white z-0 pointer-events-none"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />

        {/* (4) SERVICES Buttons (staggered exit/enter) */}
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-[15vh]">
          <AnimatePresence mode="wait">
            {/* We use a different key depending on isCommercial to force re-mount */}
            <motion.div
              key={isCommercial ? "commercial" : "residential"}
              className="flex flex-row gap-4 mt-4"
              variants={containerVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              {/* Reverse the array so the right-most item has index=0 */}
              {[...currentServices].reverse().map((service, idx) => (
                <motion.div
                  key={service.title}
                  variants={itemVariants}
                  className="flex flex-col items-center"
                >
                  <Link to={service.link}>
                    <div
                      className="dark_button w-14 h-14 rounded-full 
                                 flex items-center justify-center
                                 text-white text-2xl 
                                 transition-all duration-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 0 25px 8px rgba(0,0,0,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {React.createElement(service.icon, { color: "#ffffff" })}
                    </div>
                  </Link>
                  <h3 className="mt-1 text-white text-sm font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                    {service.title}
                  </h3>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* TESTIMONIALS (SMALL) */}
      <div className="block md:hidden -mt-[5vh] relative z-20">
        {/* Overlapping heading + toggle */}
        <div className="flex items-center justify-center px-4">
          <h2
            className="text-[7.5vw] md:text-[6vh] md:text-5xl font-serif mr-2"
            style={{ fontFamily: "Times New Roman, Times, serif" }}
          >
            Testimonials
          </h2>

          {/* Toggle (Google / Yelp) */}
          <div
            onClick={handleSwap}
            className="relative w-22 h-8 flex items-center justify-around 
                       rounded-full overflow-hidden shadow-md cursor-pointer bg-white"
            aria-label="Switch Testimonials Data Set"
          >
            {/* Left side = Google */}
            <div className="relative w-1/2 h-full flex items-center justify-center bg-white">
              <img
                src={googleIcon}
                alt="Google Icon"
                className={`h-5 w-5 transition-opacity duration-300`}
              />
              {activeSet !== 1 && (
                <div className="absolute inset-0 bg-gray-300 opacity-30 pointer-events-none" />
              )}
            </div>
            {/* Right side = Yelp */}
            <div className="relative w-1/2 h-full flex items-center justify-center bg-white">
              <img
                src={yelpIcon}
                alt="Yelp Icon"
                className={`h-5 w-5 transition-opacity duration-300`}
              />
              {activeSet !== 2 && (
                <div className="absolute inset-0 bg-gray-300 opacity-30 pointer-events-none" />
              )}
            </div>
          </div>
        </div>

        {/* Cards (3 at a time) with arrow nav */}
        <div className="relative mt-3 pb-6">
          {/* Left Arrow */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 transform -translate-y-1/2
                         bg-white text-gray-700 rounded-full w-6 h-6
                         flex items-center justify-center
                         shadow-md hover:shadow-2xl z-10 ml-2"
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

          <div className="grid grid-cols-1 gap-3">
            {visibleReviews.map((t, idx) => (
              <TestimonialItem key={idx} testimonial={t} />
            ))}
          </div>

          {/* Right Arrow */}
          {currentIndex + chunkSize < totalReviews && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2
                         bg-white text-gray-700 rounded-full w-6 h-6
                         flex items-center justify-center
                         shadow-md hover:shadow-2xl z-10 mr-2"
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
        <div className="py-2 text-center">
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
            <a
              href="https://www.yelp.com/biz/rhetts-roofing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 text-xs"
            >
              <img src={yelpIcon} alt="Yelp" className="w-4 h-4 mr-1" />
              <span>Review on Yelp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          LARGE SCREENS
      ────────────────────────────────────────────────────────── */}
      <div className="hidden md:block">
        {/* (1) Two toggle buttons ABOVE the main image */}
        <div className="w-full flex justify-center py-4">
          <button
            onClick={handleResidentialClick}
            className={`flex items-center px-4 py-2 rounded-full border-2 mx-2
              ${
                !isCommercial
                  ? "bg-gray-800 text-white border-gray-800"
                  : "border-gray-400 text-gray-700"
              }
              transition-colors duration-300`}
          >
            <Home className="mr-2" size={20} />
            Residential
          </button>
          <button
            onClick={handleCommercialClick}
            className={`flex items-center px-4 py-2 rounded-full border-2 mx-2
              ${
                isCommercial
                  ? "bg-gray-800 text-white border-gray-800"
                  : "border-gray-400 text-gray-700"
              }
              transition-colors duration-300`}
          >
            <Building2 className="mr-2" size={20} />
            Commercial
          </button>
        </div>

        {/* (2) Large images side-by-side, animate x for swap */}
        <div className="relative w-full h-[50vh] overflow-hidden">
          <motion.div
            animate={{ x: isCommercial ? "-100vw" : "0%" }}
            transition={{ duration: 1 }}
            className="flex w-[200%] h-full"
          >
            {/* Residential image */}
            <img
              src="/assets/images/main_image_expanded.jpg"
              alt="Residential Services"
              className="w-full h-full object-cover"
            />
            {/* Commercial image */}
            <img
              src="/assets/images/commercialservices.jpg"
              alt="Commercial Services"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* "Services" text near top */}
          <h2
            className="absolute top-5 left-1/2 transform -translate-x-1/2
                       text-white text-[6vh] font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)]"
          >
            Services
          </h2>

          {/* (3) Services (buttons) in the center with staggered exit/enter */}
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={isCommercial ? "commercial-lg" : "residential-lg"}
                className="grid grid-cols-4 gap-[5.5vw]"
                variants={containerVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                {[...currentServices].reverse().map((service) => (
                  <motion.div
                    key={service.title}
                    variants={itemVariants}
                    className="flex flex-col items-center"
                  >
                    <Link to={service.link}>
                      <div
                        className="dark_button w-32 h-32 rounded-full 
                                   flex items-center justify-center
                                   text-white text-[6vh]
                                   transition-all duration-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 30px 10px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {React.createElement(service.icon, { color: "#ffffff" })}
                      </div>
                    </Link>
                    <h3 className="mt-1 text-white text-2xl font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                      {service.title}
                    </h3>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* (4) TESTIMONIALS SECTION (LARGE) */}
        <section
          id="testimonials"
          className="relative bg-gradient-to-b from-faint-color to-white px-3 pt-5"
        >
          <div className="flex items-center justify-center mb-3">
            <h2
              className="text-5xl font-serif mr-4 my-3"
              style={{ fontFamily: "Times New Roman, Times, serif" }}
            >
              Testimonials
            </h2>
            {/* Toggle: Google / Yelp */}
            <div
              onClick={handleSwap}
              className="relative w-28 h-12 flex items-center justify-around 
                         rounded-full overflow-hidden shadow-md cursor-pointer bg-white"
            >
              {/* Google */}
              <div className="relative w-1/2 h-full flex items-center justify-center bg-white">
                <img
                  src={googleIcon}
                  alt="Google Icon"
                  className={`h-8 w-8 transition-opacity duration-300`}
                />
                {activeSet !== 1 && (
                  <div className="absolute inset-0 bg-gray-300 opacity-30 pointer-events-none" />
                )}
              </div>
              {/* Yelp */}
              <div className="relative w-1/2 h-full flex items-center justify-center bg-white">
                <img
                  src={yelpIcon}
                  alt="Yelp Icon"
                  className={`h-8 w-8 transition-opacity duration-300`}
                />
                {activeSet !== 2 && (
                  <div className="absolute inset-0 bg-gray-300 opacity-30 pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          {/* Cards + Arrows (3 at a time) */}
          <div className="container mx-auto px-2 relative pb-3">
            <div className="grid gap-4 grid-cols-3">
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2
                             bg-white text-gray-700 rounded-full w-8 h-8
                             flex items-center justify-center
                             shadow-md hover:shadow-lg z-10"
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

              {visibleReviews.map((t, idx) => (
                <TestimonialItem key={idx} testimonial={t} />
              ))}

              {currentIndex + chunkSize < totalReviews && (
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2
                             bg-white text-gray-700 rounded-full w-8 h-8
                             flex items-center justify-center
                             shadow-md hover:shadow-lg z-10"
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
          <div className="py-3 text-center px-3 ">
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
              <a
                href="https://www.yelp.com/biz/rhetts-roofing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-white rounded-full custom-circle-shadow hover:bg-gray-100 transition duration-300 text-sm"
              >
                <img src={yelpIcon} alt="Yelp" className="w-6 h-6 mr-2" />
                <span>Review us on Yelp</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CombinedPage;
