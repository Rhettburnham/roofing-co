import React, { useRef } from "react";

const ShinglesSlate = () => {
  const containerRef = useRef(null);

  const boxes = [
    { img: "/assets/images/p1.png", type: "Type 1" },
    { img: "/assets/images/p2.png", type: "Type 2" },
    { img: "/assets/images/p3.png", type: "Type 3" },
    { img: "/assets/images/p4.png", type: "Type 4" },
    { img: "/assets/images/p5.png", type: "Type 5" },
    { img: "/assets/images/p6.png", type: "Type 6" },
    { img: "/assets/images/p7.png", type: "Type 7" },
    { img: "/assets/images/p8.png", type: "Type 8" },
    { img: "/assets/images/p9.png", type: "Type 9" },
    { img: "/assets/images/p10.png", type: "Type 10" },
  ];

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -containerRef.current.clientWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: containerRef.current.clientWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative m-5">
      <button
        onClick={scrollLeft}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-full z-10"
        aria-label="Scroll Left"
      >
        &lt;
      </button>
      <button
        onClick={scrollRight}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-full z-10"
        aria-label="Scroll Right"
      >
        &gt;
      </button>
      <div
        className="overflow-hidden whitespace-nowrap"
        ref={containerRef}
        style={{ position: 'relative' }}
      >
        {boxes.map((box, index) => (
          <div
            key={index}
            className="inline-block relative m-2 sm:m-4"
          >
            <img
              src={box.img}
              alt={`Image ${index + 1}`}
              className="shingles-img"
            />
            <p className="absolute bottom-2 right-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {box.type}
            </p>
          </div>
        ))}
      </div>
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 0; /* Hide scrollbar */
        }
      `}</style>
    </div>
  );
};

export default ShinglesSlate;
