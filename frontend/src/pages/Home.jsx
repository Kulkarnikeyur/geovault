import { useNavigate } from "react-router-dom";
import "../assets/css/home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>GeoVault</h1>
        <p className="tagline">Manage & track locations effortlessly</p>

        <div className="home-buttons">
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>

        <div className="home-description">
          <p>
            GeoVault is a smart location management platform that goes beyond
            basic latitude and longitude. Store, search, and manage rich
            location metadata with deep map integration, offline access, and
            intelligent features — all in one secure place.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
