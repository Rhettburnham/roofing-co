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
        initial={{ height: "100vh" }}
        animate={{ height: isShrunk ? "20vh" : "100vh" }}
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
            className="text-center text-[8vw] md:text-[8vh] font-extrabold text-white tracking-wider custom-text-shadow-mini"
          >
            <h1>Ventilation</h1>
          </motion.h1>
        </div>
      </motion.section>

      {/* Our Roof Ventilation Solutions */}
      <section className="w-full py-8">
        <div className="relative h-16 w-full mb-6">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
              backgroundAttachment: 'fixed',
            }}
          ></div>
          <div className="absolute inset-0 dark-below-header"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white">Our Roof Ventilation Solutions</h2>
          </div>
        </div>
        
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {ventilationSolutions.map((vent, index) => (
              <div
                key={index}
                className="bg-white overflow-hidden transition-shadow duration-300"
              >
                <img
                  src={vent.image}
                  alt={vent.alt}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{vent.title}</h3>
                  <p className="text-gray-700">{vent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ventilation for Different Roofing Materials */}
      <section className="w-full py-8 faint-color">
        <div className="relative h-16 w-full mb-6">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
              backgroundAttachment: 'fixed',
            }}
          ></div>
          <div className="absolute inset-0 dark-below-header"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white">Tailored Ventilation for Every Roof Type</h2>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <p className="text-xl text-center max-w-4xl mx-auto text-gray-700 mb-12">
            Whether your roof is made of shingles, metal, or tiles, our expert
            team provides customized ventilation solutions that seamlessly
            integrate with your roof's aesthetic and structural integrity.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {roofTypes.map((roof, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                <img
                  src={roof.image}
                  alt={roof.alt}
                  className="w-full h-48 object-cover shadow-md"
                />
                <h3 className="text-2xl font-semibold mt-6">{roof.title}</h3>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Link
              to="/shingleinstallation"
              className="px-8 py-4 dark_button text-white font-semibold rounded-full hover:bg-white hover:text-black transition duration-300"
            >
              View Shingle Selection
            </Link>
          </div>
        </div>
      </section>

      {/* Energy Efficiency Benefits */}
      <section className="w-full pt-6 pb-8">
        <div className="relative h-16 w-full mb-6">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/images/growth/hero_growth.jpg')",
              backgroundAttachment: 'fixed',
            }}
          ></div>
          <div className="absolute inset-0 dark-below-header"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white">Boost Your Home's Energy Efficiency</h2>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center relative">
            <div className="md:w-1/2 md:pr-12">
              <p className="text-xl text-gray-700 mb-4">
                Proper roof ventilation is essential for reducing your home's
                cooling costs. According to the U.S. Department of Energy,
                effective ventilation can lower cooling expenses by up to 10% by
                allowing trapped hot air to escape, thereby decreasing the
                reliance on air conditioning systems (
                <a href="https://www.energy.gov/energysaver/ventilation">
                  Energy.gov
                </a>
                ).
              </p>
              <p className="text-xl text-gray-700">
                Implementing adequate roof ventilation not only creates a more
                comfortable living environment but also contributes to lower
                energy bills and extends the lifespan of your roofing materials.
                The National Roofing Contractors Association highlights that
                proper ventilation helps prevent heat-related damage, which can
                extend roof longevity by several years (
                <a href="https://www.nrca.net/">NRCA</a>).
              </p>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 relative z-10">
              <img
                src="/assets/images/ventilation/roof_installation.webp"
                alt="Energy Efficiency"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoofVentilation;