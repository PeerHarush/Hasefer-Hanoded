import styled from "styled-components";

export const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  direction: rtl;
  padding-top: ${({ isRegister }) => (isRegister ? "60px" : "20px")};
     @media (max-width: 768px) {
    margin-top: 0px;
`;

export const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
   

`;

export const Title = styled.h2`
  text-align: center;
  color:rgb(144, 83, 8);
  margin-bottom: 0.25rem;
`;

export const Subtitle = styled.p`
  text-align: center;
  color:rgb(0, 0, 0);
  margin-bottom: 2rem;
`;

export const Tabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

export const Tab = styled.button`
  flex: 1;
  padding: 0.65rem;
  border: none;
  border-radius: 6px 6px 0 0;
  background: ${({ active }) => (active ? "rgb(234, 199, 156)" : "#f3f4f6")};
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  color: ${({ active }) => (active ? "black" : "black")};
  cursor: pointer;
`;



export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.35rem;
`;

export const Label = styled.label`
  margin-bottom: 0.15rem;
  font-weight: 500;
  margin-top: 0.25rem;
`;

export const Input = styled.input`
  padding: 0.55rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;



export const Button = styled.button`
  width: 100%;
   background-color: rgb(241, 206, 162);

  &:hover {
     background-color: rgb(247, 192, 126);
  }
      color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;

 
`;


export const ImageUploadContainer = styled.div`
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  position: relative;
  height: 150px;
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

