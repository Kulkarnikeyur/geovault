import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { useMapEvents } from "react-leaflet/hooks";
import { useNavigate } from "react-router-dom";
import "../assets/css/Dashboard.css";

function AddMarkerOnClick({ setMarkers }) {
  const storedLocation = localStorage.getItem("currentLocation");
  const { lat, lng } = JSON.parse(storedLocation);
  useMapEvents({
    click(e) {
      setMarkers(() => [
        {
          lat: lat,
          lng: lng,
          popup: "You are here",
        },
        {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          popup: "Selected location",
        },
      ]);
    },
  });
}
function Dashboard() {
  const navigate = useNavigate();
  const storedLocation = localStorage.getItem("currentLocation");

  const { lat, lng } = JSON.parse(storedLocation);
  const [markers, setMarkers] = useState([
    { lat: lat, lng: lng, popup: "You are here" },
  ]);

  const saveloc = () => {
    localStorage.setItem("selectedLocation", JSON.stringify(markers[1]));
    navigate("/saveloc");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>GeoVault</h2>
      </div>
      <div className="map-card">
        <div className="map-container">
          <MapContainer
            center={[lat, lng]}
            zoom={14}
            style={{
              height: "400px",
              width: "100%",
              borderRadius: "12px",
            }}
          >
            {/* OpenStreetMap tiles */}
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <AddMarkerOnClick setMarkers={setMarkers} />
            {/* Marker at user's location */}
            {markers.map((marker, idx) => (
              <Marker
                key={idx}
                position={[marker.lat, marker.lng]}
                eventHandlers={{
                  mouseover: (e) => {
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    e.target.closePopup();
                  },
                }}
              >
                <Popup>{marker.popup}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="controls">
          <button className="btn btn-primary" onClick={saveloc}>
            Save Location
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              navigate("/savedloc");
            }}
          >
            Previous Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
