import React, { useEffect, useState } from "react";
import "../styles/Header.css";

const Header = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime(); // run once immediately
    const interval = setInterval(updateTime, 1000); // update every sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="heading">
      <div className="header">
        {/* === SEARCH BAR SECTION === */}
        <div className="header-search">
          <div className="search-box">
            <button className="search-btn">
              <img src="/img/search.png" alt="Search Icon" />
            </button>
            <input
              type="text"
              placeholder="Search..."
              required
              style={{ color: "#020620" }}
            />
          </div>
        </div>

        {/* === TIME SECTION === */}
        <div className="header-time">
          <h2>{time}</h2>
        </div>

        {/* === PROFILE SECTION === */}
        <div className="header-profile">
          <div className="profile">
            <p className="adminName">Khan Fernandez</p>
            <button className="profile-btn">
              <img src="/img/male.png" alt="Profile" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
