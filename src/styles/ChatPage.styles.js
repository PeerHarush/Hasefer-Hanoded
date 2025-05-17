import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* גובה מדויק שיכנס בדיוק בין התפריטים */
  height: calc(100vh - 140px); 
  max-width: 1200px;
  margin: 20px auto; /* מרווח שווה מלמעלה ולמטה */
  background-color: #fdfdfd;
  border: 1px solid #ddd;
  border-radius: 16px;
  box-shadow: 0 0 12px rgba(0,0,0,0.05);
  overflow: hidden; /* מונע גלילה בתוך הקונטיינר */
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  gap: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
`;

export const Avatar = styled.img`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
`;

export const Messages = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
`;

export const Message = styled.div`
  max-width: 60%;
  margin: 10px 0;
  padding: 14px 18px;
  border-radius: 20px;
  align-self: ${props => (props.isMine ? 'flex-start' : 'flex-end')};
  background: ${props => (props.isMine ? '#daf8e3' : '#ffffff')};
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  text-align: ${props => (props.isMine ? 'right' : 'left')};
  direction: rtl;
  white-space: pre-wrap;
  line-height: 1.5;
`;

export const MessageTime = styled.div`
  font-size: 0.75em;
  color: #888;
  margin-top: 6px;
  text-align: ${props => (props.isMine ? 'right' : 'left')};
`;

export const InputArea = styled.div`
  display: flex;
  padding: 15px 20px;
  background: #fff;
  border-top: 1px solid #ddd;
  align-items: center;
`;

export const Input = styled.textarea`
  flex: 1;
  padding: 12px 14px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  font-family: inherit;
  outline: none;
  &:focus {
    border-color: rgb(207, 167, 117);
  }
`;

export const SendButton = styled.button`
  margin-right: 12px;
  padding: 10px 16px;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: rgb(215, 184, 146);
  &:hover {
    background: rgb(241, 206, 162);
  }
`;