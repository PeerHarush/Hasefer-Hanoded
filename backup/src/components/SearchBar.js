// src/components/SearchBar.js
import React from 'react';
import { SearchWrapper, SearchInput } from '../styles/SerchBar.styles';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <SearchWrapper>
      <SearchInput
        type="search"
        placeholder="חפש ספר..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </SearchWrapper>
  );
};

export default SearchBar;
