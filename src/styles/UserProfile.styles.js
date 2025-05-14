import styled from 'styled-components';

export const Label = styled.label`
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  color: #444;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: right;
  
  h1 {
    color: #333;
    padding: 20px;
     font-size: 1.8rem;
     text-align: right;
  }
`;
export const ProfileCard = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 20px;
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #aaa;
  margin-bottom: 10px;
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 400px;
  margin-top: 10px;
  text-align: right;
  label {
    display: block;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  span {
    display: inline-block;
    margin-bottom: 5px;
  }
`;


export const GenreList = styled.div`
  margin-top: 5px;
`;

export const PointsText = styled.p`
 
  font-weight: bold;
  font-size: 1.4rem;
`;

export const SaveButton = styled.button`
 
  background: rgb(195, 165, 128);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  align-self: center;

  &:hover {
    background: rgb(225, 194, 147);
  }
`;

export const EditButton = styled.button`
  background: none;
  border-radius: 2px;
  border: none;
  vertical-align: middle;  
  margin-top: -5px;
`;


export const InputRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  align-items: center;  
`;
