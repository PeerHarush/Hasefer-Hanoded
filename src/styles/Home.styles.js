import styled from 'styled-components';

/* מעטפת כללית של הדף */
export const PageWrapper = styled.div`
  padding: 2rem;
  direction: rtl;
  font-family: 'Segoe UI', sans-serif;
`;

/* שורת ברכה + פעמון */
export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

/* טקסט שלום למשתמש */
export const UserGreeting = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #7a4a16;
`;

/* אייקון פעמון */
export const NotificationIcon = styled.div`
  font-size: 1.5rem;
  cursor: pointer;
  color: #7a4a16;
`;

/* באנר עליון – רקע + מיקום מרכזי */
export const Banner = styled.div`
  background-color: #f4e6d8;
  color: #a05921;
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    height: 3.5rem;
    font-size: 0.95rem;
  }

  @media (max-width: 480px) {
    height: 4rem;
    font-size: 0.85rem;
  }
`;

/* טקסט מתגלגל בתוך הבאנר */
export const BannerText = styled.div`
  display: inline-block;
  position: absolute;
  white-space: nowrap;
  animation: scrollText 25s linear infinite;

  @keyframes scrollText {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

/* קפסולת ספרים (כותרת + תוכן) */
export const BookSection = styled.div`
  margin-bottom: 3rem;
`;

/* כותרות של מקטעים */
export const SectionTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #8d572a;
`;

/* אזור ביקורות אחרונות */
export const ReviewSection = styled.div`
  margin-top: 2rem;

`;export const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 0.6rem;
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 768px) {
    width: 140px;
    padding: 0.9rem;
  }

  @media (max-width: 480px) {
    width: 160px;
  }
`;

export const HomeBookCard = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  text-align: center;
  position: relative;
  width: 100%;
  max-width: 240px;
  min-height: 380px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 1024px) {
    max-width: 200px;
    min-height: 340px;
  }

  @media (max-width: 768px) {
    max-width: 180px; /* ⬅️ היה 160 */
    min-height: 300px;
  }

  @media (max-width: 480px) {
    max-width: 160px; /* ⬅️ היה 130 */
    min-height: 260px;
  }
`;

export const HomeBookImage = styled.img`
  width: 100%;
  height: 250px; 
  object-fit: cover;
  border-radius: 8px;

  @media (max-width: 1024px) {
    height: 260px;
  }

  @media (max-width: 768px) {
    height: 220px;
  }

  @media (max-width: 480px) {
    height: 180px;
  }
`;

export const BookListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 🖥️ מחשב - 6 ספרים בשורה */
  gap: 1rem;
  justify-items: center;
  padding: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr); /* טאבלט - 3 טורים */
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* מובייל - 2 טורים */
  }
`;



export const HomeBookTitle = styled.h3`
  margin-top: 10px;
  color: rgb(144, 83, 8);
  font-size: 1.1rem;
`;

export const HomeBookAuthor = styled.p`
  color: #555;
  font-size: 0.95rem;
  margin: 4px 0 0;
`;

