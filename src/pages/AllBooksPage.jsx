import React, { useState, useEffect } from 'react';
import BookGallery from '../components/BookGallery.js';
import SearchBar from '../components/SearchBar';
import { genresList } from "../components/GenresSelect";
import {
  PageContainer,
  Sidebar,
  CategoryList,
  CategoryItem,
  GalleryContainer,
  Wrapper,
} from '../styles/AllBooksPage.styles';
import API_BASE_URL from '../config'; 

function AllBooksPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 
  const [books, setBooks] = useState([]); 
  const selectedGenreName = selectedCategory
  ? genresList.find((genre) => genre.id === selectedCategory)?.name
  : null;

  // פונקציה לשליפת הספרים
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const url = searchTerm.trim()
          ? `${API_BASE_URL}/books?search=${encodeURIComponent(searchTerm)}`
          : `${API_BASE_URL}/books`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setBooks(data);
        } else {
          throw new Error('שגיאה בקבלת הספרים');
        }
      } catch (err) {
        console.error('שגיאה בטעינת ספרים:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]); 

  return (
    <PageContainer>
      <Wrapper>
        <Sidebar>
          <h3>סינון לפי קטגוריה:</h3>

          <select onChange={(e) => setSortBy(e.target.value)} defaultValue="">
            <option value="">מיין לפי</option>
            <option value="az">א-ב</option>
            <option value="za">ת-א</option>
          </select>

          <CategoryList>
            {genresList.map((genre) => (
              <CategoryItem
                key={genre.id}
                active={selectedCategory === genre.id}
                onClick={() => setSelectedCategory(genre.id)}
              >
                {genre.name}
              </CategoryItem>
            ))}
            <CategoryItem
              onClick={() => setSelectedCategory(null)}
              active={selectedCategory === null}
            >
              הצג הכל
            </CategoryItem>
          </CategoryList>
        </Sidebar>

        <GalleryContainer>
        <h1>{selectedGenreName ? `ספרים בז'אנר: ${selectedGenreName}` : 'כל הספרים'}</h1>
          
          {/* תיבת חיפוש */}
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {/* גלריית הספרים */}
          <BookGallery
            books={books}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
          />
        </GalleryContainer>
      </Wrapper>
    </PageContainer>
  );
}

export default AllBooksPage;
