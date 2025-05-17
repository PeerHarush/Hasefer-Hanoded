// src/styles/Transaction.styles.js
import styled from 'styled-components';

export const PageContainer = styled.div`
`;



export const TransactionBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 1.5rem;
  background-color: ${({ status }) =>
    status === 'pending' ? '#fff8e1' :
    status === 'completed' ? '#e8f5e9' :
    status === 'cancelled' ? '#ffebee' :
    '#f5f5f5'};
  box-sizing: border-box;
  width: 100%;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
`;

export const TransactionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  justify-items: center;
`;

export const BookImage = styled.img`
  width: 100px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;


export const InfoSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  margin-top: 1rem;
`;

export const Label = styled.p`
  margin: 0.3rem 0;
  strong {
    font-weight: 600;
  }
`;
export const Title = styled.h2`
  text-align: center;
  color: rgb(144, 83, 8);
  margin: 60px 0 1rem;
`;


export const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

export const ConfirmButton = styled.button`
  background: rgb(215, 184, 146);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: rgb(241, 206, 162);
  }
`;


export const FilterWrapper = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;

  select {
    padding: 0.4rem 0.6rem;
    border-radius: 5px;
    border: 1px solid #ccc;
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  label {
    font-weight: bold;
  }
`;