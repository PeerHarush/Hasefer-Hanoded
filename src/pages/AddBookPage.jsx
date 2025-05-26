import React, { useState, useRef, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config';
import {
  Wrapper, Card, Title, Subtitle, FormGroup, Label, Input, Button,
  ImageUploadContainer, PreviewImage, EditAddressButton, Select, SuggestionsList,
  MapHelpText, MapContainer, ActionButton
} from '../styles/AddBookPage.styles';
import GenresSelect from "../components/GenresSelect";
import Map, { geocodeAddress } from '../components/Map';


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

  // Address validation states - now handled by the unified Map component
  const [addressValidationState, setAddressValidationState] = useState(null);
  const [suggestedAddress, setSuggestedAddress] = useState('');
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [validatedPosition, setValidatedPosition] = useState(null);

  const fileInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const addressTimeoutRef = useRef(null);

  // Helper function for fuzzy string matching
  const levenshteinDistance = (str1, str2) => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  // Enhanced address validation function with stricter requirements
  const validateAddress = useCallback(async (address) => {
    if (!address || address.trim().length < 5) { // Minimum 5 characters instead of 3
      setAddressValidationState(null);
      return;
    }

    const trimmedAddress = address.trim();
    
    // Basic structure validation - Israeli address should have street + city/number
    const hasNumber = /\d+/.test(trimmedAddress);
    const hasLetters = /[א-ת]|[a-zA-Z]/.test(trimmedAddress);
    const wordCount = trimmedAddress.split(/\s+/).length;
    
    // Reject addresses that are too simple or incomplete
    if (wordCount < 2 || !hasLetters) {
      setAddressValidationState('invalid');
      setIsValidatingAddress(false);
      return;
    }

    setIsValidatingAddress(true);
    setAddressValidationState('validating');

    try {
      // Try to geocode the exact address with more specific parameters
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmedAddress)}&limit=10&accept-language=he&addressdetails=1&countrycodes=il&bounded=1&viewbox=34.2,33.3,35.9,29.5`
      );
      const data = await response.json();

      if (data.length === 0) {
        setAddressValidationState('invalid');
        setIsValidatingAddress(false);
        return;
      }

      // Enhanced address matching with stricter requirements
      const checkAddressMatch = (result, inputAddress) => {
        const displayName = result.display_name.toLowerCase();
        const inputLower = inputAddress.toLowerCase().trim();
        
        // Must be in Israel
        const isIsraeliAddress = displayName.includes('israel') || displayName.includes('ישראל');
        if (!isIsraeliAddress) {
          return { match: false, confidence: 0, reason: 'not_israel' };
        }

        // Parse input address parts
        const inputParts = inputLower.split(/[\s,]+/).filter(part => part.length > 1);
        const addressDetails = result.address || {};
        
        // Extract key components
        const apiStreet = (addressDetails.road || '').toLowerCase();
        const apiCity = (addressDetails.city || addressDetails.town || addressDetails.village || '').toLowerCase();
        const apiHouseNumber = addressDetails.house_number;
        
        // Look for street number in input
        const streetNumberMatch = inputLower.match(/(\d+)/);
        const inputStreetNumber = streetNumberMatch ? streetNumberMatch[1] : null;

        let streetMatches = 0;
        let cityMatches = 0;
        let numberMatches = 0;
        let qualityScore = 0;
        let totalChecked = 0;

        // More sophisticated matching
        for (const part of inputParts) {
          if (part.length < 2) continue;
          totalChecked++;

          // Check house number match
          if (part.match(/^\d+$/) && inputStreetNumber) {
            if (apiHouseNumber === part || displayName.includes(` ${part} `)) {
              numberMatches++;
              qualityScore += 0.3; // House number is important
            }
            continue;
          }

          // Check city match - more precise
          if (apiCity) {
            if (apiCity.includes(part) || part.includes(apiCity)) {
              cityMatches++;
              qualityScore += 0.4; // City is very important
            } else if (levenshteinDistance(apiCity, part) <= 2 && part.length > 3) {
              // Allow small typos in city names
              cityMatches += 0.7;
              qualityScore += 0.3;
            }
          }

          // Check street match - more precise
          if (apiStreet) {
            if (apiStreet.includes(part) || part.includes(apiStreet)) {
              streetMatches++;
              qualityScore += 0.3;
            } else if (levenshteinDistance(apiStreet, part) <= 2 && part.length > 3) {
              // Allow small typos in street names
              streetMatches += 0.7;
              qualityScore += 0.2;
            }
          }
        }

        // Calculate base confidence
        const baseConfidence = totalChecked > 0 ? qualityScore / Math.max(totalChecked * 0.4, 1) : 0;
        
        // Requirement checks for Israeli addresses
        const hasRequiredCity = cityMatches > 0;
        const hasRequiredStreet = streetMatches > 0 || apiStreet.length > 0;
        const hasGoodStructure = addressDetails.road && (addressDetails.city || addressDetails.town || addressDetails.village);
        
        // Bonus for complete address structure
        let finalConfidence = baseConfidence;
        if (hasGoodStructure) finalConfidence += 0.15;
        if (hasRequiredCity && hasRequiredStreet) finalConfidence += 0.2;
        if (numberMatches > 0) finalConfidence += 0.1;
        
        // Penalty for incomplete addresses
        if (!hasRequiredCity) finalConfidence -= 0.3;
        if (!hasRequiredStreet && !apiStreet) finalConfidence -= 0.2;
        
        finalConfidence = Math.max(0, Math.min(1, finalConfidence));

        // Determine if this is a good match
        const isGoodMatch = finalConfidence >= 0.7 && hasRequiredCity && hasGoodStructure;
        const isPartialMatch = finalConfidence >= 0.4 && finalConfidence < 0.7 && hasGoodStructure;

        return { 
          match: isGoodMatch, 
          confidence: finalConfidence,
          isPartial: isPartialMatch,
          hasRequiredElements: hasRequiredCity && hasGoodStructure,
          reason: !hasRequiredCity ? 'missing_city' : !hasRequiredStreet ? 'missing_street' : 'ok'
        };
      };

      // Check all results and find best matches
      const results = data.map(result => ({
        ...result,
        ...checkAddressMatch(result, trimmedAddress)
      }));

      // Sort by confidence and quality
      results.sort((a, b) => {
        if (a.hasRequiredElements !== b.hasRequiredElements) {
          return b.hasRequiredElements ? 1 : -1;
        }
        return b.confidence - a.confidence;
      });

      const bestResult = results[0];
      
      // Decision logic with stricter requirements
      if (bestResult.match && bestResult.confidence >= 0.7 && bestResult.hasRequiredElements) {
        // Excellent match - valid address
        const position = [parseFloat(bestResult.lat), parseFloat(bestResult.lon)];
        setValidatedPosition(position);
        setCurrentPosition(position);
        setAddressValidationState('valid');
      } else if (bestResult.isPartial && bestResult.confidence >= 0.5 && bestResult.hasRequiredElements) {
        // Partial match with good structure - suggest correction
        const position = [parseFloat(bestResult.lat), parseFloat(bestResult.lon)];
        
        const formatSuggestedAddress = (result) => {
          if (result.address) {
            const { road, house_number, city, town, village } = result.address;
            const parts = [];

            // Build suggested address
            if (road) {
              parts.push(house_number ? `${road} ${house_number}` : road);
            }

            const cityName = city || town || village;
            if (cityName) {
              parts.push(cityName);
            }

            return parts.join(', ');
          }
          return result.display_name.split(',').slice(0, 2).join(',').trim();
        };

        setSuggestedAddress(formatSuggestedAddress(bestResult));
        setValidatedPosition(position);
        setAddressValidationState('suggestion');
      } else if (bestResult.confidence >= 0.3 && bestResult.hasRequiredElements) {
        // Low confidence but has basic structure
        const position = [parseFloat(bestResult.lat), parseFloat(bestResult.lon)];
        setValidatedPosition(position);
        setCurrentPosition(position);
        setAddressValidationState('low_confidence');
      } else {
        // No good match found
        if (bestResult.reason === 'missing_city') {
          setAddressValidationState('missing_city');
        } else if (bestResult.reason === 'missing_street') {
          setAddressValidationState('missing_street');
        } else {
          setAddressValidationState('invalid');
        }
      }
    } catch (error) {
      console.error('שגיאה בוולידציה של כתובת:', error);
      setAddressValidationState('error');
    } finally {
      setIsValidatingAddress(false);
    }
  }, []);

  // Debounced address validation
  const debouncedValidateAddress = useCallback((address) => {
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }

    addressTimeoutRef.current = setTimeout(() => {
      validateAddress(address);
    }, 800); // Wait 800ms after user stops typing
  }, [validateAddress]);

  // Handle accepting suggested address
  const handleAcceptSuggestion = () => {
    setForm(prev => ({ ...prev, location: suggestedAddress }));
    setCurrentPosition(validatedPosition);
    setAddressValidationState('valid');
  };

  // Handle rejecting suggestion
  const handleRejectSuggestion = () => {
    setAddressValidationState(null);
    setSuggestedAddress('');
    // Focus back to the input for editing
    if (addressInputRef.current) {
      addressInputRef.current.focus();
    }
  };

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

        // Validate the user's default address
        if (data.address) {
          validateAddress(data.address);
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
        },
        err => {
          console.error('שגיאה באחזור מיקום:', err.message);
          setCurrentPosition([32.0853, 34.7818]);
        }
      );
    } else {
      setCurrentPosition([32.0853, 34.7818]);
    }

    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [validateAddress]);

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

    // Check if address is validated with stricter requirements
    if (!addressValidationState || ['invalid', 'missing_city', 'missing_street', 'error'].includes(addressValidationState)) {
      alert('יש לוודא שהכתובת תקינה וכוללת רחוב ועיר לפני שליחת הטופס');
      return;
    }

    if (addressValidationState === 'suggestion') {
      alert('יש לאשר או לדחות את הצעת הכתובת לפני שליחת הטופס');
      return;
    }

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
      setAddressValidationState(null);
      setSuggestedAddress('');
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

    // Reset validation state when user types
    setAddressValidationState(null);
    setSuggestedAddress('');

    // Start validation process
    debouncedValidateAddress(address);
  };

  const handleAddressKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAddress(form.location);
    }
  };

  const finishAddressEditing = () => {
    setIsEditingLocation(false);
    // Final validation when editing is done
    if (form.location.trim()) {
      validateAddress(form.location);
    }
  };

  const updateAddressFromMap = (address) => {
    setForm(prev => ({ ...prev, location: address }));
    // Validate the address selected from map
    validateAddress(address);
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
                  ref={addressInputRef}
                  placeholder="הקלד כתובת מלאה עם רחוב ועיר (לדוגמה: רחוב הרצל 5, תל אביב)"
                />
                <ActionButton type="button" onClick={finishAddressEditing}>עדכון ואישור הכתובת</ActionButton>
              </>
            )}
          </FormGroup>

          {currentPosition && (
            <MapContainer>
              <Map
                position={currentPosition}
                setPosition={setCurrentPosition}
                address={form.location}
                updateAddress={updateAddressFromMap}
                helpText="לחץ על המפה לעדכון המיקום או הקלד כתובת מלאה למעלה"
                showValidation={true}
                validationState={addressValidationState}
                suggestedAddress={suggestedAddress}
                onAcceptSuggestion={handleAcceptSuggestion}
                onRejectSuggestion={handleRejectSuggestion}
                isValidating={isValidatingAddress}
              />
            </MapContainer>
          )}

          <Button type="submit" style={{ marginTop: '1rem' }}>הוסף ספר</Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default AddBookPage;