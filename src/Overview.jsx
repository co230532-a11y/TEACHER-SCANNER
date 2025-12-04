import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import "./Overview.css";
import NavBar from "./components/SideBar";
import Header from "./components/Header";

const Overview = () => {
  const [attendees, setAttendees] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const [lastScanned, setLastScanned] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  const readerRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const savedAttendees = JSON.parse(localStorage.getItem("attendees")) || [];
    setAttendees(savedAttendees);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });

        // Fetch weather data
        fetchWeather(lat, lng);
      });
      startCountdown(5 * 60, "timer");
    }

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, []);

  const onScanSuccess = (decodedText) => {
    const lines = decodedText.split(/\r?\n/);
    let record = {};
    lines.forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) record[key.trim()] = rest.join(":").trim();
    });

    const newAttendee = {
      name: record["Name"] || "Unknown",
      id: record["ID"] || "-",
      time: record["Time"] || new Date().toLocaleTimeString(),
      date: record["Date"] || new Date().toLocaleDateString(),
      lat: parseFloat(record["Latitude"]) || 0,
      lng: parseFloat(record["Longitude"]) || 0,
    };

    setLastScanned(newAttendee);
    setAttendees((prev) => {
      const updated = [newAttendee, ...prev];
      localStorage.setItem("attendees", JSON.stringify(updated));
      return updated;
    });
    window.location.reload();
  };

  const onScanFailure = (error) => console.warn("QR Scan failed:", error);

  const startScanner = () => {
    if (timerExpired) {
      alert("Scanner expired. Please refresh the page to restart.");
      return;
    }

    setScannerActive(true);

    setTimeout(() => {
      if (readerRef.current && !scannerRef.current) {
        const containerWidth = readerRef.current.offsetWidth || 300;
        const qrBoxSize = containerWidth > 600 ? 600 : containerWidth * 0.9;

        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { fps: 120, qrbox: qrBoxSize, disableFlip: false },
          false
        );

        scannerRef.current.render(onScanSuccess, onScanFailure);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
      setScannerActive(false);
    }
  };

  const fetchWeather = async (lat, lng) => {
    setWeatherLoading(true);
    try {
      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await response.json();

      // Weather code mapping
      const getWeatherDescription = (code) => {
        const weatherCodes = {
          0: { desc: "Clear sky", icon: "☀️" },
          1: { desc: "Mainly clear", icon: "🌤️" },
          2: { desc: "Partly cloudy", icon: "⛅" },
          3: { desc: "Overcast", icon: "☁️" },
          45: { desc: "Foggy", icon: "🌫️" },
          48: { desc: "Foggy", icon: "🌫️" },
          51: { desc: "Light drizzle", icon: "🌦️" },
          53: { desc: "Drizzle", icon: "🌦️" },
          55: { desc: "Heavy drizzle", icon: "🌧️" },
          61: { desc: "Light rain", icon: "🌧️" },
          63: { desc: "Rain", icon: "🌧️" },
          65: { desc: "Heavy rain", icon: "⛈️" },
          71: { desc: "Light snow", icon: "🌨️" },
          73: { desc: "Snow", icon: "❄️" },
          75: { desc: "Heavy snow", icon: "❄️" },
          77: { desc: "Snow grains", icon: "🌨️" },
          80: { desc: "Light showers", icon: "🌦️" },
          81: { desc: "Showers", icon: "🌧️" },
          82: { desc: "Heavy showers", icon: "⛈️" },
          85: { desc: "Light snow showers", icon: "🌨️" },
          86: { desc: "Snow showers", icon: "❄️" },
          95: { desc: "Thunderstorm", icon: "⛈️" },
          96: { desc: "Thunderstorm with hail", icon: "⛈️" },
          99: { desc: "Thunderstorm with hail", icon: "⛈️" },
        };
        return weatherCodes[code] || { desc: "Unknown", icon: "🌡️" };
      };

      const weatherInfo = getWeatherDescription(data.current.weather_code);

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        description: weatherInfo.desc,
        icon: weatherInfo.icon,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m.toFixed(1),
      });
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const viewMap = (lat, lng) => {
    setUserLocation({ lat, lng });
  };

  function startCountdown(durationInSeconds, elementId) {
    let timeLeft = durationInSeconds;
    const timerElement = document.getElementById(elementId);

    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `${minutes}:${
        seconds < 10 ? "0" : ""
      }${seconds}`;

      if (timeLeft < 60 && timeLeft > 0) {
        timerElement.style.color = "red";
      }

      if (timeLeft > 0) {
        timeLeft--;
      } else {
        clearInterval(countdown);
        setTimerExpired(true);
        stopScanner();
        timerElement.textContent = "Expired";
        timerElement.style.color = "red";
      }
    }

    updateTimer();
    const countdown = setInterval(updateTimer, 1000);
  }

  return (
    <div className="Overview">
      <div className="container">
        <Header />

        <div className="main">
          <NavBar />
          <div className="content">
            {/* Left Panel */}
            <div className="left">
              <p>Scanner</p>
              <div className="scanner-sec">
                {/* QR Scanner */}
                <div className="scanner-container">
                  {!scannerActive ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "350px",
                        gap: "1rem",
                      }}
                    >
                      <p style={{ fontSize: "1.2rem", color: "#666" }}>
                        {timerExpired
                          ? "Scanner expired. Please refresh the page."
                          : "Click the button to start scanning"}
                      </p>
                      <button
                        onClick={startScanner}
                        disabled={timerExpired}
                        style={{
                          padding: "12px 24px",
                          fontSize: "1rem",
                          fontWeight: "600",
                          background: timerExpired ? "#999" : "#273c75",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: timerExpired ? "not-allowed" : "pointer",
                          transition: "all 0.3s ease",
                          opacity: timerExpired ? 0.6 : 1,
                        }}
                        onMouseOver={(e) =>
                          !timerExpired &&
                          (e.target.style.background = "#1e2f5a")
                        }
                        onMouseOut={(e) =>
                          !timerExpired &&
                          (e.target.style.background = "#273c75")
                        }
                      >
                        {timerExpired ? "Expired" : "Start Scanner"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        ref={readerRef}
                        id="reader"
                        style={{ width: "100%", minHeight: "350px" }}
                      ></div>
                      <button
                        onClick={stopScanner}
                        style={{
                          marginTop: "10px",
                          padding: "8px 16px",
                          fontSize: "0.9rem",
                          fontWeight: "600",
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) =>
                          (e.target.style.background = "#c0392b")
                        }
                        onMouseOut={(e) =>
                          (e.target.style.background = "#e74c3c")
                        }
                      >
                        Stop Scanner
                      </button>
                    </>
                  )}
                </div>

                {/* Description Panel */}
                <div className="scanner-description">
                  <h1>Scan the QR Code</h1>
                  <p>
                    To register an attendee, scan their QR code using the camera
                    below. The system captures details and updates the attendee
                    list instantly.
                  </p>
                  <br></br>
                  <div>
                    {" "}
                    <p>Valid until: </p>
                    <p className="timer" id="timer">
                      5:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="additional-info">
                <h2>System Information</h2>
                <p>
                  This attendance tracking system provides real-time monitoring
                  of attendees through QR code scanning. The scanner validates
                  and records attendance data including name, ID, timestamp, and
                  location coordinates.
                </p>
              </div>
            </div>

            {/* Right Panel */}
            <div className="right">
              <div className="weather-section">
                {weatherLoading ? (
                  <p>Loading...</p>
                ) : weather ? (
                  <div className="weather-info-compact">
                    <div className="weather-main-compact">
                      <span className="weather-icon-large">{weather.icon}</span>
                      <div>
                        <div className="weather-temp-large">
                          {weather.temp}°C
                        </div>
                        <div className="weather-desc-compact">
                          {weather.description}
                        </div>
                      </div>
                    </div>
                    <div className="weather-details-compact">
                      <div>💧 {weather.humidity}%</div>
                      <div>💨 {weather.windSpeed} m/s</div>
                    </div>
                  </div>
                ) : (
                  <p>Weather unavailable</p>
                )}
              </div>
              <h2 className="panel-title">Last Scanned Info</h2>
              <div className="last-scanned-info">
                {lastScanned ? (
                  <>
                    <p>
                      <b className="attendee-name"></b> {lastScanned.name}
                    </p>
                    <p>
                      <b className="attendee-id">ID:</b> {lastScanned.id}
                    </p>
                  </>
                ) : (
                  <p>No QR scanned yet.</p>
                )}
              </div>

              <h2 className="panel-title" style={{ marginTop: "1rem" }}>
                👥 Attendees
              </h2>
              <div className="overview-attendees">
                <div className="overview-attendeesColumn">
                  {attendees.map((a, idx) => (
                    <div
                      key={idx}
                      className="overview-attendee-card"
                      onClick={() => viewMap(a.lat, a.lng)}
                    >
                      <div className="overview-attendee-info">
                        <div className="overview-attendee-name">
                          Name:{a.name}
                        </div>
                        <div className="overview-attendee-id">ID: {a.id}</div>
                      </div>
                      <div className="overview-attendee-meta">
                        <span>{a.date}</span>
                        <span>{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
