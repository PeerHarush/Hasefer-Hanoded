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
  text-align: center;
  padding: 30px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  h1 {
    color: #333;
    padding: 20px;
  }

  p {
    font-size: 1.3rem;
    color: #333;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    padding: 4px 0;
    font-weight: 500;
  }
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
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
  align-items: center;
`;

export const EditButton = styled.button`
  margin-right: 10px;
  background: rgb(245, 227, 195);
  border-radius: 8px;
  border: none;
`;

export const GenreList = styled.div`
  margin-top: 30px;
`;

export const PointsText = styled.p`
  margin-top: 20px;
  font-weight: bold;
  font-size: 1.4rem;
`;

export const SaveButton = styled.button`
  margin-top: 20px;
  background: rgb(195, 165, 128);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;

  &:hover {
    background: rgb(225, 194, 147);
  }
`;
