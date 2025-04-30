import React, { useState, useRef } from 'react';
import { Wrapper, Card, Title, Subtitle, FormGroup, Label, Input, Button } from '../styles/AddBookPage.styles';
import GenresSelect from "../components/GenresSelect"; // Import the GenresSelect component

const AddBookPage = () => {
    const [form, setForm] = useState({
      bookTitle: '',
      bookAuthor: '',
      bookGenre: '',
      bookDescription: '',
      bookPrice: '',
      bookPlace: '',
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
              setForm((prev) => ({ ...prev, [name]: file }));
              setPreviewImage(URL.createObjectURL(file));
            }
          } 
        else if (name === 'genres') {
          if (checked) {
            setForm((prev) => ({ ...prev, genres: [...prev.genres, value] }));
          } else {
            setForm((prev) => ({ ...prev, genres: prev.genres.filter((genre) => genre !== value) }));
          }
        }
        else {
          setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('טופס נשלח', form);
        
    };
    const handleUploadClick = () => {
        fileInputRef.current.click();
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
                id="bookTitle"
                name="bookTitle"
                placeholder="הכנס את שם הספר"
                value={form.bookTitle}
                onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>מחבר</Label>
            <Input
                type="text"
                id="bookAuthor"
                name="bookAuthor"
                placeholder="הכנס שם מחבר"
                value={form.bookAuthor}
                onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>שפה</Label>
            <Input
                type="text"
                id="bookAuthor"
                name="bookAuthor"
                placeholder="הכנס שפת הספר"
                value={form.bookAuthor}
                onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>תקציר הספר</Label>
            <Input
                type="text"
                id="bookDescription"
                name="bookDescription"
                placeholder="הכנס תקציר"
                value={form.bookDescription}
                onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>מחיר</Label>
            <Input
                type="number"
                id="bookPrice"
                name="bookPrice"
                placeholder="הכנס מחיר"
                value={form.bookPrice}
                onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>מיקום</Label>
            <Input
                type="text"
                id="bookPlace"
                name="bookPlace"
                placeholder="הכנס מיקום"
                value={form.bookPlace}
                onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>תמונה</Label>
            <div
              onClick={handleUploadClick}
              style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                height: '200px',
                backgroundColor: '#f9f9f9',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="תצוגה מקדימה" 
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span>לחץ להעלאת תמונה (PNG, JPG עד 2MB)</span>
              )}
              <Input
                type="file"
                name="bookImage"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleChange}
              />
            </div>
          </FormGroup>

          <GenresSelect
            selectedGenres={form.genres}
            onChange={handleChange}
          />

          <Button type="submit">הוסף ספר</Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default AddBookPage;
