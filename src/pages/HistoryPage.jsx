import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';

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
        const [transactionsRes, listingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/book-listings`, { headers: { Authorization: `Bearer ${token}` } }),

        ]);

        const [transactions, listings] = await Promise.all([
          transactionsRes.json(),
          listingsRes.json(),
        ]);

        const activity = [];

        // עסקאות
        transactions.forEach(tx => {
          if (String(tx.buyer?.id) === userId && tx.status === 'pending') {
            activity.push({
              type: 'reserve',
              description: `📌 שריינת את הספר "${tx.listing.book.title}"`,
              date: tx.created_at
            });
          }
          if (String(tx.buyer?.id) === userId && tx.status === 'completed') {
            activity.push({
              type: 'purchase',
              description: `✅ השלמת רכישה של "${tx.listing.book.title}"`,
              date: tx.updated_at
            });
          }
          if (String(tx.seller?.id) === userId && tx.status === 'completed') {
            activity.push({
              type: 'sold',
              description: `💰 מכרת את הספר "${tx.listing.book.title}"`,
              date: tx.updated_at
            });
          }
        });

    

        // ספרים שהוספת
        listings.forEach(listing => {
          if (String(listing.owner?.id) === userId) {
            activity.push({
              type: 'add_book',
              description: `📚 הוספת את הספר "${listing.book.title}" למכירה`,
              date: listing.created_at
            });
          }
        });

       

    

        activity.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2>📖 היסטוריית הפעולות שלי</h2>

      {loading && <p>🔄 טוען נתונים...</p>}
      {error && <p style={{ color: 'red' }}>⚠️ {error}</p>}

      {!loading && !error && visibleActivities.length === 0 && (
        <p>😕 לא נמצאו פעולות עבור המשתמש.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {visibleActivities.map((act, index) => (
          <li
            key={index}
            style={{
              background: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              direction: 'rtl',
              lineHeight: '1.6'
            }}
          >
            <div style={{ fontSize: '0.9rem', color: '#888' }}>
              🕓 {new Date(act.date).toLocaleString('he-IL')}
            </div>
            <div style={{ fontWeight: '500' }}>{act.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserActivityPage;
