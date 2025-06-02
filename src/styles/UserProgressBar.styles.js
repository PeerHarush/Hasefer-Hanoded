import styled from 'styled-components';

export const ProgressContainer = styled.div`
  margin: -1rem auto 2rem;
  max-width: 600px;
  position: relative;
`;

export const ProgressBarBackground = styled.div`
  height: 20px;
  direction: ltr;

  background-color: #e0e0e0;
  border-radius: 10px;
  position: relative;
`;

export const ProgressBarFill = styled.div`
  height: 100%;
  background-color:rgb(231, 196, 115);
  width: ${({ percentage }) => percentage}%;
  border-radius: 10px;
  transition: width 0.5s ease-in-out;
`;

export const RankLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-top: 0.5rem;
  padding: 0 5px;
  color: #444;
   direction: ltr;
`;



export const TooltipWrapper = styled.div`
  position: absolute;
  
  left: ${({ percentage }) => `calc(${percentage}% - 8px)`};
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 5;

  &:hover span {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const TooltipText = styled.span`
  background: #333;
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  white-space: nowrap;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  opacity: 0;
  transition: all 0.3s ease;
  transform: translateY(10px);
  pointer-events: none;
`;