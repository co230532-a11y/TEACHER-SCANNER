import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import NavBar from "./components/SideBar";
import Header from "./components/Header";
import "./styles/Map.css";

const MapPage = () => {
  const location = useLocation();
  const {
    lat: initialLat,
    lng: initialLng,
    name: initialName,
  } = location.state || {};

  const [attendees, setAttendees] = useState([]);
  const [userLocation, setUserLocation] = useState({
    lat: initialLat || null,
    lng: initialLng || null,
  });
  const [selectedName, setSelectedName] = useState(initialName || "Attendee");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("attendees")) || [];
    setAttendees(saved);
  }, []);

  // 🔹 When "View Map" clicked, show map of that attendee
  const handleAttendeeClick = (attendee) => {
    setUserLocation({ lat: attendee.lat, lng: attendee.lng });
    setSelectedName(attendee.name || "Attendee");
  };

  return (
    <div className="MapPage">
      <NavBar />
      <div className="map-container">
        <Header />

        <div className="map-content">
          {/* LEFT SIDE — Map Display */}
          <div className="map-left">
            <h2 className="map-title">
              {selectedName
                ? `${selectedName}'s Location`
                : "Select an Attendee to View Location"}
            </h2>

            <div className="map-wrapper">
              {userLocation.lat && userLocation.lng ? (
                <iframe
                  title="attendee-map"
                  className="map-iframe"
                  src={`https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=15&t=k&output=embed`}
                  allowFullScreen
                ></iframe>
              ) : (
                <p className="no-map">Click on an Attendee to view. 📍</p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — Attendees List */}
          <div className="Mapright">
            <h2
              style={{
                marginLeft: "1rem",
                fontSize: "20px",
                fontWeight: "bolder",
              }}
            >
              👥 More Attendees
            </h2>
            <div className="attendees">
              <div className="attendeesColumn">
                {attendees
                  .filter((a) => a.lat && a.lng)
                  .map((a, idx) => (
                    <div
                      key={idx}
                      className="attendee-card"
                      onClick={() => handleAttendeeClick(a)}
                    >
                      <div className="attendee-info">
                        <div className="attendee-name">{a.name}</div>
                        <div className="attendee-id">{a.email}</div>
                      </div>
                      <div className="attendee-meta">
                        <span>{a.time}</span>
                        <span>{a.date}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
