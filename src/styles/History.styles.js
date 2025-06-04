
import styled from "styled-components";


export const PageContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem;

  @media (max-width: 768px) {
    max-width: 400px;
    padding: 0.5rem;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem auto;
  justify-content: center;
  flex-wrap: wrap;
  width: fit-content;
`;



export const Title = styled.h2`
  text-align: center;
  color: rgb(144, 83, 8);
  margin: 60px 0 1rem;
     font-size: 40px;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

export const Message = styled.p`
  text-align: center;
  color: ${({ error }) => (error ? 'red' : '#555')};
  font-size: 1rem;
`;

export const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
`;

export const ActivityItem = styled.li`
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  direction: rtl;
  line-height: 1.6;

  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.95rem;
  }
`;

export const ActivityDate = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

export const ActivityDescription = styled.div`
  font-weight: 500;
`;

export const Button = styled.button`
  color: #252525;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
  background-color: ${({ $active }) => ($active ? '#e6b676' : 'rgb(233, 181, 114)')};

  &:hover {
    background-color: ${({ $active }) => ($active ? '#d89e52' : '#f1d9bc')};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
