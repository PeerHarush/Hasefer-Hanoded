import React, { useState } from 'react';
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
    });
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
    
        if (name === 'genres') {
          // טיפול בבחירת ז'אנרים
          if (checked) {
            setForm((prev) => ({ ...prev, genres: [...prev.genres, value] }));
          } else {
            setForm((prev) => ({ ...prev, genres: prev.genres.filter((genre) => genre !== value) }));
          }
        } else {
          // שדות רגילים
          setForm((prev) => ({ ...prev, [name]: value }));
        }
      };
    
      const handleSubmit = (e) => {
        e.preventDefault();
        console.log('טופס נשלח', form);
        // כאן את יכולה לשלוח את הנתונים לשרת או לעשות מה שתרצי
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
        <Label>ז'אנר</Label>
        <Input
            type="text"
            id="bookGenre"
            name="bookGenre"
            placeholder="הכנס ז'אנר"
            value={form.bookGenre}
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
