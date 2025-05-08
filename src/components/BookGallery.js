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
    return new Set(saved.map(b => b._id));
  });

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

  const toggleFavorite = (e, book) => {
    e.preventDefault(); 
    const updated = new Set(favorites);
    let newWishlist;

    if (favorites.has(book._id)) {
      updated.delete(book._id);
      const oldList = JSON.parse(localStorage.getItem('wishlist')) || [];
      newWishlist = oldList.filter(b => b._id !== book._id);
    } else {
      updated.add(book._id);
      const oldList = JSON.parse(localStorage.getItem('wishlist')) || [];
      newWishlist = [...oldList, book];
    }

    setFavorites(updated);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  return (
    <BooksWrapper>

      {sortedBooks.map((book) => (
       <BookCard key={book._id}>
       <FavoriteButton
         isFavorite={favorites.has(book._id)}
         onClick={(e) => toggleFavorite(e, book)}
       >
         {favorites.has(book._id) ? <FaHeart /> : <FaRegHeart />}
       </FavoriteButton>
     
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
