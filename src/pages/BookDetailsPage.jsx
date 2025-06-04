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
} from '../styles/BookDetailsPage.styles';

import Table from 'react-bootstrap/Table';
import BookReviews from '../components/BookReviews.js'; // ייבוא קומפוננטת הביקורות
import Map, { geocodeAddress, calculateDistance } from '../components/Map'; // ייבוא קומפוננטת המפה
import SimilarBooksList from '../components/SimilarBooksList'; // ייבוא קומפוננטת הספרים הדומים (Grid)
import { genresList } from "../components/GenresSelect";

const BookDetails = () => {
  const { bookTitle } = useParams();
  const [book, setBook] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [copies, setCopies] = useState([]); // עותקים של הספר
  const [errorMessage, setErrorMessage] = useState(null);
  const [reservedCopies, setReservedCopies] = useState(new Set()); // עותקים ששוריינו
  const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const titleRef = useRef(null);
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [distanceMap, setDistanceMap] = useState({}); // מרחקים לעותקים

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

  useEffect(() => {
    if (book && copies.length > 0 && !userPosition) {
      getCurrentPosition();
    }
  }, [book, copies]);

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
  window.scrollTo(0, 0);
}, [bookTitle]);


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

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude];
          setUserPosition(userPos);
          updateDistances(userPos);
        },
        (error) => {
          console.error('שגיאה בקבלת מיקום:', error);
          alert('לא הצלחנו לקבל את המיקום שלך. אנא הזן כתובת ידנית.');
          setShowMap(true);
        }
      );
    } else {
      alert('הדפדפן שלך לא תומך באיתור מיקום. אנא הזן כתובת ידנית.');
      setShowMap(true);
    }
  };

  const handleAddressSearch = async () => {
    if (!userAddress || userAddress.trim().length < 3) {
      alert('אנא הזן כתובת תקינה');
      return;
    }

    try {
      const position = await geocodeAddress(userAddress);
      if (position) {
        setUserPosition(position);
        updateDistances(position);
      } else {
        alert('לא הצלחנו למצוא את הכתובת. אנא נסה שוב.');
      }
    } catch (err) {
      console.error('שגיאה בחיפוש כתובת:', err);
      alert('אירעה שגיאה בחיפוש הכתובת');
    }
  };

  const updateDistances = async (userPos) => {
    const relevantCopies = copies.filter(copy => copy.book?.id === book?.id);
    const distances = {};

    for (const copy of relevantCopies) {
      if (copy.location && typeof copy.location === 'string') {
        try {
          const copyPosition = await geocodeAddress(copy.location);
          if (copyPosition) {
            const distance = calculateDistance(userPos, copyPosition);
            distances[copy.id] = distance ? distance.toFixed(1) : null;
          }
        } catch (err) {
          console.error(`שגיאה בחישוב מרחק לעותק ${copy.id}:`, err);
        }
      }
    }

    setDistanceMap(distances);
  };

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

  const relevantCopies = copies.filter(copy => copy.book?.id === book.id);
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
    {' '}
    {book.genres.map((genre, index) => {
      const genreObj = genresList.find(g => g.name === genre);
      const genreId = genreObj ? genreObj.id : null;

      return genreId ? (
        <Link
          key={genre}
          to={`/AllBooks?genre=${encodeURIComponent(genreId)}`}
          style={{
            color: '#000000',
            textDecoration: 'underline',
            cursor: 'pointer',
            marginLeft: '5px',
            marginRight: '5px',
          }}
        >
          {genre}
        </Link>
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
                          {distanceMap[copy.id] !== undefined
                            ? `${distanceMap[copy.id]} ק"מ`
                            : '—'}
                        </td>
                        <td>
                          {reservedCopies.has(copy.id) ? (
                            <span style={{ textDecoration: 'underline' }}>נשמר 📌</span>
                          ) : (
                            <span
                              onClick={() => handleReserveAndStartChat(copy)}
                              style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
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
                        <SmallButton onClick={handleAddressSearch}>חפש</SmallButton>
                        <SmallButton onClick={() => setShowAddressInput(false)}>סגור חיפוש</SmallButton>
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
                          setUserPosition(pos);
                          updateDistances(pos);
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

            <h3>ביקורות</h3>
            <BookReviews bookId={book.id} />
          </BookInfo>

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

      {/* הצגת המלצות */}
      {book && <SimilarBooksList currentBook={book} />}
    </>
  );
};

export default BookDetails;
