import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import BasicMap from "./BasicMap"; // Import the Map component
import Process from "./Process"; // Import the Map component
import { HashLink } from "react-router-hash-link";

import {
  FaCheckCircle,
  FaTools,
  FaClock,
  FaHandshake,
  FaHome,
  FaStar,
  FaHammer,
  FaUsers,
  FaMoneyBillWave,
  FaThumbsUp,
} from "react-icons/fa";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    // Trigger the shrinking animation after 1 second
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, []);

  const [flippedCards, setFlippedCards] = useState({});

  const handleCardClick = (index) => {
    setFlippedCards((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const cards = [
    {
      icon: <FaThumbsUp />,
      title: "Top-notch Customer Service",
      description:
        "Our team is dedicated to providing exceptional customer service. From the initial consultation to project completion, we ensure clear communication and a seamless experience for every client.",
    },
    {
      icon: <FaStar />,
      title: "Professionalism and Integrity",
      description:
        "We pride ourselves on maintaining professionalism in every job. Our team remains committed to meeting deadlines and delivering on our promises without any surprise charges.",
    },
    {
      icon: <FaUsers />,
      title: "Skilled and Experienced Team",
      description:
        "With years of combined experience, our roofing experts deliver outstanding workmanship on every project, whether it’s roof replacement or gutter installation.",
    },
    {
      icon: <FaHammer />,
      title: "High-Quality Workmanship",
      description:
        "We use premium materials and advanced techniques to ensure your roof lasts longer and meets your expectations. Our attention to detail is what sets us apart.",
    },
    {
      icon: <FaHome />,
      title: "On-Time Project Delivery",
      description:
        "No matter the weather or project scope, we guarantee timely delivery without compromising on quality. Our team works diligently to complete projects within schedule.",
    },
    {
      icon: <FaMoneyBillWave />,
      title: "Transparent and Fair Pricing",
      description:
        "We offer honest and transparent pricing with no hidden fees. Our quotes reflect the full cost, and we provide financing options to make your roofing project more affordable.",
    },
  ];

  const boxesRef = useRef([]);
  const [selectedImages, setSelectedImages] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const boxes = [
    {
      before: "/assets/images/before1ex.png",
      after: "/assets/images/after1ex.png",
    },
    {
      before: "/assets/images/before2ex.png",
      after: "/assets/images/after2ex.png",
    },
    {
      before: "/assets/images/before3ex.png",
      after: "/assets/images/after3ex.png",
    },
    {
      before: "/assets/images/before4ex.png",
      after: "/assets/images/after4ex.png",
    },
    // Add more boxes as needed
  ];

  useEffect(() => {
    boxesRef.current.forEach((box) => {
      const card = box.querySelector(".card");
      const beforeImage = card.querySelector(".before");
      const afterImage = card.querySelector(".after");

      // Set initial rotations
      gsap.set([beforeImage, afterImage], {
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
      });
      gsap.set(beforeImage, { rotationY: 0 });
      gsap.set(afterImage, { rotationY: -180 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: box,
            start: " 150%",
            end: " 105%",
            scrub: true,
            markers: false,
          },
        })
        .to(
          beforeImage,
          {
            rotationY: 180,
            ease: "none",
            transformOrigin: "center center",
          },
          0
        )
        .to(
          afterImage,
          {
            rotationY: 0,
            ease: "none",
            transformOrigin: "center center",
          },
          0
        );
    });
  }, []);

  const handleBoxClick = (images) => {
    setSelectedImages(images);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImages(null);
  };

  const teamMembers = [
    { name: "Rob", role: "Roofer", image: "/assets/images/roofer.png" },
    {
      name: "Alice",
      role: "Roofing Foreman",
      image: "/assets/images/estimator.png",
    },
    {
      name: "Frank",
      role: "Roofing Estimator",
      image: "/assets/images/foreman.png",
    },
    {
      name: "Diana",
      role: "Sales Rep",
      image: "/assets/images/salesrep.png",
    },
    {
      name: "Edward",
      role: "Project Manager",
      image: "/assets/images/manager.png",
    },
    {
      name: "Drew",
      role: "Roof Inspector",
      image: "/assets/images/inspector.png",
    },
  ];

  return (
    <div className="w-full ">
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: "100vh" }} // Initial state (full height) testing update
        animate={{ height: isShrunk ? "20vh" : "100vh" }} // Transition to 20vh after the delay
        transition={{ duration: 1 }} // Animation duration
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
            backgroundAttachment: "fixed",
          }}
        ></div>
        <div className="absolute inset-0 dark-below-header"></div>

        {/* Flexbox for centering text vertically */}
        <div className="relative z-10 h-full flex items-center justify-center custom-circle-shadow">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-6xl font-extrabold text-white tracking-wider "
          >
            About Us
          </motion.h1>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className=" mx-full pb-8">
        {/* Our Story */}
        <section id="our-story" className="relative w-full  bg-white z-30">
          {/* Background Text */}
          <div className="flex flex-col items-center justify-center  px-4 ">
            <h2 className="text-xl md:text-3xl font-bold my-2">Our Team</h2>
          </div>
          {/* Team Members */}
          <p className="flex flex-col mb-4 text-[3vw] md:text-[2vh] justify-center text-center px-10 md:px-[20vw]">
            Meet the dedicated professionals who make Rhett's Roofing one of the
            most trusted names in the roofing industry. Our team's commitment to
            excellence ensures top-notch service for every project. Above is the
            team that makes it possible. If you want to know why we are the ones
            meet your roofing needs give us a call at (442) 236-3783, or
            schedule a booking.
          </p>
          <div className="container mx-auto px-4 mb-4">
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 ">
              {teamMembers.map((member, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-24 h-24 md:w-32 md:h-32 md:mb-4 rounded-full overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="flex w-full h-full object-cover "
                      title={`${member.name} - ${member.role}`}
                    />
                  </div>
                  <h3 className="text-[3vw] md:text-xl font-semibold text-center">{member.name}</h3>
                  <p className="text-[3vw] text-gray-600 text-center">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <BasicMap />
        <section>
          <Process />
          <div className="flex justify-center">
          <HashLink
            to="/#packages"
            className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
          >
            Explore Packages
          </HashLink>
          </div>
        </section>

        {/* Gallery Section */}
        <section>
          <div className="flex flex-col items-center mb-10 pt-5 px-10">
            {/* Header Section */}
            <h2 className="text-3xl font-bold mb-6">Gallery</h2>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
              {boxes.map((img, index) => (
                <div
                  key={index}
                  className="relative w-full h-0 pb-[75%] overflow-hidden cursor-pointer"
                  ref={(el) => (boxesRef.current[index] = el)}
                  onClick={() => handleBoxClick(img)}
                  style={{ perspective: "1000px" }}
                >
                  <div
                    className="absolute top-0 left-0 w-full h-full card"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <img
                      src={img.before}
                      alt={`Before ${index + 1}`}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-lg before"
                      style={{ backfaceVisibility: "hidden" }}
                    />
                    <img
                      src={img.after}
                      alt={`After ${index + 1}`}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-lg after"
                      style={{ backfaceVisibility: "hidden" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Modal */}
            {showModal && selectedImages && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="relative w-[80vw] h-[80vh] bg-white rounded-lg overflow-hidden p-12">
                  <button
                    className="absolute top-2 right-2 text-white bg-faint-color rounded-full w-8 h-8 flex items-center justify-center px-10"
                    onClick={closeModal}
                  >
                    &times;
                  </button>
                  <div className="flex justify-between items-center h-full">
                    <img
                      src={selectedImages.before}
                      alt="Before"
                      className="w-1/2 h-full object-cover rounded-lg"
                    />
                    <img
                      src={selectedImages.after}
                      alt="After"
                      className="w-1/2 h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Service Cards with Flip Effect */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-6 px-6 py-10 bg-faint-color rounded-lg mx-10 h-[120vh] md:h-[65vh]">
          {cards.map((card, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => handleCardClick(index)}
            >
              <div
                className={`card-inner ${flippedCards[index] ? "is-flipped" : ""}`}
                style={{ minHeight: "100%" }} // Ensure card-inner takes needed height
              >
                {/* Front Side */}
                <div className="card-front flex flex-col items-center justify-center dark_button hover:bg-gray-600 text-white rounded-lg p-2 text-center transition duration-250 shadow-2xl">
                  <div className=" text-[8vw] md:text-[5vh] md:mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-[4vw] md:text-[2vh] font-semibold mb-2">
                    {card.title}
                  </h3>
                </div>
                {/* Back Side */}
                <div className="card-back flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 text-center transition duration-300">
                  <p className="text-black text-[2vw] md:text-[2vh]">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Footer */}
    </div>
  );
};

export default About;
