import styled from "styled-components";

export const Wrapper = styled.div`
text-align: center;

table, th, td {
  text-align: center;
  vertical-align: middle;
}

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
 display: flex;
  justify-content: center;
  overflow-x: auto;
  @media (max-width: 768px) {
    table {
   width: 80%; 
   align: center;
    }
  }

  
`;



 

 

