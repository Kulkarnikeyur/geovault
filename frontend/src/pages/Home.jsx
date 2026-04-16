import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/home.css";

function Home() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll(".feature-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="home" ref={containerRef}>
      {/* Ambient background */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />
      <div className="grid-overlay" />

      {/* HERO */}
      <section className="hero">
        <h1 className="title">
          <span className="title-word">Geo</span>
          <span className="title-word accent">Vault</span>
        </h1>

        <p className="subtitle">
          A personal dimension where your memories are anchored to the world
          around you.
        </p>

        <div className="buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/register")}
          >
            <span>Get Started</span>
            <svg viewBox="0 0 16 16" fill="none" className="btn-icon">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="features">
          <div className="feature-card card-left">
            <div className="card-spotlight" />
            <div className="card-border-glow" />
            <div className="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" className="card-icon">
                <circle
                  cx="12"
                  cy="10"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="card-title">2km Radius Map</h3>
            <p className="card-desc">
              Track and visualize every location you've interacted with in a
              precise 2km radius.
            </p>
            <span className="card-tag">Spatial</span>
          </div>

          <div className="feature-card card-center">
            <div className="card-spotlight" />
            <div className="card-border-glow" />
            <div className="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" className="card-icon">
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="card-title">Contextual Memories</h3>
            <p className="card-desc">
              Store and retrieve memories with rich contextual information tied
              to specific locations.
            </p>
            <span className="card-tag">Memory</span>
          </div>

          <div className="feature-card card-right">
            <div className="card-spotlight" />
            <div className="card-border-glow" />
            <div className="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" className="card-icon">
                <rect
                  x="3"
                  y="11"
                  width="18"
                  height="11"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 11V7a5 5 0 0 1 10 0v4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="card-title">The Hidden Sector</h3>
            <p className="card-desc">
              Your private vault of memories, accessible only to you, where you
              can securely store your most cherished moments.
            </p>
            <span className="card-tag">Private</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
