import styled from "styled-components";

// Wrapper סביב כל הניווט
export const Wrapper = styled.div`
  background-color: rgba(243, 227, 195, 1);
`;

// ניווט עצמו, ממוקם מימין לשמאל
export const StyledNavbar = styled.nav`
  direction: rtl;
  text-align: right;
  padding: 10px;
`;

// ניווט בצד ימין
export const NavbarRight = styled.ul`
  display: flex;
  justify-content: flex-start;
  flex-grow: 1; /* מאפשר לניווט להיות ממורכז */
  margin: 0;
  padding: 0;
  
`;

// כפתור התחברות/התנתקות בצד שמאל
export const NavbarLeft = styled.ul`
  display: flex;
  justify-content: flex-start;
  margin-left: 0; /* לא מוסיף רווח שמאלי */
  padding: 0;
`;
