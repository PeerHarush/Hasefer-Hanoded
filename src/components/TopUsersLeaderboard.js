import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import {
  PodiumWrapper,PodiumBlock, UserImage, RankCircle, UserName, UserPoints}
  from '../styles/topUsers.styles';

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
              src={user?.avatar_url }
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
