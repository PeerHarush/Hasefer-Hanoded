import React, { useState, useEffect } from 'react';
import { ReviewContainer, NoReviewsMessage, StarsContainer, Star, StarActive, Textarea, SubmitButton, ReviewText, ReviewHeader, ReviewDate, ReviewUser, ReviewHeaderContent, ReviewUserContainer, ReviewDateContainer, ReviewItem } from '../styles/BookReviews.styles';
import API_BASE_URL from '../config';

const BookReviews = ({ bookId, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/comments`);
      if (!response.ok) throw new Error('לא הצלחנו לטעון את הביקורות');
      const reviewsData = await response.json();
      setReviews(reviewsData);
    } catch (error) {
      setErrorMessage('לא הצלחנו לטעון את הביקורות');
      console.error(error);  // להדפיס שגיאות בקונסול
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const postReview = async (event) => {
    event.preventDefault();

    // בדיקות תקינות
    if (rating < 1 || rating > 5 || !comment.trim()) {
      alert('יש למלא את כל השדות בצורה תקינה');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/book_comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: bookId,
          user_id: userId,
          rating,
          comment_text: comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);  // להדפיס תגובת שגיאה מה-API
        throw new Error('לא הצלחנו לשלוח את הביקורת');
      }

      const newReview = await response.json();
      setReviews(prevReviews => [...prevReviews, newReview]);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);  // להדפיס שגיאות בקונסול
      alert('לא הצלחנו לשלוח את הביקורת');
    }
  };

  return (
    <ReviewContainer>
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <ReviewItem key={index}>
            <ReviewHeader>
              <ReviewUserContainer>
                <ReviewUser>{review.user_name || 'משתמש לא ידוע'}</ReviewUser>
                <StarsContainer>
                  {[...Array(5)].map((_, i) => (
                    i < review.rating ? <StarActive key={i}>★</StarActive> : <Star key={i}>★</Star>
                  ))}
                </StarsContainer>
              </ReviewUserContainer>
              <ReviewDateContainer>
                <ReviewDate>{new Date(review.created_at).toLocaleDateString()}</ReviewDate>
              </ReviewDateContainer>
            </ReviewHeader>
            <ReviewText>{review.comment_text}</ReviewText>
          </ReviewItem>
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
