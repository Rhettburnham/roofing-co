import React from 'react';
import {
  FaHome,
  FaStar,
  FaHammer,
  FaUsers,
  FaMoneyBillWave,
  FaThumbsUp,
} from 'react-icons/fa';

const ServiceCards = () => {
  const cards = [
    {
      icon: <FaThumbsUp />,
      title: 'Top-notch Customer Service',
      description:
        'Our team is dedicated to providing exceptional customer service. From the initial consultation to project completion, we ensure clear communication and a seamless experience for every client.',
    },
    {
      icon: <FaStar />,
      title: 'Professionalism and Integrity',
      description:
        'We pride ourselves on maintaining professionalism in every job. Our team remains committed to meeting deadlines and delivering on our promises without any surprise charges.',
    },
    {
      icon: <FaUsers />,
      title: 'Skilled and Experienced Team',
      description:
        'With years of combined experience, our roofing experts deliver outstanding workmanship on every project, whether it’s roof replacement or gutter installation.',
    },
    {
      icon: <FaHammer />,
      title: 'High-Quality Workmanship',
      description:
        'We use premium materials and advanced techniques to ensure your roof lasts longer and meets your expectations. Our attention to detail is what sets us apart.',
    },
    {
      icon: <FaHome />,
      title: 'On-Time Project Delivery',
      description:
        'No matter the weather or project scope, we guarantee timely delivery without compromising on quality. Our team works diligently to complete projects within schedule.',
    },
    {
      icon: <FaMoneyBillWave />,
      title: 'Transparent and Fair Pricing',
      description:
        'We offer honest and transparent pricing with no hidden fees. Our quotes reflect the full cost, and we provide financing options to make your roofing project more affordable.',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 py-12 bg-gray-100">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center transform transition duration-300 hover:scale-105 hover:shadow-xl"
        >
          <div className="text-blue-600 text-5xl mb-4">{card.icon}</div>
          <h3 className="text-2xl font-semibold mb-2">{card.title}</h3>
          <p className="text-gray-600">{card.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ServiceCards;
