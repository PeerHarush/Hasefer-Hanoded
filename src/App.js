import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import Home from './pages/Home';
import LoginRegisterPage from './pages/LoginRegisterPage';
import Header from "./components/Header";
import Footer from './components/Footer'; 
import Profile from "./pages/UserProfilePage";
import WishList from "./pages/WishListPage";
import History from "./pages/HistoryPage";
import Transaction  from './pages/TransactionPage.jsx';
import AddBook from "./pages/AddBookPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import  AllBooksPage from "./pages/AllBooksPage.jsx";
import BookDetailsPage from './pages/BookDetailsPage.jsx';
import AboutUsPage from './pages/aboutUsPage.jsx';
function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/Profile" element={<Profile/>} />
        <Route path="/WishList" element={<WishList/>} />
        <Route path="/History" element={<History/>} />
        <Route path="/Transaction" element={<Transaction/>} />
        <Route path="/AddBook" element={<AddBook/>} />
        <Route path="/MessagesPage" element={<MessagesPage/>} />
        <Route path="/AllBooks" element={<AllBooksPage />} />
        <Route path="/book/:bookTitle" element={<BookDetailsPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        


 </Routes>
      <Footer/>
    </div>
  );
  
}

export default App;
