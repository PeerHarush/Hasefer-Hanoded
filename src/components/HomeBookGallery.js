import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
  BookListWrapper,
  SectionTitle,
} from '../styles/Home.styles';
import API_BASE_URL from '../config';

// ערבוב רנדומלי
function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const HomeBookGallery = () => {
  const location = useLocation();
  const [allBooks, setAllBooks] = useState([]);
  const [booksWithCopies, setBooksWithCopies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. טען את כל הספרים
        const booksRes = await fetch(`${API_BASE_URL}/books`);
        const booksData = await booksRes.json();
        setAllBooks(booksData);

        // 2. טען את כל העותקים
        const copiesRes = await fetch(`${API_BASE_URL}/book-listings`);
        const copiesData = await copiesRes.json();

        // 3. קח את book.id מהעותקים עצמם
        const bookIdsWithCopies = new Set(copiesData.map(copy => copy.book?.id));

        // 4. סנן את הספרים שיש להם עותקים
        const filtered = booksData.filter(book => bookIdsWithCopies.has(book.id));
        setBooksWithCopies(filtered);
      } catch (err) {
        console.error("שגיאה בטעינת ספרים או עותקים:", err);
      }
    };

    fetchData();
  }, []);

  const randomAllBooks = useMemo(() => {
    return shuffleArray(allBooks).slice(0, 6);
  }, [allBooks]);

  const randomBooksWithCopies = useMemo(() => {
    return shuffleArray(booksWithCopies).slice(0, 6);
  }, [booksWithCopies]);

  const renderBooks = (booksArray) =>
    booksArray.map((book) => (
      <Link
        key={book.id}
        to={`/book/${encodeURIComponent(book.title)}`}
        state={{ from: location.pathname }}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <HomeBookCard>
          <HomeBookImage
            src={
              book.image_url?.startsWith('http')
                ? book.image_url
                : `${API_BASE_URL}/${book.image_url}`
            }
            alt={book.title}
          />
          <HomeBookTitle>{book.title}</HomeBookTitle>
          <HomeBookAuthor>{book.authors || 'לא ידוע'}</HomeBookAuthor>
        </HomeBookCard>
      </Link>
    ));

  return (
    <>
      <SectionTitle>📚 ספרים רנדומליים מכל המאגר</SectionTitle>
      <BookListWrapper>{renderBooks(randomAllBooks)}</BookListWrapper>

      <SectionTitle>📦 ספרים רנדומליים שיש להם עותקים זמינים</SectionTitle>
      <BookListWrapper>{renderBooks(randomBooksWithCopies)}</BookListWrapper>
    </>
  );
};

export default HomeBookGallery;
