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
  const [lastDetectedTime, setLastDetectedTime] = useState(null); // 🧠 שעת פגישה שנמצאה בטקסט

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // גלילה אוטומטית להתחלת השיחה
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [messages]);

  // שליחת הודעה אוטומטית לפי state שהועבר ב־navigate
  useEffect(() => {
    if (location.state?.sellerName && location.state?.bookTitle) {
      const defaultMessage = `היי ${location.state.sellerName}, אני מעוניין בספר שלך "${location.state.bookTitle}".\nמתי ניתן לתאם?`;
      setInput(defaultMessage);

      if (location.state.autoSend) {
        sendInitialMessage(defaultMessage);
      }
    }
  }, [location.state]);

  // שליחת ההודעה הראשונה
  const sendInitialMessage = async (message) => {
    if (!token || !chatRoomId || !message) return;

    try {
      const res = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error('Failed to send initial message');

      const newMessage = {
        id: Date.now(),
        message,
        is_from_user: true,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [newMessage, ...prev]);
      setInput('');
    } catch (err) {
      console.error('שגיאה בשליחת ההודעה הראשונה', err);
    }
  };

  // טעינת הודעות ופרטי הצ'אט
  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        // טעינת הודעות
        const messagesRes = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!messagesRes.ok) throw new Error('Failed to fetch messages');
        const messagesData = await messagesRes.json();
        setMessages(messagesData);

        // שמירה של ההודעה האחרונה ב־localStorage
        if (messagesData.length > 0) {
          const lastMessage = messagesData[0];
          localStorage.setItem(
            `last_message_${chatRoomId}`,
            JSON.stringify({
              message: lastMessage.message,
              created_at: lastMessage.created_at
            })
          );

          detectTimeInMessages(messagesData); // ניסיון לזהות שעה מתוך ההודעות
        }

        // טעינת פרטי חדר הצ׳אט
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

  // שליחת הודעה רגילה
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

  // זיהוי אם קיימת שעה בטקסטים של ההודעות
  const detectTimeInMessages = (messagesData) => {
    if (!messagesData || messagesData.length === 0) {
      setLastDetectedTime(null);
      return;
    }
    const timeRegex = /(^|\s)([01]?\d|2[0-3])(:[0-5]\d)?(\s?(AM|PM))?(\s|$)/i;
    for (const msg of messagesData) {
      const match = msg.message.match(timeRegex);
      if (match) {
        setLastDetectedTime(match[2] + (match[3] || ':00'));
        return;
      }
    }
    setLastDetectedTime(null);
  };

  // פתיחת Google Calendar עם שעה שנמצאה בטקסט
  const openGoogleCalendar = () => {
    if (!lastDetectedTime) return;

    const today = new Date();
    const [hourStr, minuteStr] = lastDetectedTime.split(':');
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hourStr), parseInt(minuteStr || '0'));
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // שעה אחת קדימה

    const toISOStringNoSeconds = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const dates = `${toISOStringNoSeconds(startDate)}/${toISOStringNoSeconds(endDate)}`;

    const title = `פגישה עם ${otherUser?.full_name || 'המשתמש'}`;

    const url = new URL('https://calendar.google.com/calendar/render?action=TEMPLATE');
    url.searchParams.set('text', title);
    url.searchParams.set('dates', dates);
    url.searchParams.set('details', 'תיאום פגישה דרך אפליקציית הצ׳אט');
    url.searchParams.set('sf', 'true');
    url.searchParams.set('output', 'xml');

    window.open(url.toString(), '_blank');
  };

  // שליחה גם בלחיצה על אנטר
  const handleKeyPress = (e) => {
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

        <Messages ref={messagesContainerRef}>
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

        {/* כפתור תיאום ביומן אם נמצאה שעה בטקסט */}
        {lastDetectedTime && (
          <SendButton onClick={openGoogleCalendar} style={{ marginTop: '8px', backgroundColor: '#4285F4' }}>
            תאם ביומן
          </SendButton>
        )}
      </ChatContainer>
    </ChatWrapper>
  );
};

export default ChatPage;
