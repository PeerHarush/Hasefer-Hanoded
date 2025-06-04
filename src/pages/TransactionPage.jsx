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
  DeleteIconButton,
  ButtonRow,
  TransactionsGrid,
  FilterWrapper
} from '../styles/Transaction.styles';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Modal, Button } from 'react-bootstrap';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const renderCancelTooltip = (props) => (
    <Tooltip id="cancel-tooltip" {...props}>
      לביטול העסקה הזו
    </Tooltip>
  );

  const handleCancelClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setShowCancelModal(true);
  };

  const confirmCancelTransaction = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${selectedTransactionId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!res.ok) throw new Error("ביטול העסקה נכשל");

      alert("העסקה בוטלה בהצלחה.");
      setShowCancelModal(false);
      setSelectedTransactionId(null);
    } catch (err) {
      alert("שגיאה בביטול העסקה");
      console.error(err);
    }
  };

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

    if (token) {
      fetchTransactions();
      fetchChats();
    }
  }, [token]);

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

    // שלוף את העותק (listing) לפי העסקה
    const transaction = transactions.find(tx => tx.id === transactionId);
    const listingId = transaction?.listing?.id;

    if (listingId) {
      // מחיקת העותק או סימון כלא זמין:
      await fetch(`${API_BASE_URL}/book-listings/${listingId}`, {
        method: 'DELETE', // אם אתה מעדיף למחוק ממש
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // או לחילופין, עדכון זמינות:
      // await fetch(`${API_BASE_URL}/book-listings/${listingId}`, {
      //   method: 'PUT',
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ is_available: false }),
      // });
    }

    setShowSuccessModal(true);
  } catch (err) {
    alert("שגיאה באישור העסקה");
    console.error(err);
  }
};



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

  const filteredTransactions = Object.values(groupedTransactions).filter(tx => {
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

  const sortedTransactions = filteredTransactions.sort((a, b) => {
    const statusOrder = { pending: 0, completed: 1, cancelled: 2 };
    const diff = statusOrder[a.status] - statusOrder[b.status];
    return diff !== 0 ? diff : a.listing.book.title.localeCompare(b.listing.book.title, 'he');
  });

  const transactionsWithChat = sortedTransactions.map(tx => {
    const participants = [tx.buyer.id, tx.seller.id];
    const matchingChat = chatRooms.find(chat =>
      participants.includes(chat.other_user?.id)
    );

    return { ...tx, chat_room_id: matchingChat?.id || null };
  });

  const translateStatus = (status) => {
    switch (status) {
      case 'pending': return 'ממתין לאישור';
      case 'completed': return 'הושלמה';
      case 'cancelled': return 'בוטלה';
      default: return status;
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

      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header>
          <Modal.Title>לבטל את העסקה? </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          בטוח שאתה רוצה לבטל את העסקה הזו?<br />
          שים לב, ביטול העסקה לא ימחק את העותק של הספר
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            ביטול
          </Button>
          <Button variant="danger" onClick={confirmCancelTransaction}>
            כן, בטל
          </Button>
        </Modal.Footer>
      </Modal>

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
                 <Label>
                    {tx.listing.price === 0
                      ? 'למסירה'
                      : <>
                          <strong>מחיר:</strong> {tx.listing.price} ₪
                        </>
                    }
                  </Label>

                <Label><strong>מוכר:</strong> {tx.seller.full_name}</Label>
                <Label><strong>קונה:</strong> {tx.buyer.full_name}</Label>
                    {tx.status === 'completed' && (
                      <Label>
                        <strong>תאריך עסקה:</strong>{' '}
                        {new Date(tx.created_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Label>
                    )}


                <ButtonRow>
                  {tx.status === 'pending' && !tx.is_user_buyer && (
                    <>
                      <ConfirmButton onClick={() => confirmTransaction(tx.groupedIds[0])}>
                        ✅ אשר שהעסקה הושלמה
                      </ConfirmButton>

                      <OverlayTrigger placement="top" overlay={renderCancelTooltip}>
                        <DeleteIconButton onClick={() => handleCancelClick(tx.groupedIds[0])}>
                          <FaTrashAlt />
                        </DeleteIconButton>
                      </OverlayTrigger>
                    </>
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

<Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
  <Modal.Header>
    <Modal.Title>העסקה הושלמה ✅</Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ textAlign: 'center' }}>
    סימנת בהצלחה שהעסקה הושלמה! 🎉<br />
    קיבלת על כך 30 נקודות 🪙
  </Modal.Body>
  <Modal.Footer>
    <Button variant="success" onClick={() => {
      setShowSuccessModal(false);
      window.location.reload();
    }}>
      סגור
    </Button>
  </Modal.Footer>
</Modal>
    </PageContainer>
  );
};

export default TransactionsPage;
