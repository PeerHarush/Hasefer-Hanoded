import React from 'react';
import { FormGroup, GenresContainer } from '../styles/GenereSelect.styles';
import { Label, Input } from '../styles/LoginRegisterPage.styles';

const genresList = [
  { id: "fantasy", name: "פנטזיה" },
  { id: "thriller", name: "מתח" },
  { id: "sci-fi", name: "מדע בדיוני" },
  { id: "romance", name: "רומן" },
  { id: "biography", name: "ביוגרפיה" },
  { id: "children", name: "ילדים" },
  { id: "youth", name: "נוער" },
  { id: "action", name: "פעולה" },
  { id: "education", name: "לימוד" },
  { id: "romantic", name: "רומנטיקה" },
  { id: "foreign-language", name: "שפה זרה" },
  { id: "self-improvement", name: "התפתחות אישית" },
];

const GenresSelect = ({ selectedGenres, onChange, labelText = "ז'אנרים" }) => {
  console.log("labelText received:", labelText); // להבטחת קבלת הפרופס

  return (
    <FormGroup>
      <Label>{labelText}</Label>
      <GenresContainer>
        {genresList.map((genre) => (
          <Label key={genre.id}>
            <Input
              type="checkbox"
              name="genres"
              value={genre.id}
              checked={selectedGenres.includes(genre.id)}
              onChange={onChange}
            />{" "}
            {genre.name}
          </Label>
        ))}
      </GenresContainer>
    </FormGroup>
  );
};

export default GenresSelect;
