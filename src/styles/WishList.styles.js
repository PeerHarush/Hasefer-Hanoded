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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 20px;
  padding: 20px 0;
`;

export const BookCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
  text-align: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  img {
    width: 100px;
    height: 150px;
    object-fit: cover;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 1.1rem;
    color: #34495e;
    margin: 5px 0;
  }

  p {
    font-size: 0.95rem;
    color: #7f8c8d;
  }

  .view-link {
    display: inline-block;
    margin-top: 10px;
    color: #3498db;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const StockTag = styled.div`
  color: ${props => (props.$inStock ? '#27ae60' : '#c0392b')};
  font-weight: bold;
  margin: 8px 0;
`;

export const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  left: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #c0392b;

  &:hover {
    color: #e74c3c;
  }
`;
