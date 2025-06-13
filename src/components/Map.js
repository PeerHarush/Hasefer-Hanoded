// Map.jsx - תיקון בעיית הוולידציה
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  MapContainerStyled,
  MapHelpTextStyled,
  ValidationContainer,
  ValidationMessage,
  SuggestionContainer,
  SuggestionText,
  SuggestedAddress,
  ButtonGroup,
  ValidationButton,
  LoadingSpinner,
   CenteredLoadingBox,
  StyledLoadingSpinner,
  LoadingText
} from '../styles/Map.styles';
import { LOCATION_IQ_TOKEN } from '../config';

// הגדרת אייקונים של Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// פונקציה להמרת קואורדינטות לכתובת
const reverseGeocode = async (position) => {
  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${LOCATION_IQ_TOKEN}&lat=${position[0]}&lon=${position[1]}&format=json&accept-language=he`
    );
    const data = await response.json();
    
    if (data && data.address) {
      const { road, house_number, city, town, village, suburb } = data.address;
      const streetPart = [road, house_number].filter(Boolean).join(' ');
      const cityPart = city || town || village || suburb || '';
      return [streetPart, cityPart].filter(Boolean).join(', ');
    }
    return null;
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return null;
  }
};

// פונקציה להמרת כתובת לקואורדינטות
// const geocodeAddress = async (address) => {
//   if (!address || address.trim().length < 2) return null;

//   const trimmed = address.trim();

//   try {
//     // ניסיון ראשון - עם "ישראל"
// let url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_TOKEN}&q=${encodeURIComponent(trimmed)}&format=json&limit=1&accept-language=he&countrycodes=il`;
//     let res = await fetch(url);
//     let data = await res.json();

//     // אם לא נמצא, ניסיון שני - בלי "ישראל" אבל עם countrycodes
//     if (!data.length) {
//       url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1&accept-language=he&countrycodes=il`;
//       res = await fetch(url);
//       data = await res.json();
//     }

//     // אם עדיין לא נמצא, ניסיון שלישי - חיפוש בטווח גיאוגרפי רחב יותר
//     if (!data.length) {
//      const fallback = trimmed.split(',')[0];
//       url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_TOKEN}&q=${encodeURIComponent(fallback)}&format=json&limit=1&accept-language=he`;
//       res = await fetch(url);
//       data = await res.json();
//     }

//     if (data && data.length > 0) {
//       const { lat, lon } = data[0];
//       return [parseFloat(lat), parseFloat(lon)];
//     }

//     return null;
//   } catch (err) {
//     console.error('Geocode error:', err);
//     return null;
//   }
// };
// const geocodeAddress = async (address) => {
//   if (!address || address.trim().length < 2) return null;

//   const trimmed = address.trim();

//   try {
//     // ניסיון ראשון - עם "ישראל"
// let url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_TOKEN}&q=${encodeURIComponent(trimmed)}&format=json&limit=1&accept-language=he&countrycodes=il`;
//     let res = await fetch(url);
//     let data = await res.json();

//     // אם לא נמצא, ניסיון שני - בלי "ישראל" אבל עם countrycodes
//     if (!data.length) {
//       url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1&accept-language=he&countrycodes=il`;
//       res = await fetch(url);
//       data = await res.json();
//     }

//     // אם עדיין לא נמצא, ניסיון שלישי - חיפוש בטווח גיאוגרפי רחב יותר
//     if (!data.length) {
//      const fallback = trimmed.split(',')[0];
//       url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_TOKEN}&q=${encodeURIComponent(fallback)}&format=json&limit=1&accept-language=he`;
//       res = await fetch(url);
//       data = await res.json();
//     }

//     if (data && data.length > 0) {
//       const { lat, lon } = data[0];
//       return [parseFloat(lat), parseFloat(lon)];
//     }

//     return null;
//   } catch (err) {
//     console.error('Geocode error:', err);
//     return null;
//   }
// };
const geocodeAddress = async (address) => {
  if (!address || address.trim().length < 2) return null;

  const trimmed = address.trim();

  try {
    const url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_TOKEN}&q=${encodeURIComponent(trimmed)}&format=json&limit=1&accept-language=he`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return [parseFloat(lat), parseFloat(lon)];
    }

    return null;
  } catch (err) {
    console.error('Geocode error:', err);
    return null;
  }
};


// קומפוננטת ולידציה של כתובת
const AddressValidation = ({ validationState, suggestedAddresses, onAcceptSuggestion, onRejectSuggestion }) => {
  switch (validationState) {
    case 'validating':
      return (
        <ValidationMessage type="info">
          מחפש כתובת... <LoadingSpinner />
        </ValidationMessage>
      );
    case 'valid':
      return <ValidationMessage type="success">✓ כתובת נמצאה</ValidationMessage>;
    case 'not_found':
      return (
        <ValidationMessage type="error">
          ✗ כתובת לא נמצאה - נסה להקליד עיר ורחוב בישראל
        </ValidationMessage>
      );
    case 'suggestions':
      return (
        <SuggestionContainer>
          <SuggestionText>האם התכוונת לאחד מהמקומות הבאים:</SuggestionText>
          {suggestedAddresses.map((addr, idx) => (
            <SuggestedAddress key={idx} onClick={() => onAcceptSuggestion(addr)}>
              {addr.display_name}
            </SuggestedAddress>
          ))}
          <ButtonGroup>
            <ValidationButton onClick={onRejectSuggestion}>ביטול</ValidationButton>
          </ButtonGroup>
        </SuggestionContainer>
      );
    case 'map_updated':
      return <ValidationMessage type="info">🗺️ מיקום עודכן מהמפה</ValidationMessage>;
    default:
      return null;
  }
};

// קומפוננטת מרקר שמטפלת בקליקים על המפה
const LocationMarker = ({ position, onMapClick, shouldCenterMap }) => {
  const map = useMapEvents({
    click(e) {
      const coords = [e.latlng.lat, e.latlng.lng];
      onMapClick(coords);
    },
  });

  // עדכון מיקום המפה רק כאשר נדרש
  useEffect(() => {
    if (position && shouldCenterMap) {
      const currentCenter = map.getCenter();
      const distance = map.distance([currentCenter.lat, currentCenter.lng], position);
      
      // אם המרחק גדול מ-500 מטר, נזיז את המפה
      if (distance > 500) {
        map.flyTo(position, 16, { duration: 1.5 });
      }
    }
  }, [position, map, shouldCenterMap]);

  return position ? <Marker position={position} /> : null;
};

// הקומפוננטה הראשית
const Map = ({ 
  position, 
  setPosition, 
  address, 
  updateAddress, 
  height = '300px', 
  helpText,
  userProfileAddress = null,
  autoLocate = true,
  onPositionChange,
  onAddressValidationChange
}) => {
  const [validationState, setValidationState] = useState(null);
  const [suggestedAddresses, setSuggestedAddresses] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [shouldCenterMap, setShouldCenterMap] = useState(true);
  
  // שינוי עיקרי: הפרדה בין מקור העדכון
  const [lastUpdateSource, setLastUpdateSource] = useState(null); // 'map', 'input', 'geolocation'
  const addressTimeoutRef = useRef(null);
  const hasInitialized = useRef(false);
  const lastValidatedAddress = useRef('');

  // פונקציה לקבלת מיקום נוכחי
  const getCurrentLocation = useCallback(async () => {
    if (!autoLocate || hasInitialized.current) return;
    
    setIsLoadingLocation(true);
    hasInitialized.current = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const coords = [pos.coords.latitude, pos.coords.longitude];
            setPosition(coords);
            setLastUpdateSource('geolocation');
            
            // המרת קואורדינטות לכתובת
            const currentAddress = await reverseGeocode(coords);
            if (currentAddress && updateAddress) {
              updateAddress(currentAddress);
              lastValidatedAddress.current = currentAddress || '';

            }
            setValidationState('valid');
            lastValidatedAddress.current = currentAddress || '';
          } catch (err) {
            console.error('שגיאה בהמרת מיקום לכתובת:', err);
            await fallbackToProfileAddress();
          }
          setIsLoadingLocation(false);
        },
        async (err) => {
          console.error('שגיאה באחזור מיקום:', err.message);
          await fallbackToProfileAddress();
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      await fallbackToProfileAddress();
      setIsLoadingLocation(false);
    }
  }, [autoLocate, setPosition, updateAddress]);

  // פונקציה לחזרה לכתובת פרופיל
  const fallbackToProfileAddress = useCallback(async () => {
    if (userProfileAddress) {
      const coords = await geocodeAddress(userProfileAddress);
      if (coords) {
        setPosition(coords);
        setValidationState('valid');
        lastValidatedAddress.current = userProfileAddress;
      } else {
        // מיקום ברירת מחדל - תל אביב
        setPosition([32.0853, 34.7818]);
        setValidationState('not_found');
      }
      
      setLastUpdateSource('geolocation');
      if (updateAddress) {
        updateAddress(userProfileAddress);
      }
    } else {
      // מיקום ברירת מחדל - תל אביב
      setPosition([32.0853, 34.7818]);
      setValidationState('not_found');
      setLastUpdateSource('geolocation');
    }
  }, [userProfileAddress, setPosition, updateAddress]);

  // טיפול בקליק על המפה
  const handleMapClick = useCallback(async (coords) => {
    setPosition(coords);
    setLastUpdateSource('map');
    setShouldCenterMap(false);
    
    if (onPositionChange) {
      onPositionChange(coords, { source: 'map' });
    }

    try {
      const newAddress = await reverseGeocode(coords);
      if (newAddress && updateAddress) {
        updateAddress(newAddress);
        setValidationState('map_updated'); // מצב מיוחד לעדכון מהמפה
        lastValidatedAddress.current = newAddress;
      } else {
        setValidationState('map_updated');
      }
    } catch (err) {
      console.error('שגיאה בהמרת מיקום לכתובת:', err);
      setValidationState('map_updated');
    }
  }, [setPosition, updateAddress, onPositionChange]);

  // חיפוש כתובת עם הצעות - רק להקלדה ידנית
  const searchAddress = useCallback(async (input) => {
    if (!input || input.trim().length < 2) {
      setValidationState(null);
      setSuggestedAddresses([]);
      return;
    }

    // אם זו אותה כתובת שכבר עברה וולידציה, לא נבדוק שוב
    if (input.trim() === lastValidatedAddress.current) {
      return;
    }

    const trimmed = input.trim();
    setValidationState('validating');

    try {
      // חיפוש עם מספר וריאציות
      const searchQueries = [
        { query: `${trimmed}, ישראל`, params: 'countrycodes=il' },
        { query: trimmed, params: 'countrycodes=il' },
        { query: trimmed, params: 'viewbox=34.2,33.4,35.9,31.2&bounded=1' }
      ];

      let allResults = [];

      for (let searchQuery of searchQueries) {
        const url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_TOKEN}&q=${encodeURIComponent(trimmed)}&format=json&limit=5&accept-language=he&addressdetails=1&countrycodes=il`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.length > 0) {
          allResults = [...allResults, ...data];
          break;
        }
      }

      if (allResults.length === 0) {
        setValidationState('not_found');
        setSuggestedAddresses([]);
        lastValidatedAddress.current = ''; // איפוס כתובת מאומתת
        return;
      }

      // הסרת כפילויות
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.place_id === result.place_id)
      );

      const firstResult = uniqueResults[0];
      const coords = [parseFloat(firstResult.lat), parseFloat(firstResult.lon)];

      // בדיקת דיוק התוצאה
      const inputLower = trimmed.toLowerCase();
      const displayNameLower = firstResult.display_name.toLowerCase();
      const inputWords = inputLower.split(/[\s,]+/).filter(word => word.length > 1);
      const matchingWords = inputWords.filter(word => displayNameLower.includes(word));
      const accuracy = matchingWords.length / inputWords.length;

      if (accuracy >= 0.5 || uniqueResults.length === 1) {
        // התוצאה מדויקת מספיק
        setShouldCenterMap(true);
        setPosition(coords);
        setValidationState('valid');
        setSuggestedAddresses([]);
        lastValidatedAddress.current = trimmed;
        setLastUpdateSource('input');
      } else {
        // הצגת הצעות
        setValidationState('suggestions');
        setSuggestedAddresses(uniqueResults.slice(0, 3));
        lastValidatedAddress.current = ''; // איפוס כתובת מאומתת
      }

    } catch (err) {
      console.error('שגיאה בחיפוש כתובת:', err);
      setValidationState('not_found');
      setSuggestedAddresses([]);
      lastValidatedAddress.current = ''; // איפוס כתובת מאומתת
    }
  }, [setPosition]);

  // טיפול בקבלת הצעה
  const handleAcceptSuggestion = useCallback((suggestion) => {
    const coords = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    setShouldCenterMap(true);
    setPosition(coords);

    if (updateAddress) {
      updateAddress(suggestion.display_name);
    }

    setValidationState('valid');
    setSuggestedAddresses([]);
    lastValidatedAddress.current = suggestion.display_name;
    setLastUpdateSource('input');
  }, [setPosition, updateAddress]);

  // טיפול בדחיית הצעות
  const handleRejectSuggestion = useCallback(() => {
    setValidationState('not_found');
    setSuggestedAddresses([]);
    lastValidatedAddress.current = ''; // איפוס כתובת מאומתת
  }, []);

  // אתחול המפה
  useEffect(() => {
    if (!position && !hasInitialized.current) {
      getCurrentLocation();
    }
  }, [getCurrentLocation, position]);

  // שינוי עיקרי: טיפול בשינוי כתובת - רק אם זו הקלדה ידנית
  useEffect(() => {
    // אם העדכון הגיע מהמפה או מ-geolocation, לא נבדוק וולידציה
    if (lastUpdateSource === 'map' || lastUpdateSource === 'geolocation') {
      // נאפס את המקור אחרי קצת זמן כדי לאפשר וולידציה עתידית
      const timeout = setTimeout(() => {
        setLastUpdateSource(null);
      }, 1000);
      return () => clearTimeout(timeout);
    }

    // ביטול timeout קודם
    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }

    // וולידציה רק אם זו הקלדה ידנית
    if (address && address.trim().length >= 2) {
      addressTimeoutRef.current = setTimeout(() => {
        searchAddress(address);
      }, 800);
    } else if (address.trim().length < 2) {
      setValidationState(null);
      setSuggestedAddresses([]);
      lastValidatedAddress.current = '';
    }

    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [address, searchAddress, lastUpdateSource]);

  // עדכון callback של ולידציה
  useEffect(() => {
    if (typeof onAddressValidationChange === 'function') {
      if (validationState === 'valid') {
        onAddressValidationChange('valid');
      } else if (validationState === 'not_found') {
        onAddressValidationChange('invalid');
      } else {
        onAddressValidationChange(null);
      }
    }
  }, [validationState, onAddressValidationChange]);

  // מסך טעינה
  if (isLoadingLocation) {
    return (
      <CenteredLoadingBox>
        <StyledLoadingSpinner />
        <LoadingText>מאתר את המיקום הנוכחי...</LoadingText>
      </CenteredLoadingBox>

    );
  }

  return (
    <>
      <ValidationContainer>
        <AddressValidation
          validationState={validationState}
          suggestedAddresses={suggestedAddresses}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
        />
      </ValidationContainer>

      <MapContainerStyled height={height}>
        <LeafletMapContainer 
          center={position || [32.0853, 34.7818]} 
          zoom={position ? 16 : 13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker 
            position={position} 
            onMapClick={handleMapClick}
            shouldCenterMap={shouldCenterMap}
          />
        </LeafletMapContainer>
      </MapContainerStyled>

      {helpText && <MapHelpTextStyled>{helpText}</MapHelpTextStyled>}
    </>
  );
};

// פונקציה לחישוב מרחק בין שתי נקודות
const calculateDistance = (coord1, coord2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // רדיוס כדור הארץ בקילומטרים
  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);

  const lat1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[0]);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export { reverseGeocode, geocodeAddress, calculateDistance };
export default Map;