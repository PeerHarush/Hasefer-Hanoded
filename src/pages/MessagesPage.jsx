import React from 'react';
import { Wrapper, Card, Title, MessageTable, TableHeader, TableRow, TableCell, ChatLink } from '../styles/MessagesPage.styles';

const MessagesPage = () => {
  // דוגמה להודעות שיתחלפו בנתונים אמיתיים בהמשך
  const messages = [
    {
      id: 1,
      name: 'יוני כהן',
      lastMessageDate: '01/05/2025',
      lastMessage: 'שלום, אני מעוניינת בספר "הארי פוטר". האם הוא עדיין זמין?',
    },
    {
      id: 2,
      name: 'מיכל לוי',
      lastMessageDate: '02/05/2025',
      lastMessage: 'כן, הספר עדיין זמין. איפה תרצי להיפגש?',
    },
    {
      id: 3,
      name: 'דני ישראלי',
      lastMessageDate: '03/05/2025',
      lastMessage: 'נפלא, אפשר בתחנת רכבת מרכז ביום רביעי?',
    },
  ];

  return (
    <Wrapper>
      <Card>
        <Title>ההודעות שלך</Title>
        <MessageTable>
          <thead>
            <TableRow>
              <TableHeader>שם</TableHeader>
              <TableHeader>תאריך הודעה אחרונה</TableHeader>
              <TableHeader>תוכן ההודעה האחרונה</TableHeader>
              <TableHeader>צ'אט</TableHeader> {/* עמודה חדשה */}
            </TableRow>
          </thead>
          <tbody>
            {messages.map((msg) => (
              <TableRow key={msg.id}>
                <TableCell>{msg.name}</TableCell>
                <TableCell>{msg.lastMessageDate}</TableCell>
                <TableCell>{msg.lastMessage}</TableCell>
                <TableCell>
                  <ChatLink href="#">צ'אט</ChatLink> {/* קישור לצ'אט */}
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
