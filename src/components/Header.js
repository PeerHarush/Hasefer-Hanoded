import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Wrapper,
  StyledNavbar,
  NavbarRight,
  NavbarLeft,
  NavItemLink,
  SearchForm,
  SearchInput,
  SearchButton,
  SearchContainer,
  SearchSuggestionsList,
  SearchSuggestionItem,
} from "../styles/Header.styles";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import API_BASE_URL from "../config";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const searchWrapperRef = useRef();

  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
  const hideSearch = ["/AllBooks", "/login", "/register"].includes(currentPath);

  const [searchResults, setSearchResults] = useState([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // חיפוש ספרים לפי טקסט מוקלד
  useEffect(() => {
    const fetchResults = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setIsSuggestionsVisible(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/books?search=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setSearchResults(data);
          setIsSuggestionsVisible(true);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("שגיאה בחיפוש ספר:", err);
        setSearchResults([]);
      }
    };

    const delay = setTimeout(fetchResults, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // סגירת תפריט הצעות בלחיצה מחוץ
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
                <li className="nav-item"><NavItemLink to="/wishlist" $active={currentPath === "/wishlist"}>רשימת משאלות</NavItemLink></li>
                <li className="nav-item"><NavItemLink to="/MessagesPage" $active={currentPath === "/MessagesPage"}>הודעות</NavItemLink></li>
                <li className="nav-item"><NavItemLink to="/History" $active={currentPath === "/History"}>היסטוריית פעולות</NavItemLink></li>
                <li className="nav-item"><NavItemLink to="/Transaction" $active={currentPath === "/Transaction"}>עסקאות</NavItemLink></li>
                <li className="nav-item"><NavItemLink to="/Profile" $active={currentPath === "/Profile"}>לפרופיל שלי</NavItemLink></li>
                <li className="nav-item"><NavItemLink to="/AddBook" $active={currentPath === "/AddBook"}>הוספת ספר</NavItemLink></li>
                <li className="nav-item"><NavItemLink to="/my-books" $active={currentPath === "/my-books"}>הספרים שלי</NavItemLink></li>
              </>
            )}


          </NavbarRight>

          

            {/* טופס חיפוש */}
            {!hideSearch && (
              <SearchContainer ref={searchWrapperRef}>
                <SearchForm
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const query = searchTerm.trim();
                    if (!query) return;

                    const titleOnly = query.includes("—")
                      ? query.split("—")[0].trim()
                      : query;

                    try {
                      const res = await fetch(`${API_BASE_URL}/books?search=${encodeURIComponent(titleOnly)}`);
                      const data = await res.json();

                      if (Array.isArray(data) && data.length > 0) {
                        const normalizedTitle = titleOnly.toLowerCase();

                        const bestMatch = data.find(book =>
                          book.title?.toLowerCase() === normalizedTitle
                        );

                        if (bestMatch) {
                          navigate(`/book/${encodeURIComponent(bestMatch.title.trim())}`);
                        } else {
                          alert("לא נמצא ספר תואם לשם שהוזן.");
                        }
                      } else {
                        alert("לא נמצאו תוצאות.");
                      }

                      setIsSuggestionsVisible(false);
                      setSearchTerm("");
                    } catch (err) {
                      console.error("שגיאה בביצוע חיפוש:", err);
                    }
                  }}

                >
                  <SearchInput
                    type="search"
                    placeholder="חפש ספר  "
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <SearchButton type="submit">חיפוש</SearchButton>
                </SearchForm>

                {isSuggestionsVisible && searchResults.length > 0 && (
                  <SearchSuggestionsList>
                    {searchResults.map((book, index) => {
                      const fullText = `${book.title}${book.authors ? " — " + (Array.isArray(book.authors) ? book.authors.join(", ") : book.authors) : ""}`;
                      return (
                        <SearchSuggestionItem
                          key={index}
                          onClick={() => {
                            setSearchTerm(fullText);
                            setIsSuggestionsVisible(false);
                          }}
                        >
                          <strong>{book.title}</strong>
                          {book.authors && (
                            <span>
                              {" — "}
                              {Array.isArray(book.authors) ? book.authors.join(", ") : book.authors}
                            </span>
                          )}
                        </SearchSuggestionItem>
                      );
                    })}
                  </SearchSuggestionsList>
                )}
              </SearchContainer>
            )}
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
