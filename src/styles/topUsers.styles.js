
import styled from 'styled-components';


export const PodiumWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  align-items: flex-end;

  @media (max-width: 768px) {
    gap: 24px;
  }

  @media (max-width: 480px) {
    gap: 2px;

  }
`;


export const PodiumBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: ${({ position }) => (position === 1 ? '130px' : '110px')};
  cursor: default;
  position: relative;
  margin-top: ${({ position }) => (position === 1 ? '-30px' : '0')};

 background: ${({ position }) => {
  if (position === 1) {
    // Gold
    return 'radial-gradient(circle at center, #FFB300 0%, #FFD700 70%)';
  }
  if (position === 2) {
    // Silver
    return 'radial-gradient(circle at center, #B0B0B0 0%, #D9D9D9 70%)';
  }
  // Bronze
  return 'radial-gradient(circle at center, #CD7F32 0%, #E5A07F 70%)';
}};

  box-shadow: ${({ position }) => {
    if (position === 1) return '0 8px 12px rgba(255, 200, 0, 0.6)';
    if (position === 2) return '0 4px 12px rgba(160, 160, 160, 0.4)';
    return '0 4px 12px rgba(205, 127, 50, 0.4)';
  }};
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