import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import {
  HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
  SectionTitle,
  CarouselWrapper,
  SwiperNavButton,
  GlobalSwiperStyle,
} from '../styles/Home.styles';

import 'swiper/css';
import 'swiper/css/navigation';
import API_BASE_URL from '../config';

const RecommendedBooksCarousel = ({ userGenres }) => {
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
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

        const shuffled = filtered.sort(() => Math.random() - 0.5);
        setRecommendedBooks(shuffled);
      } catch (err) {
        console.error('שגיאה בטעינת המלצות:', err);
      }
    };

    if (userGenres.length > 0) fetchBooks();
  }, [userGenres]);

  if (recommendedBooks.length === 0) return null;

  return (
    <>
      <GlobalSwiperStyle />
      <SectionTitle>📖 המלצות לפי הטעם שלך</SectionTitle>
      <CarouselWrapper>
        <SwiperNavButton className="prev" onClick={() => swiperRef.current?.slidePrev()}>
          <FiChevronRight />
        </SwiperNavButton>

        <Swiper
          className="custom-swiper"
          modules={[Navigation]}
          onBeforeInit={(swiper) => (swiperRef.current = swiper)}
          observer
          observeParents
          breakpoints={{
            2200: { slidesPerView: 7, spaceBetween: 20 },
            1800: { slidesPerView: 6, spaceBetween: 20 },
            1255: { slidesPerView: 5, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 30 },
            768:  { slidesPerView: 3, spaceBetween: 20 },
            480:  { slidesPerView: 2, spaceBetween: 15 },
            0:    { slidesPerView: 1, spaceBetween: 10 },
          }}
        >
          {recommendedBooks.slice(0, visibleCount).map(book => (
            <SwiperSlide key={book.id}>
              <HomeBookCard>
                <Link
                  to={`/book/${encodeURIComponent(book.title)}`}
                  state={{ from: location.pathname }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <HomeBookImage
                    src={book.image_url.startsWith('http') ? book.image_url : `${API_BASE_URL}/${book.image_url}`}
                    alt={book.title}
                  />
                  <HomeBookTitle>{book.title}</HomeBookTitle>
                  <HomeBookAuthor>{book.authors || 'לא ידוע'}</HomeBookAuthor>
                </Link>
              </HomeBookCard>
            </SwiperSlide>
          ))}
        </Swiper>

        <SwiperNavButton className="next" onClick={() => swiperRef.current?.slideNext()}>
          <FiChevronLeft />
        </SwiperNavButton>
      </CarouselWrapper>

    </>
  );
};

export default RecommendedBooksCarousel;
