import React from 'react';
import { FormGroup, GenresContainer } from '../styles/GenereSelect.styles';
import { Label, Input } from '../styles/LoginRegisterPage.styles';

const genresList = [
  { id: "פנטזיה", name: "פנטזיה" },
  { id: "מתח", name: "מתח" },
  { id: "מדע-בדיוני", name: "מדע בדיוני" },
  { id: "רומן", name: "רומן" },
  { id: "ביוגרפיה", name: "ביוגרפיה" },
  { id: "ילדים", name: "ילדים" },
  { id: "נוער", name: "נוער" },
  { id: "פעולה", name: "פעולה" },
  { id: "לימוד", name: "לימוד" },
  { id: "רומנטיקה", name: "רומנטיקה" },
  { id: "שפה-זרה", name: "שפה זרה" },
  { id: "התפתחות-אישית", name: "התפתחות אישית" },
];

const GenresSelect = ({ selectedGenres, onChange, labelText = "ז'אנרים" }) => {
  console.log("labelText received:", labelText); 
  
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
