// LoginRegisterPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import {
  Wrapper, Card, Title, Subtitle, Tabs, Tab, FormGroup, Label,
  Input, Button, ImageUploadContainer, PreviewImage
} from '../styles/LoginRegisterPage.styles';
import GenresSelect from '../components/GenresSelect';
import Map from '../components/Map';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhoneNumber = (phone) => /^05\d{8}$/.test(phone);

const LoginRegisterPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [form, setForm] = useState({
    name: '', email: '', password: '', genres: [], phonenum: '', address: '', profile_image: null
  });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => {
        const genres = prev.genres || [];
        return checked ? { ...prev, genres: [...genres, value] } : { ...prev, genres: genres.filter(g => g !== value) };
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      if (activeTab === 'register') {
        const newErrors = { ...errors };
        if (name === 'email' && !isValidEmail(value)) newErrors.email = 'כתובת אימייל לא תקינה';
        else if (name === 'phonenum' && !isValidPhoneNumber(value)) newErrors.phonenum = 'מספר טלפון לא תקין';
        else delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, profile_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'register') {
      const newErrors = {};
      if (!isValidEmail(form.email)) newErrors.email = 'כתובת אימייל לא תקינה';
      if (!isValidPhoneNumber(form.phonenum)) newErrors.phonenum = 'מספר טלפון לא תקין';
      if (!form.address) newErrors.address = 'כתובת נדרשת';
      if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

      const fd = new FormData();
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('full_name', form.name);
      fd.append('phone_number', form.phonenum);
      fd.append('address', form.address);
      fd.append('favorite_genres', form.genres.join(','));
      if (form.profile_image) fd.append('avatar', form.profile_image);
      if (mapPosition) {
        fd.append('latitude', mapPosition[0]);
        fd.append('longitude', mapPosition[1]);
      }
      try {
        const res = await fetch(`${API_BASE_URL}/signup`, { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || 'Signup failed');
        alert('נרשמת בהצלחה!');
        setActiveTab('login');
      } catch (err) {
        alert(err.message);
      }
    } else {
      try {
        const res = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || 'Login failed');
        localStorage.setItem('access_token', json.access_token);
        localStorage.setItem('refresh_token', json.refresh_token);
        localStorage.setItem('userLoggedIn', 'true');
        navigate('/');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <Wrapper isRegister={activeTab === 'register'}>
      <Card>
        <Title>ברוכים הבאים</Title>
        <Subtitle>{activeTab === 'login' ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}</Subtitle>
        <Tabs>
          <Tab active={activeTab === 'login'} onClick={() => setActiveTab('login')}>התחברות</Tab>
          <Tab active={activeTab === 'register'} onClick={() => setActiveTab('register')}>הרשמה</Tab>
        </Tabs>
        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <FormGroup>
              <Label>שם מלא</Label>
              <Input name="name" value={form.name} onChange={handleChange} required />
            </FormGroup>
          )}
          <FormGroup>
            <Label>דוא"ל</Label>
            <Input name="email" value={form.email} onChange={handleChange} required />
            {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
          </FormGroup>
          <FormGroup>
            <Label>סיסמה</Label>
            <Input name="password" type="password" value={form.password} onChange={handleChange} required />
          </FormGroup>
          {activeTab === 'register' && (
            <>
              <FormGroup>
                <Label>טלפון</Label>
                <Input name="phonenum" value={form.phonenum} onChange={handleChange} required />
                {errors.phonenum && <div style={{ color: 'red' }}>{errors.phonenum}</div>}
              </FormGroup>
              <FormGroup>
                <Label>כתובת</Label>
                <Input name="address" value={form.address} onChange={handleChange} required />
                {errors.address && <div style={{ color: 'red' }}>{errors.address}</div>}
                <Map
                  position={mapPosition}
                  setPosition={setMapPosition}
                  address={form.address}
                  updateAddress={(addr) => setForm(prev => ({ ...prev, address: addr }))}
                  showValidation={true}
                  helpText="לחץ על המפה או הקלד כתובת"
                />
              </FormGroup>
              <FormGroup>
                <Label>תמונה</Label>
                <ImageUploadContainer onClick={handleUploadClick}>
                  {previewImage ? (
                    <PreviewImage src={previewImage} alt="תמונה" />
                  ) : (
                    <span>לחץ להעלאה</span>
                  )}
                  <Input
                    type="file"
                    ref={fileInputRef}
                    name="profile_image"
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </ImageUploadContainer>
              </FormGroup>
              <GenresSelect selectedGenres={form.genres} onChange={handleChange} labelText="ז'אנרים אהובים" />
            </>
          )}
          <Button type="submit">{activeTab === 'login' ? 'התחבר' : 'הרשמה'}</Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default LoginRegisterPage;