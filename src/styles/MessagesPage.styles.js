import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 20px;
`;

export const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  width: 100%;
`;

export const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
`;

export const MessageTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

export const TableHeader = styled.th`
  padding: 12px 15px;
  text-align: center;  /* הוספת סגנון למרכז את הכותרת */
  background-color: #f2f2f2;
  color: #333;
`;

export const TableCell = styled.td`
  padding: 12px 15px;
  text-align: center;  /* מרכז את התוכן בתוך כל תא */
`;

export const ChatLink = styled.a`
  color: #0066cc;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

export const AvatarImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;


export const UnreadIndicator = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
  display: inline-block;
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid #ddd;
  background-color: ${({ isUnread }) => (isUnread ? '#fff6f6' : 'transparent')}; /* גוון אדמדם עדין */
`;
