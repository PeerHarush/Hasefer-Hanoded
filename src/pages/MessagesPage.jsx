import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import {
  Wrapper, Card, Title, AvatarImage, ChatCard,
  ChatContent, ChatHeader, UserName, ChatDate,
  BookTitle, 
} from '../styles/MessagesPage.styles';
import BackButton from '../components/BackButton.js'



const MessagesPage = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const uniqueChatsMap = new Map();

        data.forEach((room) => {
          const userId = room.other_user?.id;
          const bookId = room.listing?.book?.id;
          const key = `${userId}-${bookId}`;

          if (!uniqueChatsMap.has(key)) {
            uniqueChatsMap.set(key, room);
          } else {
            const existingRoom = uniqueChatsMap.get(key);
            const newerRoom =
              new Date(existingRoom.created_at) < new Date(room.created_at)
                ? room
                : existingRoom;
            uniqueChatsMap.set(key, newerRoom);
          }
        });

        const uniqueChats = Array.from(uniqueChatsMap.values());
        uniqueChats.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setChatRooms(uniqueChats);
      } catch (err) {
        console.error('שגיאה בהבאת שיחות:', err);
      }
    };

    if (token) fetchChatRooms();
  }, [token]);
  

  return (
  <Wrapper>
    <Card>
      <Title>הודעות</Title>
<BackButton /> 
      {chatRooms.map((room) => (
        <ChatCard
          key={room.id}
          $isUnread={room.unread_count > 0}
          onClick={() => navigate(`/chat/${room.id}`)}
        >
          <AvatarImage src={room.other_user.avatar_url} alt="avatar" />
          <ChatContent>
            <ChatHeader>
              <UserName>{room.other_user.full_name}</UserName>
              <ChatDate>
                <small>הודעה אחרונה:</small>{' '}
                {room.last_message?.created_at
                  ? new Date(room.last_message.created_at).toLocaleDateString('he-IL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '---'}
              </ChatDate>
            </ChatHeader>
            <BookTitle>{room.listing.book?.title || '---'}</BookTitle>
          </ChatContent>
        </ChatCard>
      ))}
    </Card>
  </Wrapper>
);

};

export default MessagesPage;
