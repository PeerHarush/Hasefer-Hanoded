import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { Wrapper } from "../styles/Header.styles";  
import { OverlayTrigger, Tooltip } from 'react-bootstrap'; 

function Header() {
  const renderTooltip = (props) => (
    <Tooltip id="logo-tooltip" {...props}>
      למעבר לדף הבית
    </Tooltip>
  );

  return (
    <Wrapper>
      <nav className="navbar custom-navbar navbar-expand-lg px-4" dir="rtl">
        
        <Link to="/" className=" d-flex align-items-center gap-2">
          <OverlayTrigger
            placement="bottom" 
            overlay={renderTooltip} 
          >
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
          <ul className="navbar-nav">
            <li className="nav-item">
            <Link to="/wishlist" className="nav-link">רשימת משאלות</Link>
            </li>
            <li className="nav-item">
            <Link to="MessagesPage" className="nav-link"> הודעות</Link>
            </li>
            <li className="nav-item">
            <Link to="/History" className="nav-link"> היסטוריית פעולות</Link>
            </li>
            <li className="nav-item">
            <Link to="/Transaction" className="nav-link"> עסקאות</Link>
            </li>
            <li className="nav-item">
            <Link to="/Profile" className="nav-link"> לפרופיל שלי</Link>
            </li>
            <li className="nav-item">
            <Link to="/AddBook" className="nav-link"> הוספת ספר </Link>
            </li>
          </ul>

       
          <form className="d-flex" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="חפש ספר..."
              aria-label="Search"
            />
            <button className="btn btn-outline-secondary" type="submit">
              חיפוש
            </button>
          </form>
        </div>
      </nav>
    </Wrapper>
  );
}

export default Header;
