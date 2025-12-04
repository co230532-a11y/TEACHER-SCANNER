import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/SideBar.css";

const NavBar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="navBar">
        <br />
        <img className="logo" src="/img/adzu-logo.png" alt="Logo" />
        <div className="nav-links">
          <div className={`nav-item ${isActive("/") ? "active" : ""}`}>
            <Link to="/">Overview</Link>
          </div>
          <div className={`nav-item ${isActive("/attendees") ? "active" : ""}`}>
            <Link to="/attendees">Attendees</Link>
          </div>
          <div className={`nav-item ${isActive("/map") ? "active" : ""}`}>
            <Link to="/map">Map</Link>
          </div>
        </div>
        <div className="exit">
          <img className="exit-icon" src="/img/exit.png" alt="Exit" />
          <p style={{ color: "white" }}>Exit</p>
        </div>
      </div>
    </>
  );
};

export default NavBar;
