import styled from 'styled-components';

export const HorizontalReviewCard = styled.div`
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  width: 420px;
  max-width: 90vw;
  box-sizing: border-box;
  height: auto;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

export const BookThumbnail = styled.img`
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  margin-left: 1rem;

  @media (max-width: 768px) {
    margin-left: 0;
    margin-bottom: 1rem;
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
`;

export const BookAuthor = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #555;
`;

export const ReviewerName = styled.p`
  margin: 0.5rem 0 0.2rem;
  font-weight: bold;
  font-size: 0.9rem;
  color: #444;
`;

export const ReviewText = styled.p`
  font-size: 0.85rem;
  color: #333;
  margin: 0;
  line-height: 1.4;
`;
