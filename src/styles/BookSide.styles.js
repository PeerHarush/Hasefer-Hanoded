import styled from 'styled-components';

export const SidebarWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 250px;
  height: 100vh;
  background-color: #fff;
  padding: 20px;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
`;

export const BookImage = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 20px;
  border-radius: 5px;
`;

export const SidebarButton = styled.button`
  background-color: #ffe46b;
  border: none;
  margin: 6px 0;
  padding: 10px;
  width: 100%;
  font-weight: bold;
  border-radius: 5px;
  cursor: pointer;
`;
