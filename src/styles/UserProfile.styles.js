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
  background: rgb(215, 184, 146);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: rgb(241, 206, 162);
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

