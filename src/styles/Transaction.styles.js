    // src/styles/Transaction.styles.js
    import styled from 'styled-components';

   export const PageContainer = styled.div`
  padding: 0 1rem;
  
`;

export const DeleteIconButton = styled.button`
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
    color: #a71d2a;
  }

  &:focus {
    outline: none;
  }
`;

export const TransactionBox = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  text-align: center;
  position: relative;
  width: 280px; /* 👈 יותר רחב */
  min-height: 380px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: ${({ status }) =>
    status === 'pending' ? '#fff8e1' :
    status === 'completed' ? '#e8f5e9' :
    status === 'cancelled' ? '#ffebee' :
    '#f5f5f5'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 1024px) {
    width: 260px;
  }

  @media (max-width: 768px) {
    width: 230px;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

export const TransactionsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  justify-items: center;
  padding: 0 1rem;

  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));



  @media (max-width: 480px) {
    grid-template-columns: repeat(1, 1fr);
  }
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
    margin: 0.2rem 0;
    font-size: 0.85rem;
    line-height: 1.3;
    strong {
      font-weight: 600;
    }
  `;


export const Title = styled.h2`
  text-align: center;
  color: rgb(144, 83, 8);
  margin: 60px 0 1rem;
     font-size: 40px;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
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