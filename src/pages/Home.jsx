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
 
  
} from '../styles/Home.styles';

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recycledCount, setRecycledCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [readNotificationIds, setReadNotificationIds] = useState([]);

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
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 8); 

        setNotifications(allNotifications);
        setUnreadNotifications(allNotifications.filter(note => note.isUnread).length);
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
          headers: { Authorization: `Bearer ${token}` },
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
              <ul style={{ margin: 0, padding: 0 }}>
                {notifications.length === 0 ? (
                  <NotificationItem>אין התראות כרגע</NotificationItem>
                ) : (
                  notifications.map((note) => (
                    <NotificationItem
                      key={note.id}
                      $isUnread={note.isUnread}
                      $type={note.type}
                    >
                      <div onClick={() => navigate(note.link)} style={{ flex: 1, cursor: 'pointer' }}>
                        {note.message}
                      </div>

                      {note.isUnread && (
                        <MarkAsReadIcon onClick={() => markAsRead(note.id)} title="סמן כהודעה שנקראה">
                          ✔️
                        </MarkAsReadIcon>
                      )}
                    </NotificationItem>
                  ))
                )}
              </ul>

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

    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

    <BookSection>
      <HomeBookGallery />
    </BookSection>

    <ReviewSection>
      <SectionTitle>📝 המלצות וביקורות ספרים</SectionTitle>
    </ReviewSection>
  </PageWrapper>
);

}

export default Home;
