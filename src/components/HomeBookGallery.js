import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
  SectionTitle,
  FavoriteButton,
  SwiperNavButton,
  CarouselWrapper
} from '../styles/Home.styles';
import API_BASE_URL from '../config';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

const HomeBookGallery = () => {
  const location = useLocation();
  const [favorites, setFavorites] = useState(new Set());
  const isLoggedIn = !!localStorage.getItem('access_token');
  const [randomAllBooks, setRandomAllBooks] = useState([]);
  const [randomBooksWithCopies, setRandomBooksWithCopies] = useState([]);

  const [activeIndex1, setActiveIndex1] = useState(0);
  const [isBeginning1, setIsBeginning1] = useState(true);
  const [isEnd1, setIsEnd1] = useState(false);

  const [activeIndex2, setActiveIndex2] = useState(0);
  const [isBeginning2, setIsBeginning2] = useState(true);
  const [isEnd2, setIsEnd2] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, copiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/books`),
          fetch(`${API_BASE_URL}/book-listings`),
        ]);

        const booksData = await booksRes.json();
        const copiesData = await copiesRes.json();

        const bookIdsWithCopies = new Set(copiesData.map((copy) => copy.book?.id));
        const filtered = booksData.filter((book) => bookIdsWithCopies.has(book.id));

        setRandomAllBooks(shuffleArray(booksData).slice(0, 10));
        setRandomBooksWithCopies(shuffleArray(filtered).slice(0, 10));
      } catch (err) {
        console.error('שגיאה בטעינת ספרים או עותקים:', err);
      }
    };

    fetchData();
  }, []);

  const toggleFavorite = async (book) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('עליך להתחבר כדי להוסיף לרשימת המשאלות');
      return;
    }

    const id = book.id;

    try {
      if (favorites.has(id)) {
        const res = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('שגיאה במחיקה מהשרת');
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        const res = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('שגיאה בהוספה לשרת');
        setFavorites((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const renderCarousel = (booksArray, indexSetters, isBeginning, isEnd) => {
    const [setActiveIndex, setIsBeginning, setIsEnd] = indexSetters;

    return (
      <CarouselWrapper>
        {!isBeginning && (
          <SwiperNavButton className="swiper-button-prev">‹</SwiperNavButton>
        )}
        <Swiper
          modules={[Navigation]}
          navigation={{ prevEl: '.prev-button', nextEl: '.next-button' }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          spaceBetween={5}
          slidesPerView={5}
          loop={false}
          centeredSlides={false}
          breakpoints={{
            1024: { slidesPerView: 5 },
            768: { slidesPerView: 3 },
            480: { slidesPerView: 2 },
          }}
        >
          {booksArray.map((book) => (
            <SwiperSlide key={book.id}>
              <HomeBookCard>
                <Link
                  to={`/book/${encodeURIComponent(book.title)}`}
                  state={{ from: location.pathname }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <HomeBookImage
                    src={
                      book.image_url?.startsWith('http')
                        ? book.image_url
                        : `${API_BASE_URL}/${book.image_url}`
                    }
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
        {!isEnd && (
          <SwiperNavButton className="swiper-button-next">›</SwiperNavButton>
        )}
      </CarouselWrapper>
    );
  };

  return (
    <>
      <SectionTitle>📚 ספרים רנדומליים מכל המאגר</SectionTitle>
      {renderCarousel(randomAllBooks, [setActiveIndex1, setIsBeginning1, setIsEnd1], isBeginning1, isEnd1)}

      <SectionTitle>📦 ספרים רנדומליים שיש להם עותקים זמינים</SectionTitle>
      {renderCarousel(randomBooksWithCopies, [setActiveIndex2, setIsBeginning2, setIsEnd2], isBeginning2, isEnd2)}
    </>
  );
};

export default HomeBookGallery;
