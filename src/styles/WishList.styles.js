import styled from "styled-components";

export const Wrapper = styled.div`
text-align: center;

  h1 {
  margin: 20px;
    color: #333;
    
  }

  width: 80%; 
  margin: 0 auto;

  @media (max-width: 768px) {
    width: 100%;
    margin: 0; 
  }
`;

export const TableWrapper = styled.div`
 
  @media (max-width: 768px) {
    table {
      width: 100%; 
    }
  }

  
`;



