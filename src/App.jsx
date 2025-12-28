import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SaveLoc from "./pages/SaveLoc";
import SavedLoc from "./pages/SavedLoc";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/saveloc" element={<SaveLoc />} />
        <Route path="/savedloc" element={<SavedLoc />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
