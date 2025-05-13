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
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const Star = styled.span`
  font-size: 2rem;
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
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

export const ReviewText = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin-top: 1rem;
  word-wrap: break-word;
`;
