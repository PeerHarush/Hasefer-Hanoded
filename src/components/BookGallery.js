import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  BooksWrapper,
  BookCard,
  BookImage,
  BookTitle,
  BookAuthor,
  FavoriteButton,
} from '../styles/BookGallery.styles';
import API_BASE_URL from '../config';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const BookGallery = ({ books: externalBooks, selectedCategory: propCategory, sortBy }) => {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedCategory = propCategory || searchParams.get('genre');

  useEffect(() => {
    if (!externalBooks) {
      const fetchBooks = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/books`);
          const data = await res.json();
          setBooks(data);
        } catch (err) {
          console.error("שגיאה בטעינת ספרים:", err);
        }
      };
      fetchBooks();
    }
  }, [externalBooks]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/wishlist/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('טעינת wishlist נכשלה');

        const data = await res.json();
        setFavorites(new Set(data.wishlist_book_ids));
      } catch (err) {
        console.error(err.message);
      }
    };

    if (isLoggedIn) fetchWishlist();
  }, [isLoggedIn]);

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

        if (!res.ok) throw new Error('מחיקה נכשלה מהשרת');

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

        if (!res.ok) throw new Error('הוספה נכשלה לשרת');

        setFavorites(prev => new Set(prev).add(id));
      }
    } catch (err) {
      console.error('שגיאה בניהול wishlist:', err.message);
      alert(err.message);
    }
  };

  const displayedBooks = externalBooks || books;

  const filteredBooks = selectedCategory
    ? displayedBooks.filter(book =>
        Array.isArray(book.genres)
          ? book.genres.includes(selectedCategory)
          : book.genres === selectedCategory
      )
    : displayedBooks;

  const sortedBooks = [...filteredBooks];
  if (sortBy === 'az') sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === 'za') sortedBooks.sort((a, b) => b.title.localeCompare(a.title));

  return (
    <BooksWrapper>
      {sortedBooks.map(book => (
     <BookCard
  key={book._id}
  as={Link}
  to={`/book/${encodeURIComponent(book.title)}`}
  state={{ from: location.pathname + location.search }}
  style={{ textDecoration: 'none', color: 'inherit' }}
>
  {isLoggedIn && (
    <FavoriteButton
      $isFavorite={favorites.has(book.id)}
      onClick={(e) => {
        e.preventDefault(); // מונע מהכפתור לשבור את הניווט
        toggleFavorite(book);
      }}
    >
      {favorites.has(book.id) ? <FaHeart /> : <FaRegHeart />}
    </FavoriteButton>
  )}

  <BookImage
    src={
      book.image_url?.startsWith('http')
        ? book.image_url
        : `${API_BASE_URL}/${book.image_url}`
    }
    alt={book.title}
  />
  <BookTitle>{book.title}</BookTitle>
  <BookAuthor>{book.authors}</BookAuthor>
</BookCard>

      ))}
    </BooksWrapper>
  );
};

export default BookGallery;
