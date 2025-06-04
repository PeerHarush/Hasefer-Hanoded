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
  ButtonsContainer,
  Button
} from '../styles/History.styles.js';

const PAGE_SIZE = 20;

const UserActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [visibleActivities, setVisibleActivities] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('activity'); // 'activity' or 'points'

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, reviewsRes, transactionsRes, listingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/reviews`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/book-listings`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (!userRes.ok) throw new Error('שגיאה בטעינת פרטי המשתמש');

        const [transactions, listings, reviewsRaw] = await Promise.all([
          transactionsRes.json(),
          listingsRes.json(),
          reviewsRes.json()
        ]);

        const reviews = Array.isArray(reviewsRaw) ? reviewsRaw : [];

        const activity = [];
        const points = [];

        // הרשמה
        activity.push({ type: 'signup', description: '🎉 נרשמת למערכת!', date: null });
        points.push({ description: '🎉 קיבלת 10 נקודות על הרשמה', date: null, points: 10 });

        transactions.forEach(tx => {
          const isBuyer = String(tx.buyer?.id) === userId;
          const isSeller = String(tx.seller?.id) === userId;

          if (isBuyer && tx.status === 'completed') {
            activity.push({
              type: 'purchase',
              description: `✅ השלמת רכישה של "${tx.listing.book.title}"`,
              date: tx.created_at
            });
            points.push({
              description: `✅ קיבלת 20 נקודות על רכישת "${tx.listing.book.title}"`,
              date: tx.created_at,
              points: 20
            });
          }

          if (isSeller && tx.status === 'completed') {
            activity.push({
              type: 'sold',
              description: `💰 מכרת את הספר "${tx.listing.book.title}"`,
              date: tx.created_at
            });
            points.push({
              description: `💰 קיבלת 30 נקודות על מכירת "${tx.listing.book.title}"`,
              date: tx.created_at,
              points: 30
            });
          }

          if (isBuyer && tx.status === 'pending') {
            activity.push({
              type: 'reserve',
              description: `📌 שריינת את הספר "${tx.listing.book.title}"`,
              date: tx.created_at
            });
          }
        });

        listings.forEach(listing => {
          if (String(listing.seller?.id) === String(userId)) {
            activity.push({
              type: 'add_book',
              description: `📚 הוספת את הספר "${listing.book.title}" למכירה`,
              date: listing.created_at
            });
            points.push({
              description: `📚 קיבלת 50 נקודות על הוספת "${listing.book.title}"`,
              date: listing.created_at,
              points: 50
            });
          }
        });

        reviews.forEach(review => {
          if (String(review.user_id) === userId) {
            points.push({
              description: `✍️ קיבלת 30 נקודות על כתיבת ביקורת על "${review.book_title}"`,
              date: review.created_at,
              points: 30
            });
          }
        });

        activity.sort((a, b) => new Date(b.date) - new Date(a.date));
        points.sort((a, b) => new Date(b.date) - new Date(a.date));

        setActivities(activity);
        setPointsHistory(points);
        setVisibleActivities(activity.slice(0, PAGE_SIZE));
      } catch (err) {
        console.error('שגיאה בטעינת פעילויות:', err);
        setError('אירעה שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchData();
    } else {
      setError('לא נמצא טוקן או מזהה משתמש');
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (viewMode !== 'activity') return;
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
  }, [page, activities, visibleActivities, viewMode]);

  return (
    <PageContainer>
      <Title> {viewMode === 'activity' ? 'היסטוריית הפעולות שלי' : 'היסטוריית הנקודות שלי'}</Title>

      <ButtonsContainer>
        <Button onClick={() => setViewMode('activity')} disabled={viewMode === 'activity'}>
          היסטוריית פעולות
        </Button>
        <Button onClick={() => setViewMode('points')} disabled={viewMode === 'points'}>
          היסטוריית נקודות
        </Button>
      </ButtonsContainer>

      {loading && <Message>🔄 טוען נתונים...</Message>}
      {error && <Message error={!!error}>⚠️ {error}</Message>}

      {!loading && !error && viewMode === 'activity' && visibleActivities.length === 0 && (
        <Message>😕 לא נמצאו פעולות</Message>
      )}
      {!loading && !error && viewMode === 'points' && pointsHistory.length === 0 && (
        <Message>😕 לא נמצאו נקודות</Message>
      )}

      {viewMode === 'activity' && (
        <ActivityList>
          {visibleActivities.map((act, index) => (
            <ActivityItem key={index}>
              <ActivityDate>{act.date ? `🕓 ${new Date(act.date).toLocaleString('he-IL')}` : ''}</ActivityDate>
              <ActivityDescription>{act.description}</ActivityDescription>
            </ActivityItem>
          ))}
        </ActivityList>
      )}

      {viewMode === 'points' && (
        <ActivityList>
          {pointsHistory.map((pt, index) => (
            <ActivityItem key={index}>
              <ActivityDate>{pt.date ? `🕓 ${new Date(pt.date).toLocaleString('he-IL')}` : ''}</ActivityDate>
              <ActivityDescription>{pt.description}</ActivityDescription>
            </ActivityItem>
          ))}
        </ActivityList>
      )}
    </PageContainer>
  );
};

export default UserActivityPage;
