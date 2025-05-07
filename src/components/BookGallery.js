import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import {
  BooksWrapper,
  BookCard,
  BookImage,
  BookTitle,
  BookAuthor
} from '../styles/BookGallery.styles.js';

const BookGallery = ({ books: externalBooks, selectedCategory, sortBy }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    if (!externalBooks) {
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
    }
  }, [externalBooks]);

  const displayedBooks = externalBooks || books;

  const filteredBooks = selectedCategory
    ? displayedBooks.filter((book) =>
        Array.isArray(book.genres)
          ? book.genres.includes(selectedCategory)
          : book.genres === selectedCategory
      )
    : displayedBooks;

  const sortedBooks = [...filteredBooks];
  if (sortBy === 'az') {
    sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'za') {
    sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
  }

  return (
    <BooksWrapper>
      {sortedBooks.map((book) => (
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