import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookGallery from '../components/BookGallery';
import SearchBar from '../components/SearchBar';
import API_BASE_URL from '../config';
import {
  PageWrapper,
  TopBar,
  UserGreeting,
  NotificationIcon,
  BannerText,
  Banner,
  SectionTitle,
  BookSection,
  ReviewSection,
 HomeBookCard,
  HomeBookImage,
  HomeBookTitle,
  HomeBookAuthor,
  BookListWrapper,
} from '../styles/Home.styles';
import HomeBookGallery from '../components/HomeBookGallery';


function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recycledCount, setRecycledCount] = useState(0);
  const [randomBooks, setRandomBooks] = useState([]);

  // שליפת שם משתמש
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'בעיה בפרופיל');
        setUserName(data.full_name);
      })
      .catch(err => {
        console.error('❌ שגיאה:', err.message);
        alert('לא ניתן לטעון את הפרופיל.');
      });
  }, []);

  // חיפוש ספרים
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const url = searchTerm.trim()
          ? `${API_BASE_URL}/books?search=${encodeURIComponent(searchTerm)}`
          : `${API_BASE_URL}/books`;

        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setBooks(data);
        } else {
          throw new Error('שגיאה בקבלת הספרים');
        }
      } catch (err) {
        console.error("שגיאה בטעינת ספרים:", err);
      }
    };

    const delayDebounce = setTimeout(() => fetchBooks(), 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);


  // בחירת ספרים רנדומליים מה-Books שכבר נטענו
  useEffect(() => {
    if (books.length > 0) {
      const shuffled = [...books].sort(() => 0.5 - Math.random());
      setRandomBooks(shuffled.slice(0, 4));
    }
  }, [books]);

  return (
    <PageWrapper>
      <TopBar>
        <UserGreeting>
          {userName ? `שלום, ${userName}!` : 'שלום אורח 🌸'}
        </UserGreeting>
        <NotificationIcon onClick={() => navigate('/notifications')}>
          🔔
        </NotificationIcon>
      </TopBar>

      <Banner>
        <BannerText>
          📚 בזכותכם מיחזרנו כבר {recycledCount} ספרים! תודה לכל מי שתרם והעביר הלאה 💛
        </BannerText>
      </Banner>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

   
<BookSection>
  <SectionTitle>📖 ספרים חדשים</SectionTitle>
  <HomeBookGallery books={books.slice(0, 6)} />
</BookSection>

{randomBooks.length > 0 && (
  <BookSection>
    <SectionTitle>📚 אולי תאהבי גם את...</SectionTitle>
    <HomeBookGallery books={randomBooks} />
  </BookSection>
)}



      <ReviewSection>
        <SectionTitle>📝 ביקורות אחרונות</SectionTitle>
        {/* קומפוננטה שמציגה ביקורות אחרונות */}
      </ReviewSection>
    </PageWrapper>
  );
}

export default Home;
