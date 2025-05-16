import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import {
  Wrapper, Card, Title, MessageTable, TableHeader,
  TableRow, TableCell, ChatLink, AvatarImage
} from '../styles/MessagesPage.styles';



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

      // איחוד שיחות עם אותו משתמש ואותו ספר
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
            new Date(existingRoom.created_at) > new Date(room.created_at)
              ? room
              : existingRoom;
          uniqueChatsMap.set(key, newerRoom); // אפשר לבחור גם לפי העדכני יותר
        }
      });

      const uniqueChats = Array.from(uniqueChatsMap.values());

      // מיון מהישן לחדש
      uniqueChats.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

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
        <Title>ההודעות שלך</Title>
        <MessageTable>
          <thead>
            <TableRow>
              <TableHeader>תמונה</TableHeader>
              <TableHeader>שם</TableHeader>
              <TableHeader>תאריך התחלה</TableHeader>
              <TableHeader>פרטי ספר</TableHeader>
              <TableHeader>צ'אט</TableHeader>
            </TableRow>
          </thead>
          <tbody>
           {chatRooms.map((room) => (
              <TableRow key={room.id} isUnread={room.unread_count > 0}>
                <TableCell>
                  <AvatarImage
                    src={room.other_user.avatar_url}
                    alt="avatar"
                  />
                </TableCell>
                <TableCell>{room.other_user.full_name}</TableCell>
                <TableCell>
                  {new Date(room.created_at).toLocaleDateString('he-IL')}
                </TableCell>
                <TableCell>
                  {room.listing.book?.title || '---'}
                </TableCell>
                <TableCell>
                  <ChatLink onClick={() => navigate(`/chat/${room.id}`)}>
                    המשך צ'אט
                  </ChatLink>
                </TableCell>
              </TableRow>
            ))}

          </tbody>
        </MessageTable>
      </Card>
    </Wrapper>
  );
};

export default MessagesPage;
