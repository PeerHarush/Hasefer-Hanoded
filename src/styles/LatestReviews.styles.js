import styled from 'styled-components';
  

export const HorizontalReviewCard = styled.div`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  width: 100%;
  height: 230px; 
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
    max-width: 100%; 
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
  justify-content: center; /* מרכז את כל הבלוק אנכית */
  flex: 1;
  overflow: hidden; /* חשוב כדי שהגלילה תישאר רק על ReviewText */
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
  height: 6.5rem;
  overflow-y: auto;
  padding-right: 4px;
  text-align: start;
  
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    height: 6rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
    height: 5.5rem;
  }
`;
