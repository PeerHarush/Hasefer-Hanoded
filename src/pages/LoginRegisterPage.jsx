import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from "../config";
import {
  Wrapper, Card, Title, Subtitle, Tabs, Tab, FormGroup, Label,
  Input, Button, ImageUploadContainer, PreviewImage
} from "../styles/LoginRegisterPage.styles";
import GenresSelect from "../components/GenresSelect";

// ולידציות בסיסיות
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhoneNumber = (phone) => /^05\d{8}$/.test(phone); // מספר ישראלי תקין
const isValidAddress = (address) => {
  return /^[\u0590-\u05FF\s]+\d+$/.test(address); 
};

const LoginRegisterPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    genres: [],
    phonenum: '',
    address: '',
    profile_image: null,
  });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setForm(prev => {
        const genres = prev.genres || [];
        return checked
          ? { ...prev, genres: [...genres, value] }
          : { ...prev, genres: genres.filter(g => g !== value) };
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));

      if (activeTab === 'register') {
        let errorMessage = '';

        if (name === 'email' && !isValidEmail(value)) {
          errorMessage = 'כתובת אימייל לא תקינה';
        } else if (name === 'phonenum' && !isValidPhoneNumber(value)) {
          errorMessage = 'מספר טלפון לא תקין (חייב להתחיל ב־05 ולהכיל 10 ספרות)';
        } else if (name === 'address' && !isValidAddress(value)) {
          errorMessage = 'כתובת צריכה לכלול שם רחוב ומספר (למשל: הרצל 12)';
        }

        setErrors(prev => ({ ...prev, [name]: errorMessage }));
      }
    }
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, profile_image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleSubmit = async e => {
    e.preventDefault();

    if (activeTab === 'register') {
      // ולידציה נוספת לפני שליחה
      const newErrors = {};

      if (!isValidEmail(form.email)) newErrors.email = 'כתובת אימייל לא תקינה';
      if (!isValidPhoneNumber(form.phonenum)) newErrors.phonenum = 'מספר טלפון לא תקין (חייב להתחיל ב־05 ולהכיל 10 ספרות)';
      if (!isValidAddress(form.address)) newErrors.address = 'כתובת לא תקינה - פורמט לדוגמה: דיזנגוף 100 תל אביב';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const fd = new FormData();
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('full_name', form.name);
      fd.append('phone_number', form.phonenum);
      fd.append('address', form.address);
      fd.append('favorite_genres', form.genres.join(','));
      if (form.profile_image) {
        fd.append('avatar', form.profile_image);
      }

      try {
        const res = await fetch(`${API_BASE_URL}/signup`, {
          method: 'POST',
          body: fd
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || 'Signup failed');
        alert('נרשמת בהצלחה!');
        setActiveTab('login');
      } catch (err) {
        alert(err.message);
      }
    } else {
      // login
      try {
        const res = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            password: form.password
          })
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
        <Subtitle>
          {activeTab === 'login' ? 'התחבר לחשבון שלך' : 'צור חשבון חדש'}
        </Subtitle>
        <Tabs>
          <Tab active={activeTab === 'login'} onClick={() => setActiveTab('login')}>
            התחברות
          </Tab>
          <Tab active={activeTab === 'register'} onClick={() => setActiveTab('register')}>
            הרשמה
          </Tab>
        </Tabs>

        <form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <FormGroup>
              <Label>שם מלא</Label>
              <Input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>דוא״ל</Label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div style={{ color: 'red', fontSize: '0.9em' }}>{errors.email}</div>}
          </FormGroup>

          <FormGroup>
            <Label>סיסמה</Label>
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </FormGroup>

          {activeTab === 'register' && (
            <>
              <FormGroup>
                <Label>טלפון</Label>
                <Input
                  name="phonenum"
                  type="text"
                  value={form.phonenum}
                  onChange={handleChange}
                  required
                />
                {errors.phonenum && <div style={{ color: 'red', fontSize: '0.9em' }}>{errors.phonenum}</div>}
              </FormGroup>

              <FormGroup>
                <Label>כתובת</Label>
                <Input
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="לדוגמה: דיזנגוף 100 תל אביב"
                />
                {errors.address && <div style={{ color: 'red', fontSize: '0.9em' }}>{errors.address}</div>}
              </FormGroup>

              <FormGroup>
                <Label>תמונה</Label>
                <ImageUploadContainer onClick={handleUploadClick}>
                  {previewImage ? (
                    <PreviewImage src={previewImage} />
                  ) : (
                    <span>לחץ להעלאת תמונה</span>
                  )}
                  <Input
                    ref={fileInputRef}
                    type="file"
                    name="profile_image"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </ImageUploadContainer>
              </FormGroup>

              <GenresSelect
                selectedGenres={form.genres}
                onChange={handleChange}
                labelText="ז'אנרים אהובים"
              />
            </>
          )}

          <Button type="submit">
            {activeTab === 'login' ? 'התחבר' : 'הרשמה'}
          </Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default LoginRegisterPage;
