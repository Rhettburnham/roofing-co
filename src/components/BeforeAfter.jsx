import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BeforeAfter = () => {
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
    gsap.set(boxesRef.current, { opacity: 1 });

    boxesRef.current.forEach((box) => {
      const card = box.querySelector(".card");
      const beforeImage = card.querySelector(".before");
      const afterImage = card.querySelector(".after");

      // Set initial rotations

      gsap.timeline({
        scrollTrigger: {
          trigger: box,
          start: "top %",
          end: "bottom 50%",
          scrub: true,
          markers: true
        },
      })
        .to(
          beforeImage,
          {
            rotationY: -180,
            rotationX: 0,
            ease: "none",
            transformOrigin: "center center",
          },
          0
        )
        .to(
          afterImage,
          {
            rotationY: 180,
            rotationX: 0,
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

  return (
    <div className="flex flex-col items-center mb-10 mt-5 px-5">
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
          <div className="relative w-[80vw] h-[80vh] bg-white rounded-lg overflow-hidden p-4">
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
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
  );
};

export default BeforeAfter;
