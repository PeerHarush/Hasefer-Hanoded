import React from 'react';
import { Wrapper, Card, Title, Subtitle, FormGroup, Label, Input, Button } from '../styles/AddBookPage.styles';

const AddBookPage = () => {
  return (
    <Wrapper>
      <Card>
        <Title>הוסף ספר</Title>
        <Subtitle>הזן את פרטי הספר שברצונך להוסיף</Subtitle>
        <form>
          <FormGroup>
            <Label htmlFor="bookTitle">שם הספר</Label>
            <Input type="text" id="bookTitle" placeholder="הכנס את שם הספר" />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="bookAuthor">מחבר</Label>
            <Input type="text" id="bookAuthor" placeholder="הכנס שם מחבר" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bookGenre">ז'אנר</Label>
            <Input type="text" id="bookGenre" placeholder="הכנס ז'אנר" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bookDescription">תקציר הספר</Label>
            <Input type="text" id="bookDescription" placeholder="הכנס תקציר" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bookPrice">מחיר </Label>
            <Input type="number" id="bookPrice" placeholder="הכנס מחיר" />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bookPlace">מיקום </Label>
            <Input type="text" id="bookPlace" placeholder="הכנס מיקום" />
          </FormGroup>

          <Button type="submit">הוסף ספר</Button>
        </form>
      </Card>
    </Wrapper>
  );
};

export default AddBookPage;
