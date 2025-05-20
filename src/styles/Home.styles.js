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
  position: relative; /* חשוב כדי למקם את העיגול האדום */
`;

/* עיגול אדום למספר התראות */
export const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -8px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: bold;
  line-height: 1;
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
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
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
`;

export const NotificationsWrapper = styled.div`
  position: relative;
`;

export const NotificationsBox = styled.div`
  position: absolute;
  top: 2.5rem;
  left: -10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 30px;
  width: 240px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  padding: 0.8rem 1rem;
  z-index: 9990;
  max-height: 350px; /* הגבלת גובה מקסימלי */
  overflow: hidden; /* הסתרת תוכן שחורג */
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 20px; 
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #ddd transparent;
  }

  &::after {
    content: '';
    position: absolute;
    top: -9px;
    left: 20px; 
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #fff transparent;
  }
`;

export const NotificationItem = styled.li`
  list-style: none;
  font-size: 0.9rem;
  border-radius: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;


  color: ${props => props.$isUnread ? '#000' : '#666'};
  background-color: ${props => props.$isUnread ? '#f5f0e6' : 'transparent'};
  font-weight: ${props => props.$isUnread ? 'bold' : 'normal'};
  padding: 0.6rem 0.4rem;
  border-bottom: 1px solid #eee;
  margin: 0.2rem 0;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${props => props.$isUnread ? '#efe5d3' : '#f5f5f5'};
  }

  &::before {
    content: '${props => props.$type === 'message' ? '💬 ' : props.$type === 'complete' ? '✅ ' : '📦 '}';
  }
`;
export const NotificationsScroll = styled.div`
  overflow-y: auto;
  max-height: 280px; /* גובה מקסימלי למכולת הגלילה */
  margin: 0.5rem 0;
  
  /* עיצוב סרגל הגלילה */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ddc5aa;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #c9a98b;
  }
`;

export const MarkAsReadIcon = styled.span`
  margin-right: 10px;
  color: #28a745;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;

  &:hover {
    color: #218838;
  }
`;


export const NotificationTitle = styled.div`
  font-weight: bold;
  color: #7a4a16;
`;

export const Card = styled.div`
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
  width: 220px; 
  min-height: 380px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 1024px) {
    width: 200px;
    min-height: 340px;
  }

  @media (max-width: 768px) {
    width: 180px;
    min-height: 300px;
  }

  @media (max-width: 480px) {
    width: 160px;
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
  grid-template-columns: repeat(auto-fit, 220px);
  gap: 1rem;
  justify-content: center;
  padding: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, 200px);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, 180px);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, 160px);
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

export const FavoriteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  z-index: 2;

  svg {
    color: ${props => props.$isFavorite ? 'red' : 'gray'};
    transition: color 0.2s ease;
  }

  &:hover svg {
    color: ${props => props.$isFavorite ? 'darkred' : '#555'};
  }
`;

export const MarkAllAsReadButton = styled.button`
  margin-top: 5px;
  background-color: #f4e6d8;
  border: none;
  border-radius: 15px;
   padding: 6px ;
  cursor: pointer;
  font-size: 0.8rem;
  width: 100%;
  color:rgb(122, 78, 31);
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #ebdbc6;
  }
`;

