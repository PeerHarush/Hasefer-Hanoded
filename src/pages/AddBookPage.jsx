import React, { useState, useRef, useEffect } from 'react';
import API_BASE_URL from '../config';
import {
  Wrapper, Card, Title, Subtitle, FormGroup, Label, Input, Button,
  ImageUploadContainer, PreviewImage, EditAddressButton, Select
} from '../styles/AddBookPage.styles';
import GenresSelect from "../components/GenresSelect";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// תיקון אייקון של leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const AddBookPage = () => {
  const [form, setForm] = useState({
    bookTitle: '',
    bookAuthor: '',
    bookDescription: '',
    genres: [],
    price: '',
    condition: '',
    location: '',
    bookImage: null,
  });

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [showAutoFillButton, setShowAutoFillButton] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    fetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'בעיה בפרופיל');
        setUserAddress(data.address);
        setForm(prev => ({ ...prev, location: data.address }));
      })
      .catch(err => {
        console.error('❌ שגיאה:', err.message);
        alert('לא ניתן לטעון את הפרופיל.');
      });

    // בקשת מיקום נוכחי
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setCurrentPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        err => {
          console.error('שגיאה באחזור מיקום:', err.message);
        }
      );
    }
  }, []);

  const handleAutoFillBook = async () => {
    const title = form.bookTitle.trim();
    const author = form.bookAuthor.trim();

    if (!title || !author) {
      alert('יש להזין גם שם ספר וגם שם מחבר');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/books?search=${encodeURIComponent(title)}`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        alert('הספר לא נמצא במערכת.');
        return;
      }

      const foundBook = data.find(book => {
        const bookTitle = book.title?.trim().toLowerCase();
        const bookAuthors = Array.isArray(book.authors)
          ? book.authors.join(', ').toLowerCase()
          : (book.authors || '').toLowerCase();
        return (
          bookTitle === title.toLowerCase() &&
          bookAuthors.includes(author.toLowerCase())
        );
      });

      if (!foundBook) {
        alert('הספר לא נמצא במערכת.');
        return;
      }

      const rawImage = foundBook.coverImageUrl || foundBook.image_url || foundBook.cover_image;
      const imageUrl = rawImage
        ? (rawImage.startsWith('http') || rawImage.startsWith('data:image')
          ? rawImage
          : `${API_BASE_URL}/${rawImage}`)
        : null;

      setForm(prev => ({
        ...prev,
        bookDescription: prev.bookDescription || foundBook.description || '',
        genres: prev.genres.length ? prev.genres : foundBook.genres || [],
        bookImage: imageUrl,
        bookId: foundBook.id || foundBook.book_id,
      }));

      if (imageUrl && !previewImage) {
        setPreviewImage(imageUrl);
      }
    } catch (err) {
      console.error('שגיאה באיתור ספר:', err.message);
      alert('שגיאה באיתור ספר: ' + err.message);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('יש להתחבר כדי להעלות ספר');
      return;
    }

    const fd = new FormData();
    fd.append('title', form.bookTitle);
    fd.append('authors', form.bookAuthor);
    fd.append('genres', form.genres.join(','));
    fd.append('book_description', form.bookDescription);
    fd.append('condition', form.condition);
    fd.append('price', form.price);
    fd.append('location', form.location);

    if (form.bookImage instanceof File) {
      fd.append('book_cover', form.bookImage);
      fd.append('listing_image', form.bookImage);
    }

    if (form.bookId) {
      fd.append('book_id', form.bookId);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/book-listings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        const message = Array.isArray(data.detail)
          ? data.detail.map(e => e.msg).join(', ')
          : data.detail || 'העלאה נכשלה';
        throw new Error(message);
      }

      alert('📚 הספר נוסף בהצלחה!');
      setForm({
        bookTitle: '',
        bookAuthor: '',
        bookDescription: '',
        genres: [],
        price: '',
        condition: '',
        location: userAddress || '',
        bookImage: null,
        bookId: null,
      });
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;

    } catch (err) {
      alert(`❌ שגיאה: ${err.message}`);
      console.error('Upload error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        setForm(prev => ({
          ...prev,
          bookImage: file,
        }));
        setPreviewImage(URL.createObjectURL(file));
      }
    } else if (name === 'genres') {
      setForm(prev => ({
        ...prev,
        genres: checked
          ? [...prev.genres, value]
          : prev.genres.filter(g => g !== value)
      }));
    } else {
      const updatedForm = { ...form, [name]: value };
      setForm(updatedForm);

      if (updatedForm.bookTitle.trim() && updatedForm.bookAuthor.trim()) {
        setShowAutoFillButton(true);
      } else {
        setShowAutoFillButton(false);
      }
    }
  };

  return (
    <Wrapper>
      <Card>
        <Title>הוסף ספר</Title>
        <Subtitle>הזן את פרטי הספר שברצונך להוסיף</Subtitle>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>שם הספר</Label>
            <Input name="bookTitle" value={form.bookTitle} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label>מחבר</Label>
            <Input name="bookAuthor" value={form.bookAuthor} onChange={handleChange} required />
          </FormGroup>
          {showAutoFillButton && (
            <Button type="button" onClick={handleAutoFillBook}>מצא את הספר ומלא אוטומטית</Button>
          )}
          <FormGroup>
            <Label>תקציר</Label>
            <Input name="bookDescription" value={form.bookDescription} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label>תמונה</Label>
            <ImageUploadContainer onClick={handleUploadClick}>
              {previewImage ? (
                <PreviewImage src={previewImage} alt="תצוגה מקדימה" />
              ) : (
                <span>לחץ להעלאה</span>
              )}
              <Input
                type="file"
                name="bookImage"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleChange}
              />
            </ImageUploadContainer>
          </FormGroup>
          <GenresSelect selectedGenres={form.genres} onChange={handleChange} labelText="ז'אנרים" />
          <FormGroup>
            <Label>מחיר</Label>
            <Input type="number" name="price" value={form.price} onChange={handleChange} min="0" required />
          </FormGroup>
          <FormGroup>
            <Label>מצב הספר</Label>
            <Select name="condition" value={form.condition} onChange={handleChange} required>
              <option value="">בחר</option>
              <option value="New">חדש</option>
              <option value="Used - Like New">כמו חדש</option>
              <option value="Used - Good">טוב</option>
              <option value="Used - Poor">משומש</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>מיקום</Label>
            {!isEditingLocation ? (
              <>
                <div>{form.location}</div>
                <EditAddressButton type="button" onClick={() => setIsEditingLocation(true)}>שנה כתובת</EditAddressButton>
              </>
            ) : (
              <Input name="location" value={form.location} onChange={handleChange} />
            )}
          </FormGroup>

          {/* מפת מיקום נוכחי */}
          {currentPosition && (
            <div style={{ height: '300px', margin: '1rem 0 2rem', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer center={currentPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />
                <Marker position={currentPosition} />
              </MapContainer>
            </div>
          )}

          <Button type="submit">הוסף ספר</Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default AddBookPage;
