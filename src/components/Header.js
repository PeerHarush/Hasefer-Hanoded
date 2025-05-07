import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import { Wrapper, StyledNavbar, NavbarRight, NavbarLeft } from "../styles/Header.styles";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function Header() {
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userLoggedIn");
    navigate("/");
    window.location.reload(); // מרענן את העמוד
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
            <li className="nav-item"><Link to="/AllBooks" className="nav-link">כל הספרים</Link></li>
            <li className="nav-item"><Link to="/about" className="nav-link">אודות</Link></li>

            {isLoggedIn && (
              <>
                <li className="nav-item"><Link to="/wishlist" className="nav-link">רשימת משאלות</Link></li>
                <li className="nav-item"><Link to="/MessagesPage" className="nav-link">הודעות</Link></li>
                <li className="nav-item"><Link to="/History" className="nav-link">היסטוריית פעולות</Link></li>
                <li className="nav-item"><Link to="/Transaction" className="nav-link">עסקאות</Link></li>
                <li className="nav-item"><Link to="/Profile" className="nav-link">לפרופיל שלי</Link></li>
                <li className="nav-item"><Link to="/AddBook" className="nav-link">הוספת ספר</Link></li>
              </>
            )}
          </NavbarRight>

          <NavbarLeft className="navbar-nav ms-3">
            {!isLoggedIn ? (
              <li className="nav-item">
                <Link to="/login" className="nav-link">התחברות / הרשמה</Link>
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
