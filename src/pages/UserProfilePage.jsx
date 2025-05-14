import React, { useState, useEffect, useRef } from 'react';
import { Wrapper, ProfileCard, ProfileImage, InputContainer, Label, GenreList, PointsText, SaveButton, EditButton, InputRow } from '../styles/UserProfile.styles';
import API_BASE_URL from '../config';
import GenresSelect from '../components/GenresSelect';

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
    favorite_genres: false,
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
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Wrapper>
  <ProfileCard>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ marginRight: '20px' }}>הפרופיל שלי</h1>
      <div style={{ textAlign: 'center' }}>
        <ProfileImage
          src={previewImage || '/default-profile.png'}
          alt="Profile"
        />
        <EditButton onClick={handleUploadClick}>✏️ </EditButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
      </div>
    </div>

    <InputContainer>
      <InputRow>
        <Label>שם מלא:</Label>
        {editMode.full_name ? (
          <input name="full_name" value={profile.full_name} onChange={handleChange} />
        ) : (
          <span>{profile.full_name}</span>
        )}
        <EditButton onClick={() => toggleEdit('full_name')}> ✏️</EditButton>
      </InputRow>

      <InputRow>
        <Label>טלפון:</Label>
        {editMode.phone_number ? (
          <input name="phone_number" value={profile.phone_number} onChange={handleChange} />
        ) : (
          <span>{profile.phone_number}</span>
        )}
        <EditButton onClick={() => toggleEdit('phone_number')}>✏️</EditButton>
      </InputRow>

      <InputRow>
        <Label>כתובת:</Label>
        {editMode.address ? (
          <input name="address" value={profile.address} onChange={handleChange} />
        ) : (
          <span>{profile.address}</span>
        )}
        <EditButton onClick={() => toggleEdit('address')}>✏️</EditButton>
      </InputRow>
    </InputContainer>

    <GenreList>
      <InputRow style={{ alignItems: 'center' }}>
        <Label>ז'אנרים אהובים:</Label>
        <EditButton onClick={() => toggleEdit('favorite_genres')}>✏️</EditButton>
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
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {profile.favorite_genres.map((genre, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ marginLeft: '6px' }}>📚</span> {genre}
            </li>
          ))}
        </ul>
      ) : (
        <p>אין ז'אנרים אהובים</p>
      )}
    </GenreList>

    <PointsText>
      <p>🪙 נקודות: {profile.points}</p>
    </PointsText>

    <SaveButton onClick={handleSave}>שמור פרופיל</SaveButton>
  </ProfileCard>
</Wrapper>

  );
}

export default UserProfile;
