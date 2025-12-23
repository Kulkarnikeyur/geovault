import { useState } from "react";
import { useNavigate } from "react-router-dom";
import locationImg from "../assets/location.jfif";
import "../assets/css/login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username || !password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/login", {
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
        // Store JWT
        localStorage.setItem("access_token", data.access_token);

        setMessage("Login successful");
        setUsername("");
        setPassword("");

        navigate("/dashboard");
      } else {
        setMessage(data.msg || "Invalid credentials");
      }
    } catch (error) {
      setMessage("Server error. Try again later.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src={locationImg} alt="route" />
        <h1>GeoVault</h1>
        <p>Manage & track locations effortlessly</p>
      </div>

      <div className="login-right">
        <h2>Login</h2>

        <div className="login-card">
          <form onSubmit={handleLogin}>
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

            <button type="submit">Login</button>
          </form>
        </div>

        {message && <p className="msg">{message}</p>}

        <p className="switch">
          Don't have an account?{" "}
          <span onClick={() => navigate("/register")} className="link">
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
