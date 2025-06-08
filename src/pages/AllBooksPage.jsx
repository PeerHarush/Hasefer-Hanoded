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
  Title,
} from '../styles/AllBooksPage.styles';
import API_BASE_URL from '../config'; 
import { useSearchParams } from 'react-router-dom';


function AllBooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();   
  const selectedCategory = searchParams.get('genre'); 
  const [sortBy, setSortBy] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 
  const [books, setBooks] = useState([]); 
const [allBooks, setAllBooks] = useState([]);
const [filteredBooks, setFilteredBooks] = useState([]);


  const selectedGenreName = selectedCategory
    ? genresList.find((genre) => genre.id === selectedCategory)?.name
    : null;
useEffect(() => {
  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/books`);
      const data = await res.json();
      if (res.ok) {
        setAllBooks(data);
      } else {
        throw new Error('שגיאה בקבלת הספרים');
      }
    } catch (err) {
      console.error('שגיאה בטעינת ספרים:', err);
    }
  };

  fetchBooks();
}, []);


if (window.location.pathname.toLowerCase().includes('allbooks') && allBooks.length > 0) {
  console.log("📚 כל הספרים (allBooks) בפורמט JSON:");
  console.log(`סה"כ ספרים: ${allBooks.length}`);
  console.log(JSON.stringify(allBooks, null, 2));
}

  useEffect(() => {
  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (selectedCategory) {
        params.append('genre', selectedCategory);
      }

      const url = `${API_BASE_URL}/books?${params.toString()}`;
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
}, [searchTerm, selectedCategory]);
useEffect(() => {
  const lowerSearch = searchTerm.toLowerCase();

  const filtered = allBooks.filter(book => {
    const titleMatch = book.title?.toLowerCase().includes(lowerSearch);
    const authors = Array.isArray(book.authors) ? book.authors.join(' ') : String(book.authors);
    const authorMatch = authors.toLowerCase().includes(lowerSearch);
    return titleMatch || authorMatch;
  });

  setFilteredBooks(filtered);
}, [searchTerm, allBooks]);


  const handleCategorySelect = (genre) => {
    setSearchParams(genre ? { genre } : {}); 
  };

  return (
    <PageContainer>
      <Wrapper>

        <Sidebar>
        <FilterHeader>
          <h3>סינון לפי קטגוריה:</h3>
        
        </FilterHeader>

          <CategoryList>
            {genresList.map((genre) => (
              <CategoryItem
                key={genre.id}
                $active={selectedCategory === genre.id}
                onClick={() => handleCategorySelect(genre.id)} 
              >
                {genre.name}
              </CategoryItem>
            ))}
            <CategoryItem
              onClick={() => handleCategorySelect(null)}
              $active={selectedCategory === null}
            >
              הצג הכל
            </CategoryItem>
          </CategoryList>
        </Sidebar>

        <GalleryContainer>
          <Title>{selectedGenreName ? `ספרים בז'אנר: ${selectedGenreName}` : 'כל הספרים'}</Title>

          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

       <BookGallery
          books={filteredBooks}
          sortBy={sortBy}
        />

        </GalleryContainer>
      </Wrapper>
    </PageContainer>
  );
}

export default AllBooksPage;
  