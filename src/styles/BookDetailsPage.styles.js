import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 60px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;



export const Wrapper = styled.div`
  display: flex;
  width: 100%;
 max-width: 1200px;
   gap: 30px;
  flex-direction: row-reverse;


 @media (max-width: 768px) {
  flex-direction: column-reverse;
  margin-top: 0;
  padding-top: 0;
}

`;




 export const Sidebar = styled.aside`
  margin-top: 10px;
  width: 300px;
  border-radius: 16px;
  position: sticky;
  top: 4rem;
  height: fit-content;
  @media (max-width: 768px) {
    position: static;
    width: 100%;
    margin-bottom: 20px;
    display: none; 
  }
`;





export const BookImage = styled.img`
   width: 100%;
  height: auto;
  border-radius: 10px;
margin-top: 30px;

  @media (max-width: 768px) {
    display: none; 
  }
`;

export const BookInfo = styled.div`
  flex: 1;
  padding: 10px;
  direction: rtl;

  @media (max-width: 768px) {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px; 
  }
`;


export const BookDescription = styled.p`
  font-size: 20px;
  line-height: 1.8;
  margin-top: 20px;
  text-align: justify;
`;



export const BookImageMobile = styled.img`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 80%;
    margin: 10px 0;
    border-radius: 10px;
  }
`;



export const StickyTextContainer = styled.div`
  text-align: center;
  margin-top: 15px;

  h2 {
    font-size: 20px;
    margin-bottom: 5px;
    color: #222;
  }

  h4 {
    font-size: 16px;
    color: #555;
    margin: 0;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;