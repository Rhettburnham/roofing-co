import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link"; // Import HashLink for in-page anchors
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  // Quick Links array (updated with Legal link)
  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/packages", label: "Services" },
    { href: "/#book", label: "Contact Us" },
    { href: "/legal", label: "Legal" },
  ];

  // State to store the BBB data
  const [bbbData, setBbbData] = useState({
    business_email: "",
    telephone: "",
    email: "",
    business_name: "",
    address: "",
  });

  // Fetch bbb_profile_data.json
  useEffect(() => {
    fetch("/data/bbb_profile_data.json")
      .then((res) => res.json())
      .then((data) => {
        setBbbData({
          business_email: data.business_email || "",
          telephone: data.telephone || "",
          email: data.email || "",
          business_name: data.business_name || "",
          address: data.address || "",
        });
      })
      .catch((err) => {
        console.error("Error fetching bbb_profile_data.json:", err);
      });
  }, []);

  return (
    <footer className="bg-gray-800 py-6">
      <div className="container mx-auto px-4">
        {/* Simplified Layout: Two columns on desktop, one column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Info & Contact */}
          <div>
            {/* Display Business Name if available */}
            {bbbData.business_name && (
              <h5 className="text-lg font-semibold text-white mb-2">
                {bbbData.business_name}
              </h5>
            )}

            {/* Address and Contact Info in one section */}
            <div className="text-gray-400 text-sm space-y-1">
              {bbbData.address && <p>{bbbData.address}</p>}

              {bbbData.telephone && (
                <p>
                  <a
                    href={`tel:${bbbData.telephone}`}
                    className="hover:text-white transition duration-300"
                  >
                    Phone: {bbbData.telephone}
                  </a>
                </p>
              )}

              {bbbData.business_email && bbbData.email && (
                <p>
                  <a
                    href={`mailto:${bbbData.business_email}`}
                    className="hover:text-white transition duration-300"
                  >
                    Email: {bbbData.email}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Links & Social */}
          <div className="flex flex-col md:items-end">
            {/* Quick Links */}
            <div className="mb-4">
              <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center md:justify-end">
                {quickLinks.map((link, index) => {
                  const isHashLink = link.href.startsWith("/#");
                  const LinkComponent = isHashLink ? HashLink : Link;

                  return (
                    <li key={index}>
                      <LinkComponent
                        to={link.href}
                        className="text-sm text-gray-400 hover:text-white transition duration-300"
                      >
                        {link.label}
                      </LinkComponent>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-4 justify-center md:justify-end">
              <a
                href="https://www.facebook.com/ParamountRoofingAndConstruction/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/rhettsroofing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/rhetts-roofing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com/rhettsroofing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition duration-300"
                aria-label="X (formerly Twitter)"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} Castle Roofing. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
