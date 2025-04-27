import React, { useState } from "react";
import {
  Wrapper, Card, Title, Subtitle, Tabs, Tab, FormGroup, Label,
  Input, Link, Button
} from "../styles/LoginRegisterPage.styles";
import GenresSelect from "../components/GenresSelect"; // Import the GenresSelect component
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation    

const LoginRegisterPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    userType: 'user',
    genres: [],  
  });
  

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
        userType: prev.userType === value ? "" : value  // אם לוחצים שוב - מבטל
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);
    alert(activeTab === "login" ? "מתחבר..." : "נרשמת בהצלחה!");
  };

  return (
    <Wrapper>
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
            <GenresSelect
              selectedGenres={form.genres}
              onChange={handleChange}
            />
          )}

        
          {activeTab === "login" && <Link href="#">שכחת סיסמה?</Link>}

          <Button type="submit">{activeTab === "login" ? "התחבר" : "הרשמה"}</Button>
          {/* {activeTab === "login" && <Link href="#"> התחבר כמנהל</Link>} */}
         
            
          <div> <Input 
    type="radio" name="userType" value="admin" checked={form.userType === 'admin'} onChange={handleChange} onClick={(e) => {
      if (form.userType === e.target.value) { setForm(prev => ({ ...prev, userType: "" }));}
    }}
    id="userTypeAdmin"  /> אני מנהל </div>

          {/* {activeTab === "register" && <Link href="#"> הרשם כמנהל</Link>} */}
        </form>
      </Card>
    </Wrapper>
  );
};

export default LoginRegisterPage;
