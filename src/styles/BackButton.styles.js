import styled from 'styled-components';
export const StyledBackButton = styled.button`
  position: absolute;
  
  top: 100px;
  right: 30px;
  z-index: 1000;
  
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 16px;
 background-color: rgb(241, 206, 162);

  &:hover {
     background-color: rgb(247, 192, 126);
  }

    
  
 @media (max-width: 768px) {
  position: relative;
  top: auto;
  right: auto;
  margin: 0.5rem 1rem;
  display: inline-block;

  }
`;