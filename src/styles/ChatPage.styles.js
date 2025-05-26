import styled from 'styled-components';



export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fdfdfd;
  border: 1px solid #ddd;
  border-radius: 16px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
  width: 95%;
  height: 80vh;
  overflow: hidden;

  @media (max-width: 768px) {
    max-width: 90%;
    align-self: center;
    border-radius: 0;
    box-shadow: none;
  }
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

  @media (max-width: 600px) {
    padding: 12px 16px;
    font-size: 1rem;
  }
`;

export const Avatar = styled.img`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;

  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
  }
`;

export const ChatWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  height: calc(100vh - 100px); 
  box-sizing: border-box;
  background-color: #fefaf2;
  margin-top: 60px; 
   @media (max-width: 768px) {
    margin-top: 0; 
  }
`;


export const Messages = styled.div`
   flex: 1;
    padding: 20px;
  display: flex;
  flex-direction: column; /* <--- CHANGE THIS LINE FROM column-reverse to column */
  overflow-y: auto;    
  min-height: 0;        
  

  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
`;

export const Message = styled.div`
  max-width: 60%;
  margin: 5px 0;
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

  @media (max-width: 600px) {
    max-width: 90%;
    font-size: 14px;
    padding: 12px 14px;
  }
`;

export const MessageTime = styled.div`
  font-size: 0.75em;
  color: #888;
  margin-top: 6px;
  text-align: ${props => (props.isMine ? 'right' : 'left')};

  @media (max-width: 600px) {
    font-size: 0.7em;
  }
`;

export const InputArea = styled.div`
  display: flex;
  padding: 15px 20px;
  background: #fff;
  border-top: 1px solid #ddd;
  align-items: center;

  @media (max-width: 600px) {
    padding: 12px 16px;
  }
`;
export const Input = styled.textarea`
  flex: 1;
  padding: 12px 14px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: none;
  min-height: 48px;
  outline: none;

  &:focus {
    border-color: rgb(207, 167, 117);
  }

  @media (max-width: 600px) {
    font-size: 14px;
    padding: 10px 12px;
    min-height: 40px;
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
   background-color: rgb(241, 206, 162);

  &:hover {
     background-color: rgb(247, 192, 126);
  }

  @media (max-width: 600px) {
    padding: 8px 12px;
    font-size: 14px;
  }
`;

export const CalendarButton = styled.button`
   margin-right: 12px;
  padding: 10px 16px;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  background-color:rgb(126, 155, 176); 

  transition: background-color 0.2s ease;

  &:hover {
    background-color:  rgb(149, 189, 226);
  }

  @media (max-width: 600px) {
    font-size: 13px;
    padding: 7px 10px;
  }
`;
