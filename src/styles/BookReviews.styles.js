import styled from 'styled-components';

export const ReviewContainer = styled.div`
  margin-top: -10px;
  padding: 20px;
`;

export const NoReviewsMessage = styled.p`
  text-align: center;
  color: #777;
  font-size: 16px;
`;

export const StarsContainer = styled.div`
  display: flex;
  gap: 5px;
`;

export const StaticStar = styled.span`
  color: ${({ active }) => (active ? '#f5a623' : '#ccc')};
  font-size: 20px;
`;

export const InteractiveStar = styled.span`
  cursor: pointer;
  font-size: 24px;
  color: ${({ active }) => (active ? '#f5a623' : '#ccc')};
  transition: color 0.2s;

  &:hover {
   color: rgb(250, 177, 88);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  margin-top: 10px;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
`;

export const SubmitButton = styled.button`
  margin-top: 12px;
  padding: 10px 20px;
   background-color: rgb(241, 206, 162);

  &:hover {
     background-color: rgb(247, 192, 126);
  }

  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95rem;
`;

export const ReviewText = styled.p`
  font-size: 15px;
  color: #333;
  margin-top: 10px;
  white-space: pre-line;
`;

export const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center; 
  margin-bottom: 5px;
  margin-top:-10px;
`;


export const ReviewUser = styled.span`
  font-weight: bold;
  font-size: 16px;
`;

export const ReviewDate = styled.span`
  font-size: 13px;
  color: #888;
  margin-left: 12px;
  white-space: nowrap;
`;

export const ReviewUserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const UserNameAndStars = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ReviewItem = styled.div`
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
`;

export const ReviewFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
`;

export const ReviewFormTitle = styled.h3`
  font-size: 18px;
  margin: 0;
`;

export const CoinReward = styled.span`
  font-size: 14px;
  color: #555;
`;

export const AverageRating = styled.div`
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 20px;
 color: rgb(250, 177, 88);
   text-align: center;
`;

export const AvatarImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

