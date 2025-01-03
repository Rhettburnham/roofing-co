import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Process from "./Process";
import { HashLink } from "react-router-hash-link";
import Employees from "./Employees";
import WhyChoose from "./WhyChoose";
import {
  FaThumbsUp,
  FaStar,
  FaUsers,
  FaHammer,
  FaHome,
  FaMoneyBillWave,
} from "react-icons/fa";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isShrunk, setIsShrunk] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        "With years of combined experience, our roofing experts deliver outstanding workmanship on every project, whether it's roof replacement or gutter installation.",
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

  const teamDescription = `Meet the dedicated professionals who make Rhett's Roofing one 
  of the most trusted names in the roofing industry. Our team's 
  commitment to excellence ensures top-notch service for every 
  project. Above is the team that makes it possible.
  
  If you want to know why we are the ones to meet your roofing 
  needs, give us a call at (442) 236-3783, or schedule a booking.`;

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <motion.section
        className="relative overflow-hidden"
        initial={{ height: "40vh" }}
        animate={{ height: isShrunk ? "20vh" : "40vh" }}
        transition={{ duration: 1 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
            backgroundAttachment: "fixed",
          }}
        ></div>
        <div className="absolute inset-0 dark-below-header"></div>

        <div className="relative z-10 h-full flex items-center justify-center custom-circle-shadow">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-[8vw] md:text-[8vh] font-extrabold text-white tracking-wider"
          >
            About Us
          </motion.h1>
        </div>
      </motion.section>
      <WhyChoose />
      <Process />
      <div className="mx-full pb-8">
        <section id="our-story" className="relative w-full bg-white z-30">
          <div className="relative">
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-6 px-5 md:px-10 pb-10  rounded-lg h-[120vh] md:h-[65vh]">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="cursor-pointer"
                  onClick={() => handleCardClick(index)}
                >
                  <div
                    className={`card-inner ${
                      flippedCards[index] ? "is-flipped" : ""
                    }`}
                    style={{ minHeight: "100%" }}
                  >
                    <div className="card-front flex flex-col items-center justify-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)]  dark_button hover:bg-gray-600 text-white rounded-lg p-2 text-center transition duration-250"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "inset 0 0 25px 8px rgba(0,0,0,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}>
                      <div className="text-[8vw] md:text-[5vh] md:mb-4">
                        {card.icon}
                      </div>
                      <h3 className="text-[4vw] md:text-[2vh] font-semibold mb-2">
                        {card.title}
                      </h3>
                    </div>
                    <div className=" card-back flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 text-center transition duration-300">
                      <div className="text-[6vw] md:text-[3vh] md:mb-4">
                        {card.icon}
                      </div>
                      <p className=" text-black text-[2.7vw] md:text-[2vh]">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </section>
            <section>
              <div className="flex justify-center my-2">
                <HashLink
                  to="/#packages"
                  className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-gray-600"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 25px 8px rgba(0,0,0,0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Explore Packages
                </HashLink>
              </div>
            </section>

            {/* Mobile text version (shown below md breakpoint) */}
            <div className="block md:hidden w-full bg-white p-6">
              <p className="text-[3vw] text-left">
                {teamDescription}
              </p>
            </div>

            {/* Employees section with desktop overlay */}
            <div className="relative w-full">
              <Employees />
              
              {/* Desktop text overlay (shown md and above) */}
              <div className="hidden md:flex absolute top-0 right-0 w-1/2 h-full bg-white z-10 items-center justify-center">
                <p className="text-[2vh] p-6 text-left">
                  {teamDescription}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;