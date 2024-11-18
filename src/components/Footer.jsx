import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link'; // Import HashLink for in-page anchors

const Footer = () => {
  // Quick Links array
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/packages', label: 'Services' },
    { href: '/#book', label: 'Contact Us' },
  ];

  return (
    <footer className="bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Top Section: Company Info, Quick Links, Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Information */}
          <div>
            <h5 className="text-xl font-semibold text-white mb-4">Rhett's Roofing</h5>
            <p className="text-gray-400">
              Rhett's Roofing is committed to providing quality roofing services.
              We specialize in residential and commercial roofing solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xl font-semibold text-white mb-4">Quick Links</h5>
            <ul className="text-gray-400 space-y-2">
              {quickLinks.map((link, index) => {
                // Determine if the link is an in-page anchor
                const isHashLink = link.href.startsWith('/#');
                // Choose the appropriate Link component
                const LinkComponent = isHashLink ? HashLink : Link;

                return (
                  <li key={index}>
                    <LinkComponent
                      to={link.href}
                      className="hover:text-white transition duration-300"
                    >
                      {link.label}
                    </LinkComponent>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h5 className="text-xl font-semibold text-white mb-4">Contact Us</h5>
            <p className="text-gray-400">
            1575 Clairmont Rd<br />
            Decatur, GA 30033
            </p>
            <div className=" text-gray-400">
                <a href="tel:4422363783">Phone: (442)236-3783</a>
            </div>
            <div className=" text-gray-400 ">
                <a href="email:Rhett.Burnham@emory.edu">Email: Rhett.Burnham@emory.edu</a>
            </div>
          </div>
        </div>

        {/* Bottom Section: Social Media Buttons and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8">
          <div className="text-gray-400 text-center md:text-left">
            <p>&copy; 2024 Rhett's Roofing. All Rights Reserved.</p>
          </div>

          {/* Social Media Buttons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Facebook Icon */}
            <a
              href="https://www.facebook.com/ParamountRoofingAndConstruction/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
              aria-label="Facebook"
            >
              {/* SVG icon */}
            </a>

            {/* Instagram Icon */}
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
              aria-label="Instagram"
            >
              {/* SVG icon */}
            </a>

            {/* LinkedIn Icon */}
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
              aria-label="LinkedIn"
            >
              {/* SVG icon */}
            </a>

            {/* Twitter Icon */}
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
              aria-label="X (formerly Twitter)"
            >
              {/* SVG icon */}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
