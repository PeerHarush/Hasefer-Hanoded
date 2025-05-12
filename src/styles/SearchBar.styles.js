// src/styles/SearchBar.styles.js
import styled from 'styled-components';

export const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  width: 100%;  // וודא שהחיפוש יתפוס את כל רוחב המסך
`;

export const SearchInput = styled.input`
  padding: 10px;
  font-size: 1rem;
  width: 250px;  // אפשר להקטין את הרוחב כאן, תלוי בצורך שלך
  border-radius: 12px;
  border: 1px solid #ccc;
  text-align: center;  // ממרכז את הטקסט בתיבת החיפוש
`;
