import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const topBarRef = useRef(null);
  const middleBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    tl.to(topBarRef.current, { y: 10, rotate: -45, duration: 0.3 })
      .to(middleBarRef.current, { opacity: 0, duration: 0.3 }, "-=0.3")
      .to(bottomBarRef.current, { y: -10, rotate: 45, duration: 0.3 }, "-=0.3");
    timelineRef.current = tl;
  }, []);

  useEffect(() => {
    if (isOpen) {
      timelineRef.current.play();
    } else {
      timelineRef.current.reverse();
    }
  }, [isOpen]);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Roof Repair", href: "/roofrepair" },
    { name: "Booking", href: "/#book" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-16 flex items-center justify-center relative dark-below-header px-5 md:px-10 shadow-lg ">
        <div className="flex items-center absolute left-5">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/images/logo.svg"
              alt="Paramount Roofing & Construction Logo"
              className="h-12"
            />
          </Link>
        </div>
        {/* space between */}
        <div className="hidden md:flex space-x-40 z-10"> 
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              className="text-lg cursor-pointer text-faint-color hover:text-gray-300 font-bold transition-all custom-text-shadow-mini"
            >
              {nav.name}
            </HashLink>
          ))}
        </div>
        <div className="flex items-center md:hidden absolute right-5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none"
          >
            <div className="relative w-6 h-6">
              <span
                ref={topBarRef}
                className="absolute top-0 left-0 w-full h-0.5 bg-white"
              />
              <span
                ref={middleBarRef}
                className="absolute top-2.5 left-0 w-full h-0.5 bg-white"
              />
              <span
                ref={bottomBarRef}
                className="absolute top-5 left-0 w-full h-0.5 bg-white"
              />
            </div>
          </button>
        </div>
      </nav>
      {isOpen && (
        <div className="md:hidden flex flex-col items-center dark-below-header w-full fixed top-16 left-0 z-50 shadow-lg">
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              className="px-5 py-3 text-sm cursor-pointer text-white hover:text-dark-below-header transition-all"
              onClick={() => setIsOpen(false)}
            >
              {nav.name}
            </HashLink>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
