import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: sans-serif;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  background: #e7e7e7;
  padding: 10px;
  gap: 10px;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

export const Messages = styled.div`
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  background: #f5f5f5;
`;

export const Message = styled.div`
  max-width: 70%;
  margin: 5px;
  padding: 10px;
  border-radius: 12px;
  align-self: ${props => (props.isMine ? 'flex-start' : 'flex-end')};
  background: ${props => (props.isMine ? '#dcf8c6' : '#fff')};
  border: 1px solid #ccc;
  text-align: ${props => (props.isMine ? 'right' : 'left')};
  direction: rtl;
`;




export const InputArea = styled.div`
  display: flex;
  padding: 10px;
  background: #fff;
  border-top: 1px solid #ccc;
`;

export const Input = styled.input`
  flex: 1;
  padding: 10px;
  font-size: 16px;
`;

export const SendButton = styled.button`
  padding: 10px 15px;
  margin-right: 10px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
`;

export const MessageTime = styled.div`
  font-size: 0.75em;
  color: #777;
  margin-top: 5px;
  text-align: ${props => (props.isMine ? 'right' : 'left')};
`;
