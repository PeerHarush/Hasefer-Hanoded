import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import API_BASE_URL from '../config';

import {
  ChatContainer,
  Header,
  Avatar,
    ChatWrapper,   
  Messages,
  Message,
  MessageTime,
  InputArea,
  Input,
  SendButton,
} from '../styles/ChatPage.styles';

const ChatPage = () => {
  const { chatRoomId } = useParams();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [bookTitle, setBookTitle] = useState('');

  const messagesEndRef = useRef(null);

  // גלילה אוטומטית לתחתית
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // טען הודעה ראשונית אם הגענו מהמסך עם מידע על הספר והמוכר
  useEffect(() => {
    if (location.state?.sellerName && location.state?.bookTitle) {
      const defaultMessage = `היי ${location.state.sellerName}, אני מעוניין בספר שלך "${location.state.bookTitle}".\nמתי ניתן לתאם?`;
      setInput(defaultMessage);
    }
  }, [location.state]);

  // טען הודעות והגדר פרטי משתמש שני וכותרת הספר
  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        // הודעות הצ'אט
        const messagesRes = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!messagesRes.ok) throw new Error('Failed to fetch messages');
        const messagesData = await messagesRes.json();
        setMessages(messagesData);

        // פרטי חדר הצ'אט - משתמש שני, כותרת ספר
        const chatsRes = await fetch(`${API_BASE_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!chatsRes.ok) throw new Error('Failed to fetch chats');
        const chatsData = await chatsRes.json();
        const room = chatsData.find(r => r.id === chatRoomId);
        if (room) {
          setOtherUser(room.other_user);
          setBookTitle(room.book_title || '');
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [chatRoomId, token]);

  // שליחת הודעה
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

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

      // הוספת ההודעה למצב ההודעות בצד הלקוח (הנחה שהשרת ישלח לנו גם הודעות חדשות בהמשך)
      const newMessage = {
        id: Date.now(),
        message: input,
        is_from_user: true,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [newMessage, ...prev]);
      setInput('');
    } catch (err) {
      console.error('שגיאה בשליחת הודעה', err);
    }
  }, [input, chatRoomId, token]);

  // שליחת הודעה בלחיצה על Enter בלי Shift
  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
  <ChatWrapper>
    <ChatContainer>
      <Header>
        {otherUser && (
          <>
            <Avatar src={otherUser.avatar_url} alt="avatar" />
            <span>{otherUser.full_name}</span>
            {bookTitle && <span> | {bookTitle}</span>}
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
          rows={2}
        />
        <SendButton onClick={handleSend}>שלח</SendButton>
      </InputArea>
    </ChatContainer>
  </ChatWrapper>
);
}

export default ChatPage;
