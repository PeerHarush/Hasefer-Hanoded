import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import {
  PageContainer,
  Title,
  Message,
  ActivityList,
  ActivityItem,
  ActivityDate,
  ActivityDescription,
} from '../styles/History.styles.js'


const PAGE_SIZE = 20;

const UserActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [visibleActivities, setVisibleActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

useEffect(() => {
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const userRes = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reviewsRes = await fetch(`${API_BASE_URL}/reviews`, {
  headers: { Authorization: `Bearer ${token}` },
});
const reviews = await reviewsRes.json();


      if (!userRes.ok) throw new Error('שגיאה בטעינת פרטי המשתמש');
      const userData = await userRes.json();

      const [transactionsRes, listingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/book-listings`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [transactions, listings] = await Promise.all([
        transactionsRes.json(),
        listingsRes.json(),
      ]);

      const activity = [];

      // 📝 הרשמה למערכת
      activity.push({
        type: 'signup',
        description: '🎉 נרשמת למערכת!',
        date: null,
      });

      // עסקאות
      transactions.forEach(tx => {
        const isUserBuyer = String(tx.buyer?.id) === userId;
        const isUserSeller = String(tx.seller?.id) === userId;

        if (isUserBuyer && tx.status === 'pending') {
          activity.push({
            type: 'reserve',
            description: `📌 שריינת את הספר "${tx.listing.book.title}"`,
            date: tx.created_at
          });
        }

        if (isUserBuyer && tx.status === 'completed') {
          activity.push({
            type: 'purchase',
            description: `✅ השלמת רכישה של "${tx.listing.book.title}"`,
            date: tx.created_at
          });
        }

        if (isUserSeller && tx.status === 'completed') {
          activity.push({
            type: 'sold',
            description: `💰 מכרת את הספר "${tx.listing.book.title}"`,
            date: tx.created_at
          });
        }
      });

      // ספרים שהוספת
      listings.forEach(listing => {
        if (String(listing.seller?.id) === String(userId)) {
          activity.push({
            type: 'add_book',
            description: `📚 הוספת את הספר "${listing.book.title}" למכירה`,
            date: listing.created_at
          });
        }
      });
      

      // מיון לפי תאריך מהחדש לישן
      activity.sort((b, a) => new Date(a.date) - new Date(b.date));
      setActivities(activity);
      setVisibleActivities(activity.slice(0, PAGE_SIZE));
    } catch (err) {
      console.error('שגיאה בטעינת פעילויות:', err);
      setError('אירעה שגיאה בטעינת הפעילויות');
    } finally {
      setLoading(false);
    }
  };

  if (token && userId) {
    fetchActivities();
  } else {
    setError('לא נמצא טוקן או מזהה משתמש');
    setLoading(false);
  }
}, [token, userId]);


  // טעינת עוד עמוד כשמגיעים לתחתית
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

      if (nearBottom && visibleActivities.length < activities.length) {
        const nextPage = page + 1;
        const nextItems = activities.slice(0, nextPage * PAGE_SIZE);
        setVisibleActivities(nextItems);
        setPage(nextPage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, activities, visibleActivities]);

  return (
  <PageContainer>

    <Title> היסטוריית הפעולות שלי</Title>

    {loading && <Message> טוען נתונים...🔄</Message>}
    {error && <Message error>⚠️ {error}</Message>}

    {!loading && !error && visibleActivities.length === 0 && (
      <Message>😕 לא נמצאו פעולות עבור המשתמש.</Message>
    )}

    <ActivityList>
      {visibleActivities.map((act, index) => (
        <ActivityItem key={index}>
          <ActivityDate>
          {act.date ? `🕓 ${new Date(act.date).toLocaleString('he-IL')}` : ''}
        </ActivityDate>

          <ActivityDescription>{act.description}</ActivityDescription>
        </ActivityItem>
      ))}
    </ActivityList>
  </PageContainer>
);

};

export default UserActivityPage;
