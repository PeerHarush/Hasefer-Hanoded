import React, { useState, useEffect } from 'react';
import {
  ReviewContainer,
  NoReviewsMessage,
  StarsContainer,
  StaticStar,
  InteractiveStar,
  Textarea,
  SubmitButton,
  ReviewText,
  ReviewHeader,
  ReviewDate,
  ReviewUser,
  ReviewHeaderContent,
  ReviewUserContainer,
  ReviewDateContainer,
  ReviewItem,
  ReviewFormHeader,
  ReviewFormTitle,
  CoinReward,
  AverageRating,
  AvatarImage,
  UserNameAndStars
} from '../styles/BookReviews.styles';

import API_BASE_URL from '../config';

const BookReviews = ({ bookId, userId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hoverIndex, setHoverIndex] = useState(null);

  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/comments`);
      if (!response.ok) throw new Error('לא הצלחנו לטעון את הביקורות');
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error(error);
      setErrorMessage('לא הצלחנו לטעון את הביקורות');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const postReview = async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5 || !comment.trim()) {
      setErrorMessage('יש למלא את כל השדות בצורה תקינה');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setErrorMessage('יש להתחבר כדי לשלוח ביקורת');
      return;
    }

    const reviewData = {
      book_id: bookId,
      user_id: userId,
      rating,
      comment_text: comment,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.detail || 'לא הצלחנו לשלוח את הביקורת');
      }

      const newReview = await response.json();
      setReviews(prev => [...prev, newReview]);
      setRating(0);
      setComment('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorMessage(`לא הצלחנו לשלוח את הביקורת: ${error.message}`);
    }
  };

  return (
    <ReviewContainer>
      {reviews.length > 0 && (
        <AverageRating>
          דירוג ממוצע: {averageRating.toFixed(1)} ★
        </AverageRating>
      )}

      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <ReviewItem key={index}>
            <ReviewHeader>
              <ReviewUserContainer>
                <AvatarImage
                  src={review.user?.avatar_url}
                  alt="avatar"
                />
                <UserNameAndStars>
                  <ReviewUser>{review.user?.full_name || 'משתמש לא ידוע'}</ReviewUser>
                  <StarsContainer>
                    {[...Array(5)].map((_, i) => (
                      <StaticStar key={i} active={i < review.rating}>★</StaticStar>
                    ))}
                  </StarsContainer>
                </UserNameAndStars>
              </ReviewUserContainer>
              <ReviewDateContainer>
                <ReviewDate>{new Date(review.created_at).toLocaleDateString()}</ReviewDate>
              </ReviewDateContainer>
            </ReviewHeader>
            <ReviewText>{review.comment_text}</ReviewText>
          </ReviewItem>
        ))
      ) : (
        <NoReviewsMessage>{errorMessage || 'היה הראשון להוסיף ביקורת'}</NoReviewsMessage>
      )}

      <ReviewFormHeader>
        <ReviewFormTitle>הוספת ביקורת</ReviewFormTitle>
        <CoinReward>🪙 30 מטבעות</CoinReward>
      </ReviewFormHeader>

      <form onSubmit={postReview}>
        <StarsContainer>
          {[...Array(5)].map((_, i) => (
            <InteractiveStar
              key={i}
              active={i < (hoverIndex !== null ? hoverIndex : rating)}
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoverIndex(i + 1)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              ★
            </InteractiveStar>
          ))}
        </StarsContainer>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="כתוב את הביקורת שלך..."
        />

        {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

        <SubmitButton type="submit">שלח ביקורת</SubmitButton>
      </form>
    </ReviewContainer>
  );
};

export default BookReviews;
