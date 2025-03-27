import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar as solidStar,
  faStarHalfAlt as halfStar,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating flex items-center">
      {[...Array(5)].map((star, index) => {
        const isFullStar = index < Math.floor(rating);
        const isHalfStar = index < rating && index >= Math.floor(rating);
        return (
          <FontAwesomeIcon
            key={index}
            icon={isFullStar ? solidStar : isHalfStar ? halfStar : regularStar}
            className={`${isFullStar || isHalfStar ? "text-yellow-500" : "text-gray-500"} text-[2vw] md:text-[1.6vh] mx-[0.5px]`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
