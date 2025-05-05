import React, { useState, useRef } from 'react';
import API_BASE_URL from '../config';
import {
  Wrapper, Card, Title, Subtitle, FormGroup, Label, Input, Button,
  ImageUploadContainer, PreviewImage
} from '../styles/AddBookPage.styles';
import GenresSelect from "../components/GenresSelect";

const AddBookPage = () => {
  const [form, setForm] = useState({
    bookTitle: '',
    bookAuthor: '',
    bookDescription: '',
    genres: [],
    bookImage: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      if (file) {
        setForm(prev => ({ ...prev, [name]: file }));
        setPreviewImage(URL.createObjectURL(file));
      }
    } else if (name === 'genres') {
      setForm(prev => ({
        ...prev,
        genres: checked
          ? [...prev.genres, value]
          : prev.genres.filter(g => g !== value)
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const fd = new FormData();
    fd.append('title', form.bookTitle);
    fd.append('authors', form.bookAuthor);
    fd.append('description', form.bookDescription);
    fd.append('genres', form.genres.join(','));
    if (form.bookImage) {
      fd.append('cover_image', form.bookImage);
    }
  
    try {
      const res = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        body: fd,
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("שגיאה מהשרת:", data);
  
        let errorMessage = 'העלאת הספר נכשלה';
  
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => err.msg).join(', ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
  
        throw new Error(errorMessage);
      }
  
      alert('📚 הספר נוסף בהצלחה!');
  
      // ✅ איפוס הטופס והתמונה
      setForm({
        bookTitle: '',
        bookAuthor: '',
        bookDescription: '',
        genres: [],
        bookImage: null,
      });
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
  
    } catch (err) {
      alert(`❌ שגיאה: ${err.message}`);
    }
  };
  

  return (
    <Wrapper>
      <Card>
        <Title>הוסף ספר</Title>
        <Subtitle>הזן את פרטי הספר שברצונך להוסיף</Subtitle>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>שם הספר</Label>
            <Input
              type="text"
              name="bookTitle"
              value={form.bookTitle}
              onChange={handleChange}
              placeholder="הכנס את שם הספר"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>מחבר</Label>
            <Input
              type="text"
              name="bookAuthor"
              value={form.bookAuthor}
              onChange={handleChange}
              placeholder="הכנס שם מחבר"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>תקציר</Label>
            <Input
              type="text"
              name="bookDescription"
              value={form.bookDescription}
              onChange={handleChange}
              placeholder="הכנס תקציר"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>תמונה</Label>
            <ImageUploadContainer onClick={handleUploadClick}>
              {previewImage ? (
                <PreviewImage src={previewImage} alt="תצוגה מקדימה" />
              ) : (
                <span>לחץ להעלאת תמונה</span>
              )}
              <Input
                type="file"
                name="bookImage"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleChange}
              />
            </ImageUploadContainer>
          </FormGroup>

          <GenresSelect
            selectedGenres={form.genres}
            onChange={handleChange}
            labelText="ז'אנרים"
          />

          <Button type="submit">הוסף ספר</Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default AddBookPage;
