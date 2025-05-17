import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import {
  PageContainer,
  Title,
  TransactionBox,
  BookImage,
  InfoSection,
  Label,
  ConfirmButton,
  ButtonRow,
  TransactionsGrid,
  FilterWrapper
} from '../styles/Transaction.styles';
import { useNavigate } from 'react-router-dom';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('access_token');

  // טען עסקאות
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('שגיאה בטעינת עסקאות:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTransactions();
  }, [token]);

  // טען צ'אטים
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setChatRooms(data);
      } catch (err) {
        console.error('שגיאה בטעינת צ׳אטים:', err);
      }
    };

    if (token) fetchChats();
  }, [token]);

  // אישור עסקה
  const confirmTransaction = async (transactionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!res.ok) throw new Error("עדכון סטטוס נכשל");

      alert("העסקה סומנה כהושלמה!");
      window.location.reload();
    } catch (err) {
      alert("שגיאה באישור העסקה");
      console.error(err);
    }
  };

  // קיבוץ עסקאות כפולות
  const groupedTransactions = transactions.reduce((acc, tx) => {
    const key = `${tx.seller.id}-${tx.buyer.id}-${tx.listing.book.title}`;
    if (!acc[key]) {
      acc[key] = {
        ...tx,
        groupedIds: [tx.id],
        count: 1,
      };
    } else {
      acc[key].groupedIds.push(tx.id);
      acc[key].count += 1;
    }
    return acc;
  }, {});
  const groupedArray = Object.values(groupedTransactions);

  // סינון
  const filteredTransactions = groupedArray.filter(tx => {
    switch (filter) {
      case 'seller':
        return tx.is_user_buyer === false;
      case 'buyer':
        return tx.is_user_buyer === true;
      case 'pending':
      case 'completed':
      case 'cancelled':
        return tx.status === filter;
      case 'all':
      default:
        return true;
    }
  });

  // מיון
  const sortedTransactions = filteredTransactions.sort((a, b) => {
    const statusOrder = {
      pending: 0,
      completed: 1,
      cancelled: 2,
    };
    const statusCompare = statusOrder[a.status] - statusOrder[b.status];
    if (statusCompare !== 0) return statusCompare;

    if (filter === 'seller') {
      return a.listing.book.title.localeCompare(b.listing.book.title, 'he');
    }

    return 0;
  });

  // חיבור עסקאות לצ׳אטים
  const transactionsWithChat = sortedTransactions.map(tx => {
    const participants = [tx.buyer.id, tx.seller.id];

    const matchingChat = chatRooms.find(chat => {
      const otherId = chat.other_user?.id;
      return otherId && participants.includes(otherId);
    });

    return {
      ...tx,
      chat_room_id: matchingChat?.id || null
    };
  });

  // תרגום סטטוס
  const translateStatus = (status) => {
    switch (status) {
      case 'pending':
        return 'ממתין לאישור';
      case 'completed':
        return 'הושלמה';
      case 'cancelled':
        return 'בוטלה';
      default:
        return status;
    }
  };

  return (
    <PageContainer>
      <Title>העסקאות שלי</Title>

      <FilterWrapper>
        <label>סינון עסקאות: </label>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">הכל</option>
          <option value="seller">אני המוכר/ת</option>
          <option value="buyer">אני הקונה</option>
          <option value="pending">ממתינות</option>
          <option value="completed">שהושלמו</option>
          <option value="cancelled">שבוטלו</option>
        </select>
      </FilterWrapper>

      {transactionsWithChat.length === 0 ? (
        <p style={{ textAlign: 'center' }}>אין עסקאות תואמות לסינון הנבחר.</p>
      ) : (
        <TransactionsGrid>
          {transactionsWithChat.map(tx => (
            <TransactionBox key={tx.groupedIds.join('-')} status={tx.status}>
              <BookImage src={tx.listing.book.image_url} alt={tx.listing.book.title} />
              <InfoSection>
                <Label><strong>סטטוס:</strong> {translateStatus(tx.status)}</Label>
                <Label><strong>ספר:</strong> {tx.listing.book.title}</Label>
                <Label><strong>מחיר:</strong> {tx.listing.price} ₪</Label>
                <Label><strong>מוכר:</strong> {tx.seller.full_name}</Label>
                <Label><strong>קונה:</strong> {tx.buyer.full_name}</Label>
                <Label>
                  <strong>תאריך עסקה:</strong>{' '}
                  {new Date(tx.created_at).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Label>

                <ButtonRow>
                  {tx.status === 'pending' && tx.is_user_buyer === false && (
                    <ConfirmButton onClick={() => confirmTransaction(tx.groupedIds[0])}>
                      ✅ אשר שהעסקה הושלמה
                    </ConfirmButton>
                  )}

                  {tx.chat_room_id ? (
                    <ConfirmButton onClick={() => navigate(`/chat/${tx.chat_room_id}`)}>
                      💬 עבור לצ'אט
                    </ConfirmButton>
                  ) : (
                    <span style={{ color: 'gray', fontSize: '0.9em' }}>
                      אין צ'אט לעסקה זו
                    </span>
                  )}
                </ButtonRow>
              </InfoSection>
            </TransactionBox>
          ))}
        </TransactionsGrid>
      )}
    </PageContainer>
  );
};

export default TransactionsPage;
