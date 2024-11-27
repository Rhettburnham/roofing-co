import React, { useState } from "react";
import StarRating from "./StarRating";

// Import the image icons for Rhett's Roofing
import yelpIcon from "/assets/images/yelp.png";
import googleIcon from "/assets/images/googleimage.png";

// Testimonials data for Rhett's Roofing
const testimonialsDataSet1 = [
  {
    name: "Katy O'Neil",
    stars: 5,
    date: "",
    text: "Professionalism and courtesy at the highest level. Rhett's crew arrived promptly both days and efficiently completed our total roof replacement. Their preparation included totally covering our deck and upon completion they set up my rocking chairs with the seat cushions in place! Not a single piece of trash, nail, or old shingle remained after the job was done. I will recommend Rhett's Roofing to anyone needing a quality roof at a reasonable rate. Bravo to your great crew.",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Anthony Yates",
    stars: 5,
    date: "",
    text: "I hired Rhett's Roofing to install a new roof on my house. Rhett came out the day I called and showed me my options. A few days later his crew arrived on schedule, respected me and my home and did a professional job. They were in and out in just a day. They did everything they said they were going to do. They came, installed, and cleaned up like they were never there. Rhett was a real pleasure to work with and has earned my business in the future. I would recommend him to anyone.",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
  {
    name: "Aimee Cantrell",
    stars: 5,
    date: "",
    text: "I hired Rhett's Roofing to install a new roof on my house. Rhett came out the day I called and showed me my options. A few days later his crew arrived on schedule, respected me and my home and did a professional job. They were in and out in just a day. They did everything they said they were going to do. They came, installed, and cleaned up like they were never there. Rhett was a real pleasure to work with and has earned my business in the future. I would recommend him to anyone.",
    logo: googleIcon,
    link: "https://www.google.com/maps/place/Rhetts+Roofing/",
  },
];

const testimonialsDataSet2 = [
  {
    name: "Shantericka G.",
    stars: 5,
    date: "Aug 12, 2024",
    text: "Rhett & Sons replaced our roof after weather damage, and the experience was seamless. They communicated every step of the way, arrived on time, and finished ahead of schedule. The professionalism and quality of work exceeded my expectations. Highly recommend!",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Echoing Review",
    stars: 5,
    date: "Sep 4, 2024",
    text: "The team at Rhett's Roofing did a fantastic job installing our new gutters, even with snow on the ground! They were communicative and professional throughout. The installation was perfect, and our neighbors are impressed too.",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
  {
    name: "Mary P.",
    stars: 5,
    date: "Jul 18, 2024",
    text: "Rhett's Roofing was quick and efficient. They replaced our roof in one day, and the results were fantastic. Rhett led a hardworking team, and I appreciated how seamless the entire process was. Would definitely recommend them.",
    logo: yelpIcon,
    link: "https://www.yelp.com/biz/rhetts-roofing",
  },
];

// New TestimonialItem Component
const TestimonialItem = ({ testimonial }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="p-4 bg-white rounded-lg custom-circle-shadow relative cursor-pointer"
      onClick={handleExpandClick}
    >
      {/* Logo in the top right for Rhett's Roofing */}
      <a
        href={testimonial.link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-2 right-2 w-8 h-8"
        onClick={(e) => e.stopPropagation()} // Prevents click from toggling expansion when logo is clicked
      >
        <img
          src={testimonial.logo}
          alt="Logo"
          className="w-full h-full object-cover"
        />
      </a>
      {/* Testimonial Content for Rhett's Roofing */}
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

  const handleSwap = () => {
    setActiveSet(activeSet === 1 ? 2 : 1);
  };

  const currentTestimonials =
    activeSet === 1 ? testimonialsDataSet1 : testimonialsDataSet2;

  return (
    <section id="testimonials" className="relative bg-gradient-to-t from-faint-color to-white px-1">
      {/* Centered "Testimonials" Heading with Icon Button for Rhett's Roofing */}
      <div className="flex items-center justify-center md:mb-3 px-12 md:px-0">
        <h2
          className="text-[7.5vw] md:text-[6vh] md:text-5xl font-serif mr-4 my-3 "
          style={{ fontFamily: "Times New Roman, Times, serif" }}
        >
          Testimonials
        </h2>
        <button
          onClick={handleSwap}
          className="bg-white p-2 rounded-full drop-shadow-lg hover:shadow-xl transition-shadow duration-300"
          aria-label="Switch Testimonials Data Set"
        >
          <img
            src={activeSet === 1 ? yelpIcon : googleIcon}
            alt="Icon"
            className="w-5 h-5 md:w-8 md:h-8"
          />
        </button>
      </div>

      {/* Testimonials Grid for Rhett's Roofing */}
      <div className="container mx-auto px-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {currentTestimonials.map((testimonial, index) => (
            <TestimonialItem testimonial={testimonial} key={index} />
          ))}
        </div>
      </div>

      {/* Leave a Review Section for Rhett's Roofing */}
      <div className=" py-3 text-center px-3">
        <h3 className="text-xl font-bold mb-1">Leave a Review</h3>
        <p className="text-sm mb-3">
          We value your feedback! Please take a moment to share your experience
          with us.
        </p>
        <div className="flex justify-center space-x-6">
          <a
            href="https://www.google.com/maps/place/Rhetts+Roofing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 text-sm"
          >
            <img src={googleIcon} alt="Google" className="w-6 h-6 mr-2" />
            <span>Review us on Google</span>
          </a>
          <a
            href="https://www.yelp.com/biz/rhetts-roofing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 text-sm"
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