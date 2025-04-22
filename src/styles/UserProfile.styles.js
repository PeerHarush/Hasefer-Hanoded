import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;  
  justify-content: center;  
  text-align: center;  
  


  h1 {
    color: #333;
    padding: 20px;
  }

  img {
    border-radius: 50%;
    width: 150px;
    height: 150px;
    object-fit: cover;
  }

  button {
    background: rgb(195, 165, 128);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
   
  }

  button:hover {
    background: rgb(225, 194, 147);
  }

  p {
    font-size: 1.3rem;
    text-align: center; 
    color: #333;
  }
`;
