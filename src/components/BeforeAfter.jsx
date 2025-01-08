import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BeforeAfter = () => {
  const boxesRef = useRef([]);
  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const boxes = [
    {
      before: "/assets/images/before1ex.png",
      after: "/assets/images/after1ex.png",
      shingle: "Asphalt Shingle",
      sqft: "2000 sqft",
    },
    {
      before: "/assets/images/before2ex.png",
      after: "/assets/images/after2ex.png",
      shingle: "Metal Roofing",
      sqft: "1800 sqft",
    },
    {
      before: "/assets/images/before3ex.png",
      after: "/assets/images/after3ex.png",
      shingle: "Composite Shingle",
      sqft: "2200 sqft",
    },
    {
      before: "/assets/images/before4ex.png",
      after: "/assets/images/after4ex.png",
      shingle: "Slate Shingle",
      sqft: "2500 sqft",
    },
    {
      before: "/assets/images/before4ex.png",
      after: "/assets/images/after4ex.png",
      shingle: "Wood Shingle",
      sqft: "2100 sqft",
    },
    {
      before: "/assets/images/before4ex.png",
      after: "/assets/images/after4ex.png",
      shingle: "Tile Shingle",
      sqft: "2300 sqft",
    },
  ];

  useEffect(() => {
    const nailElement = nailRef.current;
    const textElement = textRef.current;

    // Initial states
    gsap.set(nailElement, {
      x: "120vw",
      opacity: 1,
    });
    gsap.set(textElement, {
      opacity: 0,
      x: "100%",
    });

    // Create the animation sequence with ScrollTrigger
    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.current,
        start: "bottom 95%",
        toggleActions: "play none none none",
        markers: false
      },
    });

    masterTimeline
      .to(nailElement, {
        x: 0,
        duration: 1,
        ease: "power2.out",
      })
      .to(
        textElement,
        {
          opacity: 1,
          duration: 0.5,
        },
        "+=0.2"
      )
      .to(
        [nailElement, textElement],
        {
          x: (index) => (index === 0 ? "-10vw" : "-50%"),
          duration: 0.8,
          ease: "power2.inOut",
        },
        "+=0.3"
      );

    // Box animations
    const calculateOrder = (index, cols) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return cols - col + row;
    };

    const boxEls = boxesRef.current.filter((box) => box !== null);
    const numCols = window.innerWidth >= 768 ? 3 : 2;

    const sortedBoxes = boxEls
      .map((box, index) => ({
        element: box,
        order: calculateOrder(index, numCols),
        index,
      }))
      .sort((a, b) => b.order - a.order);

    sortedBoxes.forEach(({ element }) => {
      gsap.set(element, {
        x: window.innerWidth,
        opacity: 0,
      });
      gsap.set(element.querySelector(".overlay-text"), {
        opacity: 0,
      });
    });

    const boxesTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: boxEls[0],
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    sortedBoxes.forEach(({ element }, i) => {
      const overlayText = element.querySelector(".overlay-text");
      boxesTimeline
        .to(
          element,
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
          },
          `>-0.5`
        )
        .to(
          overlayText,
          {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          },
          "<+=0.3"
        );
    });

    // Card flip animations
    boxEls.forEach((box) => {
      if (!box) return;
      const cardElement = box.querySelector(".card");
      if (!cardElement) return;

      const beforeImage = cardElement.querySelector(".before");
      const afterImage = cardElement.querySelector(".after");
      if (!beforeImage || !afterImage) return;

      // Set initial states with proper 3D transforms
      gsap.set(cardElement, {
        perspective: 1000,
        transformStyle: "preserve-3d"
      });

      gsap.set([beforeImage, afterImage], {
        backfaceVisibility: "hidden",
        position: "absolute",
        width: "100%",
        height: "100%"
      });

      // Initial positions
      gsap.set(beforeImage, {
        rotationY: 0,
        zIndex: 2
      });

      gsap.set(afterImage, {
        rotationY: 180,
        zIndex: 1
      });

      // Create the flip timeline
      gsap.timeline({
        scrollTrigger: {
          trigger: box,
          start: "top center",
          end: "bottom center",
          scrub: 0.5,
          toggleActions: "restart pause reverse pause",
          markers: false
        }
      })
      .to(beforeImage, {
        rotationY: -180,
        duration: 1,
        ease: "none"
      })
      .to(afterImage, {
        rotationY: 0,
        duration: 1,
        ease: "none"
      }, 0); // Start at same time as before image
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
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
    <>
      <section className="relative w-full overflow-visible bg-gradient-to-b from-black to-white">
        <div
          ref={headerRef}
          className="relative flex items-center py-8 pb-14 w-full overflow-hidden"
        >
          <div
            ref={nailRef}
            className="absolute left-[25%] md:left-[17%] w-[30%] h-[15vh] md:h-[5vh]"
          >
            <div
              className="w-full h-full dynamic-shadow"
              style={{
                backgroundImage: "url('/assets/images/nail.png')",
                backgroundPosition: "left center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                transform: "scale(3) scaleX(-1)",
                transformOrigin: "left center",
              }}
            />
          </div>

          <div ref={textRef} className="absolute left-1/2 z-10">
            <h2 className="text-[8vw] text-white md:text-[6vh] font-normal font-condensed font-rye mt-2 py-3 z-30">
              GALLERY
            </h2>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 px-6 md:px-10 md:pb-4">
            {boxes.map((img, index) => (
              <div
                key={index}
                ref={(el) => (boxesRef.current[index] = el)}
                className="relative"
              >
                <div
                  className="relative cursor-pointer"
                  style={{ perspective: "1000px" }}
                  onClick={() => handleBoxClick(img)}
                >
                  <div
                    className="card w-[40vw] md:w-[25vw] aspect-[4/3]"
                    style={{ 
                      transformStyle: "preserve-3d",
                      position: "relative"
                    }}
                  >
                    <img
                      src={img.before}
                      alt={`Before ${index + 1}`}
                      className="before absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                      style={{ backfaceVisibility: "hidden" }}
                    />
                    <img
                      src={img.after}
                      alt={`After ${index + 1}`}
                      className="after absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                      style={{ backfaceVisibility: "hidden" }}
                    />
                  </div>

                  <div className="overlay-text absolute bottom-0 left-0 px-3 py-2 md:px-4 md:py-3 opacity-0">
                    <div className="flex flex-col text-faint-color text-left leading-tight">
                      <span className="font-bold text-sm md:text-base drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,.8)]">
                        {img.shingle}
                      </span>
                      <span className="font-semibold text-sm md:text-base text-bold text-faint-color drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,.8)]">
                        {img.sqft}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showModal && selectedImages && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-[90vw] h-[90vh] bg-white rounded-lg p-4 md:p-8">
            <button
              className="absolute top-2 right-2 text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 focus:outline-none"
              onClick={closeModal}
              aria-label="Close Modal"
            >
              &times;
            </button>
            <div className="flex flex-col md:flex-row justify-between items-center h-full gap-4">
              <img
                src={selectedImages.before}
                alt="Before"
                className="w-full md:w-1/2 h-[40vh] md:h-full object-cover rounded-lg"
              />
              <img
                src={selectedImages.after}
                alt="After"
                className="w-full md:w-1/2 h-[40vh] md:h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BeforeAfter;