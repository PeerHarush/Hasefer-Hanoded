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

  const goBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };
  
  const { bookTitle } = useParams();
  const [book, setBook] = useState(null);

  const titleRef = useRef(null);
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); 


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

  if (!book) return <p>טוען פרטי ספר...</p>;

 

  const handleAddToWishlist = () => {
    const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  
    const alreadyExists = storedWishlist.find(item => item.id === book.id);
  
    if (!alreadyExists) {
      const newBook = {
        id: book.id || book.title,
        title: book.title,
        author: book.authors,
        imageUrl: book.image_url,
        inStock: true,
      };
  
      const updatedWishlist = [...storedWishlist, newBook];
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      alert('📚 הספר נוסף לרשימת המשאלות!');
    } else {
      alert('🔁 הספר כבר ברשימת המשאלות.');
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
          <BookDescription>{book.book_description || book.description}</BookDescription>
          <BookDescription>{book.book_description || book.description}</BookDescription>
          <BookDescription>{book.book_description || book.description}</BookDescription>

          <MobileButtonsContainer>
            <Button  onClick={handleAddToWishlist}>הוסף לרשימת המשאלות💖 </Button>
            <StyledLinkButton  to="/wishlist">
              <Button>מעבר לרשימת המשאלות📜</Button>
            </StyledLinkButton>
          </MobileButtonsContainer>


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
            <Button  onClick={handleAddToWishlist}>הוסף לרשימת המשאלות💖 </Button>
            <StyledLinkButton  to="/wishlist">
              <Button>מעבר לרשימת המשאלות📜</Button>
            </StyledLinkButton>
          </ButtonsContainer>


      </Sidebar>


      </Wrapper>
    </PageContainer>
  );
};

export default BookDetails;
