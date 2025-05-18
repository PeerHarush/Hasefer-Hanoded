import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookGallery from '../components/BookGallery';
import SearchBar from '../components/SearchBar';
import HomeBookGallery from '../components/HomeBookGallery';
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
  NotificationsWrapper,
  NotificationsBox,
  NotificationItem,
  NotificationTitle
} from '../styles/Home.styles';

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recycledCount, setRecycledCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

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
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

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
          .map(chat => ({
            message: `💬 ${chat.other_user.full_name} שלח/ה לך הודעה על "${chat.listing.book.title}"`,
            link: `/chat/${chat.id}`
          }));

        setHasUnreadMessages(unreadMessages.length > 0);

        const completedTx = transactions
          .filter(tx => tx.status === 'completed' && tx.is_user_buyer)
          .map(tx => ({
            message: `✅ "${tx.listing.book.title}" אושר על ידי ${tx.seller.full_name}`,
            link: `/transaction`
          }));

        const reservedTx = transactions
          .filter(tx => tx.status === 'pending' && !tx.is_user_buyer)
          .map(tx => ({
            message: `📦 מישהו ביקש את "${tx.listing.book.title}" – עסקה פתוחה`,
            link: `/transaction`
          }));

        const allNotifications = [...unreadMessages, ...completedTx, ...reservedTx];
        setNotifications(allNotifications.slice(0, 6));
      } catch (err) {
        console.error('שגיאה בטעינת התראות:', err.message);
      }
    };

    fetchNotifications();
  }, []);

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
        console.error('שגיאה בטעינת עסקאות:', err);
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

        {userName && (
          <NotificationsWrapper>
            <NotificationIcon onClick={() => setShowNotifications(prev => !prev)}>
              🔔
            </NotificationIcon>

            {showNotifications && (
              <NotificationsBox>
                <NotificationTitle>📬 ההתראות שלך:</NotificationTitle>
                <ul style={{ margin: 0, padding: 0 }}>
                  {notifications.length === 0 ? (
                    <NotificationItem>אין התראות כרגע</NotificationItem>
                  ) : (
                    notifications.map((note, i) => (
                      <NotificationItem key={i} onClick={() => navigate(note.link)}>
                        {note.message}
                      </NotificationItem>
                    ))
                  )}
                </ul>
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

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <BookSection>
        <HomeBookGallery />
      </BookSection>

      <ReviewSection>
        <SectionTitle>📝 ביקורות אחרונות</SectionTitle>
        {/* קומפוננטת ביקורות */}
      </ReviewSection>
    </PageWrapper>
  );
}

export default Home;
