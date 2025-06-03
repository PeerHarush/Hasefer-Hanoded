import styled from 'styled-components';

export const InfoWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin-right: 1rem;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  padding: 0;
`;

export const PopupBox = styled.div`
  position: absolute;
  top: 35px;
  left: 0;
  width: 400px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 1rem;
  z-index: 100;
  font-size: 0.9rem;
  direction: rtl;

  @media (max-width: 500px) {
    width: 70vw;
    right: -80px;
  }
`;


export const SectionTitle = styled.h4`
  margin: 0.5rem 0;
  color: #444;
  font-weight: bold;
`;

export const List = styled.ul`
  padding-right: 1rem;
  margin: 0;
`;

export const ListItem = styled.li`
  margin-bottom: 0.4rem;
`;
