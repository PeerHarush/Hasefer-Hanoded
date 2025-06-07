import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  margin-top: 40px;
  background-color: #fdfcf8;
    @media (max-width: 768px) {
    margin-top: 0px;
  }
`;

export const ProfileCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden;
  text-align: right;
`;

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 1.5rem;
`;

export const Title = styled.h2`
  text-align: center;
  color:rgb(144, 83, 8);
     font-size: 40px;

  margin-bottom: 0.25rem;
`;

export const ImageContainer = styled.div`
  position: relative;
  text-align: center;
`;

export const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #ccc;
  margin-bottom: 10px;
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
`;

export const InputRow = styled.div`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  gap: 10px;
`;

export const Label = styled.label`
  font-weight: bold;
  color: #333;
  font-size: 1rem;
`;

export const EditButton = styled.button`
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #444;
  cursor: pointer;
  align-self: flex-start;
`;

export const GenreList = styled.div`
  margin-top: 15px;
`;

export const GenresListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  list-style: none;
`;

export const GenreIcon = styled.span`
  margin-left: 6px;
`;

export const PointsText = styled.p`
  font-weight: bold;
  font-size: 1.2rem;
  color: #222;
  margin-top: 20px;
  text-align: center;
`;

export const SaveButton = styled.button`
  width: 100%;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;

   background-color: rgb(241, 206, 162);

  &:hover {
     background-color: rgb(247, 192, 126);
  }
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex: 1;
`;

export const FieldValue = styled.span`
  font-size: 1rem;
  color: #000;
`;

/* סטיילים להגדרות התראות */
export const NotificationSection = styled.div`
  margin: 25px 0;
  padding: 0;
  background: transparent;
`;

export const NotificationTitle = styled.h3`
  color: rgb(144, 83, 8);
  font-size: 1.3rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const NotificationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
`;

export const NotificationInfo = styled.div`
  flex: 1;
`;

export const NotificationLabel = styled.h4`
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
`;

export const NotificationDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

export const SwitchContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 54px;
  height: 28px;
`;

export const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

export const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$isEnabled ? 'rgb(241, 206, 162)' : '#ccc'};
  border-radius: 28px;
  transition: 0.3s ease;
  
  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: ${props => props.$isEnabled ? '29px' : '3px'};
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  &:hover {
    background-color: ${props => props.$isEnabled ? 'rgb(247, 192, 126)' : '#bbb'};
  }
`;

export const NotificationMessage = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: ${props => props.$isSuccess ? '#e8f5e8' : '#fee'};
  color: ${props => props.$isSuccess ? '#2d5a2d' : '#8b2635'};
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  border-left: 4px solid ${props => props.$isSuccess ? '#4CAF50' : '#f44336'};
`;