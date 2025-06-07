import styled from 'styled-components';

export const NotificationContainer = styled.div`
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
`;

export const NotificationTitle = styled.h3`
  margin-bottom: 20px;
  color: #333;
`;

export const NotificationToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

export const NotificationInfo = styled.div`
  flex: 1;
`;

export const NotificationLabel = styled.h4`
  margin: 0 0 5px 0;
  color: #333;
`;

export const NotificationDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

export const NotificationSwitch = styled.div`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

export const NotificationSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$isEnabled ? '#4CAF50' : '#ccc'};
  border-radius: 34px;
  transition: 0.4s;
`;

export const NotificationKnob = styled.span`
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: ${props => props.$isEnabled ? '30px' : '4px'};
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: 0.4s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

export const NotificationMessage = styled.div`
  margin-top: 15px;
  padding: 10px;
  background-color: ${props => props.$isSuccess ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$isSuccess ? '#155724' : '#721c24'};
  border-radius: 5px;
  text-align: center;
`;