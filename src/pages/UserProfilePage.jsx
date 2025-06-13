import React, { useState, useEffect, useRef } from 'react';
import {
  Wrapper,
  ProfileCard,
  ProfileImage,
  InputContainer,
  Label,
  GenreList,
  PointsText,
  SaveButton,
  EditButton,
  Title,
  InputRow,
  HeaderContainer,
  FieldGroup,
  FieldValue,
  ImageContainer,
  GenresListItem,
  GenreIcon,
  NotificationSection,
  NotificationTitle,
  NotificationRow,
  NotificationInfo,
  NotificationLabel,
  NotificationDescription,
  SwitchContainer,
  SwitchInput,
  SwitchSlider,
  NotificationMessage,
} from '../styles/UserProfile.styles';
import API_BASE_URL from '../config';
import GenresSelect from '../components/GenresSelect';
import Map from '../components/Map';
import { LOCATION_IQ_TOKEN } from '../config';

function UserProfile() {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    favorite_genres: [],
    avatar: null,
    points: 0,
    email_notifications_enabled: true,
  });

  const [editMode, setEditMode] = useState({
    full_name: false,
    phone_number: false,
    address: false,
    favorite_genres: false,
  });

  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const [mapPosition, setMapPosition] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

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

        setProfile({
          ...data,
          favorite_genres: Array.isArray(data.favorite_genres)
            ? data.favorite_genres
            : data.favorite_genres?.split(',') || [],
          email_notifications_enabled: data.email_notifications_enabled ?? true,
        });

        if (data.avatar_url) {
          setPreviewImage(data.avatar_url);
        }
      })
      .catch(err => {
        console.error('❌ שגיאה:', err.message);
        alert('לא ניתן לטעון את הפרופיל. ודאי שאת מחוברת ושהשרת פעיל.');
      });
  }, []);

 const handleNotificationToggle = () => {
  if (notificationLoading) return;

  const newValue = !profile.email_notifications_enabled;

  setProfile(prev => ({ 
    ...prev, 
    email_notifications_enabled: newValue 
  }));

  setNotificationLoading(true);
  setTimeout(() => {
    setNotificationLoading(false);
    setNotificationMessage('');
  }, 2500);
};

  const handleChange = e => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setProfile(prev => ({ ...prev, avatar: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const toggleEdit = field => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    const fd = new FormData();
    fd.append('full_name', profile.full_name);
    fd.append('phone_number', profile.phone_number);
    fd.append('address', profile.address);
    fd.append('favorite_genres', profile.favorite_genres.join(','));

    if (profile.avatar instanceof File) {
      fd.append('avatar', profile.avatar);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      if (!res.ok) throw new Error('עדכון נכשל');
      alert('הפרופיל נשמר בהצלחה!');
      
      setEditMode(prev => ({ ...prev, address: false }));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Wrapper>
      <ProfileCard>
        <HeaderContainer>
          <Title>הפרופיל שלי</Title>
          <ImageContainer>
            <ProfileImage
              src={previewImage || '/default-profile.png'}
              alt="Profile"
            />
            <EditButton onClick={handleUploadClick}>✏️</EditButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </ImageContainer>
        </HeaderContainer>

        <InputContainer>
          <InputRow>
            <EditButton onClick={() => toggleEdit('full_name')}>✏️</EditButton>
            <FieldGroup>
              <Label>שם מלא:</Label>
              {editMode.full_name ? (
                <input name="full_name" value={profile.full_name} onChange={handleChange} />
              ) : (
                <FieldValue>{profile.full_name}</FieldValue>
              )}
            </FieldGroup>
          </InputRow>

          <InputRow>
            <EditButton onClick={() => toggleEdit('phone_number')}>✏️</EditButton>
            <FieldGroup>
              <Label>טלפון:</Label>
              {editMode.phone_number ? (
                <input name="phone_number" value={profile.phone_number} onChange={handleChange} />
              ) : (
                <FieldValue>{profile.phone_number}</FieldValue>
              )}
            </FieldGroup>
          </InputRow>

          <InputRow>
            <EditButton onClick={() => toggleEdit('address')}>✏️</EditButton>
            <FieldGroup>
              <Label>כתובת:</Label>
              {editMode.address ? (
                <div style={{ width: '100%' }}>
                  <input 
                    name="address" 
                    value={profile.address} 
                    onChange={handleChange} 
                    placeholder="הזן כתובת או לחץ על המפה"
                    style={{ marginBottom: '10px', width: '100%' }}
                  />
                  <Map
                    position={mapPosition}
                    setPosition={setMapPosition}
                    address={profile.address}
                    updateAddress={(addr) => setProfile(prev => ({ ...prev, address: addr }))}
                    userProfileAddress={profile.address}
                    autoLocate={true}
                    height="250px"
                    helpText="לחץ על המפה כדי לשנות את המיקום או הקלד כתובת חדשה"
                    onPositionChange={(coords, info) => {
                      console.log('מיקום עודכן:', coords, info);
                    }}
                    onAddressValidationChange={(status) => {
                      console.log('סטטוס וולידציה:', status);
                    }}
                  />
                </div>
              ) : (
                <FieldValue>{profile.address || 'לא הוגדרה כתובת'}</FieldValue>
              )}
            </FieldGroup>
          </InputRow>
        </InputContainer>

        <GenreList>
          <InputRow>
            <EditButton onClick={() => toggleEdit('favorite_genres')}>✏️</EditButton>
            <FieldGroup>
              <Label>ז'אנרים אהובים:</Label>
            </FieldGroup>
          </InputRow>

          {editMode.favorite_genres ? (
            <GenresSelect
              selectedGenres={profile.favorite_genres}
              onChange={(e) => {
                const { value, checked } = e.target;
                setProfile((prev) => {
                  const updatedGenres = checked
                    ? [...prev.favorite_genres, value]
                    : prev.favorite_genres.filter((g) => g !== value);
                  return { ...prev, favorite_genres: updatedGenres };
                });
              }}
            />
          ) : profile.favorite_genres.length > 0 ? (
            <ul>
              {profile.favorite_genres.map((genre, i) => (
                <GenresListItem key={i}>
                  <GenreIcon>📚</GenreIcon>
                  {genre}
                </GenresListItem>
              ))}
            </ul>
          ) : (
            <p>אין ז'אנרים אהובים</p>
          )}
        </GenreList>

          <NotificationSection>
            <NotificationTitle>
              📧 הגדרות התראות
            </NotificationTitle>
            
            <NotificationRow>
              <NotificationInfo>
                <NotificationLabel>
                  התראות בדואר אלקטרוני
                </NotificationLabel>
                <NotificationDescription>
                  קבל התראות על הודעות חדשות ועסקאות במייל
                </NotificationDescription>
              </NotificationInfo>
              
              <SwitchContainer>
                <SwitchInput
                  type="checkbox"
                  checked={profile.email_notifications_enabled}
                  onChange={handleNotificationToggle}
                  disabled={notificationLoading}
                />
                <SwitchSlider 
                  $isEnabled={profile.email_notifications_enabled}
                  onClick={handleNotificationToggle}
                />
              </SwitchContainer>
            </NotificationRow>

            {notificationMessage && (
              <NotificationMessage $isSuccess={notificationMessage.includes('✅')}>
                {notificationMessage}
              </NotificationMessage>
            )}
          </NotificationSection>

        <PointsText> נקודות: {profile.points}🪙</PointsText>

        <SaveButton onClick={handleSave}>שמור פרופיל</SaveButton>
      </ProfileCard>
    </Wrapper>
  );
}

export default UserProfile;