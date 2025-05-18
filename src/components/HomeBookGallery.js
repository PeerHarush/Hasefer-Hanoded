import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
  BookListWrapper,
  SectionTitle,
  FavoriteButton
} from '../styles/Home.styles';
import API_BASE_URL from '../config';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

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
  const [favorites, setFavorites] = useState(new Set());
const isLoggedIn = !!localStorage.getItem('access_token');

  // טען את כל הספרים + עותקים
  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksRes = await fetch(`${API_BASE_URL}/books`);
        const booksData = await booksRes.json();
        setAllBooks(booksData);

        const copiesRes = await fetch(`${API_BASE_URL}/book-listings`);
        const copiesData = await copiesRes.json();

        const bookIdsWithCopies = new Set(copiesData.map(copy => copy.book?.id));
        const filtered = booksData.filter(book => bookIdsWithCopies.has(book.id));
        setBooksWithCopies(filtered);
      } catch (err) {
        console.error("שגיאה בטעינת ספרים או עותקים:", err);
      }
    };

    fetchData();
  }, []);

  // טען את רשימת המשאלות
  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/wishlist/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFavorites(new Set(data.wishlist_book_ids));
      } catch (err) {
        console.error('טעינת wishlist נכשלה:', err.message);
      }
    };

    if (isLoggedIn) fetchWishlist();
  }, [isLoggedIn]);

  // הוספה / הסרה מרשימת משאלות
  const toggleFavorite = async (book) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('עליך להתחבר כדי להוסיף לרשימת המשאלות');
      return;
    }

    const id = book.id;

    try {
      if (favorites.has(id)) {
        const res = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('שגיאה במחיקה מהשרת');
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        const res = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('שגיאה בהוספה לשרת');
        setFavorites(prev => new Set(prev).add(id));
      }
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

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
        style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}
      >
        <HomeBookCard>
          {isLoggedIn && (
            <FavoriteButton
              $isFavorite={favorites.has(book.id)}
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(book);
              }}
            >
              {favorites.has(book.id) ? <FaHeart /> : <FaRegHeart />}
            </FavoriteButton>
          )}
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
