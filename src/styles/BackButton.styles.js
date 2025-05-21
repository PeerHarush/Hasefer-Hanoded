import styled from 'styled-components';

export const StyledBackButton  = styled.button`
  position: absolute;
  top: 100px;
  right: 30px;
  z-index: 10;
  padding: 8px 16px;
  background-color: rgb(218, 195, 164);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    background-color: rgb(215, 184, 146);
  }

  @media (max-width: 768px) {
    position: relative;
    top: unset;
    right: unset;
    align-self: flex-start;
    margin-bottom: 10px;
    font-size: 0.8rem;
    padding: 6px 12px;
  }
`;
