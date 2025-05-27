import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import styled from 'styled-components';

const PodiumWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px;
  align-items: flex-end;
`;

const PodiumBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f9f9f9;
  padding: 15px 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 110px;
  cursor: default;
  position: relative;
  
  ${({ position }) =>
    position === 1 && `
      margin-top: -30px;
      background: linear-gradient(135deg, #ffd700, #ffa500);
      box-shadow: 0 4px 12px rgba(255, 165, 0, 0.7);
      width: 130px;
  `}
  ${({ position }) =>
    position === 2 && `
      background:rgb(199, 145, 29);
  `}
  ${({ position }) =>
    position === 3 && `
      background:rgb(224, 172, 119);
  `}
`;

const UserImage = styled.img`
  width: ${({ position }) => (position === 1 ? '90px' : '70px')};
  height: ${({ position }) => (position === 1 ? '90px' : '70px')};
  border-radius: 50%;
  object-fit: cover;
  background-color: #ccc;
  border: 3px solid ${({ position }) => (position === 1 ? '#ffb700' : '#999')};
  margin-bottom: 8px;
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: ${({ position }) => (position === 1 ? '1.2rem' : '1rem')};
  text-align: center;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserPoints = styled.div`
  font-weight: 600;
  font-size: ${({ position }) => (position === 1 ? '1.1rem' : '0.9rem')};
  color: #555;
`;

const RankCircle = styled.div`
  position: absolute;
  top: -15px;
  background: ${({ position }) => {
    if (position === 1) return '#ffb700';
    if (position === 2) return '#c0c0c0';
    return '#cd7f32';
  }};
  color: white;
  font-weight: bold;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 0 8px rgba(0,0,0,0.2);
`;

const TopUsersLeaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/points/leaderboard`);
        if (!res.ok) throw new Error('שגיאה בטעינת טבלת המובילים');
        const data = await res.json();
        setTopUsers(data.slice(0, 3)); // רק 3 מובילים
      } catch (err) {
        console.error('שגיאה:', err.message);
      }
    };

    fetchTopUsers();
  }, []);

  // כדי שמקום 1 יהיה באמצע, נמיין את המשתמשים כך: 2,1,3
  const orderedUsers = [
    topUsers[1], // מקום 2 שמאל
    topUsers[0], // מקום 1 מרכז
    topUsers[2], // מקום 3 ימין
  ].filter(Boolean); // מסנן אם יש פחות מ-3 משתמשים

  return (
    <PodiumWrapper>
      {orderedUsers.map((user, idx) => {
        const position = idx === 1 ? 1 : idx === 0 ? 2 : 3; // ממפה אינדקס למקום בפודיום
        return (
          <PodiumBlock key={user.id} position={position} title={`${user.full_name} - ${user.points} נקודות`}>
            <RankCircle position={position}>#{position}</RankCircle>
            <UserImage
              src={user.avatar_url || '/default-user.png'}
              alt={user.full_name}
              position={position}
            />
            <UserName position={position}>{user.full_name}</UserName>
            <UserPoints position={position}>⭐ {user.points}</UserPoints>
          </PodiumBlock>
        );
      })}
    </PodiumWrapper>
  );
};

export default TopUsersLeaderboard;
