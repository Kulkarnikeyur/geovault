import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import "../assets/css/login.css";

function Login() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Spotlight mouse effect on minimal glass card
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      cardRef.current.style.setProperty(
        "--mouse-x",
        `${e.clientX - rect.left}px`,
      );
      cardRef.current.style.setProperty(
        "--mouse-y",
        `${e.clientY - rect.top}px`,
      );
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleGoogleLogin = async () => {
    setMessage("");

    try {
      // 🔐 STEP 1: Google Auth
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      // 🔥 STEP 2: Backend FIRST (no location)
      const res = await fetch("/api/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("Authentication failed");
        return;
      }

      // ✅ Save token
      localStorage.setItem("access_token", data.access_token);

      // 🔥 STEP 3: Location AFTER login (same as your old flow)
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          localStorage.setItem("currentLocation", JSON.stringify(location));

          setMessage("Login successful");
          navigate("/dashboard");
        },
        () => {
          setMessage("Login successful, but location access denied.");
          alert(
            "📍 Location permission is required to use this app.\nPlease enable it and login again.",
          );
        },
      );
    } catch (error) {
      console.error(error);
      setMessage("Google login failed");
    }
  };

  return (
    <div className="luxury-split-wrapper">
      {/* Left: Window into the Vault (Visual Core) */}
      <div className="luxury-visual-pane">
        <div className="memory-location-visual">
          {/* Topographic map layers */}
          <div className="topo-map">
            <div className="topo-layer layer-1"></div>
            <div className="topo-layer layer-2"></div>
            <div className="topo-layer layer-3"></div>
          </div>

          {/* Massive Location Pin */}
          <div className="massive-pin-container">
            <div className="pin-pulse-shadow"></div>
            <div className="neon-location-pin">
              <span className="material-symbols-outlined">location_on</span>
            </div>
          </div>

          {/* Floating Memory Polaroids */}
          <div className="floating-polaroids">
            <div className="polaroid p-1">
              <div className="p-img p-img-a"></div>
            </div>
            <div className="polaroid p-2">
              <div className="p-img p-img-b"></div>
            </div>
            <div className="polaroid p-3">
              <div className="p-img p-img-c"></div>
            </div>
          </div>
        </div>
        <div className="luxury-ambient-grid"></div>
        <div className="luxury-brand">GeoVault</div>
      </div>

      {/* Right: Minimalist Auth Panel */}
      <div className="luxury-auth-pane">
        <div className="auth-glass-card" ref={cardRef}>
          <div className="glass-card-border"></div>
          <div className="glass-card-content">
            <h1 className="auth-title">The Vault</h1>
            <p className="auth-desc">Securely access your spatial memories.</p>

            <button onClick={handleGoogleLogin} className="luxury-google-btn">
              <span className="btn-glow-bg"></span>
              <img
                className="google-icon"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="G"
              />
              <span className="btn-text">Identify via Google</span>
            </button>

            {message && <div className="luxury-error">{message}</div>}

            <div className="luxury-footer">
              <span>New to the Vault?</span>
              <button
                className="text-btn"
                onClick={() => navigate("/register")}
              >
                Create entity.
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
