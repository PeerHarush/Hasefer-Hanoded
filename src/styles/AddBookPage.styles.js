import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0 20px; 
  overflow: auto; 
  margin-top: 20px;
    margin: 0 auto;

  background-color: transparent;  
   @media (max-width: 768px) {
    margin-top: 0px;
    
  }
`;

export const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
  padding: 2rem;
  box-sizing: border-box;
  overflow: hidden; 
  margin-bottom: 20px;
  margin-top: 40px;
`;

export const Title = styled.h2`
  text-align: center;
     font-size: 40px;

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
  background-color: rgb(241, 206, 162);

  &:hover {
     background-color: rgb(247, 192, 126);
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

export const SuggestionsList = styled.ul`
  list-style: none;
  margin: 0.25rem 0 0;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  max-height: 150px;
  overflow-y: auto;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  direction: rtl;

  li {
    padding: 0.35rem 0.5rem;
    cursor: pointer;
    border-bottom: 1px solid #eee;

    &:hover {
      background-color: #f0f0f0;
    }
  }
`;



export const MapContainer = styled.div`
  height: 300px;
  margin: 1rem 0 2rem;
  border-radius: 8px;
  overflow: hidden;
`;


export const ModalButton = styled.button`
  min-width: 120px;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  margin: 0 0.5rem;
  transition: background-color 0.3s ease;

  &.home {
    background-color: rgb(220, 173, 116);
    color: #fff;

    &:hover {
      background-color: rgb(210, 147, 70);
    }
  }

  &.close {
    background-color:  rgb(140, 135, 129);
    color: #fff;

    &:hover {
      background-color:  rgb(83, 79, 75);
    }
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem ;
`;
