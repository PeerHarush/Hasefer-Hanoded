import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookGallery from '../components/BookGallery.js';
import { pageWrapper, buttonStyle } from '../styles/Home.styles';
import API_BASE_URL from '../config';

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'בעיה בפרופיל');
        setUserName(data.full_name);
      })
      .catch(err => {
        console.error('❌ שגיאה:', err.message);
        alert('לא ניתן לטעון את הפרופיל. ודאי שאת מחוברת ושהשרת פעיל.');
      });
  }, []);

  const goToLogin = () => navigate('/login');
  const goToBook = () => navigate('/Book');
  const goToProfile = () => navigate('/Profile');
  const messeges = () => navigate('/MessagesPage');

  return (
    <div style={pageWrapper}>
      <h1>
        {userName ? `שלום, ${userName}!` : 'שלום אורח!'} 🌸
      </h1>

      <button onClick={goToLogin} style={buttonStyle}>מעבר לדף ההתחברות / הרשמה</button>
      <button onClick={goToBook} style={buttonStyle}>מעבר לדף ספר</button>
      <button onClick={goToProfile} style={buttonStyle}>מעבר לדף פרופיל</button>
      <button onClick={messeges} style={buttonStyle}>הודעות</button>

      <BookGallery />
    </div>
  );
}

<<<<<<< HEAD
export default Home;
=======
export default Home;
>>>>>>> origin/master
