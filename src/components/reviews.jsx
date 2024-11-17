import React, { useState, useEffect } from 'react';

const YelpReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:5000/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div>
      <h2>Google Maps Scraper Reviews</h2>
      <div>
        {reviews.map((review, index) => (
          <div key={index}>
            <h4>{review.name}</h4>
            <p>{review.review_text}</p>
            <p>Rating: {review.rating}</p>
            <p>Date: {new Date(review.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YelpReviews;
