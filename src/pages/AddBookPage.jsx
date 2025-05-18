import React, { useState, useRef, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config';
import {
  Wrapper, Card, Title, Subtitle, FormGroup, Label, Input, Button,
  ImageUploadContainer, PreviewImage, EditAddressButton, Select, SuggestionsList,
  MapHelpText, MapContainer, ActionButton
} from '../styles/AddBookPage.styles';
import GenresSelect from "../components/GenresSelect";
import { MapContainer as LeafletMapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Interactive marker component
const LocationMarker = ({ position, setPosition, updateAddress }) => {
  const map = useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      map.flyTo(newPosition, map.getZoom());
      
      // Convert the clicked point to an address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition[0]}&lon=${newPosition[1]}&accept-language=he`)
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const { road, house_number, city, town, village } = data.address;
            const cityName = city || town || village || '';
            const locationText = [road, house_number, cityName].filter(Boolean).join(' ');
            updateAddress(locationText);
          }
        })
        .catch(err => {
          console.error('שגיאה בהמרת מיקום לכתובת:', err);
        });
    },
  });

  // Update map position when position changes from outside
  useEffect(() => {
    if (position && map) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

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

  const [bookSuggestions, setBookSuggestions] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [showAutoFillButton, setShowAutoFillButton] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [map, setMap] = useState(null);
  const fileInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const addressTimeoutRef = useRef(null);

  // Debounced geocoding function - waits 500ms after user stops typing
  const debouncedGeocodeAddress = useCallback((address) => {
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    addressTimeoutRef.current = setTimeout(() => {
      geocodeAddress(address);
    }, 500);
  }, []);

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

        // Try to geocode the user's address to show on map
        if (data.address) {
          geocodeAddress(data.address);
        }
      })
      .catch(err => {
        console.error('❌ שגיאה:', err.message);
        alert('לא ניתן לטעון את הפרופיל.');
      });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setCurrentPosition(coords);

          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}&accept-language=he`)
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const { road, house_number, city, town, village } = data.address;
                const cityName = city || town || village || '';
                const locationText = [road, house_number, cityName].filter(Boolean).join(' ');
                setForm(prev => ({ ...prev, location: locationText }));
              }
            })
            .catch(err => {
              console.error('שגיאה בהמרת מיקום לכתובת:', err);
            });
        },
        err => {
          console.error('שגיאה באחזור מיקום:', err.message);
          // Fallback to Tel Aviv coordinates if geolocation fails
          setCurrentPosition([32.0853, 34.7818]);
        }
      );
    } else {
      // Fallback to Tel Aviv coordinates if geolocation not supported
      setCurrentPosition([32.0853, 34.7818]);
    }

    // Cleanup function to clear timeout
    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, []);

  // Function to convert address to coordinates
  const geocodeAddress = (address) => {
    if (!address || address.trim().length < 3) return;
    
    // Show loading indicator or feedback
    console.log('מחפש את הכתובת...');
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=he`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const newPosition = [lat, lon];
          setCurrentPosition(newPosition);
          
          // If map is available, fly to the new position
          if (map) {
            map.flyTo(newPosition, 15);
          }
          
          console.log('נמצאה כתובת:', data[0].display_name);
        } else {
          console.log('לא נמצאה כתובת');
        }
      })
      .catch(err => {
        console.error('שגיאה בחיפוש כתובת:', err);
      });
  };

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

  const handleSelectSuggestion = (book) => {
    const rawImage = book.coverImageUrl || book.image_url || book.cover_image;
    const imageUrl = rawImage
      ? (rawImage.startsWith('http') || rawImage.startsWith('data:image')
        ? rawImage
        : `${API_BASE_URL}/${rawImage}`)
      : null;

    setForm(prev => ({
      ...prev,
      bookTitle: book.title || '',
      bookAuthor: Array.isArray(book.authors) ? book.authors.join(', ') : book.authors || '',
      bookDescription: book.description || '',
      genres: book.genres || [],
      bookImage: imageUrl,
      bookId: book.id || book.book_id,
    }));

    if (imageUrl) {
      setPreviewImage(imageUrl);
    }

    setIsSuggestionsVisible(false);
  };

  const handleUploadClick = () => fileInputRef.current.click();

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
        headers: { Authorization: `Bearer ${token}` },
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

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        setForm(prev => ({ ...prev, bookImage: file }));
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

      if (name === 'bookTitle' && value.trim().length >= 2) {
        try {
          const res = await fetch(`${API_BASE_URL}/books?search=${encodeURIComponent(value)}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setBookSuggestions(data);
            setIsSuggestionsVisible(true);
          }
        } catch (err) {
          console.error('שגיאה בשליפת הצעות:', err);
        }
      } else if (name === 'bookTitle') {
        setBookSuggestions([]);
        setIsSuggestionsVisible(false);
      }

      if (updatedForm.bookTitle.trim() && updatedForm.bookAuthor.trim()) {
        setShowAutoFillButton(true);
      } else {
        setShowAutoFillButton(false);
      }
    }
  };

  const handleAddressChange = (e) => {
    const address = e.target.value;
    setForm(prev => ({ ...prev, location: address }));
    
    // Use debounced geocoding for a better UX
    if (address.trim().length > 3) {
      debouncedGeocodeAddress(address);
    }
  };

  // Handle address input key press - search on Enter
  const handleAddressKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      geocodeAddress(form.location);
    }
  };

  // Handle address input blur - search when focus leaves the field
  const handleAddressBlur = () => {
    if (form.location.trim().length > 3) {
      geocodeAddress(form.location);
    }
  };

  // Handle finishing address editing
  const finishAddressEditing = () => {
    setIsEditingLocation(false);
    // Final geocode once editing is done
    if (form.location.trim()) {
      geocodeAddress(form.location);
    }
  };

  // Update the address from map click
  const updateAddressFromMap = (address) => {
    setForm(prev => ({ ...prev, location: address }));
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
            {isSuggestionsVisible && bookSuggestions.length > 0 && (
              <SuggestionsList>
                {bookSuggestions.map((book, idx) => (
                  <li key={idx} onClick={() => handleSelectSuggestion(book)}>
                    {book.title} {book.authors ? `— ${Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}` : ''}
                  </li>
                ))}
              </SuggestionsList>
            )}
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
              <>
                <Input 
                  name="location" 
                  value={form.location} 
                  onChange={handleAddressChange}
                  onKeyDown={handleAddressKeyDown}
                  onBlur={handleAddressBlur}
                  ref={addressInputRef}
                  placeholder="הקלד כתובת ולחץ אנטר או לחץ בחוץ לחיפוש"
                />
                <ActionButton type="button" onClick={finishAddressEditing}>אישור כתובת</ActionButton>
              </>
            )}
          </FormGroup>

          {currentPosition && (
            <MapContainer>
              <LeafletMapContainer 
                center={currentPosition} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                whenCreated={setMap}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <LocationMarker 
                  position={currentPosition} 
                  setPosition={setCurrentPosition}
                  updateAddress={updateAddressFromMap}
                />
              </LeafletMapContainer>
              <MapHelpText>
                לחץ על המפה לעדכון המיקום או הקלד כתובת למעלה
              </MapHelpText>
            </MapContainer>
          )}

          <Button type="submit" style={{ marginTop: '1rem' }}>הוסף ספר</Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default AddBookPage;