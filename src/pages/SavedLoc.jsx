import React from "react";
import { useEffect, useState } from "react";
import "../assets/css/savedloc.css";
import { useNavigate } from "react-router-dom";

function SavedLoc() {
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/savedLoc", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLocations(data);
      });
  }, []);

  return (
    <div className="saved-loc-page">
      <div className="saved-loc">
        <h1>Your Saved Memories</h1>
        <p className="subtitle">
          This is where your saved locations will be displayed.
        </p>
        {locations.length === 0 ? (
          <div className="empty">No saved locations yet 🌍</div>
        ) : (
          <ul className="location-list">
            {locations.map((loc, index) => (
              <li className="location-card" key={index}>
                <h3>{loc.name}</h3>
                <p className="desc">{loc.description}</p>
                <p className="date">Saved on: {loc.date}</p>
                <button
                  className="goToGmap"
                  onClick={() => {
                    if (!loc.loc) return <p>No loc</p>;
                    const url = `https://www.google.com/maps?q=${loc.loc.lat},${loc.loc.lng}`;
                    window.open(url, "_blank");
                  }}
                >
                  OnGmap
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <button
          className="back-button"
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default SavedLoc;
