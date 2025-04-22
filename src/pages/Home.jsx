import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };
  const goToBook = () => {
    navigate('/Book');
  };
  const goToProfile = () => {
    navigate('/Profile');
  };

  

  return (
    <div style={{ textAlign: 'center', marginTop: '5rem' }}>
      <h1>ברוכה הבאה לדף הבית 🌸</h1>
      
      <button
        onClick={goToLogin}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '10px',
          backgroundColor: '#daaa84',
          color: '#fff',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        מעבר לדף ההתחברות / הרשמה
      </button>

      <button
        onClick={goToBook}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '10px',
          backgroundColor: '#daaa84',
          color: '#fff',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        מעבר לדף ספר
      </button>

<button
        onClick={goToProfile}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          borderRadius: '10px',
          backgroundColor: '#daaa84',
          color: '#fff',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        מעבר לדף profile
      </button>
      
    </div>
    
  );
}

export default Home;
