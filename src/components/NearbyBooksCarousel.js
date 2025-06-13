import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FiChevronLeft, FiChevronRight, FiMapPin } from 'react-icons/fi';

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
import {
  LoadingBox,
  ErrorBox,
  NoLocationBox,
  NoResultsBox,
  NearbyInfo,
  DistanceTag,
  BookExtraInfo,
  BookCondition,
  MessageText,
  SubMessageText,
  RelativeWrapper
} from '../styles/NearbyBooksCarousel.styles';


import 'swiper/css';
import 'swiper/css/navigation';
import API_BASE_URL from '../config';
import { geocodeAddress, calculateDistance } from './Map';

const NearbyBooksCarousel = ({ userPosition, userProfileAddress }) => {
  const [nearbyBooks, setNearbyBooks] = useState([]);
  const [loading, setLoading] = useState(true); // מתחיל בטעינה
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationSource, setLocationSource] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const swiperRef = useRef();
  const location = useLocation();

  // קבלת מיקום המשתמש
  useEffect(() => {
    const determineUserLocation = async () => {
      console.log('🔍 NearbyBooksCarousel: מתחיל תהליך קביעת מיקום');
      console.log('📍 userPosition:', userPosition);
      console.log('🏠 userProfileAddress:', userProfileAddress);
      
      setLoading(true);
      setError(null);
      
      try {
        // אם יש מיקום נוכחי מועבר מהקומפוננטה האב
        if (userPosition && Array.isArray(userPosition) && userPosition.length === 2) {
          console.log('✅ יש מיקום נוכחי מהקומפוננטה האב');
          setUserLocation(userPosition);
          setLocationSource('מיקום נוכחי');
          setDebugInfo(`מיקום נוכחי: ${userPosition[0]}, ${userPosition[1]}`);
          return;
        }

        // ניסיון לקבל מיקום נוכחי אם אין מיקום מהקומפוננטה האב
        if (navigator.geolocation) {
          console.log('📡 מנסה לקבל מיקום נוכחי');
          
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: false,
                timeout: 20000,  
                maximumAge: 300000 // 5 דקות
              }
            );
          });

          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setLocationSource('מיקום נוכחי');
          setDebugInfo(`מיקום נוכחי חדש: ${coords[0]}, ${coords[1]}`);
          console.log('🎯 מיקום נוכחי נקבע:', coords);
          return;
        }

        // אם לא הצלחנו לקבל מיקום נוכחי, נסה כתובת פרופיל
        if (userProfileAddress && userProfileAddress.trim()) {
          console.log('🏠 מנסה להמיר כתובת פרופיל למיקום:', userProfileAddress);
          const coords = await geocodeAddress(userProfileAddress);
          if (coords && Array.isArray(coords) && coords.length === 2) {
            setUserLocation(coords);
            setLocationSource('כתובת פרופיל');
            setDebugInfo(`כתובת פרופיל: ${userProfileAddress} -> ${coords[0]}, ${coords[1]}`);
            console.log('🏠 מיקום נקבע לפי כתובת פרופיל:', coords);
            return;
          }
        }

        // אם לא הצלחנו לקבל מיקום כלל
        console.log('❌ לא הצלחנו לקבל מיקום');
        setError('לא הצלחנו לקבל את המיקום שלך');
        setDebugInfo('לא הצלחנו לקבל מיקום');
        
      } catch (err) {
        console.error('❌ שגיאה בקביעת מיקום:', err);
        setError('שגיאה בקביעת מיקום');
        setDebugInfo(`שגיאה: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    determineUserLocation();
  }, [userPosition, userProfileAddress]);

  // חיפוש ספרים בקרבת המשתמש
useEffect(() => {
 const fetchNearbyBooks = async () => {
  if (!userLocation || !Array.isArray(userLocation) || userLocation.length !== 2) {
    console.log('❌ אין מיקום תקין לחיפוש ספרים');
    return;
  }

  setLoading(true);
  setError(null);

  const cacheKey = `nearbyBooks_${userLocation[0]}_${userLocation[1]}`;
  const cachedData = sessionStorage.getItem(cacheKey);
  if (cachedData) {
    console.log('⚡ טוען ספרים מה־sessionStorage');
    setNearbyBooks(JSON.parse(cachedData));
    setLoading(false);
    return;
  }

  try {
    const [listingsRes, booksRes] = await Promise.all([
      fetch(`${API_BASE_URL}/book-listings`),
      fetch(`${API_BASE_URL}/books`)
    ]);

    if (!listingsRes.ok || !booksRes.ok) throw new Error('שגיאה בשליפת ספרים או עותקים');

    const listingsRaw = await listingsRes.json();
    const books = await booksRes.json();

    // 1. מפה של ספרים לפי id לשימוש מהיר
    const bookMap = new Map(books.map(book => [book.id, book]));

    // 2. נבחר רק 50 עם מידע בסיסי
    const listings = listingsRaw
      .filter(listing => listing.location && listing.book && bookMap.has(listing.book.id))
      .slice(0, 50);

    const geocodeCache = new Map();

    const processed = await Promise.all(
      listings.map(async (listing) => {
        try {
          let coords;
          if (geocodeCache.has(listing.location)) {
            coords = geocodeCache.get(listing.location);
          } else {
            coords = await geocodeAddress(listing.location);
            geocodeCache.set(listing.location, coords);
          }

          if (!coords || coords.length !== 2) return null;

          const distance = calculateDistance(userLocation, coords);
          if (distance > 10) return null;

          const book = bookMap.get(listing.book.id);

          return {
            ...book,
            distance: distance.toFixed(1),
            listingId: listing.id,
            price: listing.price,
            condition: listing.condition,
            sellerLocation: listing.location,
          };
        } catch {
          return null;
        }
      })
    );

    // 3. סינון לפי מרחק
    const nearby = processed.filter(Boolean).sort((a, b) => a.distance - b.distance);

    // 4. רק ספר אחד לכל ID
    const uniqueBooks = [];
    const seen = new Set();
    for (const book of nearby) {
      if (!seen.has(book.id)) {
        uniqueBooks.push(book);
        seen.add(book.id);
      }
    }

    const final = uniqueBooks.slice(0, 20);
    setNearbyBooks(final);
    sessionStorage.setItem(cacheKey, JSON.stringify(final));
    setDebugInfo(prev => `${prev} | נשמר ב־sessionStorage`);
  } catch (err) {
    console.error('❌ שגיאה בטעינת ספרים בקרבתך:', err);
    setError('שגיאה בטעינת ספרים בקרבתך');
  } finally {
    setLoading(false);
  }
};

  if (userLocation) {
    fetchNearbyBooks();
  } else {
    setLoading(false);
  }
}, [userLocation]);


  // הצגת מצב טעינה
  if (loading) {
    return (
      <LoadingBox >
             <MessageText>🔍 מחפש ספרים בקרבתך...</MessageText>
      </LoadingBox>
    );
  }

  // הצגת שגיאה
  if (error) {
    return (
      <LoadingBox >
        <MessageText>❌ {error}</MessageText>
      </LoadingBox>
    );
  }

  // אם אין מיקום או אין ספרים קרובים
  if (!userLocation) {
    return (
     <NoLocationBox>
            <MessageText> 📍לא הצלחנו לקבל את המיקום שלך</MessageText>
            <SubMessageText>
                אנא אפשר גישה למיקום או וודא שיש לך כתובת בפרופיל
            </SubMessageText>
            </NoLocationBox>

    );
  }

  if (nearbyBooks.length === 0) {
    return (
      <NoResultsBox>
        <MessageText> 📚אין ספרים באזורך כעת</MessageText>
        <SubMessageText>
            אולי תהיה הראשון להוסיף? 😄
        </SubMessageText>
        </NoResultsBox>


    );
  }

  return (
    <>
      <GlobalSwiperStyle />
      <SectionTitle>
       
        ספרים זמינים בקרבתך (עד 10 ק"מ)
        <NearbyInfo>
            {nearbyBooks.length} ספרים נמצאו • לפי {locationSource}
            </NearbyInfo>

       
      </SectionTitle>
      
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
          {nearbyBooks.map(book => (
            <SwiperSlide key={`${book.id}-${book.listingId}`}>
              <HomeBookCard>
                <Link
                  to={`/book/${encodeURIComponent(book.title)}`}
                  state={{ from: location.pathname }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ position: 'relative' }}>
                    <HomeBookImage
                      src={book.image_url?.startsWith('http') ? book.image_url : `${API_BASE_URL}/${book.image_url}`}
                      alt={book.title}
                    />
                    {/* תגית מרחק */}
                     <DistanceTag>{book.distance} ק"מ</DistanceTag>

                  </div>
                  
                  <HomeBookTitle>{book.title}</HomeBookTitle>
                  <HomeBookAuthor>{book.authors || 'לא ידוע'}</HomeBookAuthor>
                  
                <BookExtraInfo>
                    {book.price ? `${book.price} ₪` : 'חינם'}
                    {book.condition && (
                        <BookCondition>
                        {book.condition === 'New' && 'חדש'}
                        {book.condition === 'Used - Like New' && 'כמו חדש'}
                        {book.condition === 'Used - Good' && 'טוב'}
                        {book.condition === 'Used - Poor' && 'משומש'}
                        </BookCondition>
                    )}
                    </BookExtraInfo>

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

export default NearbyBooksCarousel;