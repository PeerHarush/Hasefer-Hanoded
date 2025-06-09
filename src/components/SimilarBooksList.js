import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
} from '../styles/Home.styles';
import { SimilarBooksSection } from '../styles/BookDetailsPage.styles';
import API_BASE_URL from '../config';

const SimilarBooksList = ({ currentBook }) => {
  const [similarBooks, setSimilarBooks] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchSimilarBooks = async () => {
      if (!currentBook) {
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/books`);
        const books = await res.json();

        let filtered = [];

        // סינון לפי ז'אנרים
        if (currentBook.genres && Array.isArray(currentBook.genres) && currentBook.genres.length > 0) {
          filtered = books.filter(book =>
            book.id !== currentBook.id &&
            book.genres &&
            Array.isArray(book.genres) &&
            book.genres.some(genre => currentBook.genres.includes(genre))
          );
        }

        // fallback למחבר
        if (filtered.length === 0 && currentBook.authors) {
          filtered = books.filter(book =>
            book.id !== currentBook.id &&
            book.authors &&
            book.authors === currentBook.authors
          );
        }

        // fallback אקראי
        if (filtered.length === 0) {
          filtered = books.filter(book => book.id !== currentBook.id);
        }

        // ערבוב + חיתוך
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        setSimilarBooks(shuffled.slice(0, 4));
      } catch (err) {
        console.error('שגיאה בטעינת ספרים דומים:', err);
      }
    };

    fetchSimilarBooks();
  }, [currentBook]);

  if (similarBooks.length === 0) return null;

  return (
    <SimilarBooksSection>
      <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
         ספרים נוספים בסגנון 📚
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px',
        justifyItems: 'center',
      }}>
        {similarBooks.map(book => (
          <HomeBookCard key={book.id} style={{ maxWidth: '200px' }}>
            <Link
              to={`/book/${encodeURIComponent(book.title)}`}
              state={{ from: location.pathname }}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <HomeBookImage
                src={book.image_url.startsWith('http') ? book.image_url : `${API_BASE_URL}/${book.image_url}`}
                alt={book.title}
              />
              <HomeBookTitle>{book.title}</HomeBookTitle>
              <HomeBookAuthor>{book.authors || 'לא ידוע'}</HomeBookAuthor>
            </Link>
          </HomeBookCard>
        ))}
      </div>
    </SimilarBooksSection>
  );
};

export default SimilarBooksList;
