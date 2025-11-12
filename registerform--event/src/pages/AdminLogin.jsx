// src/components/AdminLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; 
import Bg from "../images/devotional-john.webp";

// Superadmin credentials
const SUPERADMIN_EMAIL = "info@squarecom.ae";
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Auto-create superadmin on component mount
  useEffect(() => {
    // Superadmin creation logic removed since static login is now used
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }
    // Allow static login: admin/admin
    if ((email === "admin" || email === "admin@gmail.com") && password === "admin") {
      // Set a dummy session (for demo only)
      localStorage.setItem("admin_demo_login", "true");
      navigate("/admin/dashboard");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      alert("Invalid admin credentials or user does not exist.");
    }
  };
   
  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            autoComplete="username"
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="current-password"
            />
            <span
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 18,
                top: 16,
                cursor: "pointer",
                color: "#888",
                fontSize: 15
              }}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          <button type="submit" style={styles.button}>Login</button>
          <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>
            <b>Demo login:</b> <br />Username or Email: <b>admin</b> <br />Password: <b>admin</b>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  background: { position: "absolute", inset: 0, backgroundImage: `url(${Bg})`, backgroundSize: "cover", opacity: 0.2, zIndex: -1 },
  card: { backgroundColor: "#fff", padding: "40px 30px", borderRadius: 12, boxShadow: "0 8px 25px rgba(0,0,0,0.15)", maxWidth: 400, textAlign: "center" },
  title: { marginBottom: 20, fontSize: 24, fontWeight: "bold" },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  input: { padding: 14, fontSize: 16, borderRadius: 8, border: "1px solid #ccc" },
  button: { padding: 14, fontSize: 16, fontWeight: "bold", backgroundColor: "#2980b9", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
};

export default AdminLogin;
