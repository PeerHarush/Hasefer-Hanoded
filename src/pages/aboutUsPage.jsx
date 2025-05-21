import React from 'react';
import {
  AboutWrapper,
  Title,
  Paragraph,
  AboutContent,
  LogoImage
} from '../styles/AboutUsPage.styles';


function AboutUsPage() {
  return (
        <AboutWrapper>
      <AboutContent>
     
                      
        
        <div>
          <Title>עלינו</Title>
          <Paragraph>
            ברוכים הבאים ל"הספר הנודד"– פלטפורמה שיתופית לחובבי ספרים. 
          <Paragraph>
          אנו מאמינים שלספר יש חיים משלו, ושהוא צריך להמשיך לנדוד בין קוראים חדשים.
          </Paragraph>
            כאן תוכלו למצוא, לשתף ולתרום ספרים– בין אם חדשים או משומשים, ולהפיץ את ההנאה שבקריאה לקהילה רחבה יותר.
          </Paragraph>
          <Paragraph>
            המטרה שלנו היא לחבר בין אנשים דרך ספרים, להנגיש ידע ולהפוך את עולם הקריאה לנגיש, פשוט וחברתי.
          </Paragraph>
          <Paragraph>
            אם גם אתם מאמינים בכוחם של סיפורים– הצטרפו אלינו למסע.
          </Paragraph>
          
        </div>

        <LogoImage src="/pictures/LOGO.png" alt="לוגו הספר הנודד" />
        </AboutContent>
    </AboutWrapper>
  );
}

export default AboutUsPage;
