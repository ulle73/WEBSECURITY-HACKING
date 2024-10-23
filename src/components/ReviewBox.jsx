import React, { useContext, useState } from 'react';
import { Form, Button, ListGroup } from 'react-bootstrap';
import StarRatings from 'react-star-ratings'; // Importera react-star-ratings
import { AuthContext } from '../context/Context';

function ReviewBox({ clubId }) {
  const { golfClubs, handleReviewSubmit } = useContext(AuthContext);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0); // Ny state för betyg
  const [submitted, setSubmitted] = useState(false);

  // Hitta golfklubben i golfClubs baserat på clubId
  const currentClub = golfClubs.find(club => club._id === clubId);
  const reviewList = currentClub ? currentClub.reviews : [];

  // Hantera inskick av recension
  const handleSubmit = (e) => {
    e.preventDefault();
    // Kontrollera att både review och rating är ifyllda
    if (review.trim() && rating > 0) {
      handleReviewSubmit(clubId, { review, rating }, () => {
        setSubmitted(true);
        setReview('');
        setRating(0); // Nollställ betyget efter inskick
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="review-form">
        <label htmlFor="review">Lämna en recension</label>
        <textarea
          id="review"
          rows={3}
          className="review-textarea"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Skriv din recension här..."
          disabled={submitted}
        />

        {/* Star Ratings */}
        <div className="mt-2">
          <StarRatings
            rating={rating}
            starRatedColor="#ffd700" // Färg på de valda stjärnorna
            starHoverColor="#ffd700"
            changeRating={(newRating) => setRating(newRating)} // Hantera betygsändringar
            numberOfStars={5} // Antal stjärnor
            name='rating'
            starDimension="25px" // Storlek på stjärnorna
            starSpacing="5px" // Avstånd mellan stjärnorna
          />
        </div>

        <button type="submit" className="review-button button-71" disabled={submitted}>
          {submitted ? 'Recension skickad!' : 'Skicka recension'}
        </button>
      </form>

      {/* Recensioner-listan */}
      <div className="mt-4">
        <h4>Recensioner</h4>
        {reviewList.length > 0 ? (
          <ul className="review-list">
            {reviewList.map((rev, index) => (
              <li key={index} className="review-card mb-2">
                <div className="d-flex justify-content-between align-items-center "> {/* Flexbox container */}
                  <div className="review-text" > {/* Recensionstexten */}
                    <strong>{rev.review}</strong> 
                  </div>
                  <div className="star-rating"> {/* Stjärnorna */}
                    {Array.from({ length: rev.rating }, (_, i) => (
                      <span key={i} className="star" style={{ color: '#ffd700', fontSize: '20px' }}>★</span>
                    ))}
                  </div>
                </div>
                <div className="review-date text-muted text-right"> {/* Datumet, justerat till höger */}
                  {new Date(rev.date).toLocaleDateString()}
                </div>
                <div className='line'></div>
              </li>
            ))}
          </ul>



        ) : (
          <p>Inga recensioner ännu. Bli den första att lämna en!</p>
        )}
      </div>
    </>
  );
}

export default ReviewBox;
