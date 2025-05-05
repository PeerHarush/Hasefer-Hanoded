import styled from 'styled-components';

export const BooksWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 2rem;
`;

export const BookCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 200px;
  padding: 1rem;
  text-align: center;
`;

export const BookImage = styled.img`
  width: 100%;
  height: 250px;
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
