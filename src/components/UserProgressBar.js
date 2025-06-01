import React from  'react';
import {
  ProgressContainer,
  ProgressBarBackground,
  ProgressBarFill,
  RankLabels,
  UserMarker,
  TooltipWrapper,
  TooltipText,
} from '../styles/UserProgressBar.styles';



const getTooltipText = (points) => {
  const ranks = [
    { label: 'מתחיל', min: 0, max: 100 },
    { label: 'תורם', min: 100, max: 300 },
    { label: 'נאמן', min: 300, max: 800 },
    { label: 'משפיען', min: 800, max: 1200 },
    { label: 'אגדה', min: 1200, max: Infinity }
  ];

  const currentRank = ranks.find(rank => points >= rank.min && points < rank.max);

  if (!currentRank || currentRank.max === Infinity) {
    return ' הגעת לדרגת אגדה';
  }

  const nextRank = ranks[ranks.indexOf(currentRank) + 1];
  const remaining = currentRank.max - points;

  return `עוד ${remaining} נקודות לדרגת ${nextRank.label}`;
};

const UserProgressBar = ({ userPoints }) => {
  const maxPoints = 1400;

  const getPercentage = () => {
    const capped = Math.min(userPoints, maxPoints);
    const raw = (capped / maxPoints) * 100;
    return Math.max(raw, 5); 
  };

  return (
    <ProgressContainer>
      <ProgressBarBackground>
        <ProgressBarFill percentage={getPercentage()} />
           <TooltipWrapper>
            <TooltipText>{getTooltipText(userPoints)}</TooltipText>
            <UserMarker percentage={getPercentage()} />
            </TooltipWrapper>

      </ProgressBarBackground>
      <RankLabels>
        <span>מתחיל</span>
        <span>תורם</span>
        <span>נאמן</span>
        <span>משפיען</span>
        <span>אגדה</span>
      </RankLabels>
    </ProgressContainer>
  );
};

export default UserProgressBar;
