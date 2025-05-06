import React from 'react';
import { useNavigate } from 'react-router-dom';
import BookGallery from '../components/BookGallery.js';
import { pageWrapper, buttonStyle } from '../styles/Home.styles';

function Home() {
  const navigate = useNavigate();

  const goToLogin = () => navigate('/login');
  const goToBook = () => navigate('/Book');
  const goToProfile = () => navigate('/Profile');
  const messeges = () => navigate('/MessagesPage');

  return (
    <div style={pageWrapper}>
            <h1>ברוכה הבאה לדף הבית 🌸</h1>

      <button onClick={goToLogin} style={buttonStyle}>מעבר לדף ההתחברות / הרשמה</button>
      <button onClick={goToBook} style={buttonStyle}>מעבר לדף ספר</button>
      <button onClick={goToProfile} style={buttonStyle}>מעבר לדף profile</button>

      <BookGallery />
    </div>
  );
}
export default Home;
