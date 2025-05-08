import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../config';
import {
  BookImage,
  PageContainer,   
  Wrapper,
  Sidebar,
  BookDescription, 
  BookImageMobile ,
  BookInfo 
} from '../styles/BookDetailsPage.styles';

const BookDetails = () => {
  const { bookTitle } = useParams();
  const [book, setBook] = useState(null);

  const titleRef = useRef(null);
  const [showStickyTitle, setShowStickyTitle] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!titleRef.current) return;

      const rect = titleRef.current.getBoundingClientRect();
      setShowStickyTitle(rect.top < 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/books?search=${encodeURIComponent(bookTitle)}`);
        const data = await res.json();

        const matchedBook = data.find(b => b.title?.toLowerCase() === bookTitle.toLowerCase());
        if (matchedBook) {
          setBook(matchedBook);
        } else {
          console.warn("לא נמצא ספר עם השם הזה");
        }

      } catch (err) {
        console.error('שגיאה בטעינת הספר:', err);
      }
    };

    fetchBook();
  }, [bookTitle]);

  if (!book) return <p>טוען פרטי ספר...</p>;

  return (
    <PageContainer>
      <Wrapper>
        <BookInfo>
          <h1 ref={titleRef}>{book.title}</h1>
          <h3>{book.authors}</h3>
          <BookImageMobile src={book.image_url} alt={book.title} />
          <BookDescription>{book.book_description || book.description}</BookDescription>
                    <BookDescription>{book.book_description || book.description}</BookDescription>
                    <BookDescription>{book.book_description || book.description}</BookDescription>
                    <BookDescription>{book.book_description || book.description}</BookDescription>
                    <BookDescription>{book.book_description || book.description}</BookDescription>
                    <BookDescription>{book.book_description || book.description}</BookDescription>

        </BookInfo>

        <Sidebar>
  <BookImage src={book.image_url} alt={book.title} />

        {showStickyTitle && (
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <h2>{book.title}</h2>
            <h4>{book.authors}</h4>
          </div>
        )}
      </Sidebar>

      </Wrapper>
    </PageContainer>
  );
};

export default BookDetails;
