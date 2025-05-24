import styled from 'styled-components';
export const StyledBackButton = styled.button`
  position: absolute;
  
  top: 100px;
  right: 30px;
  z-index: 1000;
  background-color: rgb(218, 195, 164);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 16px;

  &:hover {
    background-color: rgb(215, 184, 146);
  }
    
  
 @media (max-width: 768px) {
  position: relative;
  top: auto;
  right: auto;
  margin: 0.5rem 1rem;
  display: inline-block;

  }
`;