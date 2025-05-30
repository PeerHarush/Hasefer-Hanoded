// Map.jsx - קומפוננטת מפה מתוקנת עם סינכרון טוב יותר
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
  LoadingSpinner
} from '../styles/Map.styles';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const reverseGeocode = async (position) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&accept-language=he&addressdetails=1`);
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

const AddressValidation = ({ validationState, suggestedAddresses, onAcceptSuggestion, onRejectSuggestion }) => {
  switch (validationState) {
    case 'validating':
      return <ValidationMessage type="info">מחפש כתובת... <LoadingSpinner /></ValidationMessage>;
    case 'valid':
      return <ValidationMessage type="success">✓ כתובת נמצאה</ValidationMessage>;
    case 'not_found':
      return <ValidationMessage type="error">✗ כתובת לא נמצאה - נסה להקליד עיר ורחוב בישראל</ValidationMessage>;
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
    default:
      return null;
  }
};

const LocationMarker = ({ position, onMapClick, skipMapMove }) => {
  const map = useMapEvents({
    click(e) {
      const coords = [e.latlng.lat, e.latlng.lng];
      onMapClick(coords);
    },
  });

  // עדכון מיקום המפה רק כשיש שינוי במיקום
  const prevPosition = useRef(null);
  useEffect(() => {
    if (position && 
        (!prevPosition.current || 
         prevPosition.current[0] !== position[0] || 
         prevPosition.current[1] !== position[1])) {
      
      // אם מסומן לדלג על תזוזת המפה (לחיצה על המפה), לא נזיז כלום
      if (!skipMapMove) {
        // בדיקה אם המיקום רחוק מהמרכז הנוכחי של המפה
        const currentCenter = map.getCenter();
        const distance = map.distance([currentCenter.lat, currentCenter.lng], position);
        
        // רק אם המיקום רחוק יותר מ-500 מטר, נזיז את המפה
        if (distance > 500) {
          map.flyTo(position, 16, { duration: 1.5 });
        }
      }
      
      prevPosition.current = position;
    }
  }, [position, map, skipMapMove]);

  return position ? <Marker position={position} /> : null;
};

const Map = ({ 
  position, 
  setPosition, 
  address, 
  updateAddress, 
  height = '300px', 
  helpText,
  userProfileAddress = null,
  autoLocate = true,
  onPositionChange
}) => {
  const [validationState, setValidationState] = useState(null);
  const [suggestedAddresses, setSuggestedAddresses] = useState([]);
  const [isUpdatingFromMap, setIsUpdatingFromMap] = useState(false);
  const [isUpdatingFromAddress, setIsUpdatingFromAddress] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [skipMapMove, setSkipMapMove] = useState(false);
  
  const addressTimeoutRef = useRef(null);
  const hasAutoLocated = useRef(false);
  const lastProcessedAddress = useRef('');

  // פונקציה לקבלת המיקום הנוכחי
  const getCurrentLocationAndAddress = useCallback(async () => {
    if (hasAutoLocated.current || !autoLocate) return;
    
    setIsLoadingLocation(true);
    hasAutoLocated.current = true;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          
          try {
            const currentAddress = await reverseGeocode(coords);
            if (currentAddress && updateAddress) {
              setIsUpdatingFromMap(true);
              updateAddress(currentAddress);
              setTimeout(() => setIsUpdatingFromMap(false), 100);
            }
          } catch (err) {
            console.error('שגיאה בהמרת מיקום לכתובת:', err);
            if (userProfileAddress && updateAddress) {
              setIsUpdatingFromMap(true);
              updateAddress(userProfileAddress);
              setTimeout(() => setIsUpdatingFromMap(false), 100);
            }
          }
          
          setIsLoadingLocation(false);
        },
        async (err) => {
          console.error('שגיאה באחזור מיקום:', err.message);
          
          if (userProfileAddress) {
            const coords = await geocodeAddress(userProfileAddress);
            if (coords) {
              setPosition(coords);
            } else {
              setPosition([32.0853, 34.7818]);
            }
            
            if (updateAddress) {
              setIsUpdatingFromMap(true);
              updateAddress(userProfileAddress);
              setTimeout(() => setIsUpdatingFromMap(false), 100);
            }
          } else {
            setPosition([32.0853, 34.7818]);
          }
          
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      if (userProfileAddress) {
        const coords = await geocodeAddress(userProfileAddress);
        if (coords) {
          setPosition(coords);
        } else {
          setPosition([32.0853, 34.7818]);
        }
        
        if (updateAddress) {
          setIsUpdatingFromMap(true);
          updateAddress(userProfileAddress);
          setTimeout(() => setIsUpdatingFromMap(false), 100);
        }
      } else {
        setPosition([32.0853, 34.7818]);
      }
      
      setIsLoadingLocation(false);
    }
  }, [autoLocate, setPosition, updateAddress, userProfileAddress]);

  // חיפוש כתובת עם הצעות
  const searchAddress = useCallback(async (input) => {
    if (!input || input.trim().length < 2) {
      setValidationState(null);
      setSuggestedAddresses([]);
      return;
    }

    const trimmed = input.trim();
    
    // אם זו אותה כתובת שכבר עיבדנו, לא נעבד שוב
    if (trimmed === lastProcessedAddress.current) {
      return;
    }

    lastProcessedAddress.current = trimmed;
    setValidationState('validating');

    try {
      // חיפוש גמיש - תחילה עם ישראל
      let searchQueries = [
        `${trimmed}, ישראל`,
        trimmed
      ];

      let allResults = [];
      
      for (let query of searchQueries) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=he&addressdetails=1&countrycodes=il`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data && data.length > 0) {
          allResults = [...allResults, ...data];
          break; // אם מצא תוצאות, עוצר
        }
      }

      if (allResults.length === 0) {
        setValidationState('not_found');
        setSuggestedAddresses([]);
        return;
      }

      // סינון תוצאות כפולות
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.place_id === result.place_id)
      );

      const firstResult = uniqueResults[0];
      const coords = [parseFloat(firstResult.lat), parseFloat(firstResult.lon)];

      // בדיקה אם התוצאה הראשונה מדויקת
      const inputLower = trimmed.toLowerCase();
      const displayNameLower = firstResult.display_name.toLowerCase();
      
      // חיפוש מילים מרכזיות
      const inputWords = inputLower.split(/[\s,]+/).filter(word => word.length > 1);
      const matchingWords = inputWords.filter(word => displayNameLower.includes(word));
      const accuracy = matchingWords.length / inputWords.length;

      if (accuracy >= 0.5 || uniqueResults.length === 1) {
        // כתובת מדויקת - עדכן מיקום (ללא תזוזת מפה כי זה מחיפוש)
        setIsUpdatingFromAddress(true);
        setPosition(coords);
        setValidationState('valid');
        setSuggestedAddresses([]);
        setTimeout(() => setIsUpdatingFromAddress(false), 100);
      } else {
        // הצג הצעות
        setValidationState('suggestions');
        setSuggestedAddresses(uniqueResults.slice(0, 3));
      }

    } catch (err) {
      console.error('שגיאה בחיפוש כתובת:', err);
      setValidationState('not_found');
      setSuggestedAddresses([]);
    }
  }, [setPosition]);

  // טיפול בקליק על המפה - כאן נמנע מתזוזת מפה נוספת
  const handleMapClick = useCallback(async (coords) => {
    setIsUpdatingFromMap(true);
    setSkipMapMove(true); // מניעת תזוזת מפה נוספת
    setPosition(coords);
    setPosition(coords);
if (onPositionChange) {
  onPositionChange(coords, { source: 'map' });
}

    try {
      const newAddress = await reverseGeocode(coords);
      if (newAddress && updateAddress) {
        updateAddress(newAddress);
        setValidationState('valid');
      }
    } catch (err) {
      console.error('שגיאה בהמרת מיקום לכתובת:', err);
    }
    
    setTimeout(() => {
      setIsUpdatingFromMap(false);
      setSkipMapMove(false); // איפוס דגל מניעת תזוזה
    }, 1000);
  }, [setPosition, updateAddress]);

  // קבלת הצעה - כאן נאפשר תזוזת מפה
  const handleAcceptSuggestion = (suggestion) => {
    const coords = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    setIsUpdatingFromAddress(true);
    setPosition(coords);
    
    if (updateAddress) {
      updateAddress(suggestion.display_name);
    }
    
    setValidationState('valid');
    setSuggestedAddresses([]);
    setTimeout(() => {
      setIsUpdatingFromAddress(false);
    }, 1000);
  };

  const handleRejectSuggestion = () => {
    setValidationState('not_found');
    setSuggestedAddresses([]);
  };

  // אפקט לטעינת מיקום ראשוני
  useEffect(() => {
    if (!position && autoLocate) {
      getCurrentLocationAndAddress();
    }
  }, [getCurrentLocationAndAddress, position, autoLocate]);

  // אפקט לחיפוש כתובת - רק כשלא מגיע מהמפה
  useEffect(() => {
    if (isUpdatingFromMap) return;

    if (addressTimeoutRef.current) {
      clearTimeout(addressTimeoutRef.current);
    }
    
    addressTimeoutRef.current = setTimeout(() => {
      searchAddress(address);
    }, 800); // זמן המתנה ארוך יותר למניעת חיפושים מיותרים

    return () => {
      if (addressTimeoutRef.current) {
        clearTimeout(addressTimeoutRef.current);
      }
    };
  }, [address, searchAddress, isUpdatingFromMap]);

  if (isLoadingLocation) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '16px' }}>
        <LoadingSpinner style={{ marginBottom: '10px' }} />
        <div>מאתר את המיקום הנוכחי...</div>
      </div>
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
            skipMapMove={skipMapMove}
          />
        </LeafletMapContainer>
      </MapContainerStyled>

      {helpText && <MapHelpTextStyled>{helpText}</MapHelpTextStyled>}
    </>
  );
};

// מחשבת את המרחק בין שתי נקודות גאוגרפיות (בקו אווירי, בק"מ)
const calculateDistance = (coord1, coord2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // רדיוס כדור הארץ בק"מ
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

// ממיר כתובת למיקום גאוגרפי (latitude, longitude) - משופר
const geocodeAddress = async (address) => {
  if (!address || address.trim().length < 2) return null;

  const trimmed = address.trim();

  try {
    // חיפוש ראשון עם "ישראל"
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed + ', ישראל')}&limit=1&accept-language=he`;
    let res = await fetch(url);
    let data = await res.json();

    // אם לא מצא, מחפש בלי "ישראל" אבל עם קוד מדינה
    if (!data.length) {
      url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=1&accept-language=he&countrycodes=il`;
      res = await fetch(url);
      data = await res.json();
    }

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

export { reverseGeocode, geocodeAddress, calculateDistance };
export default Map;