import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Wrapper, StyledNavbar, NavbarRight, NavbarLeft, NavItemLink } from "../styles/Header.styles";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function Header() {
  const navigate = useNavigate();
const location = useLocation();
const currentPath = location.pathname;

  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userLoggedIn");
    navigate("/");
    window.location.reload(); 
  };

  const renderTooltip = (props) => (
    <Tooltip id="logo-tooltip" {...props}>
      למעבר לדף הבית
    </Tooltip>
  );

  return (
    <Wrapper>
      <StyledNavbar className="navbar custom-navbar navbar-expand-lg px-4" dir="rtl">
        <Link to="/" className="d-flex align-items-center gap-2">
          <OverlayTrigger placement="bottom" overlay={renderTooltip}>
            <img src="/pictures/LOGO.png" alt="לוגו הספר הנודד" height="50" />
          </OverlayTrigger>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
        <NavbarRight className="navbar-nav">
  <li className="nav-item">
    <NavItemLink to="/AllBooks" $active={currentPath === "/AllBooks"}>כל הספרים</NavItemLink>
  </li>
  <li className="nav-item">
        <NavItemLink to="/about" $active={currentPath === "/about"}>אודות</NavItemLink>
  </li>

  {isLoggedIn && (
    <>
      <li className="nav-item">
        <NavItemLink to="/wishlist" $active={currentPath === "/wishlist"}>רשימת משאלות</NavItemLink>
      </li>
      <li className="nav-item">
        <NavItemLink to="/MessagesPage" $active={currentPath === "/MessagesPage"}>הודעות</NavItemLink>
      </li>
      <li className="nav-item">
        <NavItemLink to="/History" $active={currentPath === "/History"}>היסטוריית פעולות</NavItemLink>
      </li>
      <li className="nav-item">
        <NavItemLink to="/Transaction" $active={currentPath === "/Transaction"}>עסקאות</NavItemLink>
      </li>
      <li className="nav-item">
        <NavItemLink to="/Profile" $active={currentPath === "/Profile"}>לפרופיל שלי</NavItemLink>
      </li>
      <li className="nav-item">
        <NavItemLink to="/AddBook" $active={currentPath === "/AddBook"}>הוספת ספר</NavItemLink>
      </li>
      <li className="nav-item">
  <NavItemLink to="/my-books" $active={currentPath === "/my-books"}>הספרים שלי</NavItemLink>
</li>

    </>
  )}
</NavbarRight>


       <NavbarLeft className="navbar-nav ms-3">
  {!isLoggedIn ? (
    <li className="nav-item">
      <NavItemLink to="/login" $active={currentPath === "/login"}>התחברות / הרשמה</NavItemLink>
    </li>
  ) : (
    <li className="nav-item">
      <button className="btn btn-link nav-link" onClick={handleLogout} style={{ padding: 0 }}>
        התנתקות
      </button>
    </li>
  )}
</NavbarLeft>

        </div>
      </StyledNavbar>
    </Wrapper>
  );
}

export default Header;
