import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/saveloc.css";

function SaveLoc() {
  const [locname, setlocname] = useState("");
  const [description, setDescription] = useState("");
  const [loc, setLoc] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const selloc = localStorage.getItem("selectedLocation");

  const lockloc = (e) => {
    if (e.target.value === "selloc") {
      setLoc(JSON.parse(localStorage.getItem("selectedLocation")));
    } else if (e.target.value === "curloc") {
      setLoc(JSON.parse(localStorage.getItem("currentLocation")));
    }
  };
  if (localStorage.getItem("selectedLocation") === null) {
    setLoc(JSON.parse(localStorage.getItem("currentLocation")));
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logic to save location would go here
    try {
      const res = await fetch("/api/saveLoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          loc: loc,
          name: locname,
          description: description,
          date: date,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Location saved successful.");
        setlocname("");
        setLoc("");
        setDescription("");
        setDate("");

        navigate("/dashboard");
      } else {
        setMessage(data.msg || "Registration failed");
      }
    } catch (error) {
      setMessage("Server error. Try again later.");
    }
  };
  return (
    <div className="saveloc-container">
      <div className="saveloc-card">
        <h2>Save Location</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Location Name"
            onChange={(e) => setlocname(e.target.value)}
          />
          <textarea
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          {selloc != "undefined" ? (
            <select id="loc" name="loc" onChange={lockloc}>
              <option value="">Select a Location</option>
              <option value="selloc">Selected Location</option>
              <option value="curloc">Current Location</option>
            </select>
          ) : (
            <div className="location-info">
              Location to be saved is your Current Location
            </div>
          )}
          <input
            type="date"
            id="dob"
            name="dob"
            onChange={(e) => {
              setDate(e.target.value);
            }}
          />
          <button className="saveloc-btn" type="submit">
            Save Location
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
      <div>
        <button
          className="back"
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

export default SaveLoc;
