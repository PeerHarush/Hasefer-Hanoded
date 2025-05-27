// Map.jsx - קומפוננטת מפה כוללת ולידציות
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
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&accept-language=he`);
  const data = await response.json();
  if (data && data.address) {
    const { road, house_number, city, town, village } = data.address;
    const cityName = city || town || village || '';
    return [road, house_number, cityName].filter(Boolean).join(' ');
  }
  return null;
};

const AddressValidation = ({ validationState, suggestedAddress, onAcceptSuggestion, onRejectSuggestion, isValidating }) => {
  switch (validationState) {
    case 'validating':
      return <ValidationMessage type="info">מאמת כתובת... <LoadingSpinner /></ValidationMessage>;
    case 'valid':
      return <ValidationMessage type="success">✓ כתובת תקינה</ValidationMessage>;
    case 'invalid':
      return <ValidationMessage type="error">✗ כתובת לא נמצאה</ValidationMessage>;
    case 'suggestion':
      return (
        <SuggestionContainer>
          <SuggestionText>האם התכוונת ל:</SuggestionText>
          <SuggestedAddress>{suggestedAddress}</SuggestedAddress>
          <ButtonGroup>
            <ValidationButton primary onClick={onAcceptSuggestion}>כן</ValidationButton>
            <ValidationButton onClick={onRejectSuggestion}>לא</ValidationButton>
          </ButtonGroup>
        </SuggestionContainer>
      );
    default:
      return null;
  }
};

const LocationMarker = ({ position, setPosition, updateAddress }) => {
  const map = useMapEvents({
    click(e) {
      const coords = [e.latlng.lat, e.latlng.lng];
      setPosition(coords);
      map.flyTo(coords);
      reverseGeocode(coords).then(updateAddress).catch(() => {});
    },
  });

  useEffect(() => {
    if (position) map.flyTo(position);
  }, [position]);

  return position ? <Marker position={position} /> : null;
};
const Map = ({ position, setPosition, address, updateAddress, height = '300px', helpText }) => {
  const [validationState, setValidationState] = useState(null);
  const [suggestedAddress, setSuggestedAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const addressTimeoutRef = useRef(null);

  const levenshteinDistance = (str1, str2) => {
    const matrix = Array(str2.length + 1).fill().map(() => []);
    for (let i = 0; i <= str2.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        matrix[i][j] = str2[i - 1] === str1[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
      }
    }
    return matrix[str2.length][str1.length];
  };

  const validateAddress = useCallback(async (input) => {
    if (!input || input.trim().length < 2) {
      setValidationState(null);
      return;
    }

    const trimmed = input.trim();
    const hasLetters = /[א-ת]|[a-zA-Z]/.test(trimmed);
    if (!hasLetters) {
      setValidationState('invalid');
      return;
    }

    setIsValidating(true);
    setValidationState('validating');

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed + ', ישראל')}&limit=10&accept-language=he&addressdetails=1`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.length) {
        setValidationState('not_found');
        return;
      }

      const result = data[0];
      const pos = [parseFloat(result.lat), parseFloat(result.lon)];
      setPosition(pos);

      const displayName = result.display_name.toLowerCase();
      const confidence = 1 - (levenshteinDistance(trimmed.toLowerCase(), displayName) / displayName.length);

      if (confidence > 0.6) {
        setValidationState('valid');
        updateAddress(result.display_name);
      } else {
        setSuggestedAddress(result.display_name);
        setValidationState('suggestion');
      }

    } catch (err) {
      setValidationState('error');
    } finally {
      setIsValidating(false);
    }
  }, [setPosition, updateAddress]);

  const handleAcceptSuggestion = () => {
    updateAddress(suggestedAddress);
    setValidationState('valid');
    setSuggestedAddress('');
  };

  const handleRejectSuggestion = () => {
    setValidationState(null);
    setSuggestedAddress('');
  };

  useEffect(() => {
    if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current);
    addressTimeoutRef.current = setTimeout(() => {
      validateAddress(address);
    }, 400);
    return () => clearTimeout(addressTimeoutRef.current);
  }, [address, validateAddress]);

  return (
    <>
      <ValidationContainer>
        <AddressValidation
          validationState={validationState}
          suggestedAddress={suggestedAddress}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          isValidating={isValidating}
        />
      </ValidationContainer>

      <MapContainerStyled height={height}>
        <LeafletMapContainer center={position || [32.0853, 34.7818]} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker position={position} setPosition={setPosition} updateAddress={updateAddress} />
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

// ממיר כתובת למיקום גאוגרפי (latitude, longitude)
const geocodeAddress = async (address) => {
  if (!address || address.trim().length < 2) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', ישראל')}&limit=1&accept-language=he`;

  try {
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

// ייצוא של הפונקציות הנוספות
export { reverseGeocode, geocodeAddress, calculateDistance };

export default Map;
