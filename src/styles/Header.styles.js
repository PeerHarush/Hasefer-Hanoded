import styled from "styled-components";
import { Link } from "react-router-dom";

export const Wrapper = styled.div`
  background-color: rgba(243, 227, 195, 1);
`;

export const StyledNavbar = styled.nav`
  direction: rtl;
  text-align: right;
  padding: 10px;
`;

export const NavbarRight = styled.ul`
  display: flex;
  justify-content: flex-start;
  flex-grow: 1;
  margin: 0;
  padding: 0;
`;

export const NavbarLeft = styled.ul`
  display: flex;
  justify-content: flex-start;
  margin-left: 0;
  padding: 0;
`;

export const NavItemLink = styled(Link)`
  text-decoration: none;
  padding: 8px 12px;
  font-weight: ${props => (props.$active ? "bold" : "normal")};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: inline-block;
  color: inherit;

  &:hover {
    transform: translateY(-4px);
    text-decoration: none;
  }
`;

export const SearchContainer = styled.div`
  position: relative;
  max-width: 300px;
  width: 100%;
  margin-inline-end: auto;
`;

export const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.2rem;
`;

export const SearchInput = styled.input`
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  background-color: #fffaf3;
  color: #333;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #caa67d;
  }

  &:focus {
    border-color: #caa67d;
    outline: none;
    box-shadow: none;
  }
`;

export const SearchButton = styled.button`
  padding: 6px 16px;
  border-radius: 20px;
  border: none;
  background-color: #caa67d;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #b3855f;
  }
`;

export const SearchSuggestionsList = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  background-color: #fffaf3;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 10px 10px;
  z-index: 1000;
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
`;

export const SearchSuggestionItem = styled.li`
  padding: 6px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  font-size: 14px;

  &:hover {
    background-color: #f0e6d6;
  }

  strong {
    font-weight: bold;
  }

  span {
    color: #666;
    margin-right: 4px;
  }
`;
