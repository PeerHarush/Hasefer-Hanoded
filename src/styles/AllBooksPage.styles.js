import styled from 'styled-components';

export const PageContainer = styled.div`
  padding: 2rem;
  direction: rtl;
  
`;

export const Sidebar = styled.aside`
  margin-top: 10px;
  width: 232px;
  padding: 1rem;
  background-color:rgba(243, 227, 195, 1);
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
  height: fit-content;
  align-self: flex-start;
`;



export const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 75vh;
  overflow-y: auto;

  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 10px;
  }
`;

export const CategoryItem = styled.li`
  margin-bottom: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: ${({ active }) => (active ? '#ffe0f0' : 'transparent')};
  color: ${({ active }) => (active ? '#e91e63' : '#333')};
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #ffd6eb;
    color:rgb(243, 107, 152);
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
  
 h1, h6 {
    color: #333;
    text-align: center;
    width: 100%;
 
  }
`;
