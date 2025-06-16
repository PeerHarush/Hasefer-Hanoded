// BookDetailsPage.jsx - תיקון בעיות המרחקים
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import {
  BookImage,
  PageContainer,
  Wrapper,
  Sidebar,
  BookDescription,
  BookImageMobile,
  StickyTextContainer,
  BookInfo,
  ButtonsContainer,
  MobileButtonsContainer,
  StyledLinkButton,
  Button,
  MapControlsWrapper,
  ControlsContainer,
  InputRow,
  AddressInput,
  MapWrapper,
  SmallButton,
  SimilarBooksSection,
  GenreLink
} from '../styles/BookDetailsPage.styles';
import { Modal, Button as BootstrapButton } from 'react-bootstrap';
import { LOCATION_IQ_TOKEN } from '../config';

import Table from 'react-bootstrap/Table';
import BookReviews from '../components/BookReviews.js';
import Map, { geocodeAddress, calculateDistance } from '../components/Map';
import SimilarBooksList from '../components/SimilarBooksList';
import { genresList } from "../components/GenresSelect";

const BookDetails = () => {
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);
  const { bookTitle } = useParams();
  const [book, setBook] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [copies, setCopies] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [reservedCopies, setReservedCopies] = useState(new Set());
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const titleRef = useRef(null);
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [showAddressInput, setShowAddressInput] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [distanceMap, setDistanceMap] = useState({});
  
  // 🔥 הוספת מצבי טעינה וטיפול בשגיאות
  const [isCalculatingDistances, setIsCalculatingDistances] = useState(false);
  const [distanceError, setDistanceError] = useState(null);
  
  // 🔥 Cache למניעת חישובים כפולים
const distanceCache = useRef(new window.Map());

  const isCalculatingRef = useRef(false);

  const goBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  const conditionTranslations = {
    'New': 'חדש',
    'Used - Like New': 'כמו חדש',
    'Used - Good': 'טוב',
    'Used - Poor': 'משומש',
  };

  // 🔥 פונקציה משופרת לחישוב מרחקים עם הגנות
  const updateDistances = async (userPos) => {
    if (!userPos || !book || isCalculatingRef.current) {
      console.log('🚫 מדלג על חישוב מרחקים - תנאים לא מתקיימים');
      return;
    }

    const relevantCopies = copies.filter(copy => copy.book?.id === book?.id);
    if (relevantCopies.length === 0) {
      console.log('🚫 אין עותקים רלוונטיים');
      return;
    }

    // 🔥 נעל את התהליך למניעת קריאות כפולות
    isCalculatingRef.current = true;
    setIsCalculatingDistances(true);
    setDistanceError(null);

    console.log(`🔍 מתחיל חישוב מרחקים עבור ${relevantCopies.length} עותקים`);

    const distances = {};
    const cacheKey = `${userPos[0]},${userPos[1]}`;
    
    try {
      for (const copy of relevantCopies) {
        if (!copy.location || typeof copy.location !== 'string') {
          console.log(`⚠️ עותק ${copy.id} ללא מיקום תקין`);
          continue;
        }

        try {
          // 🔥 בדיקת cache
          const locationCacheKey = `${copy.location}_${cacheKey}`;
          if (distanceCache.current.has(locationCacheKey)) {
            distances[copy.id] = distanceCache.current.get(locationCacheKey);
            console.log(`💾 מרחק מהcache לעותק ${copy.id}: ${distances[copy.id]} ק"מ`);
            continue;
          }

          // 🔥 השהיה בין קריאות למניעת rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));

          const copyPosition = await geocodeAddress(copy.location);
          if (copyPosition && copyPosition.length === 2) {
            const distance = calculateDistance(userPos, copyPosition);
            const roundedDistance = distance ? distance.toFixed(1) : null;
            
            distances[copy.id] = roundedDistance;
            
            // 🔥 שמירה בcache
            distanceCache.current.set(locationCacheKey, roundedDistance);
            
            console.log(`✅ מרחק חושב לעותק ${copy.id}: ${roundedDistance} ק"מ`);
          } else {
            console.log(`❌ לא הצלחתי לחשב מיקום עבור עותק ${copy.id}`);
          }
        } catch (err) {
          console.error(`❌ שגיאה בחישוב מרחק לעותק ${copy.id}:`, err);
          continue;
        }
      }

      // 🔥 עדכון ה-state רק אם יש תוצאות
      if (Object.keys(distances).length > 0) {
        setDistanceMap(prev => ({ ...prev, ...distances }));
        console.log(`✅ עודכנו מרחקים עבור ${Object.keys(distances).length} עותקים`);
      } else {
        setDistanceError('לא הצלחנו לחשב מרחקים');
        console.log('❌ לא הצלחנו לחשב אף מרחק');
      }

    } catch (err) {
      console.error('❌ שגיאה כללית בחישוב מרחקים:', err);
      setDistanceError('שגיאה בחישוב מרחקים');
    } finally {
      setIsCalculatingDistances(false);
      isCalculatingRef.current = false;
    }
  };

  // 🔥 פונקציה משופרת לקבלת מיקום
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      console.log('❌ Geolocation לא נתמך');
      setShowMap(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = [position.coords.latitude, position.coords.longitude];
        console.log('📍 מיקום נוכחי נקבע:', userPos);
        setUserPosition(userPos);
        // 🔥 הוספת השהיה קטנה לוודא שהstate התעדכן
        setTimeout(() => updateDistances(userPos), 100);
      },
      (error) => {
        console.error('❌ שגיאה בקבלת מיקום:', error);
        setDistanceError('לא הצלחנו לקבל את המיקום שלך');
        setShowMap(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  // 🔥 פונקציה משופרת לחיפוש כתובת
  const handleAddressSearch = async () => {
    if (!userAddress || userAddress.trim().length < 3) {
      alert('אנא הזן כתובת תקינה');
      return;
    }

    setIsCalculatingDistances(true);
    setDistanceError(null);

    try {
      const position = await geocodeAddress(userAddress);
      if (position && position.length === 2) {
        console.log('📍 מיקום נמצא לכתובת:', position);
        setUserPosition(position);
        // 🔥 הוספת השהיה קטנה
        setTimeout(() => updateDistances(position), 100);
      } else {
        setDistanceError('לא הצלחנו למצוא את הכתובת');
        alert('לא הצלחנו למצוא את הכתובת. אנא נסה שוב.');
      }
    } catch (err) {
      console.error('❌ שגיאה בחיפוש כתובת:', err);
      setDistanceError('שגיאה בחיפוש הכתובת');
      alert('אירעה שגיאה בחיפוש הכתובת');
    } finally {
      setIsCalculatingDistances(false);
    }
  };

  // 🔥 useEffect משופר עם תנאים ברורים יותר
  useEffect(() => {
    if (book && copies.length > 0 && !userPosition && !isCalculatingRef.current) {
      console.log('🎯 מתחיל קבלת מיקום נוכחי');
      getCurrentPosition();
    }
  }, [book, copies, userPosition]);

  // 🔥 useEffect נפרד לטיפול בשינויי מיקום
  useEffect(() => {
    if (userPosition && book && copies.length > 0 && !isCalculatingRef.current) {
      console.log('🎯 מיקום השתנה, מחשב מרחקים מחדש');
      updateDistances(userPosition);
    }
  }, [userPosition, book, copies]);

  // שאר הuseEffect הקיימים...
  useEffect(() => {
    const handleScroll = () => {
      if (!titleRef.current) return;
      const rect = titleRef.current.getBoundingClientRect();
      setShowStickyTitle(rect.top < 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/books?search=${encodeURIComponent(bookTitle)}`);
        const data = await res.json();

        const matchedBook = data.find(b => b.title?.toLowerCase() === bookTitle.toLowerCase());
        if (matchedBook) {
          setBook(matchedBook);
        } else {
          setErrorMessage('לא נמצא ספר עם השם הזה');
        }
      } catch (err) {
        console.error('שגיאה בטעינת הספר:', err);
        setErrorMessage('שגיאה בטעינת פרטי הספר');
      }
    };

    fetchBook();
  }, [bookTitle]);

  useEffect(() => {
    if (book) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [book]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/wishlist/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('טעינת wishlist נכשלה');

        const data = await res.json();
        setFavorites(new Set(data.wishlist_book_ids));
      } catch (err) {
        console.error('שגיאה בטעינת wishlist:', err.message);
      }
    };

    if (isLoggedIn) fetchWishlist();
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchCopies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/book-listings`);
        const data = await res.json();
        setCopies(data);
      } catch (err) {
        console.error('שגיאה בטעינת עותקים:', err);
      }
    };

    fetchCopies();
  }, []);

  // שאר הפונקציות הקיימות...
  const handleAddToWishlist = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('יש להתחבר תחילה');
      return;
    }

    const bookId = book.id;

    if (favorites.has(bookId)) {
      alert('📌 הספר כבר קיים ברשימת המשאלות שלך');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/${bookId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'הוספה נכשלה');
      }

      setFavorites(prev => new Set(prev).add(bookId));
      alert('📚 הספר נוסף בהצלחה לרשימת המשאלות!');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleReserveAndStartChat = async (copy) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('יש להתחבר תחילה');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/listings/${copy.id}/reserve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('לא ניתן היה לשריין את העותק');
      const data = await res.json();
      const chatRoomId = data.chat_room_id;

      setReservedCopies(prev => new Set(prev).add(copy.id));

      const sellerName = copy.seller?.full_name || 'המוכר';
      const bookTitle = copy.book?.title || book.title || 'הספר';

      navigate(`/chat/${chatRoomId}`, {
        state: {
          sellerName: sellerName,
          bookTitle: bookTitle
        }
      });
    } catch (err) {
      console.error('שגיאה בשריון/פתיחת צ׳אט:', err);
      alert('אירעה שגיאה בעת פתיחת הצ׳אט');
    }
  };

  if (errorMessage) {
    return (
      <PageContainer>
        <Wrapper>
          <BookInfo>
            <h1>{errorMessage}</h1>
          </BookInfo>
        </Wrapper>
      </PageContainer>
    );
  }

  if (!book) {
    return (
      <PageContainer>
        <Wrapper>
          <BookInfo>
            <h1>טוען פרטי ספר...</h1>
          </BookInfo>
        </Wrapper>
      </PageContainer>
    );
  }

  // סינון ומיון העותקים
  const relevantCopies = book
    ? copies.filter(copy => copy?.book && copy.book.id === book.id)
    : [];
    
  const sortedCopies = [...relevantCopies].sort((a, b) => {
    const distA = parseFloat(distanceMap[a.id]) || Infinity;
    const distB = parseFloat(distanceMap[b.id]) || Infinity;
    return distA - distB;
  });

  return (
    <>
      <PageContainer>
        <Wrapper>
          <BookInfo>
            <h1 ref={titleRef}>{book.title}</h1>
            <h3>{book.authors}</h3>
            
            {book.genres && book.genres.length > 0 && (
              <div style={{ fontSize: '1rem', margin: '10px 0', color: '#555' }}>
                 ז׳אנר:{' '}
                {book.genres.map((genre) => {
                  const genreObj = genresList.find(g => g.name === genre);
                  const genreId = genreObj ? genreObj.id : null;
                  
                  return genreId ? (
                    <GenreLink
                      key={genre}
                      to={`/AllBooks?genre=${encodeURIComponent(genreId)}`}
                    >
                      {genre}
                    </GenreLink>
                  ) : (
                    <span key={genre} style={{ marginLeft: '5px', marginRight: '5px' }}>
                      {genre}
                    </span>
                    );
                })}
              </div>
            )}

            <BookImageMobile src={book.image_url} alt={book.title} />
            <BookDescription>{book.book_description || book.description}</BookDescription>

            {isLoggedIn && (
              <MobileButtonsContainer>
                <Button onClick={handleAddToWishlist}>הוסף לרשימת המשאלות💖</Button>
                <StyledLinkButton to="/wishlist">
                  <Button>מעבר לרשימת המשאלות📜</Button>
                </StyledLinkButton>
              </MobileButtonsContainer>
            )}

            {relevantCopies.length > 0 && (
              <>
                <h3>עותקים זמינים</h3>
                
                {/* 🔥 מצב טעינה ושגיאות */}
                
                
                {distanceError && (
                  <div style={{ padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px', marginBottom: '10px', color: '#c62828' }}>
                    ⚠️ {distanceError}
                  </div>
                )}
                
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>מצב הספר</th>
                      <th>מחיר</th>
                      <th>מיקום</th>
                      <th>מרחק</th>
                      <th>שריון</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCopies.map(copy => (
                      <tr key={copy.id}>
                        <td>{conditionTranslations[copy.condition]}</td>
                        <td>{copy.price ? `${copy.price} ₪` : 'חינם'}</td>
                        <td>{copy.location}</td>
                        <td>
                          {isCalculatingDistances ? (
                            '⌛'
                          ) : distanceMap[copy.id] !== undefined ? (
                            `${distanceMap[copy.id]} ק"מ`
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {reservedCopies.has(copy.id) ? (
                            <span style={{ textDecoration: 'underline' }}>נשמר 📌</span>
                          ) : (
                            <span
                              onClick={() => handleReserveAndStartChat(copy)}
                              style={{ cursor: 'pointer', color: '#007bff' }}
                            >
                              לשריון ✅
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <MapControlsWrapper>
                  <ControlsContainer>
                    {!showAddressInput && (
                      <SmallButton onClick={() => setShowAddressInput(true)}>
                        חיפוש לפי מרחק ממיקום שונה
                      </SmallButton>
                    )}

                    {showAddressInput && (
                      <InputRow>
                        <AddressInput
                          type="text"
                          value={userAddress}
                          onChange={(e) => setUserAddress(e.target.value)}
                          placeholder="הזן כתובת"
                        />
                        <SmallButton onClick={handleAddressSearch} disabled={isCalculatingDistances}>
                          {isCalculatingDistances ? '🔍' : 'חפש'}
                        </SmallButton>
                        <SmallButton onClick={() => setShowAddressInput(false)}>
                          סגור חיפוש
                        </SmallButton>
                      </InputRow>
                    )}

                    <SmallButton onClick={() => setShowMap(!showMap)}>
                      {showMap ? 'הסתר מפה' : 'הצג מפה'}
                    </SmallButton>
                  </ControlsContainer>
                  
                  {showMap && (
                    <MapWrapper>
                      <Map
                        position={userPosition}
                        setPosition={(pos) => {
                          console.log('🗺️ מיקום עודכן מהמפה:', pos);
                          setUserPosition(pos);
                          // 🔥 השהיה קטנה למניעת קריאות כפולות
                          setTimeout(() => updateDistances(pos), 200);
                        }}
                        address={userAddress}
                        updateAddress={(newAddress) => setUserAddress(newAddress)}
                        userProfileAddress={userAddress}
                        autoLocate={!userPosition && !userAddress}
                        helpText="לחץ על המפה לעדכון המיקום או הקלד כתובת"
                      />
                    </MapWrapper>
                  )}
                </MapControlsWrapper>
              </>
            )}

            <h3> ביקורות </h3>
            <BookReviews
              bookId={book.id}
              onSuccess={() => setShowReviewSuccess(true)}
            />
          </BookInfo>
          
          <Modal show={showReviewSuccess} onHide={() => setShowReviewSuccess(false)} centered>
            <Modal.Header>
              <Modal.Title> ביקורת נשלחה בהצלחה!🎉</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ textAlign: 'center' }}>
              תודה על הביקורת!<br />
              קיבלת 50 נקודות🪙
            </Modal.Body>
            <Modal.Footer>
              <BootstrapButton variant="success" onClick={() => setShowReviewSuccess(false)}>
                סגור
              </BootstrapButton>
            </Modal.Footer>
          </Modal>

          <Sidebar>
            <BookImage src={book.image_url} alt={book.title} />

            <StickyTextContainer>
              {showStickyTitle && (
                <>
                  <h2>{book.title}</h2>
                  <h4>{book.authors}</h4>
                </>
              )}
            </StickyTextContainer>

            {isLoggedIn && (
              <ButtonsContainer>
                <Button onClick={handleAddToWishlist}>הוסף לרשימת המשאלות💖</Button>
                <StyledLinkButton to="/wishlist">
                  <Button>מעבר לרשימת המשאלות📜</Button>
                </StyledLinkButton>
              </ButtonsContainer>
            )}
          </Sidebar>
        </Wrapper>
      </PageContainer>
      
      {book && <SimilarBooksList currentBook={book} />}
    </>
  );
};

export default BookDetails;