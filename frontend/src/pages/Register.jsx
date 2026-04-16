import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase"; // adjust path
import "../assets/css/register.css";

function Register() {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Spotlight effect (unchanged)
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

  const handleGoogleRegister = async () => {
    setMessage("");
    setIsSuccess(false);

    try {
      // 🔐 Google Auth
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      // 🔥 STEP 1: Backend FIRST
      const res = await fetch("/api/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("Registration failed");
        return;
      }

      localStorage.setItem("access_token", data.access_token);

      // 🔥 STEP 2: Location enforcement
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          localStorage.setItem("currentLocation", JSON.stringify(location));

          setMessage("Registration successful. Entering Vault...");
          setIsSuccess(true);

          setTimeout(() => navigate("/dashboard"), 1500);
        },
        () => {
          setMessage("Registration successful, but location access denied.");
          alert(
            "📍 Location permission is required.\nPlease enable it and login again.",
          );
        },
      );
    } catch (error) {
      console.error(error);
      setMessage("Google authentication failed");
    }
  };

  return (
    <div className="luxury-split-wrapper">
      {/* Left Side (unchanged) */}
      <div className="luxury-visual-pane">
        <div className="memory-location-visual">
          <div className="topo-map">
            <div className="topo-layer layer-1"></div>
            <div className="topo-layer layer-2"></div>
            <div className="topo-layer layer-3"></div>
          </div>

          <div className="massive-pin-container">
            <div className="pin-pulse-shadow"></div>
            <div className="neon-location-pin">
              <span className="material-symbols-outlined">location_on</span>
            </div>
          </div>

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

      {/* Right Side */}
      <div className="luxury-auth-pane">
        <div className="auth-glass-card" ref={cardRef}>
          <div className="glass-card-border"></div>

          <div className="glass-card-content">
            <h1 className="auth-title">Join GeoVault</h1>
            <p className="auth-desc">Authenticate with Google to begin.</p>

            <button
              onClick={handleGoogleRegister}
              className="luxury-google-btn"
            >
              <span className="btn-glow-bg"></span>
              <img
                className="google-icon"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="G"
              />
              <span className="btn-text">Continue with Google</span>
            </button>

            {message && (
              <div className={isSuccess ? "luxury-success" : "luxury-error"}>
                {message}
              </div>
            )}

            <div className="luxury-footer">
              <span>Already registered?</span>
              <button
                type="button"
                className="text-btn"
                onClick={() => navigate("/login")}
              >
                Enter the Vault
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
