import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
  BookListWrapper,
} from '../styles/Home.styles';
import API_BASE_URL from '../config';

const HomeBookGallery = ({ books }) => {
  const location = useLocation();

  return (
    <BookListWrapper>
      {books.map((book) => (
        <Link
          key={book.id}
          to={`/book/${encodeURIComponent(book.title)}`}
          state={{ from: location.pathname }}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <HomeBookCard>
            <HomeBookImage
              src={book.image_url?.startsWith('http')
                ? book.image_url
                : `${API_BASE_URL}/${book.image_url}`}
              alt={book.title}
            />
            <HomeBookTitle>{book.title}</HomeBookTitle>
            <HomeBookAuthor>{book.authors || 'לא ידוע'}</HomeBookAuthor>
          </HomeBookCard>
        </Link>
      ))}
    </BookListWrapper>
  );
};

export default HomeBookGallery;
