import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';
import {
  ChatContainer,
  Header,
  Avatar,
  Messages,
  Message,
  InputArea,
  Input,
  SendButton,
  MessageTime,
} from '../styles/ChatPage.styles';

const ChatPage = () => {
  const { chatRoomId } = useParams();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [bookTitle, setBookTitle] = useState('');

  const messagesEndRef = useRef(null);

  // גלילה אוטומטית לתחתית ההודעות
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // הודעת ברירת מחדל אם מגיעים מדף הספר
  useEffect(() => {
    if (location.state?.sellerName && location.state?.bookTitle) {
      const defaultMessage = `היי ${location.state.sellerName}, אני מעוניין בספר שלך "${location.state.bookTitle}".\nמתי ניתן לתאם?`;
      setInput(defaultMessage);
    }
  }, [location.state]);

  // טען פרטי משתמש נוכחי
  useEffect(() => {
    if (!token) return;

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch current user');
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error('שגיאה בהבאת פרטי משתמש נוכחי', err);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // טען הודעות ופרטי חדר צ'אט
  useEffect(() => {
    if (!token) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('שגיאה בהבאת הודעות', err);
      }
    };

    const fetchChatRoom = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch chat rooms');
        const rooms = await res.json();
        const room = rooms.find(r => r.id === chatRoomId);
        if (room) {
          setOtherUser(room.other_user);
          setBookTitle(room.book_title || '');
        }
      } catch (err) {
        console.error('שגיאה בהבאת פרטי משתמש', err);
      }
    };

    fetchMessages();
    fetchChatRoom();
  }, [chatRoomId, token]);

  // שליחת הודעה
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      message: input,
      is_from_user: true,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      // הוספת ההודעה לסטייט מידית
      setMessages(prev => [newMessage, ...prev]);
      setInput('');
    } catch (err) {
      console.error('שגיאה בשליחת הודעה', err);
      // אפשר להוסיף התראה למשתמש כאן אם רוצים
    }
  }, [input, chatRoomId, token]);

  // שליחת הודעה בלחיצה על Enter (בלי שיפט)
  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatContainer>
      <Header>
        {otherUser && (
          <>
            <Avatar src={otherUser.avatar_url} alt="avatar" />
            <span>{otherUser.full_name}</span>
            {bookTitle && <span className="book-title"> | {bookTitle}</span>}
          </>
        )}
      </Header>

      <Messages>
        {messages.map(msg => (
          <Message key={msg.id} isMine={msg.is_from_user}>
            <div>{msg.message}</div>
            {msg.created_at && (
              <MessageTime isMine={msg.is_from_user}>
                {new Date(msg.created_at).toLocaleString('he-IL', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </MessageTime>
            )}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </Messages>

      <InputArea>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="כתוב הודעה..."
          rows={3}
        />
        <SendButton onClick={handleSend}>שלח</SendButton>
      </InputArea>
    </ChatContainer>
  );
};

export default ChatPage;
