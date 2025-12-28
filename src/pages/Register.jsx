import { useState } from "react";
import locationImg from "../assets/location.jfif";
import "../assets/css/register.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!username || !password) {
      setMessage("Please fill all fields");
      return;
    }

    if (password.length > 6) {
      setMessage("password must be at most 6 characters");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          pass: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userId", data.id);
        setMessage("Registration successful. You can now log in.");
        setUsername("");
        setPassword("");
        navigate("/login");
      } else {
        setMessage(data.msg || "Registration failed");
      }
    } catch (error) {
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-image">
        <img src={locationImg} alt="Location path" />
        <h1>GeoVault</h1>
        <p>Manage & track locations effortlessly</p>
      </div>

      <div className="register-form">
        <div className="Register-right">
          <div className="instructions-wrapper">
            <button
              className="instructions-btn"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              Instructions ⌄
            </button>

            {showInstructions && (
              <div className="instructions-dropdown">
                <ul>
                  <li>• Password must be at most 6 characters</li>
                  <li>• Username should be unique</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <h2>Create Account</h2>

        <form onSubmit={handleRegister} className="input-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Register</button>

          {message && <p className="message">{message}</p>}
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
