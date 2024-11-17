import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaTint, FaPaintRoller, FaHammer, FaFan, FaWrench } from 'react-icons/fa';

const Whywork = () => {
  const buttons = [
    {
      to: '/inspection',
      image: '/assets/images/Services_button_imgs/inspection.webp',
      text: 'Inspection',
      icon: <FaSearch className="text-4xl text-blue-500" />,
    },
    {
      to: '/gutterrelated',
      image: '/assets/images/Services_button_imgs/guttering.jpg',
      text: 'Guttering',
      icon: <FaTint className="text-4xl text-blue-500" />,
    },
    {
      to: '/roofcoating',
      image: '/assets/images/Services_button_imgs/coating.jpg',
      text: 'Roof Coating',
      icon: <FaPaintRoller className="text-4xl text-blue-500" />,
    },
    {
      to: '/shingleinstallation',
      image: '/assets/images/Services_button_imgs/shingle.jpeg',
      text: 'Shingle Installation',
      icon: <FaHammer className="text-4xl text-blue-500" />,
    },
    {
      to: '/ventilation',
      image: '/assets/images/Services_button_imgs/ventilation.jpeg',
      text: 'Roof Ventilation Installation',
      icon: <FaFan className="text-4xl text-blue-500" />,
    },
    {
      to: '/roofrepair',
      image: '/assets/images/Services_button_imgs/repair.webp',
      text: 'Roof Repair',
      icon: <FaWrench className="text-4xl text-blue-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {buttons.map((button, index) => (
        <Link to={button.to} key={index} className="w-full">
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105">
            <img
              src={button.image}
              alt={button.text}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 flex items-center">
              {button.icon}
              <span className="ml-4 text-xl font-semibold text-gray-800">
                {button.text}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Whywork;
