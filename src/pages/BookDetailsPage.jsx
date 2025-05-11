import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';

import API_BASE_URL from '../config';
import {
  BookImage,
  PageContainer,   
  Wrapper,
  Sidebar,
  BookDescription, 
  BookImageMobile ,
  StickyTextContainer,
  BookInfo,
  ButtonsContainer,
  MobileButtonsContainer,
  StyledLinkButton,
  BackButton ,
  Button,
} from '../styles/BookDetailsPage.styles';

const BookDetails = () => {
  const { bookTitle } = useParams();
  const [book, setBook] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
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
          console.warn("לא נמצא ספר עם השם הזה");
        }
      } catch (err) {
        console.error('שגיאה בטעינת הספר:', err);
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

          <ButtonsContainer>
            <Button onClick={handleAddToWishlist}>הוסף לרשימת המשאלות💖</Button>
            <StyledLinkButton to="/wishlist">
              <Button>מעבר לרשימת המשאלות📜</Button>
            </StyledLinkButton>
          </ButtonsContainer>
        </Sidebar>
      </Wrapper>
    </PageContainer>
  );
};

export default BookDetails;