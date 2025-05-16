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
  BackButton,
  Button,
} from '../styles/BookDetailsPage.styles';

import Table from 'react-bootstrap/Table'; // טבלת bootstrap להצגת העותקים
import BookReviews from '../components/BookReviews.js'; // ייבוא קומפוננטת הביקורות

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

  const handleReserve = (copyId) => {
    setReservedCopies(prev => new Set(prev).add(copyId));
  };

  if (errorMessage) {
    return (
      <PageContainer>
        <Wrapper>
          <BookInfo>
            <h1>{errorMessage}</h1>
            <BackButton onClick={goBack}>חזור</BackButton>
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

  // סינון העותקים שקשורים רק לספר הזה
  const relevantCopies = copies.filter(copy => copy.book?.id === book.id);

const handleReserveAndStartChat = async (copy) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('יש להתחבר תחילה');
    return;
  }

  try {
    // שריון העותק ויצירת/קבלת צ'אט קיים
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

    // סמן את העותק כמשוריין ב-UI
    setReservedCopies(prev => new Set(prev).add(copy.id));

    // שלב ב: בדוק אם זו ההודעה הראשונה בצ'אט
    const messagesRes = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const messages = await messagesRes.json();

    if (messages.length === 0) {
      // שלח הודעה בעברית רק אם הצ'אט ריק
      const sellerName = copy.seller?.full_name || 'המוכר';
      const bookTitle = copy.book?.title || book.title || 'הספר';
      const firstMessage = `היי ${sellerName}, אני מעוניין בספר שלך "${bookTitle}".\nמתי ניתן לתאם?`;

      await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: firstMessage }),
      });
    }

    // נווט לצ'אט
    navigate(`/chat/${chatRoomId}`);
  } catch (err) {
    console.error('שגיאה בשריון/פתיחת צ׳אט:', err);
    alert('אירעה שגיאה בעת פתיחת הצ׳אט');
  }
};



  return (
    <PageContainer>
      <BackButton onClick={goBack}> אחורה</BackButton>

      <Wrapper>
        <BookInfo>
          <h1 ref={titleRef}>{book.title}</h1>
          <h3>{book.authors}</h3>
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

          {/* ✅ טבלת עותקים */}
          <h3>עותקים זמינים</h3>
          {relevantCopies.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>מצב הספר</th>
                  <th>מחיר</th>
                  <th>שריון</th>
                  <th>מיקום</th>
                </tr>
              </thead>
              <tbody>
                {relevantCopies.map(copy => (
                  <tr key={copy.id}>
                    <td>{conditionTranslations[copy.condition] || 'לא צוין'}</td>
                    <td>{copy.price ? `${copy.price} ₪` : 'לא צוין'}</td>
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
                    <td>{copy.location || 'לא צוין'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>אין עותקים זמינים כרגע.</p>
          )}

          {/* הוספת ביקורות */}
          <h3> ביקורות </h3>
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
  );
};

export default BookDetails;
