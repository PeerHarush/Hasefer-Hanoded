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

// Main Map Component
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

  // Export useful functions for parent components
  return (
    <>
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

// Export the component and utility functions
export default Map;
export { geocodeAddress, reverseGeocode, calculateDistance };