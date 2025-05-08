import React, { useState, useEffect, useRef } from 'react';
import {
  Wrapper,
  ProfileImage,
  InputContainer,
  Label,
  GenreList,
  PointsText,
  SaveButton,
  EditButton
} from '../styles/UserProfile.styles';
import API_BASE_URL from '../config';

function UserProfile() {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    favorite_genres: [],
    avatar: null,
    points: 0,
  });

  const [editMode, setEditMode] = useState({
    full_name: false,
    phone_number: false,
    address: false,
  });

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
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Wrapper>
      <h1>הפרופיל שלי</h1>

      <div>
      <ProfileImage
          src={previewImage || '/default-profile.png'}
          alt="Profile"
        />

        <br />
        <EditButton onClick={handleUploadClick}>✏️ ערוך תמונה</EditButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
      </div>

      <InputContainer>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Label>שם מלא:</Label>
          {editMode.full_name ? (
            <input name="full_name" value={profile.full_name} onChange={handleChange} />
          ) : (
            <span>{profile.full_name}</span>
          )}
          <EditButton onClick={() => toggleEdit('full_name')}> ✏️ערוך</EditButton>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Label>טלפון:</Label>
          {editMode.phone_number ? (
            <input name="phone_number" value={profile.phone_number} onChange={handleChange} />
          ) : (
            <span>{profile.phone_number}</span>
          )}
          <EditButton onClick={() => toggleEdit('phone_number')}>✏️ ערוך</EditButton>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Label>כתובת:</Label>
          {editMode.address ? (
            <input name="address" value={profile.address} onChange={handleChange} />
          ) : (
            <span>{profile.address}</span>
          )}
          <EditButton onClick={() => toggleEdit('address')}>✏️ ערוך</EditButton>
        </div>
      </InputContainer>

      <GenreList>
        <p>ז'אנרים אהובים:</p>
        {profile.favorite_genres.length > 0 ? (
          <ul>
            {profile.favorite_genres.map((genre, i) => (
              <li key={i}>{genre}</li>
            ))}
          </ul>
        ) : (
          <p>אין ז'אנרים אהובים</p>
        )}
      </GenreList>

      <PointsText>
        <p><strong>🪙 נקודות:</strong> {profile.points}</p>
      </PointsText>

      <SaveButton onClick={handleSave}>שמור פרופיל</SaveButton>
    </Wrapper>
  );
}

export default UserProfile;