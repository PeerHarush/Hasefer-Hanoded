import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { TableWrapper, Wrapper} from '../styles/WishList.styles'; 
import { Link } from 'react-router-dom';



// דוגמה לפונקציה שקוראת ל-API של Google Books
const fetchBooksData = async () => {
        const response = await fetch('https://www.googleapis.com/books/v1/volumes?q=פוצלים+&langRestrict=he'); // חיפוש בעברית
        const data = await response.json();
        return data.items;
      };
      
  

function WishList() {
  const [books, setBooks] = useState([]);

  // נטען את הספרים מה-API
  useEffect(() => {
    fetchBooksData().then((data) => {
      const formattedBooks = data.map((book) => ({
        id: book.id,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors ? book.volumeInfo.authors.join(", ") : "Unknown",
        imageUrl: book.volumeInfo.imageLinks?.thumbnail || '', // אם יש תמונה, נקבל את הקישור שלה
        inStock: true,  // כאן תוכל להוסיף לוגיקה אם הספר במלאי או לא
        url: book.volumeInfo.infoLink,
      }));
      setBooks(formattedBooks);
    });
  }, []);

  // פונקציה למחיקת ספר מהרשימה
  const handleDelete = (bookId) => {
    const updatedBooks = books.filter(book => book.id !== bookId); // מסנן את הספר הרצוי
    setBooks(updatedBooks); // מעדכן את ה-state עם הספרים החדשים
  };

  return (
    <div>
        <Wrapper>
      <h1>רשימת המשאלות שלי</h1>
      
      <TableWrapper >
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
                  onClick={() => handleDelete(book.id)} // לחיצה על הכפתור תמחוק את הספר
                  className="btn btn-outline-secondary"
                >
                  X
                </button>
              </td>
              <td><img src={book.imageUrl} alt={book.title} width="50" /></td>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.inStock ? 'במלאי' : 'לא במלאי'}</td>
              <td>
              <Link to="/book">לספר</Link>

              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </TableWrapper>
      </Wrapper>
    </div>
  );
}

export default WishList;
