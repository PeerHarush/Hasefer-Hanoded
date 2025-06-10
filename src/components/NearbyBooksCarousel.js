// import React, { useEffect, useState, useRef } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation } from 'swiper/modules';
// import { FiChevronLeft, FiChevronRight, FiMapPin } from 'react-icons/fi';

// import {
//   HomeBookCard,
//   HomeBookImage,
//   HomeBookTitle,
//   HomeBookAuthor,
//   SectionTitle,
//   CarouselWrapper,
//   SwiperNavButton,
//   GlobalSwiperStyle,
// } from '../styles/Home.styles';

// import 'swiper/css';
// import 'swiper/css/navigation';
// import API_BASE_URL from '../config';
// import { geocodeAddress, calculateDistance } from './Map';

// const NearbyBooksCarousel = ({ userPosition, userProfileAddress }) => {
//   const [nearbyBooks, setNearbyBooks] = useState([]);
//   const [loading, setLoading] = useState(true); // מתחיל בטעינה
//   const [error, setError] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [locationSource, setLocationSource] = useState('');
//   const [debugInfo, setDebugInfo] = useState('');
//   const swiperRef = useRef();
//   const location = useLocation();

//   // קבלת מיקום המשתמש
//   useEffect(() => {
//     const determineUserLocation = async () => {
//       console.log('🔍 NearbyBooksCarousel: מתחיל תהליך קביעת מיקום');
//       console.log('📍 userPosition:', userPosition);
//       console.log('🏠 userProfileAddress:', userProfileAddress);
      
//       setLoading(true);
//       setError(null);
      
//       try {
//         // אם יש מיקום נוכחי מועבר מהקומפוננטה האב
//         if (userPosition && Array.isArray(userPosition) && userPosition.length === 2) {
//           console.log('✅ יש מיקום נוכחי מהקומפוננטה האב');
//           setUserLocation(userPosition);
//           setLocationSource('מיקום נוכחי');
//           setDebugInfo(`מיקום נוכחי: ${userPosition[0]}, ${userPosition[1]}`);
//           return;
//         }

//         // ניסיון לקבל מיקום נוכחי אם אין מיקום מהקומפוננטה האב
//         if (navigator.geolocation) {
//           console.log('📡 מנסה לקבל מיקום נוכחי');
          
//           const position = await new Promise((resolve, reject) => {
//             navigator.geolocation.getCurrentPosition(
//               resolve,
//               reject,
//               {
//                 enableHighAccuracy: false,
//                 timeout: 10000, // 10 שניות
//                 maximumAge: 300000 // 5 דקות
//               }
//             );
//           });

//           const coords = [position.coords.latitude, position.coords.longitude];
//           setUserLocation(coords);
//           setLocationSource('מיקום נוכחי');
//           setDebugInfo(`מיקום נוכחי חדש: ${coords[0]}, ${coords[1]}`);
//           console.log('🎯 מיקום נוכחי נקבע:', coords);
//           return;
//         }

//         // אם לא הצלחנו לקבל מיקום נוכחי, נסה כתובת פרופיל
//         if (userProfileAddress && userProfileAddress.trim()) {
//           console.log('🏠 מנסה להמיר כתובת פרופיל למיקום:', userProfileAddress);
//           const coords = await geocodeAddress(userProfileAddress);
//           if (coords && Array.isArray(coords) && coords.length === 2) {
//             setUserLocation(coords);
//             setLocationSource('כתובת פרופיל');
//             setDebugInfo(`כתובת פרופיל: ${userProfileAddress} -> ${coords[0]}, ${coords[1]}`);
//             console.log('🏠 מיקום נקבע לפי כתובת פרופיל:', coords);
//             return;
//           }
//         }

//         // אם לא הצלחנו לקבל מיקום כלל
//         console.log('❌ לא הצלחנו לקבל מיקום');
//         setError('לא הצלחנו לקבל את המיקום שלך');
//         setDebugInfo('לא הצלחנו לקבל מיקום');
        
//       } catch (err) {
//         console.error('❌ שגיאה בקביעת מיקום:', err);
//         setError('שגיאה בקביעת מיקום');
//         setDebugInfo(`שגיאה: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     determineUserLocation();
//   }, [userPosition, userProfileAddress]);

//   // חיפוש ספרים בקרבת המשתמש
// useEffect(() => {
//   const fetchNearbyBooks = async () => {
//     if (!userLocation || !Array.isArray(userLocation) || userLocation.length !== 2) {
//       console.log('❌ אין מיקום תקין לחיפוש ספרים');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     // בדיקת cache קודם
//     const cacheKey = `nearbyBooks_${userLocation[0]}_${userLocation[1]}`;
//     const cachedData = sessionStorage.getItem(cacheKey);

//     if (cachedData) {
//       console.log('⚡ טוען ספרים מה־sessionStorage');
//       setNearbyBooks(JSON.parse(cachedData));
//       setLoading(false);
//       return;
//     }

//     try {
//       const listingsRes = await fetch(`${API_BASE_URL}/book-listings`);
//       if (!listingsRes.ok) throw new Error('לא הצלחנו לשלוף רשימת עותקים');
//       const listings = (await listingsRes.json()).slice(0, 50);

//       const booksRes = await fetch(`${API_BASE_URL}/books`);
//       if (!booksRes.ok) throw new Error('לא הצלחנו לשלוף רשימת ספרים');
//       const books = await booksRes.json();

//       const geocodeCache = {};

//       const processed = await Promise.all(
//         listings.map(async (listing) => {
//           try {
//             if (!listing.location || !listing.book) return null;

//             const coords = geocodeCache[listing.location] || await geocodeAddress(listing.location);
//             geocodeCache[listing.location] = coords;

//             if (!coords || coords.length !== 2) return null;

//             const distance = calculateDistance(userLocation, coords);
//             if (distance > 10) return null;

//             const bookData = books.find(book => book.id === listing.book.id);
//             if (!bookData) return null;

//             return {
//               ...bookData,
//               distance: distance.toFixed(1),
//               listingId: listing.id,
//               price: listing.price,
//               condition: listing.condition,
//               sellerLocation: listing.location,
//             };
//           } catch (err) {
//             return null;
//           }
//         })
//       );

//       const nearbyListings = processed.filter(Boolean);
//       nearbyListings.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

//       const uniqueBooks = [];
//       const seenBookIds = new Set();

//       for (const book of nearbyListings) {
//         if (!seenBookIds.has(book.id)) {
//           uniqueBooks.push(book);
//           seenBookIds.add(book.id);
//         }
//       }

//       const finalBooks = uniqueBooks.slice(0, 20);
//       setNearbyBooks(finalBooks);
//       sessionStorage.setItem(cacheKey, JSON.stringify(finalBooks)); // 💾 שמירה ל־sessionStorage
//       setDebugInfo(prev => `${prev} | נשמר ב־sessionStorage`);
//     } catch (err) {
//       console.error('❌ שגיאה בטעינת ספרים בקרבתך:', err);
//       setError('שגיאה בטעינת ספרים בקרבתך');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (userLocation) {
//     fetchNearbyBooks();
//   } else {
//     setLoading(false);
//   }
// }, [userLocation]);


//   // הצגת מצב טעינה
//   if (loading) {
//     return (
//       <div style={{ 
//         textAlign: 'center', 
//         padding: '20px', 
//         color: '#666',
//         border: '1px solid #ddd',
//         borderRadius: '8px',
//         margin: '20px 0',
//         background: '#f9f9f9'
//       }}>
//         <div style={{ fontSize: '18px', marginBottom: '10px' }}>🔍 מחפש ספרים בקרבתך...</div>
//       </div>
//     );
//   }

//   // הצגת שגיאה
//   if (error) {
//     return (
//       <div style={{ 
//         textAlign: 'center', 
//         padding: '20px', 
//         color: '#d32f2f',
//         border: '1px solid #f44336',
//         borderRadius: '8px',
//         margin: '20px 0',
//         background: '#ffebee'
//       }}>
//         <div style={{ fontSize: '18px', marginBottom: '10px' }}>❌ {error}</div>
//       </div>
//     );
//   }

//   // אם אין מיקום או אין ספרים קרובים
//   if (!userLocation) {
//     return (
//       <div style={{ 
//         textAlign: 'center', 
//         padding: '20px', 
//         color: '#666',
//         border: '1px solid #ddd',
//         borderRadius: '8px',
//         margin: '20px 0',
//         background: '#f9f9f9'
//       }}>
//         <div style={{ fontSize: '18px', marginBottom: '10px' }}>📍 לא הצלחנו לקבל את המיקום שלך</div>
//         <div style={{ fontSize: '14px' }}>
//           אנא אפשר גישה למיקום או וודא שיש לך כתובת בפרופיל
//         </div>
       
//       </div>
//     );
//   }

//   if (nearbyBooks.length === 0) {
//     return (
//       <div style={{ 
//         textAlign: 'center', 
//         padding: '20px', 
//         color: '#666',
//         border: '1px solid #ddd',
//         borderRadius: '8px',
//         margin: '20px 0',
//         background: '#f9f9f9'
//       }}>
//         <div style={{ fontSize: '18px', marginBottom: '10px' }}>📚 לא נמצאו ספרים בקרבתך</div>
//         <div style={{ fontSize: '14px' }}>
//           נסה לחפש בעיר הגדולה הקרובה או הרחב את החיפוש
//         </div>
        
        
//       </div>
//     );
//   }

//   return (
//     <>
//       <GlobalSwiperStyle />
//       <SectionTitle>
       
//         ספרים זמינים בקרבתך (עד 10 ק"מ)
//          <FiMapPin style={{ marginLeft: '8px', color: '#28a745' }} />
//         <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'normal', marginTop: '5px' }}>
//           {nearbyBooks.length} ספרים נמצאו • לפי {locationSource}
//         </div>
       
//       </SectionTitle>
      
//       <CarouselWrapper>
//         <SwiperNavButton className="prev" onClick={() => swiperRef.current?.slidePrev()}>
//           <FiChevronRight />
//         </SwiperNavButton>

//         <Swiper
//           className="custom-swiper"
//           modules={[Navigation]}
//           onBeforeInit={(swiper) => (swiperRef.current = swiper)}
//           observer
//           observeParents
//           breakpoints={{
//             2200: { slidesPerView: 7, spaceBetween: 20 },
//             1800: { slidesPerView: 6, spaceBetween: 20 },
//             1255: { slidesPerView: 5, spaceBetween: 20 },
//             1024: { slidesPerView: 4, spaceBetween: 30 },
//             768:  { slidesPerView: 3, spaceBetween: 20 },
//             480:  { slidesPerView: 2, spaceBetween: 15 },
//             0:    { slidesPerView: 1, spaceBetween: 10 },
//           }}
//         >
//           {nearbyBooks.map(book => (
//             <SwiperSlide key={`${book.id}-${book.listingId}`}>
//               <HomeBookCard>
//                 <Link
//                   to={`/book/${encodeURIComponent(book.title)}`}
//                   state={{ from: location.pathname }}
//                   style={{ textDecoration: 'none', color: 'inherit' }}
//                 >
//                   <div style={{ position: 'relative' }}>
//                     <HomeBookImage
//                       src={book.image_url?.startsWith('http') ? book.image_url : `${API_BASE_URL}/${book.image_url}`}
//                       alt={book.title}
//                     />
//                     {/* תגית מרחק */}
//                     <div style={{
//                       position: 'absolute',
//                       top: '5px',
//                       right: '5px',
//                       background: 'rgba(40, 167, 69, 0.9)',
//                       color: 'white',
//                       padding: '2px 6px',
//                       borderRadius: '10px',
//                       fontSize: '0.7rem',
//                       fontWeight: 'bold'
//                     }}>
//                       {book.distance} ק"מ
//                     </div>
//                   </div>
                  
//                   <HomeBookTitle>{book.title}</HomeBookTitle>
//                   <HomeBookAuthor>{book.authors || 'לא ידוע'}</HomeBookAuthor>
                  
//                   {/* מידע נוסף על העותק */}
//                   <div style={{ 
//                     fontSize: '0.8rem', 
//                     color: '#666', 
//                     marginTop: '5px',
//                     textAlign: 'center'
//                   }}>
//                     {book.price ? `${book.price} ₪` : 'חינם'}
//                     {book.condition && (
//                       <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>
//                         {book.condition === 'New' && 'חדש'}
//                         {book.condition === 'Used - Like New' && 'כמו חדש'}
//                         {book.condition === 'Used - Good' && 'טוב'}
//                         {book.condition === 'Used - Poor' && 'משומש'}
//                       </div>
//                     )}
//                   </div>
//                 </Link>
//               </HomeBookCard>
//             </SwiperSlide>
//           ))}
//         </Swiper>

//         <SwiperNavButton className="next" onClick={() => swiperRef.current?.slideNext()}>
//           <FiChevronLeft />
//         </SwiperNavButton>
//       </CarouselWrapper>
//     </>
//   );
// };

// export default NearbyBooksCarousel;