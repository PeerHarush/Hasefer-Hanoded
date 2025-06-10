import React, { useState } from 'react';
import styled from 'styled-components';
import {
  InfoWrapper,
  IconButton,
  PopupBox,
  SectionTitle,
  List,
  ListItem,
} from '../styles/PointsInfoPopup.styles';


const PointsInfoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => setIsOpen(!isOpen);

  const ranks = [
    { label: 'מתחיל', min: 0, max: 100 },
    { label: 'תורם', min: 100, max: 300 },
    { label: 'נאמן', min: 300, max: 800 },
    { label: 'משפיען', min: 800, max: 1200 },
    { label: 'אגדה', min: 1200, max: Infinity }
  ];

  const actions = [
    { label: 'הרשמה', points: 10 },
    { label: 'הוספת ספר', points: 50 },
    { label: 'רכישת ספר', points: 50 },
    { label: 'הוספת ביקורת', points: 50 },
    { label: 'השלמת 3 עסקאות', points: 100 }
  ];

  return (
    <InfoWrapper>
      <IconButton onClick={togglePopup} title="הסבר על נקודות">
        ℹ️
      </IconButton>
      {isOpen && (
        <PopupBox>
          <SectionTitle>🎖️ רמות</SectionTitle>
          <List>
            {ranks.map((rank, idx) => (
              <ListItem key={idx}>
                {rank.label} ({rank.min} - {rank.max === Infinity ? '∞' : rank.max} נק')
              </ListItem>
            ))}
          </List>

          <SectionTitle>🪙 איך מרוויחים נקודות?</SectionTitle>
          <List>
            {actions.map((action, idx) => (
              <ListItem key={idx}>
                {action.label} – {action.points} נקודות
              </ListItem>
            ))}
          </List>
        </PopupBox>
      )}
    </InfoWrapper>
  );
};

export default PointsInfoPopup;
