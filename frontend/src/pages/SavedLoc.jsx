import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Dashboard.css";
import "../assets/css/savedloc.css";
import { auth } from "../firebase";

function SavedLoc() {
  const [locations, setLocations] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("/api/savedLoc", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => res.json().then((d) => ({ status: res.status, body: d })))
      .then(({ status, body }) => {
        // If token expired or invalid, backend returns 401/403 — clear token and redirect
        if (status === 401 || status === 403) {
          console.warn(
            "Auth expired or invalid (status:",
            status,
            ") — redirecting to login",
          );
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        // API may return an error object — guard against that
        if (Array.isArray(body)) {
          setLocations(body);
        } else if (status === 200 && body) {
          // if API wrapped result, try common keys
          if (Array.isArray(body.locs)) setLocations(body.locs);
          else setLocations([]);
        } else {
          setLocations([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch saved locations:", err);
        // network error: optionally force login if unauthorized-looking
        setLocations([]);
      });
  }, [navigate]);

  const deleteLoc = async (id) => {
    try {
      const res = await fetch(`/api/saveLoc/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Delete failed");
      }

      setLocations((prev) => prev.filter((loc) => loc.id !== id));

      setSelectedLoc(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-geo">Geo</span>
          <span className="logo-vault">Vault</span>
          <span className="topbar-sub">Your spatial memory vault</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => navigate("/dashboard")}>
            <span className="nav-icon">🗺</span>
            <span className="nav-label">Map</span>
          </div>
          <div className="nav-item active">
            <span className="nav-icon">📍</span>
            <span className="nav-label">Saved Locations</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-glow" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h2>Saved location history</h2>
            <p className="subtitle">
              All your saved spots appear here, ready to open in Google Maps.
            </p>
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
                    auth.signOut();
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="saved-loc-section">
          {locations.length === 0 ? (
            <div className="empty">No saved locations yet 🌍</div>
          ) : (
            <ul className="location-list">
              {locations.map((loc, index) => (
                <li className="location-card" key={index}>
                  <div>
                    <h3>{loc.name}</h3>
                    <p className="desc">
                      {loc.description.split(" ").length > 20
                        ? loc.description.split(" ").slice(0, 20).join(" ") +
                          "..."
                        : loc.description}
                    </p>
                  </div>
                  <div className="location-meta">
                    <p className="date">Saved on: {loc.date}</p>
                    <button
                      className="goToGmap"
                      onClick={() => setSelectedLoc(loc)}
                    >
                      View more
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        {selectedLoc && (
          <div className="modal-overlay" onClick={() => setSelectedLoc(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedLoc.name}</h2>
                <p>Saved on: {selectedLoc.date}</p>
              </div>

              {/* Photos/Videos */}
              <div className="media-container">
                {selectedLoc.photos?.map((photo, index) => (
                  <img
                    key={index}
                    src={`http://localhost:8000${photo}`}
                    alt={`photo-${index}`}
                    className="location-photo"
                  />
                ))}

                {selectedLoc.videos?.map((video, index) => (
                  <video key={index} controls className="location-video">
                    <source
                      src={`http://localhost:8000${video}`}
                      type="video/mp4"
                    />
                  </video>
                ))}
              </div>

              <div className="description">{selectedLoc.description}</div>

              <div className="modal-actions">
                <button
                  className="delete-btn"
                  onClick={() => deleteLoc(selectedLoc.id)}
                >
                  Delete Location
                </button>

                <button className="private-btn">Make Private</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SavedLoc;
