import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Home from './pages/Home';
import LoginRegisterPage from './pages/LoginRegisterPage';
import Header from './components/Header';
import Footer from './components/Footer';
import Profile from './pages/UserProfilePage';
import WishList from './pages/WishListPage';
import History from './pages/HistoryPage';
import Transaction from './pages/TransactionPage.jsx';
import AddBook from './pages/AddBookPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import AllBooksPage from './pages/AllBooksPage.jsx';
import BookDetailsPage from './pages/BookDetailsPage.jsx';
import AboutUsPage from './pages/aboutUsPage.jsx';
import ChatPage from './pages/ChatPage';
import MyAddedBooks from './pages/MyAddedBooks.jsx';
import BackButton from './components/BackButton';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  //Insert Chatbase script on load
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.chatbase.co/embed.min.js';
    script.defer = true;
    script.setAttribute('chatbotId', '6ceWUMKzaeQPxohY6xLct');
    script.setAttribute('domain', 'www.chatbase.co');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <Header />

      {!isHomePage && <BackButton />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/WishList" element={<WishList />} />
        <Route path="/History" element={<History />} />
        <Route path="/Transaction" element={<Transaction />} />
        <Route path="/AddBook" element={<AddBook />} />
        <Route path="/MessagesPage" element={<MessagesPage />} />
        <Route path="/AllBooks" element={<AllBooksPage />} />
        <Route path="/book/:bookTitle" element={<BookDetailsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/chat/:chatRoomId" element={<ChatPage />} />
        <Route path="/my-books" element={<MyAddedBooks />} />
      </Routes>

      <Footer />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
