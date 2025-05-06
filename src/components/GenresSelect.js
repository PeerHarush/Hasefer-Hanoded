import React from 'react';
import { FormGroup, GenresContainer } from '../styles/GenereSelect.styles';
import { Label, Input } from '../styles/LoginRegisterPage.styles';

const genresList = [
  { id: "פסיכולוגיה ומודעות", name: "פסיכולוגיה ומודעות" },
  { id: "פעוטות וילדים", name: "פעוטות וילדים" },
  { id: "מדע בדיוני ופנטזיה", name: "מדע בדיוני ופנטזיה" },

  { id: "רומנטיקה", name: "רומנטיקה" },
  { id: "נוער", name: "נוער" },
  { id: "מתח", name: "מתח" },
  { id: "בישול ואפיה", name: "בישול ואפיה" },
  { id: "טיולים", name: "טיולים" },
  { id: "שירה", name: "שירה" },
  { id: "ספרי לימוד", name: "ספרי לימוד" },
  { id: "הורות ", name: "הורות " },
  { id: "כלכלה", name: "כלכלה" },

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
export { genresList };
export default GenresSelect;
