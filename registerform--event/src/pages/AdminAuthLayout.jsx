
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const AdminAuthLayout = () => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for static demo login
    if (localStorage.getItem("admin_demo_login") === "true") {
      setAuthed(true);
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setLoading(false);
      if (!user) navigate("/admin-login");
    });
    return () => unsub();
  }, [navigate]);

  if (loading) return null;
  if (!authed) return null;
  return <Outlet />;
};

export default AdminAuthLayout;
