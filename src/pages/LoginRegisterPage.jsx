import React, { useState, useRef } from 'react';
import {
  Wrapper, Card, Title, Subtitle, Tabs, Tab, FormGroup, Label,
  Input, Link, Button, ImageUploadContainer, PreviewImage
} from "../styles/LoginRegisterPage.styles";
import GenresSelect from "../components/GenresSelect";
import { useNavigate } from "react-router-dom";

const LoginRegisterPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    userType: 'user',
    genres: [],
    phonenum: "",
    address: "",
    profile_image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm(prev => {
        const genres = prev.genres || [];
        if (checked) {
          return { ...prev, genres: [...genres, value] };
        } else {
          return { ...prev, genres: genres.filter((genre) => genre !== value) };
        }
      });
    } else if (name === "userType") {
      setForm(prev => ({
        ...prev,
        userType: prev.userType === value ? "" : value
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      setForm(prev => ({ ...prev, profile_image: file }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);
    alert(activeTab === "login" ? "מתחבר..." : "נרשמת בהצלחה!");
  };

  return (
    <Wrapper  isRegister={activeTab === "register"}>
      <Card>
        <Title>ברוכים הבאים</Title>
        <Subtitle>{activeTab === "login" ? "התחבר לחשבון שלך" : "צור חשבון חדש"}</Subtitle>

        <Tabs>
          <Tab active={activeTab === "login"} onClick={() => setActiveTab("login")}>התחברות</Tab>
          <Tab active={activeTab === "register"} onClick={() => setActiveTab("register")}>הרשמה</Tab>
        </Tabs>

        <form onSubmit={handleSubmit}>
          {activeTab === "register" && (
            <FormGroup>
              <Label>שם מלא</Label>
              <Input name="name" type="text" value={form.name} onChange={handleChange} placeholder="ישראל ישראלי" required />
            </FormGroup>
          )}

          <FormGroup>
            <Label>דוא״ל</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="user@example.com" required />
          </FormGroup>

          <FormGroup>
            <Label>סיסמה</Label>
            <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="********" required />
          </FormGroup>

          {activeTab === "register" && (
            <FormGroup>
              <Label>מספר טלפון</Label>
              <Input name="phonenum" type="text" value={form.phonenum} onChange={handleChange} placeholder="0541234567" required />
              <Label>כתובת</Label>
              <Input name="address" type="text" value={form.address} onChange={handleChange} placeholder="בית יוסף 4, תל אביב" required />
            </FormGroup>
          )}

          {activeTab === "register" && (
            <FormGroup>
              <Label>תמונה</Label>
              <ImageUploadContainer onClick={handleUploadClick}>
                {previewImage ? (
                  <PreviewImage src={previewImage} alt="תצוגה מקדימה" />
                ) : (
                  <span>לחץ להעלאת תמונה (PNG, JPG עד 2MB)</span>
                )}
                <Input
                  type="file"
                  name="profile_image"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </ImageUploadContainer>
            </FormGroup>
          )}
          
          {activeTab === "register" && (
            <GenresSelect
              selectedGenres={form.genres}
              onChange={handleChange}
              labelText="ז'אנרים אהובים"
            />
          )}



          <Button type="submit">{activeTab === "login" ? "התחבר" : "הרשמה"}</Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default LoginRegisterPage;
