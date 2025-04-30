import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import Home from './pages/Home';
import LoginRegisterPage from './pages/LoginRegisterPage';
import BookDetails from './pages/BookDetailsPage'
import Header from "./components/Header";
import Footer from './components/Footer'; 
import Profile from "./pages/UserProfilePage";
import WishList from "./pages/WishListPage";
import History from "./pages/HistoryPage";
import Transaction  from './pages/TransactionPage.jsx';
import AddBook from "./pages/AddBookPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/Book" element={<BookDetails />} />
        <Route path="/Profile" element={<Profile/>} />
        <Route path="/WishList" element={<WishList/>} />
        <Route path="/History" element={<History/>} />
        <Route path="/Transaction" element={<Transaction/>} />
        <Route path="/AddBook" element={<AddBook/>} />
        <Route path="/MessagesPage" element={<MessagesPage/>} />
 </Routes>
      <Footer/>
    </div>
  );
  
}

export default App;
