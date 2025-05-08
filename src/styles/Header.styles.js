import styled from "styled-components";

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
