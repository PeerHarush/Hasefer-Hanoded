import styled from 'styled-components';

export const AboutWrapper = styled.div`
  max-width: 60%;;
  margin: 5rem auto;
  padding: 2rem;
  background-color:rgba(243, 227, 195, 0.22);
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  direction: rtl;
    text-align: justify;
        margin: 35px auto;


   @media (max-width: 768px) {
    margin-top: 0px;
     max-width: 80%;
  
  }

`;

export const AboutContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
    text-align: center;
  }
`;



export const Title = styled.h2`
  text-align: center;
   font-size: 40px;
  color: rgb(144, 83, 8);
  margin-right: 150px;
  margin-bottom: 1.5rem;
    @media (max-width: 768px) {
    margin-top: 0px;
  margin-right: 0px;

  }
`;

export const Paragraph = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  color: #555;
  margin-bottom: 1.2rem;
`;

export const LogoImage = styled.img`
  max-width: 150px;
  height: auto;
  border-radius: 8px;
`;
