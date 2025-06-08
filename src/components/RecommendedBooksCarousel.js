import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FavoriteButton } from '../styles/Home.styles';

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
  const [favorites, setFavorites] = useState(new Set());
  const isLoggedIn = !!localStorage.getItem('access_token');

  // --- useEffect לטעינת רשימת המועדפים ---
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('שגיאה בטעינת מועדפים');

        const data = await res.json();
        const favoritesSet = new Set(data.map(item => item.book.id));
        setFavorites(favoritesSet);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchFavorites();
  }, []);

  // --- toggleFavorite ---
  const toggleFavorite = async (book) => {
    const token = localStorage.getItem('access_token');
    if (!token) return alert('יש להתחבר');

    const id = book.id;

    try {
      const method = favorites.has(id) ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('שגיאה בשרת');

      setFavorites((prev) => {
        const newSet = new Set(prev);
        method === 'POST' ? newSet.add(id) : newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  // --- useEffect לטעינת הספרים ---
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
      <SectionTitle> המלצות לפי הטעם שלך📖</SectionTitle>
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
            768: { slidesPerView: 3, spaceBetween: 20 },
            480: { slidesPerView: 2, spaceBetween: 15 },
            0: { slidesPerView: 1, spaceBetween: 10 },
          }}
        >
          {recommendedBooks.slice(0, visibleCount).map((book) => (
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

                {isLoggedIn && (
                  <FavoriteButton
                    $isFavorite={favorites.has(book.id)}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(book);
                    }}
                  >
                    {favorites.has(book.id) ? <FaHeart /> : <FaRegHeart />}
                  </FavoriteButton>
                )}
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
