import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 1rem;
  
`;



export const Title = styled.h2`
  text-align: center;
  color: rgb(144, 83, 8);
  margin: 30px 0 1rem;
     font-size: 40px;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;



export const Sidebar = styled.aside`
  margin-top: 60px;
  width: 232px;
  padding: 1rem;
  background-color: rgba(243, 227, 195, 1);
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 4rem;
   height: fit-content;
  align-self: flex-start;

  @media (max-width: 768px) {
    width: 100%;
      margin-top: 0px;

    position: static;
  }
`;

export const FilterHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;


  h3 {
    font-size: 1rem;
    margin: 0;
  }

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;

    h3 {
      font-size: 0.95rem;
    }

    select {
      font-size: 0.85rem;
    }
  }
`;



export const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 75vh;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
    scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }
     @media (max-width: 768px) {
    flex-direction: row; flex-wrap: wrap;
    max-height: none;
    overflow-y: visible;
    justify-content: center;
    gap: 0.5rem;
  }
`;

export const CategoryItem = styled.li`
  margin-bottom: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${({ $active }) => ($active ? ' rgb(236, 216, 190)' : 'transparent')};
  color: ${({ $active }) => ($active ? ' rgb(0, 0, 0)' : '#333')};
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
  transition: background-color 0.2s, color 0.2s, font-weight 0.2s;

  &:hover {
    background-color: rgb(218, 195, 164);
    color: rgb(0, 0, 0);
  }

  @media (max-width: 768px) {
    margin-bottom: 0;
    font-size: 0.85rem;
  }
`;


export const GalleryContainer = styled.main`
  flex: 1;
  padding: 1rem 2rem;
`;


export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  flex-direction: row;

  h1, h6 {
    color: #333;
    text-align: center;
    width: 100%;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch; 
  }
`;