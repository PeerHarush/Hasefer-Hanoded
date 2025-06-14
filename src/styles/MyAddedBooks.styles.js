import styled from 'styled-components';

export const Wrapper = styled.div`
  text-align: center;
  width: 90%;
  margin: 0 auto;

  h1 {
    color: #2c3e50;
    margin: 30px 0;
  }
`;

export const CardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 0;
  max-width: 70%;
  margin: 0 auto;
`;

export const BookCard = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  position: relative;
  gap: 20px;
  transition: background 0.2s;

  &:hover {
    background: #e9ecef;
  }

  img {
    width: 80px;
    height: 120px;
    object-fit: cover;
    flex-shrink: 0;
  }

  h3 {
    font-size: 1.1rem;
    color: #34495e;
    margin: 0;
  }

  p {
    font-size: 0.95rem;
    color: #7f8c8d;
    margin: 0;
  }

  .book-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const StockTag = styled.div`
  color: ${props => (props.$inStock ? '#27ae60' : '#c0392b')};
  font-weight: bold;
  margin: 8px 0;
`;



export const DeleteIconButton = styled.button`
  position: absolute;
  bottom:  20px;
  left: 8px;
  background: none;
  border: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
    color: #a71d2a;
  }

  &:focus {
    outline: none;
  }
`;

export const Title = styled.h2`
  text-align: center;
     font-size: 40px;

  color: rgb(144, 83, 8);
  margin: 60px 0 1rem;
`;
