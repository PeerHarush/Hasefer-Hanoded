import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookGallery from '../components/BookGallery';
import { PageWrapper , buttonStyle } from '../styles/Home.styles';
import API_BASE_URL from '../config';
import SearchBar from '../components/SearchBar'; // ייבוא קומפוננטת החיפוש

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // שליפת שם משתמש לפי טוקן
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

  // חיפוש דינמי תוך כדי הקלדה
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const url = searchTerm.trim()
          ? `${API_BASE_URL}/books?search=${encodeURIComponent(searchTerm)}`
          : `${API_BASE_URL}/books`;

        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setBooks(data);
        } else {
          throw new Error('שגיאה בקבלת הספרים');
        }
      } catch (err) {
        console.error("שגיאה בטעינת ספרים:", err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);


  return (
      <PageWrapper>
        <h1>{userName ? `שלום, ${userName}!` : 'שלום אורח!'} 🌸</h1>

        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <BookGallery books={books} />
      </PageWrapper>
  );
}

export default Home;
