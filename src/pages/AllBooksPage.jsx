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

  return (
    <PageContainer>
    <Wrapper>
    <Sidebar>
  <h3>סינון לפי קטגוריה:</h3>

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
        <BookGallery selectedCategory={selectedCategory} />
      </GalleryContainer>
    </Wrapper>
  </PageContainer>
  
  );
}

export default AllBooksPage;
