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

  //#8B1A1A אופציונלי 
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
  background: rgb(195, 165, 128);
  color: white;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top:0.15rem;

  &:hover {
    background: #bfa78a;
  }
`;
