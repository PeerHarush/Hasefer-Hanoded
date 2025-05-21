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
  FilterHeader,
  Wrapper,
} from '../styles/AllBooksPage.styles';
import API_BASE_URL from '../config'; 
import { useSearchParams } from 'react-router-dom';


function AllBooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();   
  const selectedCategory = searchParams.get('genre'); 
  const [sortBy, setSortBy] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 
  const [books, setBooks] = useState([]); 

  const selectedGenreName = selectedCategory
    ? genresList.find((genre) => genre.id === selectedCategory)?.name
    : null;

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

    const delayDebounce = setTimeout(fetchBooks, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]); 


  const handleCategorySelect = (genre) => {
    setSearchParams(genre ? { genre } : {}); // אם genre=null, זה מוחק את הפרמטר מה-URL
  };

  return (
    <PageContainer>
      <Wrapper>

        <Sidebar>
        <FilterHeader>
          <h3>סינון לפי קטגוריה:</h3>
          <select onChange={(e) => setSortBy(e.target.value)} defaultValue="">
            <option value="">מיין לפי</option>
            <option value="az">א-ב</option>
            <option value="za">ת-א</option>
          </select>
        </FilterHeader>

          <CategoryList>
            {genresList.map((genre) => (
              <CategoryItem
                key={genre.id}
                active={selectedCategory === genre.id}
                onClick={() => handleCategorySelect(genre.id)} // ✅
              >
                {genre.name}
              </CategoryItem>
            ))}
            <CategoryItem
              onClick={() => handleCategorySelect(null)} // ✅ איפוס הסינון
              active={selectedCategory === null}
            >
              הצג הכל
            </CategoryItem>
          </CategoryList>
        </Sidebar>

        <GalleryContainer>
          <h1>{selectedGenreName ? `ספרים בז'אנר: ${selectedGenreName}` : 'כל הספרים'}</h1>

          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <BookGallery
            books={books}
            sortBy={sortBy}
          />
        </GalleryContainer>
      </Wrapper>
    </PageContainer>
  );
}

export default AllBooksPage;
  