import styled from 'styled-components';

export const ReviewContainer = styled.div`
  margin-top: 2rem;
`;

export const NoReviewsMessage = styled.p`
  font-size: 1.2rem;
  color: #888;
  text-align: center;
`;

export const StarsContainer = styled.div`
  display: flex;
  gap: 0.3rem;
  font-size: 1.2rem;
  align-items: center;
  margin-left: 1rem;
`;

export const Star = styled.span`
  color: #ddd; /* צבע כהה יותר */
  cursor: pointer;
  &:hover {
    color: #ffbb33; /* צהוב כהה */
  }
`;

export const StarActive = styled(Star)`
  color: #ffbb33; /* צהוב כהה */
`;

export const Textarea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  resize: none;
`;

export const SubmitButton = styled.button`
  background-color:rgb(237, 182, 110);
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  
  }
`;

export const ReviewText = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin-top: 1rem;
  word-wrap: break-word;
`;

export const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  flex-direction: column;
`;

export const ReviewDate = styled.span`
  font-size: 0.9rem;
  color: #888;
  margin-top: 0.2rem;
`;

export const ReviewUser = styled.span`
  font-weight: bold;
  font-size: 1rem;
  margin-right: 1rem;
  text-align: right; /* הצמדה לימין */
  width: 100%; /* מבטיח שהשם יתפוס את כל הרוחב */
`;

export const ReviewHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  margin-right: 1rem;
`;

export const ReviewUserContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem; 
`;

export const ReviewDateContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-left: auto;
`;

export const ReviewItem = styled.div`
  border-bottom: 1px solid #ddd;
  padding: 1rem 0;
`;
