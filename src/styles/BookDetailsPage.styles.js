import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';

export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 60px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 30px;
  flex-direction: row-reverse;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    margin-top: 0;
    padding-top: 0;
  }
`;

export const Sidebar = styled.aside`
  margin-top: 10px;
  width: 300px;
  border-radius: 16px;
  position: sticky;
  top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: fit-content;

  @media (max-width: 768px) {
    position: static;
    width: 100%;
    margin-bottom: 20px;
    display: none;
  }
`;

export const BookImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;  
  border-radius: 10px;
  margin-top: 30px;

  @media (max-width: 768px) {
    display: none; 
  }
`;

export const BookInfo = styled.div`
  flex: 1;
  padding: 10px;
  direction: rtl;

  @media (max-width: 768px) {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px; 
  }
`;

export const BookDescription = styled.p`
  font-size: 20px;
  line-height: 1.8;
  margin-top: 20px;
  text-align: justify;
`;

export const BookImageMobile = styled.img`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 80%;
    margin: 10px 0;
    border-radius: 10px;
  }
`;

export const StickyTextContainer = styled.div`
  text-align: center;
  margin-top: 15px;

  h2 {
    font-size: 20px;
    margin-bottom: 5px;
  }

  h4 {
    font-size: 16px;
    margin: 0;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

export const Button = styled.button`
  color: white;
  width: 220px;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  cursor: pointer;
  margin: 2px;
  background: rgb(218, 195, 164);

  &:hover {
    background: rgb(224, 205, 165);
  }

  @media (max-width: 768px) {
    font-size: 0.95rem;
    width: fit-content;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column; 
  margin-top: 10px;

  @media (max-width: 768px) {
    flex-direction: row; 
    justify-content: center;
    flex-wrap: wrap;
  }
`;



export const MobileButtonsContainer = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 30px;
  }
`;


export const StyledLinkButton = styled(Link)`
  text-decoration: none;

  @media (max-width: 768px) {
    width: auto;
  }
`;

export const TableWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 10px auto;
  
  padding: 16px;

  @media (max-width: 768px) {
    margin: 0 auto 5px auto;

    max-width: 100%;
  }
`;

export const StyledTable = styled(Table)`
  width: 100%;
border-radius: 0px;
  overflow: hidden; 
  @media (max-width: 768px) {
    min-width: 80%
    
    font-size: 0.85rem;
  }
`;



export const MapControlsWrapper = styled.div`
  margin: 1rem 0;
  border-top: 1px solid #eee;
  padding-top: 1rem;
`;

export const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
`;

export const InputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

export const AddressInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

export const MapWrapper = styled.div`
  margin-top: 1rem;
`;

export const SmallButton = styled.button`
  color: white;
  width: 220px;
  border: none;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
border-radius: 6px;
width: fit-content;

 background: rgb(218, 195, 164);

  &:hover {
    background: rgb(224, 205, 165);
  }
  @media (max-width: 600px) {
    font-size: 0.95rem;
  width: fit-content;
  }
`;

  // display: flex;

  // border-radius: 6px;
  // margin: 2px;
  
