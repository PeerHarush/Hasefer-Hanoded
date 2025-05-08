import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { TableWrapper, Wrapper } from '../styles/WishList.styles';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

function WishList() {
  const [books, setBooks] = useState([]);
  const [copies, setCopies] = useState([]); // כל העותקים הקיימים

  // טען את רשימת הספרים מה-localStorage
  useEffect(() => {
    const storedBooks = localStorage.getItem('wishlist');
    if (storedBooks) {
      setBooks(JSON.parse(storedBooks));
    }
  }, []);

  // טען את כל העותקים מהשרת
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

  const handleDelete = (bookId) => {
    const updatedBooks = books.filter(book => book.id !== bookId);
    setBooks(updatedBooks);
    localStorage.setItem('wishlist', JSON.stringify(updatedBooks));
  };

  const isInStock = (title, author) => {
    return copies.some(copy => {
      const copyTitle = copy.title?.trim().toLowerCase();
      const copyAuthor = copy.authors?.trim().toLowerCase();
      return (
        copyTitle === title.trim().toLowerCase() &&
        copyAuthor === author.trim().toLowerCase()
      );
    });
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
                  <img src={book.imageUrl} alt={book.title} width="50" />
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{isInStock(book.title, book.author) ? 'במלאי' : 'לא במלאי'}</td>
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
