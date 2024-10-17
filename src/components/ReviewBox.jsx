import React, { useContext, useState } from 'react';
import { Form, Button, Card, ListGroup } from 'react-bootstrap';
import { AuthContext } from '../context/Context';

function ReviewBox({ clubId }) {
  const { golfClubs, handleReviewSubmit } = useContext(AuthContext);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Hitta golfklubben i golfClubs baserat på clubId
  const currentClub = golfClubs.find(club => club._id === clubId);
  const reviewList = currentClub ? currentClub.reviews : [];

  // Hantera inskick av recension
  const handleSubmit = (e) => {
    e.preventDefault();
    if (review.trim()) {
      handleReviewSubmit(clubId, review, () => {
        setSubmitted(true);
        setReview('');
      });
    }
  };

  return (
    <>
      {/* Recensionsrutan */}
      <form onSubmit={handleSubmit} className="review-form">
        <label htmlFor="review">Lämna en recension</label>
        <textarea
          id="review"
          style={{
            height: '150px', // Justera höjden
            width: '100%', // Gör textarea fullbredd
            resize: 'none', // Förhindra att användaren ändrar storlek
          }}
          rows={3}
          className="review-textarea"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Skriv din recension här..."
          disabled={submitted}
        />
        <button type="submit" className="review-button" disabled={submitted}>
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
                <div className="review-text">
                  {rev.review}
                 
                </div>
                <div className="review-date text-muted">
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
