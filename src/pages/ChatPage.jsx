import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(null);

  const token = localStorage.getItem('access_token');

  // טען הודעות
  useEffect(() => {
    if (!token) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
        const rooms = await res.json();
        const room = rooms.find(r => r.id === chatRoomId);
        if (room) setOtherUser(room.other_user);
      } catch (err) {
        console.error('שגיאה בהבאת פרטי משתמש', err);
      }
    };

    fetchMessages();
    fetchChatRoom();
  }, [chatRoomId, token]);

  // שליחת הודעה
  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      await fetch(`${API_BASE_URL}/chats/${chatRoomId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      setMessages(prev => [
        { message: input, is_from_user: true, id: Date.now() },
        ...prev,
      ]);
      setInput('');
    } catch (err) {
      console.error('שגיאה בשליחת הודעה', err);
    }
  };

  return (
    <ChatContainer>
      <Header>
        {otherUser && (
          <>
                    <Avatar
                    src={otherUser?.avatar_url}
                    alt="avatar"
                    />
            <span>{otherUser.full_name}</span>
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
</Messages>



      <InputArea>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="כתוב הודעה..."
        />
        <SendButton onClick={handleSend}>שלח</SendButton>
      </InputArea>
    </ChatContainer>
  );
};

export default ChatPage;
