
import styled from 'styled-components';


export const PodiumWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  align-items: flex-end;
`;

export const PodiumBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f9f9f9;
  padding: 15px 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 110px;
  cursor: default;
  position: relative;
  
  ${({ position }) =>
    position === 1 && `
      margin-top: -30px;
      background: linear-gradient(135deg, #ffd700, #ffa500);
      box-shadow: 0 4px 12px rgba(255, 165, 0, 0.7);
      width: 130px;
  `}
  ${({ position }) =>
    position === 2 && `
        background: linear-gradient(135deg, #dcdcdc, #b0b0b0);
  `}
  ${({ position }) =>
    position === 3 && `
  
        background: linear-gradient(135deg,rgb(222, 172, 122), #b87333);
  `}
`;

 export const UserImage = styled.img`
  width: ${({ position }) => (position === 1 ? '90px' : '70px')};
  height: ${({ position }) => (position === 1 ? '90px' : '70px')};
  border-radius: 50%;
  object-fit: cover;
  background-color: #ccc;
  border: 3px solid ${({ position }) => (position === 1 ? '#ffb700' : '#999')};
  margin-bottom: 8px;
`;

 export const UserName = styled.div`
  font-weight: bold;
  font-size: ${({ position }) => (position === 1 ? '1.2rem' : '1rem')};
  text-align: center;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserPoints = styled.div`
  font-weight: 600;
  font-size: ${({ position }) => (position === 1 ? '1.1rem' : '0.9rem')};
  color: #555;
`;

export const RankCircle = styled.div`
  position: absolute;
  top: -15px;
  background: ${({ position }) => {
    if (position === 1) return '#ffb700';
    if (position === 2) return '#c0c0c0';
    return '#cd7f32';
  }};
  color: white;
  font-weight: bold;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 0 8px rgba(0,0,0,0.2);
`;