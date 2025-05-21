import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;

  @media (max-width: 768px) {
    padding-top: 20px;
  }
`;


export const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  
  width: 100%;

  
  
`;

export const Title = styled.h2`
  text-align: center;
  color: rgb(144, 83, 8);
  margin-bottom: 1.5rem; 
  
  
`;

export const AvatarImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

export const ChatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: ${({ isUnread }) => (isUnread ? '#fdecea' : '#f4f4f4')};
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  transition: background-color 0.3s, box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    background-color: ${({ isUnread }) => (isUnread ? '#ffe9e9' : '#dcdcdc')};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
`;

export const ChatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
 
`;

export const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  
`;

export const UserName = styled.div`
  font-weight: bold;
  font-size: 18px;
  color: #333;
  
`;

export const ChatDate = styled.div`
  font-size: 14px;
  color: #777;
`;

export const BookTitle = styled.div`
  font-size: 16px;
  color: #555;
  
`;
