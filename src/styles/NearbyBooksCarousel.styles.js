import styled from 'styled-components';

export const InfoBox = styled.div`
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
`;

export const LoadingBox = styled(InfoBox)`
  color: #666;
  border: 1px solid #ddd;
  background: #f9f9f9;
`;

export const ErrorBox = styled(InfoBox)`
  color: #d32f2f;
  border: 1px solid #f44336;
  background: #ffebee;
`;

export const NoLocationBox = styled(InfoBox)`
  color: #666;
  border: 1px solid #ddd;
  background: #f9f9f9;
`;

export const NoResultsBox = styled(InfoBox)`
  color: #666;
  border: 1px solid #ddd;
  background: #f9f9f9;
`;

export const NearbyInfo = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: normal;
  margin-top: 5px;
`;

export const DistanceTag = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(40, 167, 69, 0.9);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
`;

export const BookExtraInfo = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
  text-align: center;
`;

export const BookCondition = styled.div`
  font-size: 0.7rem;
  margin-top: 2px;
`;

export const MessageText = styled.div`
  font-size: 18px;
  margin-bottom: 10px;
`;

export const SubMessageText = styled.div`
  font-size: 14px;
`;

export const RelativeWrapper = styled.div`
  position: relative;
`;
