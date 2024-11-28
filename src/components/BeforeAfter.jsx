// src/components/BeforeAfter.jsx

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// Removed unused icon imports
// import { FaThumbsUp, FaStar, FaUsers, FaHammer, FaHome, FaMoneyBillWave } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

const BeforeAfter = () => {
  const boxesRef = useRef([]);
  const [selectedImages, setSelectedImages] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Removed unused state
  // const [flippedCards, setFlippedCards] = useState([]);

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
      if (!box) return; // Safety check

      const cardElement = box.querySelector(".card");
      if (!cardElement) return; // Safety check

      const beforeImage = cardElement.querySelector(".before");
      const afterImage = cardElement.querySelector(".after");

      if (!beforeImage || !afterImage) return; // Safety check

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
            start: "top 70%", // Adjusted for better triggering
            end: "bottom 45%",
            scrub: true,
            markers: true,
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

    // Cleanup ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [boxesRef]);

  const handleBoxClick = (images) => {
    setSelectedImages(images);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImages(null);
  };

  return (
    <>
      {/* Gallery Section */}
      <section>
        <div className="flex flex-col items-center mb-10 pt-5 px-10">
          {/* Header Section */}

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
              <div className="relative w-[80vw] h-[80vh] bg-white rounded-lg overflow-hidden p-4 md:p-12">
                <button
                  className="absolute top-2 right-2 text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 focus:outline-none"
                  onClick={closeModal}
                  aria-label="Close Modal"
                >
                  &times;
                </button>
                <div className="flex flex-col md:flex-row justify-between items-center h-full">
                  <img
                    src={selectedImages.before}
                    alt="Before"
                    className="w-full md:w-1/2 h-64 md:h-full object-cover rounded-lg mb-4 md:mb-0 md:mr-2"
                  />
                  <img
                    src={selectedImages.after}
                    alt="After"
                    className="w-full md:w-1/2 h-64 md:h-full object-cover rounded-lg md:ml-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Removed incomplete code below
          {/* Service Cards with Flip Effect */}
      {/* ))} */}
      {/* </section> */}
    </>
  );
};

export default BeforeAfter;
