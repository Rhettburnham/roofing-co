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
    name: "G F",
    stars: 5,
    date: "",
    text: "Luis and his crew were phenomenal!  From the estimate phase to the finish phase. Very fast and professional. Cleanup was very efficient. They did the roof in one day. They worked a long 12 hour day.  My roof is very steep with a lot of angles and they made it look easy!  I would highly recommend Luis for your roofing needs. 5+ stars!",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Chae Downing",
    stars: 5,
    date: "11/15/24",
    text: "Luis and Cowboy Construction did a great job on my roof. I first used them in 2018 to replace my roof. Five years later, I called them because I had a rodent problem caused by access through the soffits. Although I hired a rodent removal company to address the issue, they kept saying that there was a problem with the roof. Despite the fact that that wasn’t the cause, Cowboy Construction continued to respond to my calls to check out various possibilities until the problem was resolved.  I would recommend Luis and Cowboy Construction anytime."
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Julian Spears",
    stars: 5,
    date: "",
    text: "Luis was very courteous and prompt. He took photos of my shingle issue and explained the problem. Luis was ready and able to handle my repair on the spot. He completed the repair quickly. He told me what to watch for if other shingles showed the same issue. Luis was very professional and knowledgeable. I highly recommend him for roof and shingle issues.",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Karina Romero",
    stars: 5,
    date: "",
    text: "Responsiveness, Punctuality, Quality, Professionalism, Value.",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Mike Zotta",
    stars: 5,
    date: "May 23, 2024",
    text: "I called Luis last year after speaking with several of the large Corporate owned roofing companies. He came out promptly and we discussed what I needed. I knew right away we were going to go with his company but at the last minute I had to delay the work but emailed him almost a year later. He was able to schedule me in within two weeks and despite me adding some last minute gutter damage, him and his team were able to finish in one day. The quaity of the work and the attention to detail was top notch. The extra work I asked last minute was all well done and exceeded my expectations. I only wish I could get this level of service and quality for all my home projects. Thank you Luis much appreciated !!! Mike Z Jonesboro GA",
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
      <div className="flex flex-col">
        <p className="text-[4vw] md:text-sm font-semibold text-black">
          {testimonial.name}
        </p>
        <div className="flex items-center justify-between">
          <StarRating rating={testimonial.stars} />
          <p className="text-gray-500 text-xs mt-1">
            {testimonial.date}
          </p>
        </div>
      </div>


      {/* Text */}
      <p className="text-gray-800 text-sm mt-1">
        <span className="text-[3vw] block md:hidden">
          {isExpanded ? testimonial.text : truncated}
        </span>
        <span className=" md:text-xs hidden md:block">{testimonial.text}</span>
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
  const currentServices = isCommercial
    ? commercialServices
    : residentialServices;
  const handleResidentialClick = () => setIsCommercial(false);
  const handleCommercialClick = () => setIsCommercial(true);

  return (
    <div className="w-full bg-black">
      {/* ──────────────────────────────────────────────────────────
          SMALL SCREEN SECTION
      ────────────────────────────────────────────────────────── */}
      <div className="block md:hidden relative w-full ">
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
          className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-black z-0 pointer-events-none"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
        <h2
          className="absolute top-[0vh] left-1/2 transform -translate-x-1/2
                        text-white text-[10vw] font-normal font-ultra-condensed font-rye drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)]"
        >
          Services
        </h2>
        {/* (4) SERVICES Buttons (staggered exit/enter) */}
        <div className="absolute bottom-[10vh] left-1/2 transform -translate-x-1/2 z-30">
          <div className=" flex flex-row ">
            <button
              onClick={handleResidentialClick}
              className={`flex items-center px-2 md:px-4  md:py-2 rounded-full border-1 mx-2 text-md
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
              <Home className="mr-2 "  size={16}/>
               <p className=" text-[3vw]">
                Residential
              </p>
            </button>
            <button
              onClick={handleCommercialClick}
              className={`flex items-center px-2 md:px-4 py-1 md:py-2 text-lg rounded-full border-1 mx-2 
                ${
                  isCommercial
                    ? "bg-dark-below-header text-gray-50 border-gray-800 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]"
                    : "bg-gray-500 hover:bg-white hover:text-black text-white "
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
              <Building2 className="mr-2 " size={16}  />
                <p className=" text-[3vw]">
                  Commercial
                </p>
            </button>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-[15vh]">
          <AnimatePresence mode="wait">
            {/* We use a different key depending on isCommercial to force re-mount */}
            <motion.div
              key={isCommercial ? "commercial" : "residential"}
              className="flex flex-row gap-4"
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
                  className="flex flex-col items-center -mt-[7vh] md:-mt-[2vh]"
                >
                  <Link to={service.link}>
                    <div
                      className="flex-col dark_button w-16 h-16 md:w-24 md:h-24 rounded-full 
                      flex items-center justify-center
                       text-white text-[5vw]
                       hover:text-black hover:bg-gray-200 transition drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 0 30px 10px rgba(0,0,0,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {React.createElement(service.icon)}
                      <h3 className="mt-1 text-white text-[3vw] md:text-sm font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
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

      {/* TESTIMONIALS (SMALL) */}
      <div className="block md:hidden -mt-[5vh] relative z-20">
        {/* Overlapping heading + toggle */}
        <div className="flex items-center justify-center px-4">
          <h2
            className="text-[7.5vw] text-white md:text-[6vh] md:text-5xl font-serif mr-2"
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

          {/* Right Arrow */}
          {currentIndex + chunkSize < totalReviews && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2
                         bg-white text-gray-700 rounded-full w-6 h-6
                         flex items-center justify-center
                         drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10 mr-2"
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
        <div className=" text-center">
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
      <div className="hidden md:block overflow-hidden">
        {/* (1) Two toggle buttons ABOVE the main image */}
        {/* <div className="w-full flex justify-center py-4 bg-gradient-to-b from-faint-color to-dark-button">
          <h2
            className="relative z-40
                       text-white text-[6vh] font-bold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)]"
          >
            Services
          </h2>
          
        </div> */}

        {/* (2) Large images side-by-side, animate x for swap */}
        <div className="relative w-full h-[60vh] ">
          <motion.div
            animate={{ x: isCommercial ? "-100vw" : "0%" }}
            transition={{ duration: 1 }}
            className="flex w-[200%] h-full"
          >
            {/* Residential image */}
            <img
              src="/assets/images/main_image_expanded.jpg"
              alt="Residential Services"
              className="w-[100vw] h-full object-cover"
            />
            {/* Commercial image */}
            <img
              src="/assets/images/commercialservices.jpg"
              alt="Commercial Services"
              className="w-[100vw] h-full object-cover"
            />
          </motion.div>

          <div className="absolute top-0 w-full flex justify-center ">
            <h2
              className="relative z-40
                          text-white text-[11.5vh] font-serif  font-semibold tracking-wider font-condensed drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)]"
            >
              Services
            </h2>
          </div>

          {/* "Services" text near top */}
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
                      : "bg-gray-500 hover:bg-white hover:text-black text-white "
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

          {/* (3) Services (buttons) in the center with staggered exit/enter */}
          <div className="absolute inset-0 flex items-end justify-center mb-[18vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isCommercial ? "commercial-lg" : "residential-lg"}
                className="grid grid-cols-4 gap-[5.5vw] group-hover:text-black "
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
                                    hover:text-black hover:bg-gray-200  transition drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "inset 0 0 30px 10px rgba(0,0,0,0.8)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {React.createElement(service.icon)}
                        <h3 className="mt-1 text-white  text-lg font-semibold drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
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

        {/* (4) TESTIMONIALS SECTION (LARGE) */}
        <section
          id="testimonials"
          className="relative bg-black px-3 pt-5"
        >
          <div className="flex items-center justify-center mb-3">
            <h2
              className="text-5xl text-white text-font-serif mr-4 my-3"
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
                  className="absolute -left-4 top-1/2 transform -translate-y-1/2
                             bg-white text-gray-700 rounded-full w-8 h-8
                             flex items-center justify-center
                             drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"
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
                  className="absolute -right-4 top-1/2 transform -translate-y-1/2
                             bg-white text-gray-700 rounded-full w-8 h-8
                             flex items-center justify-center
                             drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1.8)] hover:drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,1.8)] z-10"
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
