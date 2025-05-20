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