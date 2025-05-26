import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
  SectionTitle,
  FavoriteButton,
  CarouselWrapper,
  SwiperNavButton
} from '../styles/Home.styles';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import API_BASE_URL from '../config';

import 'swiper/css';
import 'swiper/css/navigation';

const HomeBookGallery = () => {
  const location = useLocation();
  const [favorites, setFavorites] = useState(new Set());
  const [books, setBooks] = useState([]);
  const swiperRef = useRef();

  const isLoggedIn = !!localStorage.getItem('access_token');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/books`);
        const data = await res.json();
        setBooks(data.slice(0, 10));
      } catch (err) {
        console.error('שגיאה בטעינת ספרים:', err);
      }
    };

    fetchBooks();
  }, []);

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

  return (
    <>
      <SectionTitle>📚 ספרים רנדומליים</SectionTitle>

      <CarouselWrapper>
        <SwiperNavButton onClick={() => swiperRef.current?.slidePrev()}>
          ‹
        </SwiperNavButton>

        <Swiper
          modules={[Navigation]}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          slidesPerView={5}
          spaceBetween={10}
          breakpoints={{
            1024: { slidesPerView: 5 },
            768: { slidesPerView: 3 },
            480: { slidesPerView: 2 },
          }}
        >
          {books.map((book) => (
            <SwiperSlide key={book.id}>
              <HomeBookCard>
                <Link to={`/book/${encodeURIComponent(book.title)}`} state={{ from: location.pathname }} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <HomeBookImage src={book.image_url.startsWith('http') ? book.image_url : `${API_BASE_URL}/${book.image_url}`} alt={book.title} />
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

        <SwiperNavButton onClick={() => swiperRef.current?.slideNext()}>
          ›
        </SwiperNavButton>
      </CarouselWrapper>
    </>
  );
};

export default HomeBookGallery;
