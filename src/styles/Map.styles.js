
import styled from 'styled-components';

export const MapContainerStyled = styled.div`
  height: ${props => props.height || '300px'};
  margin: ${props => props.margin || '1rem 0 2rem'};
  border-radius: 8px;
  overflow: hidden;
`;

export const MapHelpTextStyled = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
`;

// Styled components for address validation
export const ValidationContainer = styled.div`
  margin-top: 0.5rem;
`;

export const ValidationMessage = styled.div`
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'warning':
        return `
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'error':
        return `
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'info':
        return `
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
      default:
        return `
          background-color: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
        `;
    }
  }}
`;

export const SuggestionContainer = styled.div`
  background-color: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
`;

export const SuggestionText = styled.div`
  margin-bottom: 0.5rem;
  color: #0c5460;
  font-size: 0.9rem;
`;

export const SuggestedAddress = styled.div`
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0.5rem 0;
  font-weight: 500;
  color: #333;
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const ValidationButton = styled.button`
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
  
  ${props => props.primary ? `
    background-color: #007bff;
    color: white;
    &:hover {
      background-color: #0056b3;
    }
  ` : `
    background-color: #6c757d;
    color: white;
    &:hover {
      background-color: #545b62;
    }
  `}
`;

export const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


export const CenteredLoadingBox = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
`;

export const StyledLoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  margin: 0 auto 10px;
  border: 3px solid #ccc;
  border-top: 3px solid #333;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingText = styled.div`
  font-size: 16px;
  color: #666;
`;