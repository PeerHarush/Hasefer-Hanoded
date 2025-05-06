import React, { useState } from 'react';
import BookGallery from '../components/BookGallery.js';
import { genresList } from "../components/GenresSelect";
import {
  PageContainer,
  Sidebar,
  CategoryList,
  CategoryItem,
  GalleryContainer,
  Wrapper,
} from '../styles/AllBooksPage.styles';

function AllBooksPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState(''); // ✅ עבר פנימה

  return (
    <PageContainer>
      <Wrapper>
        <Sidebar>
          <h3>סינון לפי קטגוריה:</h3>

          <select onChange={(e) => setSortBy(e.target.value)} defaultValue="">
            <option value="">מיין לפי</option>
            <option value="az">א-ב</option>
            <option value="za">ב-א</option>
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
          <h1>כל הספרים</h1>
          <BookGallery
            selectedCategory={selectedCategory}
            sortBy={sortBy} // ✅ מעבירים את המיון ל־BookGallery
          />
        </GalleryContainer>
      </Wrapper>
    </PageContainer>
  );
}

export default AllBooksPage;
