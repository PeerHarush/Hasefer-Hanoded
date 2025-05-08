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
  const [favorites, setFavorites] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist')) || [];
    return new Set(saved.map(b => b.id || b.title)); // מזהה ייחודי
  });
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

  const displayedBooks = externalBooks || books;

  const filteredBooks = selectedCategory
    ? displayedBooks.filter((book) =>
        Array.isArray(book.genres)
          ? book.genres.includes(selectedCategory)
          : book.genres === selectedCategory
      )
    : displayedBooks;

  const sortedBooks = [...filteredBooks];
  if (sortBy === 'az') sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortBy === 'za') sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
  const toggleFavorite = (book) => {
    const stored = JSON.parse(localStorage.getItem('wishlist')) || [];
    const id = book.id || book.title;
  
    let updatedFavorites;
    if (favorites.has(id)) {
      updatedFavorites = stored.filter(b => (b.id || b.title) !== id);
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      const newBook = {
        id,
        title: book.title,
        author: book.authors,
        imageUrl: book.image_url,
        inStock: true,
      };
      updatedFavorites = [...stored, newBook];
      setFavorites(prev => new Set(prev).add(id));
    }
  
    localStorage.setItem('wishlist', JSON.stringify(updatedFavorites));
  };
  
  

  

  return (
    <BooksWrapper>

      {sortedBooks.map((book) => (
       <BookCard key={book._id}>
    {isLoggedIn && (
        <FavoriteButton
          isFavorite={favorites.has(book.id || book.title)}
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(book);
          }}
        >
          {favorites.has(book.id || book.title) ? <FaHeart /> : <FaRegHeart />}
        </FavoriteButton>
      )}

     
       <Link
         to={`/book/${encodeURIComponent(book.title)}`}
         state={{ from: location.pathname + location.search }}
         style={{ textDecoration: 'none', color: 'inherit' }}
       >
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
       </Link>
     </BookCard>
     
      ))}
    </BooksWrapper>
  );
};

export default BookGallery;
