import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0 20px; 
  overflow: auto; 
  margin-top: 20px;
  background-color: transparent; 
`;

export const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden; 
  margin-bottom: 20px;
  margin-top: 40px;

`;

export const Title = styled.h2`
  text-align: center;
  color:rgb(144, 83, 8);

  margin-bottom: 0.25rem;
`;

export const Subtitle = styled.p`
  text-align: center;
  color:rgb(0, 0, 0);
`;

export const FormGroup = styled.div`
  margin-bottom: 0.45rem;
`;

export const Label = styled.label`
  font-weight: 500;
  margin-top:0.15rem;
  margin-bottom:0.15rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.55rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size:1rem;

  &:focus {
    border-color: rgb(130, 76, 6);
    outline: none;
  }
`;

export const Button = styled.button`
  width: 100%;
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top:0.15rem;
  background: rgb(215, 184, 146);
  &:hover {
    background:rgb(241, 206, 162);
  }
`;



export const ImageUploadContainer = styled.div`
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  height: 200px;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PreviewImage = styled.img`
  max-height: 100%;
  max-width: 100%;
  object-fit: cover;
`;



export const EditAddressButton = styled.button`
  background: none;
  border: none;
  color:rgb(5, 93, 186);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  padding: 0;
`;



export const Select = styled.select`
  padding: 1px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  color: #333;
  width: 100%;
  
  &:focus {
    outline: none;
  }
`;