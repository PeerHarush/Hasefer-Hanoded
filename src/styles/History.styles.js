
import styled from "styled-components";


export const PageContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  
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
`;

export const ActivityDate = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

export const ActivityDescription = styled.div`
  font-weight: 500;
`;