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
} from '../styles/Home.styles';
import HomeBookGallery from '../components/HomeBookGallery';

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [recycledCount, setRecycledCount] = useState(0);
  const token = localStorage.getItem('access_token');

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

  
  // שליפת כמות עסקאות שהושלמו מכלל המשתמשים
useEffect(() => {
  const fetchCompletedTransactions = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const completed = Array.isArray(data)
        ? data.filter(tx => tx.status === 'completed')
        : [];

      setRecycledCount(completed.length);
    } catch (err) {
      console.error('שגיאה בטעינת כמות עסקאות שהושלמו:', err);
    }
  };

  fetchCompletedTransactions();
}, []);


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
          עד כה הצלחנו להעביר הלאה {recycledCount}   ספרים! תודה שאתם חלק מהקהילה 💛
        </BannerText>
      </Banner>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <BookSection>
        <HomeBookGallery />
      </BookSection>

      <ReviewSection>
        <SectionTitle>📝 ביקורות אחרונות</SectionTitle>
        {/* קומפוננטה שמציגה ביקורות אחרונות */}
      </ReviewSection>
    </PageWrapper>
  );
}

export default Home;
