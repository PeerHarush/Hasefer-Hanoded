import React, { useState, useEffect } from 'react';
import { ReviewContainer, NoReviewsMessage, StarsContainer, Star, StarActive, Textarea, SubmitButton, ReviewText } from '../styles/BookReviews.styles';
import API_BASE_URL from '../config';
const BookReviews = ({ bookId, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // פונקציה למשיכת הביקורות מה-API
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/comments`);
      if (!response.ok) throw new Error('לא הצלחנו לטעון את הביקורות');
      const reviewsData = await response.json();
      setReviews(reviewsData);
    } catch (error) {
      setErrorMessage('לא הצלחנו לטעון את הביקורות');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  // פונקציה לשליחת ביקורת חדשה
  const postReview = async (event) => {
    event.preventDefault();

    if (rating === 0 || !comment) {
      alert('יש למלא את כל השדות');
      return;
    }

    try {
      const response = await fetch(`API_BASE_URL/book_comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,      // book_id של הספר
          user_id: userId,      // user_id של המשתמש
          rating,               // דירוג
          comment_text: comment, // טקסט הביקורת
        }),
      });

      if (!response.ok) throw new Error('לא הצלחנו לשלוח את הביקורת');

      const newReview = await response.json();
      setReviews(prevReviews => [
        ...prevReviews,
        newReview,
      ]);

      setRating(0);
      setComment('');
    } catch (error) {
      alert('לא הצלחנו לשלוח את הביקורת');
    }
  };

  return (
    <ReviewContainer>
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '1rem 0' }}>
            <StarsContainer>
              {[...Array(5)].map((_, i) => (
                i < review.rating ? <StarActive key={i}>★</StarActive> : <Star key={i}>★</Star>
              ))}
            </StarsContainer>
            <ReviewText>{review.comment_text}</ReviewText>
          </div>
        ))
      ) : (
        <NoReviewsMessage>היה הראשון להוסיף ביקורת</NoReviewsMessage>
      )}

      <form onSubmit={postReview}>
        <StarsContainer>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              onClick={() => setRating(i + 1)}
              style={{ color: i < rating ? '#ffbb33' : '#ddd' }}
            >
              ★
            </Star>
          ))}
        </StarsContainer>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="כתוב את הביקורת שלך..."
        />

        <SubmitButton type="submit">שלח ביקורת</SubmitButton>
      </form>
    </ReviewContainer>
  );
};

export default BookReviews;