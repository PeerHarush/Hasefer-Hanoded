import styled from 'styled-components';


export const HorizontalReviewCard = styled.div`
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  width: 100%;
  height: 210px; 
  box-sizing: border-box;
  overflow: hidden;

width: 100%;
max-width: 420px;

  @media (max-width: 1024px) {
    max-width: 360px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 280px;
    max-width: 100%; // מאפשר לכרטיס להיות מלא רוחב בתוך Slide
  }
`;



export const BookThumbnail = styled.img`
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  margin-right: 1rem;
  align-self: center;

  @media (max-width: 768px) {
    width: 80px;
    height: 110px;
    margin: 0 auto 0.5rem auto; // ממרכז גם אנכית וגם אופקית
  }

  @media (max-width: 480px) {
    width: 70px;
    height: 100px;
  }
`;




export const ReviewContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const BookHeader = styled.div`
  margin-bottom: 0.5rem;
`;

export const BookTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #8d572a;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const BookAuthor = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #555;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

export const ReviewerName = styled.p`
  margin: 0.5rem 0 0.2rem;
  font-weight: bold;
  font-size: 0.9rem;
  color: #444;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

export const ReviewText = styled.p`
  font-size: 0.85rem;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

