import React, { useEffect, useState } from 'react';
import {
  Wrapper,
  CardsContainer,
  BookCard,
  StockTag,
  Title,
  DeleteButton,
  
} from '../styles/WishList.styles';
import { DeleteIconButton } from '../styles/MyAddedBooks.styles';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Modal, Button } from 'react-bootstrap';
import { FaTrashAlt } from 'react-icons/fa';


function MyAddedBooks() {
  const [listings, setListings] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [selectedListingId, setSelectedListingId] = useState(null);
const handleShowModal = (id) => {
  setSelectedListingId(id);
  setShowDeleteModal(true);
};

const handleConfirmDelete = () => {
  if (selectedListingId) {
    handleDelete(selectedListingId);
    setShowDeleteModal(false);
    setSelectedListingId(null);
  }
};

const handleCancelDelete = () => {
  setShowDeleteModal(false);
  setSelectedListingId(null);
};

const renderDeleteTooltip = (props) => (
  <Tooltip id="delete-tooltip" {...props}>
למחיקת העותק מהמערכת  </Tooltip>
);

  useEffect(() => {
    const fetchUserAndListings = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        // שליפת המשתמש
        const userRes = await fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) throw new Error('שגיאה בטעינת פרטי המשתמש');
        const userData = await userRes.json();
        setUserId(userData.id);

        // שליפת כל העותקים
        const listingsRes = await fetch(`${API_BASE_URL}/book-listings`);
        const allListings = await listingsRes.json();

        // סינון לפי המשתמש המחובר (לפי seller.id)
        const myListings = allListings.filter(
          listing => listing.seller?.id === userData.id
        );

        setListings(myListings);
      } catch (err) {
        console.error('שגיאה בטעינת העותקים שלך:', err.message);
      }
    };

    fetchUserAndListings();
  }, []);

  const handleDelete = async (listingId) => {
    const confirm = window.confirm('למחוק את הספר הזה?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/book-listings/${listingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('מחיקה נכשלה');
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err) {
      console.error('שגיאה במחיקה:', err.message);
      alert('מחיקה נכשלה');
    }
  };

  return (
    <Wrapper>
      <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
 
  <Modal.Header>
  <Modal.Title>למחוק את הספר?😢</Modal.Title>
</Modal.Header>

  <Modal.Body>
    בטוח שאתה רוצה למחוק את הספר?<br />
    סתם יצבור אבק במדף... לא חבל?
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleCancelDelete}>
      ביטול
    </Button>
    <Button variant="danger" onClick={handleConfirmDelete}>
      כן, תמחק
    </Button>
  </Modal.Footer>
</Modal>

        
      <Title> הספרים שלי </Title>
             

      <CardsContainer>
        {listings.length === 0 ? (
          <p>לא נמצאו ספרים שלך</p>
        ) : (
          listings.map((listing) => (
            <Link
              to={`/book/${encodeURIComponent(listing.book?.title)}`}
              key={listing.id}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <BookCard>
              <OverlayTrigger placement="top" overlay={renderDeleteTooltip}>
                      <DeleteIconButton
                        onClick={(e) => {
                          e.preventDefault(); // לא לנווט
                          handleShowModal(listing.id); // הצג מודל
                        }}
                        title="מחק עותק"
                      >
                        <FaTrashAlt />
                      </DeleteIconButton>
                    </OverlayTrigger>


                <img
                  src={listing.book?.image_url || '/images/default-book.png'}
                  alt={listing.book?.title}
                  onError={(e) => {
                    e.target.src = '/images/default-book.png';
                  }}
                />
                <div className="book-details">
                  <h3>{listing.book?.title}</h3>
                  <p>{listing.book?.authors}</p>
                  <StockTag $inStock={true}>במלאי</StockTag>
                </div>
              </BookCard>
            </Link>
          ))
        )}
      </CardsContainer>
    </Wrapper>
  );
}

export default MyAddedBooks;
