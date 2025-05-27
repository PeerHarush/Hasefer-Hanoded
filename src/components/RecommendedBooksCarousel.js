import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import {
  HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
  SectionTitle,
  CarouselWrapper,
  SwiperNavButton
} from '../styles/Home.styles';
import API_BASE_URL from '../config';

import 'swiper/css';
import 'swiper/css/navigation';

const RecommendedBooksCarousel = ({ userGenres }) => {
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const swiperRef = useRef();
  const location = useLocation();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/books`);
        const books = await res.json();
        const filtered = books.filter(book =>
        Array.isArray(book.genres) && book.genres.some(genre => userGenres.includes(genre))
        );
        setRecommendedBooks(filtered.slice(0, 10));
      } catch (err) {
        console.error('שגיאה בטעינת המלצות:', err);
      }
    };

    if (userGenres.length > 0) fetchBooks();
  }, [userGenres]);

  if (recommendedBooks.length === 0) return null;

  return (
    <>
      <SectionTitle>📖 המלצות לפי הטעם שלך</SectionTitle>
      <CarouselWrapper>
        <SwiperNavButton onClick={() => swiperRef.current?.slidePrev()}>‹</SwiperNavButton>
        <Swiper
          modules={[Navigation]}
          onBeforeInit={(swiper) => (swiperRef.current = swiper)}
          slidesPerView={5}
          spaceBetween={10}
          breakpoints={{
            1024: { slidesPerView: 5 },
            768: { slidesPerView: 3 },
            480: { slidesPerView: 2 },
          }}
        >
          {recommendedBooks.map(book => (
            <SwiperSlide key={book.id}>
              <HomeBookCard>
                    <Link
                      to={`/book/${encodeURIComponent(book.title)}`}
                      state={{ from: location.pathname }}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                  <HomeBookImage src={book.image_url.startsWith('http') ? book.image_url : `${API_BASE_URL}/${book.image_url}`} alt={book.title} />
                  <HomeBookTitle>{book.title}</HomeBookTitle>
                  <HomeBookAuthor>{book.authors || 'לא ידוע'}</HomeBookAuthor>
                </Link>
              </HomeBookCard>
            </SwiperSlide>
          ))}
        </Swiper>
        <SwiperNavButton onClick={() => swiperRef.current?.slideNext()}>›</SwiperNavButton>
      </CarouselWrapper>
    </>
  );
};

export default RecommendedBooksCarousel;
