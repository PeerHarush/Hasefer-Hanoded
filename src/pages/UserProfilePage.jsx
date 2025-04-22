import React, { useState } from 'react';
import { Wrapper } from '../styles/UserProfile.styles'; // נייבא את הסטיילים

function UserProfile() {
  // הגדרת הסטייט של המשתמש
  const [profile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    imageUrl: ''  // נתיב לתמונה של המשתמש
  });


  return (
    <Wrapper>
      <h1>הפרופיל שלי</h1>
      <div>
        
        <img src={profile.imageUrl || '/default-profile.png'} alt="Profile" />
        <button onClick={() => alert('הפונקציה לשינוי תמונה תתווסף בהמשך!')}>ערוך</button>
      </div>
      
      <div>
        <p>שם מלא: {profile.fullName}</p>
        <p>אימייל: {profile.email}</p>
        <p>טלפון: {profile.phone}</p> 
        <button onClick={() => alert('הפונקציה לשינוי תמונה תתווסף בהמשך!')}>ערוך</button>
        <p>כתובת: {profile.address}</p>
        <button onClick={() => alert('הפונקציה לשינוי תמונה תתווסף בהמשך!')}>ערוך</button>
      </div>

      <button>שמור פרופיל</button>
    </Wrapper>
  );
}

export default UserProfile;
