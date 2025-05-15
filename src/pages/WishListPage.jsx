import React, { useState, useEffect } from 'react';
import { Wrapper, CardsContainer, BookCard, StockTag, DeleteButton } from '../styles/WishList.styles';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

function WishList() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);

  useEffect(() => {
    const fetchWishlistBooks = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const resWishlist = await fetch(`${API_BASE_URL}/wishlist/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resWishlist.ok) throw new Error(`שגיאה: ${resWishlist.status}`);
        const data = await resWishlist.json();
        const wishlistIds = Array.isArray(data.wishlist_book_ids) ? data.wishlist_book_ids : [];

        const resBooks = await fetch(`${API_BASE_URL}/books`);
        const allBooks = await resBooks.json();

        const filteredBooks = allBooks.filter(book => wishlistIds.includes(book.id));
        setBooks(filteredBooks);
      } catch (err) {
        console.error('שגיאה בטעינת ספרי Wishlist:', err.message);
      }
    };

    fetchWishlistBooks();
  }, []);

  useEffect(() => {
    const fetchCopies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/book-listings`);
        const data = await res.json();
        setCopies(data);
      } catch (err) {
        console.error("שגיאה בטעינת העותקים:", err);
      }
    };

    fetchCopies();
  }, []);

  const handleDelete = async (bookId) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/wishlist/${bookId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('מחיקה נכשלה');
      setBooks(prev => prev.filter(book => book.id !== bookId));
    } catch (err) {
      console.error('שגיאה במחיקת ספר מהרשימה:', err.message);
    }
  };

  const isInStock = (bookId) => {
    return copies.some(copy => copy.book?.id === bookId);
  };

  return (
    <Wrapper>
      <h1>רשימת המשאלות שלי</h1>
      <CardsContainer>
        {books.map((book) => (
          <BookCard key={book.id}>
            <DeleteButton onClick={() => handleDelete(book.id)}>🗑️</DeleteButton>
            <img
              src={book.image_url}
              alt={book.title}
              onError={(e) => { e.target.src = '/images/default-book.png'; }}
            />
            <h3>{book.title}</h3>
            <p>{book.authors}</p>
            <StockTag $inStock={isInStock(book.id)}>
              {isInStock(book.id) ? 'במלאי' : 'לא במלאי'}
            </StockTag>
            <Link to={`/book/${encodeURIComponent(book.title)}`} className="view-link">
              לפרטי הספר
            </Link>
          </BookCard>
        ))}
      </CardsContainer>
    </Wrapper>
  );
}

export default WishList;
