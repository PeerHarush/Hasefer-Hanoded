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
    SwiperNavButton, 
    GlobalSwiperStyle,
  } from '../styles/Home.styles';

  import { Swiper, SwiperSlide } from 'swiper/react';
  import { Navigation } from 'swiper/modules';
  import { FaHeart, FaRegHeart } from 'react-icons/fa';
  import API_BASE_URL from '../config';

  import 'swiper/css';
  import 'swiper/css/navigation';
  import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

  const HomeBookGallery = () => {
    const location = useLocation();
    const [favorites, setFavorites] = useState(new Set());
    const [books, setBooks] = useState([]);
    const [booksWithCopies, setBooksWithCopies] = useState([]);
    const swiperRef1 = useRef();
    const swiperRef2 = useRef();

    const isLoggedIn = !!localStorage.getItem('access_token');

    useEffect(() => {
      const fetchBooks = async () => {
        try {
          const [booksRes, copiesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/books`),
            fetch(`${API_BASE_URL}/book-listings`)
          ]);

          const booksData = await booksRes.json();
          const copiesData = await copiesRes.json();

          const bookIdsWithCopies = new Set(copiesData.map(copy => copy.book?.id));
          const filteredBooks = booksData.filter(book => bookIdsWithCopies.has(book.id));

          setBooks(booksData.slice(0, 10));
          setBooksWithCopies(filteredBooks.slice(0, 10));
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

    const renderCarousel = (booksArray, swiperRef) => (
      <CarouselWrapper>
  <SwiperNavButton className="prev" onClick={() => swiperRef.current?.slidePrev()}>
    <FiChevronRight />
  </SwiperNavButton>



<Swiper
  className="custom-swiper"
  modules={[Navigation]}
  onBeforeInit={(swiper) => {
    swiperRef.current = swiper;
  }}
  observer
  observeParents
  breakpoints={{
    1255: { slidesPerView: 5, spaceBetween: 20 },
    1024: { slidesPerView: 4, spaceBetween: 30 },
    768:  { slidesPerView: 3, spaceBetween: 20 },
    480:  { slidesPerView: 2, spaceBetween: 15 },
    0:    { slidesPerView: 1, spaceBetween: 10 },
  }}
>
  {booksArray.map((book) => (
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


  <SwiperNavButton className="next" onClick={() => swiperRef.current?.slideNext()}>
    <FiChevronLeft />
  </SwiperNavButton>

      </CarouselWrapper>
    );

    return (
      
      <>
        <GlobalSwiperStyle />
        <SectionTitle> ספרים רנדומליים📚</SectionTitle>
        {renderCarousel(books, swiperRef1)}

        <SectionTitle> ספרים שיש להם עותקים זמינים📦</SectionTitle>
        {renderCarousel(booksWithCopies, swiperRef2)}
      </>
    );
  };

  
  export default HomeBookGallery;
