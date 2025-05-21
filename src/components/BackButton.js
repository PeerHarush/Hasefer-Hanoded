import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StyledBackButton } from '../styles/BackButton.styles.js';

const BackButton = ({ children = 'חזור', className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  return (
    <StyledBackButton onClick={handleClick} className={className}>
      {children}
    </StyledBackButton>
  );
};

export default BackButton;
