import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { useMapEvents } from "react-leaflet/hooks";
import { useNavigate } from "react-router-dom";
import "../assets/css/Dashboard.css";
import { auth } from "../firebase";

function FixMap() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);
  return null;
}

function AddMarkerOnClick({ setMarkers }) {
  const storedLocation = localStorage.getItem("currentLocation");
  if (!storedLocation) return null;
  const { lat, lng } = JSON.parse(storedLocation);

  useMapEvents({
    click(e) {
      setMarkers(() => [
        { lat, lng, popup: "You are here" },
        { lat: e.latlng.lat, lng: e.latlng.lng, popup: "Selected coordinates" },
      ]);
    },
  });
  return null;
}

function Dashboard() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const location = localStorage.getItem("currentLocation");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!location) {
      alert("📍 Location is required. Please enable it and login again.");
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 200);
  }, []);

  const storedLocation = localStorage.getItem("currentLocation");
  if (!storedLocation) {
    return <div className="redirecting">Redirecting... Please wait</div>;
  }

  const { lat, lng } = JSON.parse(storedLocation);
  const [markers, setMarkers] = useState([{ lat, lng, popup: "You are here" }]);

  const saveloc = () => {
    if (markers.length > 1) {
      localStorage.setItem("selectedLocation", JSON.stringify(markers[1]));
    } else {
      localStorage.setItem("selectedLocation", JSON.stringify(markers[0]));
    }
    navigate("/saveloc");
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-geo">Geo</span>
          <span className="logo-vault">Vault</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon">🗺</span>
            <span className="nav-label">Map</span>
          </div>
          <div className="nav-item" onClick={() => navigate("/savedloc")}>
            <span className="nav-icon">📍</span>
            <span className="nav-label">Saved Locations</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-glow" />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="topbar-title">
            <h1>Dashboard</h1>
            <span className="topbar-sub">Your spatial memory vault</span>
          </div>

          <div className="topbar-right">
            <button
              className={`profile-btn ${showProfile ? "active" : ""}`}
              onClick={() => setShowProfile(!showProfile)}
              aria-label="Profile"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {/* PROFILE DROPDOWN */}
            {showProfile && (
              <div className="profile-dropdown glass-card">
                <div className="profile-info">
                  <img
                    src={user?.photoURL || "https://i.pravatar.cc/100"}
                    alt="avatar"
                    className="profile-avatar"
                  />

                  <div className="profile-meta">
                    <p className="profile-name">
                      {user?.displayName || "User"}
                    </p>
                    <p className="profile-email">{user?.email || "No email"}</p>
                  </div>
                </div>

                <button
                  className="btn-logout"
                  onClick={() => {
                    localStorage.clear();
                    auth.signOut(); // 🔥 important
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* MAP SECTION */}
        <div className={`map-section ${loaded ? "map-loaded" : ""}`}>
          <div className="map-glass glass-card">
            <div className="map-header">
              <span className="map-label">
                <span className="pulse-dot" />
                Live View
              </span>
              <span className="map-coords">
                {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
              </span>
            </div>

            <div className="map-wrapper">
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FixMap />
                <AddMarkerOnClick setMarkers={setMarkers} />
                {markers.map((marker, idx) => (
                  <Marker key={idx} position={[marker.lat, marker.lng]}>
                    <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                      {marker.popup}
                    </Tooltip>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="map-footer">
              <p className="map-hint">
                {markers.length > 1
                  ? "📍 Destination selected — ready to save"
                  : "Click anywhere on the map to pin a location"}
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className={`controls ${loaded ? "controls-show" : ""}`}>
            <button className="btn-liquid primary" onClick={saveloc}>
              <span>Save Location</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
