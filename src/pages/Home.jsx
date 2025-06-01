import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeBookGallery from '../components/HomeBookGallery';
import TopUsersLeaderboard from '../components/TopUsersLeaderboard';
import API_BASE_URL from '../config';
import LatestReviewsCarousel from '../components/LatestReviewsCarousel.js';

import {
  PageWrapper,
  TopBar,
  UserGreeting,
  NotificationIcon,
  NotificationBadge,
  BannerText,
  Banner,
  SectionTitle,
  BookSection,
  ReviewSection,
  NotificationsWrapper,
  MarkAsReadIcon,
  MarkAllAsReadButton,
  NotificationsBox, 
  NotificationItem,
  NotificationTitle, 
  NotificationsScroll, 
} from '../styles/Home.styles';
import BackButton from '../components/BackButton.js'
import RecommendedBooksCarousel from '../components/RecommendedBooksCarousel';





function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recycledCount, setRecycledCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [favoriteGenres, setFavoriteGenres] = useState([]);

useEffect(() => {
  const fetchLatestReviewsWithBookData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/comments/latest`);
      const reviews = await res.json();

      // שליפת כל הספרים בבת אחת
      const booksRes = await fetch(`${API_BASE_URL}/books`);
      const allBooks = await booksRes.json();

      const enhancedReviews = reviews.map((review) => {
        const bookData = allBooks.find(book => book.id === review.book_id);

        return {
          ...review,
          book: bookData // יכול להיות undefined אם לא נמצא
        };
      });

      setLatestReviews(enhancedReviews);
    } catch (err) {
      console.error('שגיאה בטעינת ביקורות או ספרים:', err);
    }
  };

  fetchLatestReviewsWithBookData();
}, []);


useEffect(() => {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  fetch(`${API_BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'בעיה בפרופיל');

      localStorage.setItem('user_id', data.id);
      setUserName(data.full_name);

      // 💡 כאן שמרי את הז'אנרים האהובים
      const genres = Array.isArray(data.favorite_genres)
        ? data.favorite_genres
        : data.favorite_genres?.split(',') || [];
      setFavoriteGenres(genres);
    })
    .catch(err => {
      console.error('❌ שגיאה:', err.message);
    });
}, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const storedReadIds = JSON.parse(localStorage.getItem('readNotificationIds')) || [];
    setReadNotificationIds(storedReadIds);

    const fetchNotifications = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [chatsRes, txRes] = await Promise.all([
          fetch(`${API_BASE_URL}/chats`, { headers }),
          fetch(`${API_BASE_URL}/transactions`, { headers })
        ]);

        const [chats, transactions] = await Promise.all([
          chatsRes.json(),
          txRes.json()
        ]);

        const unreadMessages = chats
          .filter(chat => chat.unread_count > 0)
          .map(chat => {
            const id = `chat-${chat.id}`;
            return {
              id,
              message: `${chat.other_user.full_name} שלח/ה לך הודעה על "${chat.listing.book.title}"`,
              link: `/chat/${chat.id}`,
              type: 'message',
              isUnread: !storedReadIds.includes(id), 
              timestamp: new Date().getTime(),
            };
          });


        const completedTx = transactions
          .filter(tx => tx.status === 'completed' && tx.is_user_buyer)
          .map(tx => ({
            id: `tx-complete-${tx.id}`,
            message: `"${tx.listing.book.title}" אושר על ידי ${tx.seller.full_name}`,
            link: '/transaction',
            type: 'complete',
            isUnread: !storedReadIds.includes(`tx-complete-${tx.id}`),
            timestamp: new Date().getTime() - 1000
          }));

        const reservedTx = transactions
          .filter(tx => tx.status === 'pending' && !tx.is_user_buyer)
          .map(tx => ({
            id: `tx-pending-${tx.id}`,
            message: `מישהו ביקש את "${tx.listing.book.title}" – עסקה פתוחה`,
            link: '/transaction',
            type: 'pending',
            isUnread: !storedReadIds.includes(`tx-pending-${tx.id}`),
            timestamp: new Date().getTime() - 2000
          }));

        const allNotifications = [...unreadMessages, ...completedTx, ...reservedTx]
          .sort((a, b) => b.timestamp - a.timestamp);
          // הסרנו את ה-slice כדי לאפשר את כל ההתראות

        setNotifications(allNotifications);
        setUnreadNotifications(allNotifications.filter(note => note.isUnread).length);
      } catch (err) {
        console.error('שגיאה בטעינת התראות:', err.message);
      }
    };

    fetchNotifications();
  }, []);

  const [latestReviews, setLatestReviews] = useState([]);



  useEffect(() => {
  const fetchCompletedTransactions = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/transactions/completed`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      // נניח ש־data הוא מערך של עסקאות שהושלמו
      setRecycledCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error('שגיאה בטעינת עסקאות שהושלמו:', err);
    }
  };

  fetchCompletedTransactions();
}, []);

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(note =>
      note.id === notificationId ? { ...note, isUnread: false } : note
    );

    setNotifications(updatedNotifications);

    const newUnreadCount = updatedNotifications.filter(note => note.isUnread).length;
    setUnreadNotifications(newUnreadCount);

    const updatedReadIds = [...readNotificationIds, notificationId];
    setReadNotificationIds(updatedReadIds);
    localStorage.setItem('readNotificationIds', JSON.stringify(updatedReadIds));
  };


  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(note => ({
      ...note,
      isUnread: false
    }));

    setNotifications(updatedNotifications);
    setUnreadNotifications(0);

  const allIds = updatedNotifications.map(note => note.id);
  setReadNotificationIds(allIds);
  localStorage.setItem('readNotificationIds', JSON.stringify(allIds));
};
return (
  <PageWrapper>
    <TopBar>
      <UserGreeting>
        {userName ? `שלום, ${userName}! 🌸` : 'שלום אורח 🌸'}
      </UserGreeting>

        {userName && (
          <NotificationsWrapper>
            <NotificationIcon onClick={() => setShowNotifications(prev => !prev)}>
              🔔
              {unreadNotifications > 0 && (
                <NotificationBadge>{unreadNotifications}</NotificationBadge>
              )}
            </NotificationIcon>

            {showNotifications && (
              <NotificationsBox>
                <NotificationTitle>📬 ההתראות שלך:</NotificationTitle>
                
                <NotificationsScroll>
                  {notifications.length === 0 ? (
                    <NotificationItem>אין התראות כרגע</NotificationItem>
                  ) : (
                    notifications.map((note) => (
                        <NotificationItem
  key={note.id}
  $isUnread={note.isUnread}
  $type={note.type}
  onClick={() => {
    // נווט קודם
    navigate(note.link);

    if (note.isUnread) {
      setTimeout(() => markAsRead(note.id), 300);
    }
  }}
  style={{ cursor: 'pointer' }}
>
  <div style={{ flex: 1 }}>
    {note.message}
  </div>
</NotificationItem>

                    ))
                  )}
                </NotificationsScroll>

                {unreadNotifications > 2 && (
                  <MarkAllAsReadButton onClick={markAllAsRead}>
                    ✔️ סמן את כל ההתראות כנקראו
                  </MarkAllAsReadButton>
                )}
              </NotificationsBox>
            )}
          </NotificationsWrapper>
        )}
      </TopBar>

      <Banner>
        <BannerText>
          עד כה הצלחנו להעביר הלאה {recycledCount} ספרים! תודה שאתם חלק מהקהילה 💛
        </BannerText>
      </Banner>
<BookSection>
  <TopUsersLeaderboard />
</BookSection>
<BookSection>
  <HomeBookGallery />
</BookSection>

{favoriteGenres.length > 0 && (
  <BookSection>
    <RecommendedBooksCarousel userGenres={favoriteGenres} />
  </BookSection>
)}

<ReviewSection>
  <LatestReviewsCarousel reviews={latestReviews} />
</ReviewSection>



      
    </PageWrapper>
    
  );
}

export default Home;