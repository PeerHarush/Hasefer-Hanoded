import React, { useState } from "react";
import {
  Wrapper, Card, Title, Subtitle, Tabs, Tab, FormGroup, Label,
  Input, Link, Button
} from "../styles/LoginRegisterPage.styles";


const LoginRegisterPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    userType: 'user',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        

          {activeTab === "login" && <Link href="#">שכחת סיסמה?</Link>}

          <Button type="submit">{activeTab === "login" ? "התחבר" : "הרשמה"}</Button>
          {/* {activeTab === "login" && <Link href="#"> התחבר כמנהל</Link>} */}
         
            
            <div>
              <Input 
                type="radio" name="userType" value="admin" 
                checked={form.userType === 'admin'} onChange={handleChange}
              />
              <Label id="userTypeAdmin">אני מנהל</Label>
                
               </div>
          {/* {activeTab === "register" && <Link href="#"> הרשם כמנהל</Link>} */}
        </form>
      </Card>
    </Wrapper>
  );
};

export default LoginRegisterPage;
