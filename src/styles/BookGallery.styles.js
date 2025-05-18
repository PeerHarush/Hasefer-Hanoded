import styled from 'styled-components';

export const BooksWrapper = styled.div`
display: grid;
gap: 1.5rem;
padding: 1rem 2rem;
justify-content: center;
justify-items: center;
box-sizing: border-box;
width: 100%;

grid-template-columns: repeat(5, 1fr);

@media (max-width: 1200px) {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 992px) {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 580px) {
  grid-template-columns: repeat(2, minmax(160px, 1fr));    
  padding: 0.5rem;
  gap: 1rem;
}
`;

export const BookCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  padding: 1rem;
  text-align: center;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
`;



export const BookImage = styled.img`
width: 100%;
aspect-ratio: 2 / 3;
object-fit: cover;
border-radius: 8px;
`;


export const BookTitle = styled.h3`
  margin-top: 10px;
  color: rgb(144, 83, 8);
  font-size: 1.1rem;
`;

export const BookAuthor = styled.p`
  color: #555;
  font-size: 0.95rem;
  margin: 4px 0 0;
`;


export const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.6rem;

  svg {
    color: ${props => props.$isFavorite ? 'red' : 'gray'};
    transition: color 0.2s ease;
  }

  &:hover svg {
    color: ${props => props.$isFavorite ? 'darkred' : '#555'};
  }  cursor: pointer;
  z-index: 2;
`;
