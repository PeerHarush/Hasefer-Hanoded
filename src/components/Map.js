import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styled from 'styled-components';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Styled components for the map
const MapContainerStyled = styled.div`
  height: ${props => props.height || '300px'};
  margin: ${props => props.margin || '1rem 0 2rem'};
  border-radius: 8px;
  overflow: hidden;
`;

const MapHelpTextStyled = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
`;

// Styled components for address validation
const ValidationContainer = styled.div`
  margin-top: 0.5rem;
`;

const ValidationMessage = styled.div`
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'warning':
        return `
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'error':
        return `
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'info':
        return `
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
      default:
        return `
          background-color: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
        `;
    }
  }}
`;

const SuggestionContainer = styled.div`
  background-color: #e7f3ff;
  border: 1px solid #b3d7ff;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
`;

const SuggestionText = styled.div`
  margin-bottom: 0.5rem;
  color: #0c5460;
  font-size: 0.9rem;
`;

const SuggestedAddress = styled.div`
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  margin: 0.5rem 0;
  font-weight: 500;
  color: #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ValidationButton = styled.button`
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 500;
  
  ${props => props.primary ? `
    background-color: #007bff;
    color: white;
    &:hover {
      background-color: #0056b3;
    }
  ` : `
    background-color: #6c757d;
    color: white;
    &:hover {
      background-color: #545b62;
    }
  `}
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Interactive marker component
const LocationMarker = ({ position, setPosition, updateAddress, clickable = true }) => {
  const map = useMapEvents(clickable ? {
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      map.flyTo(newPosition, map.getZoom());
      
      // Convert the clicked point to an address
      reverseGeocode(newPosition)
        .then(address => {
          if (address && updateAddress) {
            updateAddress(address);
          }
        })
        .catch(err => {
          console.error('שגיאה בהמרת מיקום לכתובת:', err);
        });
    },
  } : {});

  // Update map position when position changes from outside
  useEffect(() => {
    if (position && map) {
      map.flyTo(position, 15);
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

// Address Validation Component
const AddressValidation = ({ 
  validationState, 
  suggestedAddress, 
  onAcceptSuggestion, 
  onRejectSuggestion,
  isValidating 
}) => {
  const renderValidationContent = () => {
    switch (validationState) {
      case 'validating':
        return (
          <ValidationMessage type="info">
            מאמת כתובת...
            <LoadingSpinner />
          </ValidationMessage>
        );
        
      case 'valid':
        return (
          <ValidationMessage type="success">
            ✓ כתובת תקינה ואומתה
          </ValidationMessage>
        );
        
      case 'invalid':
        return (
          <ValidationMessage type="error">
            ✗ כתובת לא נמצאה במערכת. אנא בדוק את הכתובת ונסה שוב.
          </ValidationMessage>
        );
        
      case 'suggestion':
        return (
          <SuggestionContainer>
            <SuggestionText>
              💡 נמצאה כתובת דומה. האם התכוונת ל:
            </SuggestionText>
            <SuggestedAddress>
              {suggestedAddress}
            </SuggestedAddress>
            <ButtonGroup>
              <ValidationButton primary onClick={onAcceptSuggestion}>
                כן, השתמש בכתובת המתוקנת
              </ValidationButton>
              <ValidationButton onClick={onRejectSuggestion}>
                לא, אני אשנה בעצמי
              </ValidationButton>
            </ButtonGroup>
          </SuggestionContainer>
        );
        
      case 'low_confidence':
        return (
          <ValidationMessage type="warning">
            ⚠️ כתובת נמצאה אך רמת הביטחון נמוכה. אנא ודא שהכתובת נכונה במפה למטה.
          </ValidationMessage>
        );
        
      default:
        return null;
    }
  };

  return (
    <ValidationContainer>
      {renderValidationContent()}
    </ValidationContainer>
  );
};

// Function to convert coordinates to address
const reverseGeocode = async (position) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&accept-language=he`
    );
    const data = await response.json();
    
    if (data && data.address) {
      const { road, house_number, city, town, village } = data.address;
      const cityName = city || town || village || '';
      return [road, house_number, cityName].filter(Boolean).join(' ');
    }
    return null;
  } catch (error) {
    console.error('שגיאה בהמרת מיקום לכתובת:', error);
    throw error;
  }
};

// Function to convert address to coordinates
const geocodeAddress = async (address) => {
  if (!address || address.trim().length < 3) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=he`
    );
    const data = await response.json();
    
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      return [lat, lon];
    }
    return null;
  } catch (error) {
    console.error('שגיאה בחיפוש כתובת:', error);
    throw error;
  }
};

// Calculate distance between two points in km
const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return null;
  
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Main Map Component with integrated validation
const Map = ({
  initialPosition = [32.0853, 34.7818], // Default to Tel Aviv
  position = null,
  setPosition = () => {},
  address = '',
  updateAddress = () => {},
  height = '300px',
  margin = '1rem 0 2rem',
  helpText = 'לחץ על המפה לעדכון המיקום או הקלד כתובת',
  showHelpText = true,
  clickable = true,
  onMapLoad = () => {},
  // Validation props
  showValidation = false,
  validationState = null,
  suggestedAddress = '',
  onAcceptSuggestion = () => {},
  onRejectSuggestion = () => {},
  isValidating = false
}) => {
  const [mapInstance, setMapInstance] = useState(null);
  
  useEffect(() => {
    if (mapInstance) {
      onMapLoad(mapInstance);
    }
  }, [mapInstance, onMapLoad]);

  useEffect(() => {
    if (position && mapInstance) {
      mapInstance.flyTo(position, 15);
    }
  }, [position, mapInstance]);

  // Create debounced geocode function
  const debouncedGeocodeAddress = useCallback((address) => {
    if (!address || address.trim().length < 3) return;
    
    geocodeAddress(address)
      .then(newPosition => {
        if (newPosition) {
          setPosition(newPosition);
          if (mapInstance) {
            mapInstance.flyTo(newPosition, 15);
          }
        }
      })
      .catch(err => {
        console.error('שגיאה בחיפוש כתובת:', err);
      });
  }, [setPosition, mapInstance]);

  return (
    <>
      {showValidation && (
        <AddressValidation
          validationState={validationState}
          suggestedAddress={suggestedAddress}
          onAcceptSuggestion={onAcceptSuggestion}
          onRejectSuggestion={onRejectSuggestion}
          isValidating={isValidating}
        />
      )}
      
      <MapContainerStyled height={height} margin={margin}>
        <LeafletMapContainer 
          center={position || initialPosition} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMapInstance}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <LocationMarker 
            position={position || initialPosition} 
            setPosition={setPosition}
            updateAddress={updateAddress}
            clickable={clickable}
          />
        </LeafletMapContainer>
      </MapContainerStyled>
      
      {showHelpText && <MapHelpTextStyled>{helpText}</MapHelpTextStyled>}
    </>
  );
};

// Export the main component and utility functions
export default Map;
export { AddressValidation, geocodeAddress, reverseGeocode, calculateDistance };