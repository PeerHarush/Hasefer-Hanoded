import React from 'react';
import {
  ProgressContainer,
  ProgressBarBackground,
  ProgressBarFill,
  RankLabels,
  TooltipWrapper,
  TooltipText,
} from '../styles/UserProgressBar.styles';

const getTooltipText = (points) => {
  const ranks = [
    { label: 'מתחיל', min: 0, max: 100 },
    { label: 'תורם', min: 100, max: 300 },
    { label: 'נאמן', min: 300, max: 800 },
    { label: 'משפיען', min: 800, max: 1200 },
    { label: 'אגדה', min: 1200, max: Infinity },
  ];

  const currentRank = ranks.find(rank => points >= rank.min && points < rank.max);

  if (!currentRank || currentRank.max === Infinity) {
    return 'הגעת לדרגת אגדה';
  }

  const nextRank = ranks[ranks.indexOf(currentRank) + 1];
  const remaining = currentRank.max - points;

  return `עוד ${remaining} נקודות לדרגת ${nextRank.label}`;
};

const UserProgressBar = ({ userPoints }) => {
  const maxPoints = 1500;

const getPercentage = () => {
  const maxPoints = 1800;
  let fakePoints;

  if (userPoints < 100) {
    fakePoints = Math.min(userPoints + 150 , maxPoints);
  } else {
    fakePoints = Math.min(userPoints + 600, maxPoints);
  }

  return (fakePoints / maxPoints) * 100;
};



  const percentage = getPercentage();

  return (
    <ProgressContainer>
      <ProgressBarBackground>
        <ProgressBarFill percentage={percentage} />
        <TooltipWrapper percentage={percentage}>
          <TooltipText>{getTooltipText(userPoints)}</TooltipText>
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
