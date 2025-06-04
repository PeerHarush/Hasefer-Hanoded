import React, { useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HorizontalReviewCard,
  BookThumbnail,
  ReviewContent,
  BookHeader,
  BookTitle,
  BookAuthor,
  ReviewerName,
  ReviewText
} from '../styles/LatestReviews.styles';
import { CarouselWrapper, SwiperNavButton, SectionTitle, GlobalSwiperStyle } from '../styles/Home.styles';


import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import 'swiper/css';
import 'swiper/css/navigation';
import API_BASE_URL from '../config';

const LatestReviewsCarousel = ({ reviews }) => {
  const swiperRef = useRef();
  const location = useLocation();

  if (!reviews || reviews.length === 0) return null;
console.log('🧾 ביקורות שהתקבלו לקרוסלה:', reviews);

  return (
    <>
      <GlobalSwiperStyle />
      <SectionTitle>📝 ביקורות אחרונות</SectionTitle>
      <CarouselWrapper>
        <SwiperNavButton onClick={() => swiperRef.current?.slidePrev()}>
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
    1255: { slidesPerView: 4, spaceBetween: 8 },
    1024: { slidesPerView: 3, spaceBetween: 20 },
    768:  { slidesPerView: 2, spaceBetween: 20 },
    480:  { slidesPerView: 1, spaceBetween: 15 },
    0:    { slidesPerView: 1, spaceBetween: 10 },
  }}
>
  {reviews.map((review) => (
<SwiperSlide key={review.id}>
  <Link
  to={`/book/${encodeURIComponent(review.book?.title || '')}`}
    state={{ from: location.pathname }}
    style={{ textDecoration: 'none', color: 'inherit' }}
    onClick={() => {
      console.log('📘 מעבר לפרטי הספר:', review.book?.title);
    }}
  >
    <HorizontalReviewCard dir="rtl">
      <BookThumbnail
        src={
          review.book?.image_url
            ? (review.book.image_url.startsWith('http')
                ? review.book.image_url
                : `${API_BASE_URL}/${review.book.image_url}`)
            : '/default-book.jpg'
        }
        alt={review.book?.title || 'עטיפת ספר'}
      />

      <ReviewContent>
        <BookHeader>
          <BookTitle>{review.book?.title || 'שם ספר לא זמין'}</BookTitle>
          <BookAuthor>{review.book?.authors || 'מחבר לא ידוע'}</BookAuthor>
        </BookHeader>

        <ReviewerName>{review.user?.full_name || 'אנונימי'}</ReviewerName>

        <ReviewText>
          {review.comment_text ? (
            review.comment_text.length > 180
              ? `${review.comment_text.slice(0, 180)}...`
              : review.comment_text
          ) : 'לא קיימת ביקורת'}
        </ReviewText>
      </ReviewContent>
    </HorizontalReviewCard>
  </Link>
</SwiperSlide>


  ))}
</Swiper>


        <SwiperNavButton onClick={() => swiperRef.current?.slideNext()}>
          <FiChevronLeft />
        </SwiperNavButton>
      </CarouselWrapper>
    </>
  );
};

export default LatestReviewsCarousel;
