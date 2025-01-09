import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";

const RoofVentilation = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShrunk(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const ventilationSolutions = [
    {
      title: "Ridge Vents",
      image: "/assets/images/ventilation/ridge_vent.jpeg",
      alt: "Ridge Vents",
      description:
        "Installed at the peak of the roof to allow warm, humid air to escape naturally, preventing moisture buildup.",
    },
    {
      title: "Soffit Vents",
      image: "/assets/images/ventilation/soffit_vent.avif",
      alt: "Soffit Vents",
      description:
        "Installed under the eaves to draw cool air into the attic, maintaining a steady and efficient airflow.",
    },
    {
      title: "Gable Vents",
      image: "/assets/images/ventilation/gable_vent.jpg",
      alt: "Gable Vents",
      description:
        "Positioned on the gable ends of your roof to ensure effective cross-ventilation throughout the attic space.",
    },
    {
      title: "Roof Vents",
      image: "/assets/images/ventilation/roof_vent.jpg",
      alt: "Roof Vents",
      description:
        "Designed to remove excess heat and moisture from the attic to improve ventilation and roof longevity.",
    },
  ];

  const roofTypes = [
    {
      title: "Shingle Roofs",
      image: "/assets/images/ventilation/vent_shingle.jpeg",
      alt: "Shingle Roof",
    },
    {
      title: "Metal Roofs",
      image: "/assets/images/ventilation/vent_metal.jpg",
      alt: "Metal Roof",
    },
    {
      title: "Tile Roofs",
      image: "/assets/images/ventilation/vent_tile.jpeg",
      alt: "Tile Roof",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section with Shrinking Effect */}
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

        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center text-[10vw] md:text-[8vh] font-extrabold text-white tracking-wider custom-text-shadow-mini"
          >
            <h1>Ventilation</h1>
          </motion.h1>
        </div>
      </motion.section>
            {/* Call to Action */}
            <div className="flex justify-center my-4">
        <HashLink
          to="/#book"
          className="px-4 md:px-8 py-2 md:py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-500"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "inset 0 0 15px 1px rgba(0,0,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
          }}
        >
          <p className="text-base md:text-xl">
          Schedule an Inspection
          </p>
        </HashLink>
      </div>

      {/* Our Roof Ventilation Solutions */}
      <section className="w-full ">
        <div className="relative h-12 md:h-16 w-full mb-2 ">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
              backgroundAttachment: 'fixed',
            }}
          ></div>
          <div className="absolute inset-0 faint-color opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-base md:text-3xl font-bold text-white">Our Roof Ventilation Solutions</h2>
          </div>
        </div>
        
        <div className="container mx-auto px-10 md:px-6 py-4 md:py-8">
          <div className="grid gap-4 md:gap-8 grid-cols-2 md:grid-cols-4 h-[60vh] md:h-auto">
            {ventilationSolutions.map((vent, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden shadow-md"
              >
                <img
                  src={vent.image}
                  alt={vent.alt}
                  className="w-full h-[12vh] md:h-48 object-cover"
                />
                <div className="p-2 md:p-6">
                  <h3 className="text-[3vw] md:text-xl font-semibold md:mb-2">{vent.title}</h3>
                  <p className="text-[2.5vw] md:text-sm text-gray-700">{vent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ventilation for Different Roofing Materials */}
      <section className="w-full  bg-gradient-to-t from-faint-color to-white">
        <div className="relative h-16 w-full mb-3 md:mb-6">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
              backgroundAttachment: 'fixed',
            }}
          ></div>
          <div className="absolute inset-0 dark-below-header opacity-70"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-base md:text-3xl font-bold text-white">Tailored Ventilation for Every Roof Type</h2>
          </div>
        </div>

        <div className="container mx-auto ">
          <p className="text-xs md:text-lg text-center  mx-auto text-gray-700 mb-4 px-6 md:px-10">
            Whether your roof is made of shingles, metal, or tiles, our expert
            team provides customized ventilation solutions that seamlessly
            integrate with your roof's aesthetic and structural integrity.
          </p>
          <div className="grid gap-8 grid-cols-3 px-2 md:px-10">
            {roofTypes.map((roof, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <img
                  src={roof.image}
                  alt={roof.alt}
                  className="w-full h-[15vh] md:h-48 object-cover shadow-md"
                />
                <h3 className="text-md md:text-xl font-semibold mt-3 md:mt-6">{roof.title}</h3>
              </div>
            ))}
          </div>
          <div className="flex justify-center py-3 md:py-6">
            <Link
              to="/shingleinstallation"
              className="px-4 md:px-8 py-2 md:py-4 dark_button text-white font-semibold rounded-lg hover:bg-white hover:text-black transition duration-500"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 0 15px 1px rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              View Shingle Selection
            </Link>
          </div>
        </div>
      </section>

      {/* Energy Efficiency Benefits */}
      <section className=" w-full  bg-gradient-to-b from-faint-color to-white">
        <div className="relative h-16 w-full ">
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
              backgroundAttachment: 'fixed',
            }}
          ></div>
          <div className="absolute inset-0 dark-below-header opacity-70 "></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-lg md:text-3xl font-bold text-white">Boost Your Home's Energy Efficiency</h2>
          </div>
        </div>

        <div className="px-10 md:px-[15vw] md:py-6 ">
          <div className="flex flex-row relative -py-2 mt-6 md:mt-0 md:justify-between items-center bg-dark-below-header bg-opacity-20 rounded-t-xl md:rounded-xl ">
            <div className="w-[35vw] md:h-auto aspect-square md:w-[40vh] ml-3 md:ml-16 relative z-10 md:py-3">
              <img
                src="/assets/images/ventilation/roof_installation.webp"
                alt="Energy Efficiency"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="w-2/5 md:w-1/2 md:pl-12 ml-4 md:mr-10 px-1 pt-3 md:pt-0">
              <p className="text-[2vw] md:text-sm text-gray-700 md:mb-4 opacity-100">
                Proper roof ventilation is essential for reducing your home's
                cooling costs. According to the U.S. Department of Energy,
                effective ventilation can lower cooling expenses by up to 10% by
                allowing trapped hot air to escape, thereby decreasing the
                reliance on air conditioning systems (
                <a href="https://www.energy.gov/energysaver/ventilation opacity-100"
                  className="text-blue">
                  Energy.gov
                </a>
                ).
              </p>
              <p className=" hidden md:block md:w-full text-[2vw] md:text-sm text-gray-700 md:mr-10">
                Implementing adequate roof ventilation not only creates a more
                comfortable living environment but also contributes to lower
                energy bills and extends the lifespan of your roofing materials.
                The National Roofing Contractors Association highlights that
                proper ventilation helps prevent heat-related damage, which can
                extend roof longevity by several years (
                <a href="https://www.nrca.net/" className="text-blue" >NRCA</a>).
              </p>  
            </div>
            
          </div>
          <div className=" bg-dark-below-header bg-opacity-20 rounded-b-xl px-1 ">
            <p className="text-[2vw] md:text-sm text-gray-700 opacity-100 md:hidden mb-3">
                  Implementing adequate roof ventilation not only creates a more
                  comfortable living environment but also contributes to lower
                  energy bills and extends the lifespan of your roofing materials.
                  The National Roofing Contractors Association highlights that
                  proper ventilation helps prevent heat-related damage, which can
                  extend roof longevity by several years (
                  <a href="https://www.nrca.net/" className="text-blue" >NRCA</a>).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoofVentilation;