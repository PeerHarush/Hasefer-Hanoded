import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import {
  BooksWrapper,
  BookCard,
  BookImage,
  BookTitle,
  BookAuthor
} from '../styles/BookGallery.styles.js';


const BookGallery = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/books`);
        const data = await res.json();
        setBooks(data);
        console.log("📚 ספרים מהשרת:", data);

      } catch (err) {
        console.error("שגיאה בטעינת ספרים:", err);
      }
    };

    fetchBooks();
  }, []);

  return (
    <BooksWrapper>
     
      {books.map((book) => (
        <BookCard key={book._id}>
          <BookImage src={book.image_url} alt={book.title} />
          <BookTitle>{book.title}</BookTitle>
          <BookAuthor>{book.authors}</BookAuthor>
        </BookCard>
      ))}
    </BooksWrapper>
   );
};
export default BookGallery;
