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
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/users/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('שגיאה בשליפת היסטוריית פעילות');

        const data = await res.json();
        const allActivities = Array.isArray(data.activities) ? data.activities : [];

        // נתרגם פעולות ונקודות לעברית
const translated = allActivities
  .filter(act =>
    act.type !== 'message_sent' &&
    !act.description?.toLowerCase().includes('sent a message')
  )
  .map((act) => {
          const bookTitle = act.details?.book?.title || '';
          
          switch (act.type) {
            case 'comment_created':
              return { ...act, description: `✍️ כתבת ביקורת על "${bookTitle}"` };
            case 'comment_updated':
              return { ...act, description: `✏️ עדכנת ביקורת על "${bookTitle}"` };
            case 'listing_created':
              return { ...act, description: `📚 הוספת את הספר "${bookTitle}" למכירה` };
            case 'transaction_buyer':
              if (act.details.status === 'pending') return { ...act, description: `📌 שריינת את "${bookTitle}"` };
              if (act.details.status === 'completed') return { ...act, description: `✅ השלמת רכישה של "${bookTitle}"` };
              if (act.details.status === 'cancelled') return { ...act, description: `❌ הביטול שלך ל-"${bookTitle}" התקבל` };
              break;
            case 'transaction_seller':
              if (act.details.status === 'pending') return { ...act, description: `📩 קיבלת בקשת שריון ל-"${bookTitle}"` };
              if (act.details.status === 'completed') return { ...act, description: `💰 מכרת את הספר "${bookTitle}"` };
              if (act.details.status === 'cancelled') return { ...act, description: `❌ ביטלת את העסקה עבור "${bookTitle}"` };
              break;
            case 'wishlist_added':
              return { ...act, description: `💖 הוספת את "${bookTitle}" לרשימת המשאלות שלך` };
           
            case 'points_earned':
              const points = act.details?.points || 0;
              const reason = act.details?.reason || '';
              return {
                ...act,
                description: `🪙 קיבלת ${points} נקודות - ${translateReason(reason, bookTitle)}`
              };
            default:
              return act;
          }
          return act;
        });

        const actions = translated.filter(act => act.type !== 'points_earned');
        const points = translated.filter(act => act.type === 'points_earned');

        actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        points.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setActivities(actions);
        setPointsHistory(points);
        setVisibleActivities(actions.slice(0, PAGE_SIZE));
      } catch (err) {
        console.error('שגיאה:', err);
        setError('אירעה שגיאה בטעינת הנתונים');
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchActivityData();
    } else {
      setError('לא נמצא טוקן או מזהה משתמש');
      setLoading(false);
    }
  }, [token, userId]);

  const translateReason = (reason, bookTitle) => {
    switch (reason) {
      case 'Account registration':
        return 'על הרשמה למערכת';
      case 'Created listing':
        return `על הוספת "${bookTitle}" למכירה`;
      case 'Added comment':
        return `על כתיבת ביקורת ל-"${bookTitle}"`;
      case 'Added rating':
        return `על דירוג של "${bookTitle}"`;
      case 'Completed transaction as buyer':
        return `על רכישת "${bookTitle}"`;
      case 'Completed transaction as seller':
        return `על מכירת "${bookTitle}"`;
      default:
        return reason;
    }
  };

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
      <Title>{viewMode === 'activity' ? 'היסטוריית הפעולות שלי' : 'היסטוריית הנקודות שלי'}</Title>

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
              <ActivityDate>{act.timestamp ? `🕓 ${new Date(act.timestamp).toLocaleString('he-IL')}` : ''}</ActivityDate>
              <ActivityDescription>{act.description}</ActivityDescription>
            </ActivityItem>
          ))}
        </ActivityList>
      )}

      {viewMode === 'points' && (
        <ActivityList>
          {pointsHistory.map((pt, index) => (
            <ActivityItem key={index}>
              <ActivityDate>{pt.timestamp ? `🕓 ${new Date(pt.timestamp).toLocaleString('he-IL')}` : ''}</ActivityDate>
              <ActivityDescription>{pt.description}</ActivityDescription>
            </ActivityItem>
          ))}
        </ActivityList>
      )}
    </PageContainer>
  );
};

export default UserActivityPage;
