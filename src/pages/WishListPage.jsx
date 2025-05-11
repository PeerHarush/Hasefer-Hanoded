import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { TableWrapper, Wrapper } from '../styles/WishList.styles';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

function WishList() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]);
  
  useEffect(() => {
    const fetchWishlistBooks = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.warn('אין טוקן - המשתמש לא מחובר');
          return;
        }

        const resWishlist = await fetch(`${API_BASE_URL}/wishlist/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resWishlist.ok) {
          throw new Error(`שגיאה: ${resWishlist.status}`);
        }

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
  if (!bookId) return false;

  return copies.some(copy => copy.book_id === bookId);
};


  return (
    <Wrapper>
      <h1>רשימת המשאלות שלי</h1>
      <TableWrapper>
        <Table bordered hover>
          <thead>
            <tr>
              <th>מחיקה</th>
              <th>תמונה</th>
              <th>שם הספר</th>
              <th>שם המחבר</th>
              <th>האם נמצא במלאי?</th>
              <th>מעבר לספר</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="btn btn-outline-danger"
                  >
                    X
                  </button>
                </td>
                <td>
                 <img
                    src={book.image_url}
                    alt={book.title}
                    width="60"
                    onError={(e) => { e.target.src = '/images/default-book.png'; }}
                  />

                </td>
                <td>{book.title}</td>
                <td>{book.authors}</td>
<td>{isInStock(book.id) ? 'במלאי' : 'לא במלאי'}</td>
                <td>
                  <Link to={`/book/${encodeURIComponent(book.title)}`}>לספר</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </Wrapper>
  );
}

export default WishList;
