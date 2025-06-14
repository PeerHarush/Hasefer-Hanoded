import React, { useState, useEffect } from 'react';
import { Wrapper, CardsContainer, BookCard, StockTag, FavoriteButton, Title } from '../styles/WishList.styles';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import { FaHeart } from 'react-icons/fa';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';



function WishList() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
const renderTooltip = (props) => (
  <Tooltip id="wishlist-tooltip" {...props}>
להסרה מרשימת המשאלות  </Tooltip>
);

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
    <Title>רשימת המשאלות שלי</Title>

    {books.length === 0 ? (
      <p >
        עוד לא הוספת ספרים לרשימת המשאלות, <Link to="/AllBooks">עיין בספרים</Link>
      </p>
    ) : (
      <CardsContainer>
        {books.map((book) => (
          <Link 
            to={`/book/${encodeURIComponent(book.title)}`} 
            style={{ textDecoration: 'none', color: 'inherit' }}
            key={book.id}
          >
            <BookCard>
              <OverlayTrigger placement="top" overlay={renderTooltip}>
                <FavoriteButton
                  $isFavorite={true}
                  onClick={(e) => {
                    e.preventDefault(); 
                    handleDelete(book.id); 
                  }}
                >
                  <FaHeart />
                </FavoriteButton>
              </OverlayTrigger>

              <img
                src={book.image_url}
                alt={book.title}
                onError={(e) => { e.target.src = '/images/default-book.png'; }}
              />
              <div className="book-details">
                <h3>{book.title}</h3>
                <p>{book.authors}</p>
                <StockTag $inStock={isInStock(book.id)}>
                  {isInStock(book.id) ? 'במלאי' : 'לא במלאי'}
                </StockTag>
              </div>
            </BookCard>
          </Link>
        ))}
      </CardsContainer>
    )}
  </Wrapper>
);

}

export default WishList;
